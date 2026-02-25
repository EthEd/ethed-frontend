/**
 * NFT Minting Service
 * Handles IPFS uploads, metadata generation, and blockchain minting
 */

import { pinFile, pinJSON } from "./pinata-config";
import { prisma } from "@/lib/prisma-client";
import type { Prisma } from "@/generated/prisma";
import { GENESIS_PIONEER_IMAGE_URI, GENESIS_PIONEER_METADATA_URI } from "@/lib/genesis-assets";
import {
  getContractAddress,
  AMOY_CHAIN_ID,
  NFT_CONTRACT_ABI,
  getExplorerTxUrl,
} from "@/lib/contracts";
import {
  getDeployerAddress,
  getPublicClient,
  getWalletClient,
  isOnChainEnabled,
} from "@/lib/viem-client";
import { logger } from "@/lib/monitoring";
import fs from "fs";
import path from "path";

// Log on-chain mode at module load
if (typeof globalThis !== 'undefined' && typeof process !== 'undefined') {
  const mode = isOnChainEnabled() ? 'REAL (Polygon Amoy)' : 'MOCK (dev fallback)';
  logger.info(`NFT Service initialized — on-chain mode: ${mode}`, "nft-service");
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  courseSlug?: string;
  courseName?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  animation_url?: string;
}

export interface MintNFTParams {
  userId: string;
  ensName?: string;
  userAddress?: string;
}

/**
 * Upload image to IPFS via Pinata
 */
export async function uploadImageToIPFS(
  imageBuffer: Buffer,
  filename: string
): Promise<string> {
  try {
    // Convert Buffer to File for Pinata upload
    const arrayBuffer = imageBuffer.buffer.slice(
      imageBuffer.byteOffset,
      imageBuffer.byteOffset + imageBuffer.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: "image/png" });
    const file = new File([blob], filename, { type: "image/png" });
    
    return await pinFile(file);
  } catch {
    throw new Error("Failed to upload image to IPFS");
  }
}

/**
 * Upload metadata JSON to IPFS
 */
import { env } from '@/env';

export async function uploadMetadataToIPFS(
  metadata: NFTMetadata
): Promise<string> {
  // IPFS-first: prefer Pinata when configured. If missing, provide a dev fallback.
  if (!env.PINATA_JWT) {
    if (env.NODE_ENV === 'production') {
      throw new Error('Pinata not configured — PINATA_JWT is required in production');
    }

    // Development fallback: write metadata JSON to public/local-metadata
    try {
      const outDir = `${process.cwd()}/public/local-metadata`;
      const filename = `metadata-${Date.now()}.json`;
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(`${outDir}/${filename}`, JSON.stringify(metadata, null, 2));
      logger.warn(`Saved metadata to /local-metadata/${filename} (Pinata not configured)`, "nft-service");
      return `/local-metadata/${filename}`;
    } catch {
      throw new Error('Failed to write local metadata fallback');
    }
  }

  try {
    return await pinJSON(metadata as unknown as Record<string, unknown>);
  } catch {
    // If Pinata fails in dev, fallback to local file; in prod propagate error
    if (env.NODE_ENV !== 'production') {
      try {
        const outDir = `${process.cwd()}/public/local-metadata`;
        const filename = `metadata-${Date.now()}.json`;
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(`${outDir}/${filename}`, JSON.stringify(metadata, null, 2));
        logger.warn(`Pinata upload failed, saved to /local-metadata/${filename}`, "nft-service");
        return `/local-metadata/${filename}`;
      } catch {
        // fall through
      }
    }

    throw new Error('Failed to upload metadata to IPFS');
  }
}

/**
 * Generate NFT metadata for Genesis Scholar
 */
