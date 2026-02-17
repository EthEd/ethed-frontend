/**
 * ENS Registration Service
 * Handles ENS subdomain registration and management
 */

import { prisma } from "@/lib/prisma-client";
import {
  AMOY_CHAIN_ID,
  ENS_REGISTRAR_ABI,
  getContractAddress,
  getExplorerTxUrl,
} from "./contracts";
import {
  getDeployerAddress,
  getPublicClient,
  getWalletClient,
  isOnChainEnabled,
} from "./viem-client";
import { logger } from "./monitoring";

/**
 * Best-effort ENS avatar resolver.
 * Uses the ENS metadata avatar endpoint as a fallback; returns a resolvable URL or null.
 */
async function resolveEnsAvatar(ensName: string): Promise<string | null> {
  try {
    if (!ensName) return null;
    const name = ensName.trim();
    // ENS metadata avatar proxy (best-effort — works for many mainnet names)
    const url = `https://metadata.ens.domains/mainnet/avatar/${encodeURIComponent(name)}`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return null;

    // If the endpoint redirects to an image or IPFS gateway, `res.url` will contain it
    if (res.url && res.url !== url) return res.url;

    // Otherwise attempt to parse JSON body for `image` or `avatar` fields
    const text = await res.text();
    try {
      const json = JSON.parse(text || '{}');
      return json.image || json.avatar || null;
    } catch {
      // Not JSON — cannot determine avatar
      return null;
    }
  } catch {
    return null;
  }
}

export interface ENSRegistrationParams {
  userId: string;
  subdomain: string;
  walletAddress?: string;
  rootDomain?: string; // e.g. 'ethed.eth' or 'ayushetty.eth'
}

/**
 * Validate ENS subdomain format
 */
export function validateSubdomain(subdomain: string): {
  valid: boolean;
  error?: string;
} {
  if (!subdomain || typeof subdomain !== "string") {
    return { valid: false, error: "Subdomain is required" };
  }

  const cleaned = subdomain.trim().toLowerCase();

  // ENS name validation rules
  const ensNameRegex = /^[a-z0-9-]{3,20}$/;
  if (!ensNameRegex.test(cleaned)) {
    return {
      valid: false,
      error:
        "ENS name must be 3-20 characters long and contain only lowercase letters, numbers, and hyphens",
    };
  }

  // Cannot start or end with hyphen
  if (cleaned.startsWith("-") || cleaned.endsWith("-")) {
    return { valid: false, error: "ENS name cannot start or end with a hyphen" };
  }

  // Cannot contain consecutive hyphens
  if (cleaned.includes("--")) {
    return {
      valid: false,
      error: "ENS name cannot contain consecutive hyphens",
    };
  }

  // Reserved names
  const reservedNames = [
    "admin",
    "api",
    "www",
    "mail",
    "ftp",
    "localhost",
    "ethed",
    "test",
    "root",
    "system",
  ];
  if (reservedNames.includes(cleaned)) {
    return { valid: false, error: "This ENS name is reserved" };
  }

  return { valid: true };
}

/**
 * Check if ENS subdomain is available (in database)
 */
export async function checkAvailability(subdomain: string, rootDomain = 'ethed.eth'): Promise<boolean> {
  const cleaned = subdomain.trim().toLowerCase();
  const fullName = `${cleaned}.${rootDomain}`;
  
  // Check if already registered in database
  const existing = await prisma.walletAddress.findFirst({
    where: {
      ensName: fullName,
    },
  });

  return !existing;
}

/**
 * Register ENS subdomain on-chain via the deployed ENS registrar contract.
 * Falls back to a dev mock when on-chain env vars are not set.
 */
