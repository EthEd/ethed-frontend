/**
 * ENS Registration Service
 * Handles ENS subdomain registration and management
 */

import { prisma } from "./prisma-client";

export interface ENSRegistrationParams {
  userId: string;
  subdomain: string;
  walletAddress?: string;
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
export async function checkAvailability(subdomain: string): Promise<boolean> {
  const cleaned = subdomain.trim().toLowerCase();
  
  // Check if already registered in database
  const existing = await prisma.walletAddress.findFirst({
    where: {
      ensName: `${cleaned}.ethed.eth`,
    },
  });

  return !existing;
}

/**
 * Register ENS subdomain on-chain (mock implementation)
 * In production, this would interact with ENS registrar contract
 */
export async function registerOnChain(
  subdomain: string,
  ownerAddress: string
): Promise<{ txHash: string; ensName: string }> {
  // TODO: Replace with actual ENS contract interaction
  // Example using ethers.js:
  // const ensRegistrar = new ethers.Contract(REGISTRAR_ADDRESS, ABI, signer);
  // const tx = await ensRegistrar.register(subdomain, ownerAddress, duration);
  // const receipt = await tx.wait();
  // return { txHash: receipt.transactionHash, ensName: `${subdomain}.ethed.eth` };

  console.log(`Registering ENS: ${subdomain}.ethed.eth for ${ownerAddress}`);

  // Simulate blockchain transaction
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  const ensName = `${subdomain}.ethed.eth`;

  return { txHash, ensName };
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
    return await prisma.walletAddress.create({
      data: {
        userId,
        address: address || "0x0000000000000000000000000000000000000000",
        chainId: 1, // Ethereum mainnet
        ensName,
        isPrimary: true,
      },
    });
  }
}

/**
 * Full ENS registration pipeline
 */
export async function registerENS(params: ENSRegistrationParams) {
  const { userId, subdomain, walletAddress } = params;

  // Validate subdomain
  const validation = validateSubdomain(subdomain);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const cleaned = subdomain.trim().toLowerCase();
  const ensName = `${cleaned}.ethed.eth`;

  // Check availability
  const available = await checkAvailability(cleaned);
  if (!available) {
    throw new Error("This ENS name is already registered");
  }

  // Register on-chain (requires wallet address in production)
  const defaultAddress = walletAddress || "0x0000000000000000000000000000000000000000";
  
  const { txHash } = await registerOnChain(cleaned, defaultAddress);

  // Save to database
  const walletRecord = await saveENSToDatabase({
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
    await prisma.walletAddress.update({
      where: { id: walletRecord.id },
      data: { isPrimary: true }
    });
  }

  return {
    success: true,
    ensName,
    txHash,
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