export function generateGenesisScholarMetadata(
  imageUri: string,
  ensName?: string
): NFTMetadata {
  return {
    name: ensName ? `eth.ed Pioneer - ${ensName}` : "eth.ed Pioneer NFT",
    description: `Commemorates ${ensName || 'a dedicated scholar'} being an early eth.ed pioneer and completing the onboarding journey.`,
    image: imageUri,
    attributes: [
      { trait_type: "Type", value: "Genesis Scholar" },
      { trait_type: "Edition", value: "Pioneer" },
      { trait_type: "Rarity", value: "Founder" },
      { trait_type: "Minted Date", value: new Date().toISOString().split("T")[0] },
      ...(ensName ? [{ trait_type: "ENS Name", value: ensName }] : []),
    ],
    external_url: "https://ethed.app",
  };
}

/**
 * Mint NFT on blockchain and save to database
 */
export async function mintNFTAndSave(
  params: MintNFTParams
): Promise<{ id: string; tokenId: string; metadataUri: string }> {
  try {
    const { userId, ensName, userAddress } = params;

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Generate metadata
    const metadata = generateGenesisScholarMetadata(
      GENESIS_PIONEER_IMAGE_URI,
      ensName
    );

    // Upload metadata to IPFS
    const metadataUri = await uploadMetadataToIPFS(metadata);

    // Mint on-chain if user has a wallet address
    const recipientAddress = userAddress || "0x0000000000000000000000000000000000000000";
    let tokenId: string;
    let txHash: string | null = null;
    let contractAddr: string | null = null;

    if (recipientAddress !== "0x0000000000000000000000000000000000000000" && isOnChainEnabled()) {
      const mintResult = await mintOnChain(recipientAddress, metadataUri, "pioneer");
      tokenId = mintResult.tokenId;
      txHash = mintResult.txHash;
      contractAddr = mintResult.contractAddress;
    } else {
      // Off-chain record only
      tokenId = `off-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Save NFT record to database
    const nft = await prisma.nFT.create({
      data: {
        userId,
        name: `eth.ed Genesis Pioneer - ${ensName || user.name || "Scholar"}`,
        image: GENESIS_PIONEER_IMAGE_URI,
        metadata: metadataUri,
        contractAddress: contractAddr,
        tokenId,
        chainId: AMOY_CHAIN_ID,
        ownerAddress: userAddress || null,
        transactionHash: txHash,
        mintedAt: new Date(),
      },
    });

    return {
      id: nft.id,
      tokenId: nft.tokenId,
      metadataUri,
    };
  } catch (error) {
    throw new Error(`NFT minting failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Get user's NFTs
 */
export async function getUserNFTs(userId: string) {
  try {
    return await prisma.nFT.findMany({
      where: { userId },
      orderBy: { mintedAt: "desc" },
    });
  } catch (error) {
    throw new Error(`Failed to fetch NFTs: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
export async function mintOnChain(
  recipientAddress: string,
  metadataUri: string,
  _nftType: "pioneer" | "course-completion"
): Promise<{ tokenId: string; txHash: string; contractAddress: string }> {
  void _nftType;
  const contractAddress = getContractAddress(AMOY_CHAIN_ID, "NFT_CONTRACT") as `0x${string}`;

  // If on-chain operations are not available, fall back to mock (dev only)
  if (!isOnChainEnabled()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("On-chain minting unavailable: AMOY_RPC_URL and DEPLOYER_PRIVATE_KEY must be set.");
    }
    logger.warn("On-chain minting disabled (missing env vars) — using dev mock", "nft-service");
    await new Promise((resolve) => setTimeout(resolve, 500));
    const mockTokenId = `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const mockTxHash = `0x${"0".repeat(64)}`;
    return { tokenId: mockTokenId, txHash: mockTxHash, contractAddress };
  }

  const publicClient = getPublicClient();
  const walletClient = getWalletClient();

  logger.info(`Minting NFT to ${recipientAddress}`, "nft-service", { metadataUri });

  try {
    // Send the mint transaction via the server relayer wallet
    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: NFT_CONTRACT_ABI,
      functionName: "mint",
      args: [recipientAddress as `0x${string}`, metadataUri],
      account: getDeployerAddress(),
      chain: undefined,
    });

    logger.info(`Mint tx sent: ${txHash}`, "nft-service");

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    if (receipt.status === "reverted") {
      throw new Error(`Mint transaction reverted: ${txHash}`);
    }

    // Try to extract the tokenId from the Minted event log
    let tokenId = `${Date.now()}`;
    try {
      for (const log of receipt.logs) {
        try {
          // The Minted event has indexed `to` and indexed `tokenId`
          if (log.topics.length >= 3) {
            // tokenId is the second indexed param (topics[2])
            const raw = BigInt(log.topics[2]!);
            tokenId = raw.toString();
            break;
          }
        } catch {
          // Not our event, continue
        }
      }
    } catch {
      // Fallback tokenId is fine
    }

    logger.info(`Mint confirmed: tokenId=${tokenId}, tx=${txHash}`, "nft-service");

    return {
      tokenId,
      txHash,
      contractAddress,
    };
  } catch (error) {
    logger.error(
      "On-chain mint failed",
      "nft-service",
      { recipientAddress, metadataUri },
      error
    );
    throw new Error(
      `On-chain mint failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Save NFT to database
 */
export async function saveNFTToDatabase(params: {
  userId: string;
  tokenId: string;
  name: string;
  image: string;
  metadata: NFTMetadata;
  contractAddress?: string;
  transactionHash?: string;
  ownerAddress?: string;
  chainId?: number;
}) {
  return await prisma.nFT.create({
    data: {
      userId: params.userId,
      tokenId: params.tokenId,
      name: params.name,
      image: params.image,
      metadata: params.metadata as unknown as Prisma.InputJsonValue,
      contractAddress: params.contractAddress ?? null,
      transactionHash: params.transactionHash ?? null,
      ownerAddress: params.ownerAddress ?? null,
      chainId: params.chainId ?? AMOY_CHAIN_ID,
      mintedAt: new Date(),
    },
  });
}

/**
 * Full minting pipeline: upload to IPFS, mint on-chain, save to DB
 */
export async function mintGenesisNFTs(params: MintNFTParams) {
  const { userId, ensName, userAddress } = params;

  // Development-friendly fallback: if the genesis image is still the placeholder
  // and Pinata is not configured, use a bundled local image so the UI works offline.
  const placeholderCid = "ipfs://QmEthEdPioneer1" as string;
  // Use the Learning Sprout image as the default for pioneers
  const devLocalImage = "/nft-learning-sprout.png";
  const genesisImageUri =
    GENESIS_PIONEER_IMAGE_URI === placeholderCid && !env.PINATA_JWT
      ? devLocalImage
      : GENESIS_PIONEER_IMAGE_URI;

  // Generate metadata
  const genesisMetadata = generateGenesisScholarMetadata(
    genesisImageUri,
    ensName
  );

  const genesisMetadataUri = GENESIS_PIONEER_METADATA_URI
    ? GENESIS_PIONEER_METADATA_URI
    : await uploadMetadataToIPFS(genesisMetadata);

  // Mint on-chain (requires user wallet address)
  const defaultAddress = userAddress || "0x0000000000000000000000000000000000000000";
  
  const genesisResult = await mintOnChain(
    defaultAddress,
    genesisMetadataUri,
    "pioneer"
  );
  
  // Save to database with on-chain data
  const genesisNFT = await saveNFTToDatabase({
    userId,
    tokenId: genesisResult.tokenId,
    name: "eth.ed Pioneer NFT",
    image: genesisImageUri,
    metadata: genesisMetadata,
    contractAddress: genesisResult.contractAddress,
    transactionHash: genesisResult.txHash,
    ownerAddress: defaultAddress !== "0x0000000000000000000000000000000000000000" ? defaultAddress : undefined,
    chainId: AMOY_CHAIN_ID,
  });

  const explorerUrl = genesisResult.txHash && !genesisResult.txHash.startsWith("0x" + "0".repeat(64))
    ? getExplorerTxUrl(AMOY_CHAIN_ID, genesisResult.txHash)
    : null;

  return {
    nfts: [genesisNFT],
    transactions: [
      {
        type: "pioneer",
        txHash: genesisResult.txHash,
        tokenId: genesisResult.tokenId,
        explorerUrl,
      },
    ],
  };
}

/**
 * Upload course completion NFT image (Learning Sprout GIF) to IPFS
 */
export async function uploadCourseSproutToIPFS(): Promise<string> {
  try {
    // Read the sprout GIF from public folder
    const sproutPath = path.join(process.cwd(), "public", "nft-learning-sprout.gif");
    const imageBuffer = fs.readFileSync(sproutPath);

    // If Pinata not configured, return OG PNG (we don't need the course GIFs right now)
    if (!env.PINATA_JWT) {
      logger.warn("Pinata JWT not configured — using OG PNG at /og-image.png", "nft-service");
      return "/og-image.png";
    }

    // Convert to File for Pinata
    const arrayBuffer = imageBuffer.buffer.slice(
      imageBuffer.byteOffset,
      imageBuffer.byteOffset + imageBuffer.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: "image/gif" });
    const file = new File([blob], "learning-sprout.gif", { type: "image/gif" });
    
    return await pinFile(file);
  } catch (error: unknown) {
    // Fallback to OG PNG if IPFS fails in dev
    const msg = error instanceof Error ? error.message : String(error);
    logger.warn(`uploadCourseSproutToIPFS failed, falling back to OG PNG: ${msg}`, "nft-service");
    return "/og-image.png";
  }
}

/**
 * Generate NFT metadata for course completion
 */
export function generateCourseCompletionMetadata(
  imageUri: string,
  courseName: string,
  courseSlug: string,
  recipientName?: string
): NFTMetadata {
  return {
    name: `${courseName}${recipientName ? ` - ${recipientName}` : ''} - Learning Sprout`,
    description: `Commemorates the successful completion of ${courseName} on eth.ed by ${recipientName || 'a dedicated scholar'}. This Learning Sprout represents your growth and mastery in blockchain education.`,
    image: imageUri,
    animation_url: imageUri, // GIF works as animation
    courseSlug, // Used for UI linkage In Profile
    courseName, // Used for UI linkage In Profile
    attributes: [
      { trait_type: "Type", value: "Course Completion" },
      { trait_type: "Course", value: courseName },
      { trait_type: "Course Slug", value: courseSlug },
      { trait_type: "Recipient", value: recipientName || "Scholar" },
      { trait_type: "Platform", value: "eth.ed" },
      { trait_type: "Completion Date", value: new Date().toISOString().split("T")[0] },
      { trait_type: "NFT Design", value: "Learning Sprout" }
    ],
    external_url: `https://ethed.app/courses/${courseSlug}`,
  };
}

/**
 * Mint course completion NFT with Learning Sprout design
 */
export async function mintCourseCompletionNFT(params: {
  userId: string;
  courseSlug: string;
  courseName: string;
  userAddress?: string;
  recipientName?: string;
}) {
  const { userId, courseSlug, courseName, userAddress, recipientName } = params;

  // Upload sprout GIF to IPFS
  const imageUri = await uploadCourseSproutToIPFS();

  // Generate metadata
  const metadata = generateCourseCompletionMetadata(imageUri, courseName, courseSlug, recipientName);

  // Upload metadata to IPFS
  const metadataUri = await uploadMetadataToIPFS(metadata);

  // Mint on-chain
  const recipientAddress = userAddress || "0x0000000000000000000000000000000000000000";
  const mintResult = await mintOnChain(recipientAddress, metadataUri, "course-completion");
  
  // Save to database with on-chain data
  const nft = await saveNFTToDatabase({
    userId,
    tokenId: mintResult.tokenId,
    name: `${courseName}${recipientName ? ` - ${recipientName}` : ''} - Learning Sprout`,
    image: imageUri,
    metadata,
    contractAddress: mintResult.contractAddress,
    transactionHash: mintResult.txHash,
    ownerAddress: recipientAddress !== "0x0000000000000000000000000000000000000000" ? recipientAddress : undefined,
    chainId: AMOY_CHAIN_ID,
  });

  const explorerUrl = mintResult.txHash && !mintResult.txHash.startsWith("0x" + "0".repeat(64))
    ? getExplorerTxUrl(AMOY_CHAIN_ID, mintResult.txHash)
    : null;

  return {
    nft,
    transaction: { 
      type: "course-completion", 
      txHash: mintResult.txHash, 
      tokenId: mintResult.tokenId,
      courseSlug,
      courseName,
      explorerUrl,
    },
  };
}

/**
 * Synchronize user NFTs from the blockchain to the database
 */
export async function syncUserNFTs(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallets: true },
  });

  if (!user || user.wallets.length === 0) {
    return { success: true, synced: 0, message: "No wallets found for user" };
  }

  const publicClient = getPublicClient();
  // specify chain and ensure the returned string is treated as an address literal
  const contractAddress = getContractAddress(AMOY_CHAIN_ID, "NFT_CONTRACT") as `0x${string}`;
  
  if (!contractAddress) {
    return { success: false, error: "NFT contract address not configured" };
  }

  let syncedCount = 0;
  
  for (const wallet of user.wallets) {
    const address = wallet.address as `0x${string}`;
    
    try {
      // Find all Minted events for this user
      const logs = await publicClient.getLogs({
        address: contractAddress,
        event: {
          type: "event",
          name: "Minted",
          inputs: [
            { indexed: true, name: "to", type: "address" },
            { indexed: true, name: "tokenId", type: "uint256" },
          ],
        },
        args: { to: address },
        fromBlock: BigInt(0), // Start from genesis for Amoy
      });

      for (const log of logs) {
        const tokenIdInt = log.args.tokenId;
        if (tokenIdInt === undefined) continue;
        const tokenId = tokenIdInt.toString();

        // Check if we already have this NFT by tokenId and contractAddress
        const existing = await prisma.nFT.findFirst({
          where: { 
            tokenId, 
            contractAddress: contractAddress,
            chainId: AMOY_CHAIN_ID
          },
        });

        if (!existing) {
          // Fetch TokenURI
          try {
            const tokenUri = await publicClient.readContract({
              address: contractAddress,
              abi: NFT_CONTRACT_ABI,
              functionName: "tokenURI",
              args: [tokenIdInt],
            }) as string;

            // Fetch metadata JSON
            let metadata: NFTMetadata;
            if (tokenUri.startsWith('ipfs://')) {
              const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${tokenUri.replace('ipfs://', '')}`;
              const metadataRes = await fetch(gatewayUrl);
              if (!metadataRes.ok) throw new Error(`HTTP ${metadataRes.status} fetching metadata`);
              metadata = await metadataRes.json() as NFTMetadata;
            } else if (tokenUri.startsWith('/local-metadata/')) {
              // Read local file from public/local-metadata
              const localPath = path.join(process.cwd(), 'public', tokenUri);
              if (fs.existsSync(localPath)) {
                metadata = JSON.parse(fs.readFileSync(localPath, 'utf8')) as NFTMetadata;
              } else {
                throw new Error(`Local metadata file not found: ${localPath}`);
              }
            } else {
              // External URL
              const metadataRes = await fetch(tokenUri);
              if (!metadataRes.ok) throw new Error(`HTTP ${metadataRes.status} fetching metadata`);
              metadata = await metadataRes.json() as NFTMetadata;
            }

            // Save to DB
            await prisma.nFT.create({
              data: {
                userId,
                tokenId,
                name: metadata.name || `EthEd Certificate #${tokenId}`,
                image: metadata.image || "",
                metadata: metadata as any,
                contractAddress,
                chainId: AMOY_CHAIN_ID,
                ownerAddress: address,
                transactionHash: log.transactionHash,
              }
            });
            syncedCount++;
          } catch (err) {
            logger.error(`Failed to sync NFT ${tokenId}: ${err}`, "nft-service");
          }
        }
      }
    } catch (err) {
      logger.error(`Log fetch failed for ${address}: ${err}`, "nft-service");
    }
  }

  return { success: true, synced: syncedCount };
}