export async function registerOnChain(
  subdomain: string,
  ownerAddress: string,
  rootDomain = "ethed.eth"
): Promise<{ txHash: string; ensName: string; explorerUrl: string | null }> {
  const ensName = `${subdomain}.${rootDomain}`;

  if (!isOnChainEnabled()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "On-chain ENS registration unavailable: AMOY_RPC_URL and DEPLOYER_PRIVATE_KEY must be set."
      );
    }
    logger.warn(
      "On-chain ENS registration disabled (missing env vars) — using dev mock",
      "ens-service"
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    const mockTxHash = `0x${"0".repeat(64)}`;
    return { txHash: mockTxHash, ensName, explorerUrl: null };
  }

  const contractAddress = getContractAddress(AMOY_CHAIN_ID, "ENS_REGISTRAR") as `0x${string}`;
  const walletClient = getWalletClient();
  const publicClient = getPublicClient();

  logger.info(`Registering ENS subdomain "${ensName}" for ${ownerAddress}`, "ens-service");

  try {
    const duration = BigInt(365 * 24 * 60 * 60); // 1 year in seconds

    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: ENS_REGISTRAR_ABI,
      functionName: "register",
      args: [subdomain, ownerAddress as `0x${string}`, duration],
      account: getDeployerAddress(),
      chain: undefined,
    });

    logger.info(`ENS register tx sent: ${txHash}`, "ens-service");

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    if (receipt.status === "reverted") {
      throw new Error(`ENS registration transaction reverted: ${txHash}`);
    }

    const explorerUrl = getExplorerTxUrl(AMOY_CHAIN_ID, txHash);

    logger.info(`ENS registration confirmed: ${ensName}, tx=${txHash}`, "ens-service");

    return { txHash, ensName, explorerUrl };
  } catch (error) {
    logger.error(
      "On-chain ENS registration failed",
      "ens-service",
      { subdomain, ownerAddress },
      error
    );
    throw new Error(
      `On-chain ENS registration failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Save ENS registration to database
 */
export async function saveENSToDatabase(params: {
  userId: string;
  ensName: string;
  address?: string;
}) {
  const { userId, ensName, address } = params;

  // Check if user already has a wallet address entry
  const existingWallet = await prisma.walletAddress.findFirst({
    where: { userId },
  });

  if (existingWallet) {
    // Update existing wallet with ENS name
    return await prisma.walletAddress.update({
      where: { id: existingWallet.id },
      data: {
        ensName,
        address: address || existingWallet.address,
      },
    });
  } else {
    // Create new wallet address entry
    try {
      return await prisma.walletAddress.create({
        data: {
          userId,
          address: address || "0x0000000000000000000000000000000000000000",
          chainId: AMOY_CHAIN_ID,
          ensName,
          isPrimary: true,
        },
      });
    } catch (err: unknown) {
      // Ignore unique constraint races and return the existing record instead
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
        const existing = await prisma.walletAddress.findFirst({ where: { userId, ensName } });
        if (existing) return existing;
      }
      throw err;
    }
  }
}

/**
 * Full ENS registration pipeline
 */
export async function registerENS(params: ENSRegistrationParams) {
  const { userId, subdomain, walletAddress, rootDomain = 'ethed.eth' } = params;

  // Validate subdomain label
  const validation = validateSubdomain(subdomain);
  if (!validation.valid) {
    throw new Error(validation.error ?? "Invalid ENS subdomain");
  }

  const cleaned = subdomain.trim().toLowerCase();
  const ensName = `${cleaned}.${rootDomain}`;

  // Check availability (pass the requested root domain)
  const available = await checkAvailability(cleaned, rootDomain);
  if (!available) {
    throw new Error("This ENS name is already registered");
  }

  // Register on-chain (requires wallet address in production)
  const defaultAddress = walletAddress || "0x0000000000000000000000000000000000000000";
  
  const { txHash, explorerUrl } = await registerOnChain(cleaned, defaultAddress, rootDomain);

  // Save to database
  let walletRecord = await saveENSToDatabase({
    userId,
    ensName,
    address: walletAddress,
  });

  // Ensure this wallet is marked as primary if it's the first one
  const existingWallets = await prisma.walletAddress.findMany({
    where: { userId }
  });

  if (existingWallets.length === 1) {
    // This is the first wallet, make it primary
    walletRecord = await prisma.walletAddress.update({
      where: { id: walletRecord.id },
      data: { isPrimary: true }
    });
  }

  // Best-effort: resolve ENS avatar (non-blocking but update DB if found)
  try {
    const avatar = await resolveEnsAvatar(ensName);
    if (avatar) {
      walletRecord = await prisma.walletAddress.update({
        where: { id: walletRecord.id },
        data: { ensAvatar: avatar }
      });
    }
  } catch (err) {
    // Non-fatal — avatar resolution should not block registration
    logger.warn("avatar resolution failed", "ens-service", {
      ensName,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }

  return {
    success: true,
    ensName,
    txHash,
    explorerUrl,
    wallet: walletRecord,
  };
}

/**
 * Get user's ENS name
 */
export async function getUserENS(userId: string): Promise<string | null> {
  const wallet = await prisma.walletAddress.findFirst({
    where: {
      userId,
      ensName: { not: null },
    },
    orderBy: { createdAt: "desc" },
  });

  return wallet?.ensName || null;
}
