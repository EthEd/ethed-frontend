/**
 * NFT Minting Service
 * Handles IPFS uploads, metadata generation, and blockchain minting
 */

import { pinata } from "./pinata-config";
import { prisma } from "@/lib/prisma-client";
import { GENESIS_PIONEER_IMAGE_URI, GENESIS_PIONEER_METADATA_URI } from "@/lib/genesis-assets";
import fs from "fs";
import path from "path";

// Add proper type definitions for Pinata SDK
type PinataUploadResponse = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
};

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
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
    
    // Pinata SDK v2 upload method - cast to any for now due to SDK type mismatch
    const upload = (await (pinata as any).upload.file(file)) as PinataUploadResponse;
    return `ipfs://${upload.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading image to IPFS:", error);
    throw new Error("Failed to upload image to IPFS");
  }
}

/**
 * Upload metadata JSON to IPFS
 */
export async function uploadMetadataToIPFS(
  metadata: NFTMetadata
): Promise<string> {
  try {
    // Pinata SDK v2 upload method for JSON - cast to any for now due to SDK type mismatch
    const upload = (await (pinata as any).upload.json(metadata)) as PinataUploadResponse;
    return `ipfs://${upload.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    throw new Error("Failed to upload metadata to IPFS");
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
    name: "eth.ed Pioneer NFT",
    description: `Commemorates being an early eth.ed pioneer and completing the onboarding journey.`,
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
 * Mint NFT on blockchain (mock implementation - replace with actual contract call)
 */
export async function mintOnChain(
  recipientAddress: string,
  metadataUri: string,
  nftType: "pioneer" | "course-completion"
): Promise<{ tokenId: string; txHash: string }> {
  // TODO: Replace with actual smart contract interaction
  // Example using ethers.js:
  // const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, ABI, signer);
  // const tx = await contract.mint(recipientAddress, metadataUri);
  // const receipt = await tx.wait();
  // return { tokenId: receipt.events[0].args.tokenId.toString(), txHash: receipt.transactionHash };

  // Simulate blockchain transaction
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const tokenId = `${nftType}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;

  return { tokenId, txHash };
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
}) {
  return await prisma.nFT.create({
    data: {
      userId: params.userId,
      tokenId: params.tokenId,
      name: params.name,
      image: params.image,
      metadata: params.metadata as any,
    },
  });
}

/**
 * Full minting pipeline: upload to IPFS, mint on-chain, save to DB
 */
export async function mintGenesisNFTs(params: MintNFTParams) {
  const { userId, ensName, userAddress } = params;

  // For now, using placeholder URIs
  const genesisImageUri = GENESIS_PIONEER_IMAGE_URI;

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
  
  // Save to database
  const genesisNFT = await saveNFTToDatabase({
    userId,
    tokenId: genesisResult.tokenId,
    name: "eth.ed Pioneer NFT",
    image: genesisImageUri,
    metadata: genesisMetadata,
  });

  return {
    nfts: [genesisNFT],
    transactions: [
      { type: "pioneer", txHash: genesisResult.txHash, tokenId: genesisResult.tokenId },
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
    
    // Convert to File for Pinata
    const arrayBuffer = imageBuffer.buffer.slice(
      imageBuffer.byteOffset,
      imageBuffer.byteOffset + imageBuffer.byteLength
    ) as ArrayBuffer;
    const blob = new Blob([arrayBuffer], { type: "image/gif" });
    const file = new File([blob], "learning-sprout.gif", { type: "image/gif" });
    
    const upload = (await (pinata as any).upload.file(file)) as PinataUploadResponse;
    return `ipfs://${upload.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading sprout GIF to IPFS:", error);
    // Fallback to local URL if IPFS fails
    return "/nft-learning-sprout.gif";
  }
}

/**
 * Generate NFT metadata for course completion
 */
export function generateCourseCompletionMetadata(
  imageUri: string,
  courseName: string,
  courseSlug: string
): NFTMetadata {
  return {
    name: `${courseName} - Learning Sprout`,
    description: `Commemorates the successful completion of ${courseName} on eth.ed. This Learning Sprout represents your growth and mastery in blockchain education.`,
    image: imageUri,
    animation_url: imageUri, // GIF works as animation
    attributes: [
      { trait_type: "Type", value: "Course Completion" },
      { trait_type: "Course", value: courseName },
      { trait_type: "Course Slug", value: courseSlug },
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
}) {
  const { userId, courseSlug, courseName, userAddress } = params;

  // Upload sprout GIF to IPFS
  const imageUri = await uploadCourseSproutToIPFS();

  // Generate metadata
  const metadata = generateCourseCompletionMetadata(imageUri, courseName, courseSlug);

  // Upload metadata to IPFS
  const metadataUri = await uploadMetadataToIPFS(metadata);

  // Mint on-chain
  const recipientAddress = userAddress || "0x0000000000000000000000000000000000000000";
  const mintResult = await mintOnChain(recipientAddress, metadataUri, "course-completion");
  
  // Save to database
  const nft = await saveNFTToDatabase({
    userId,
    tokenId: mintResult.tokenId,
    name: `${courseName} - Learning Sprout`,
    image: imageUri,
    metadata,
  });

  return {
    nft,
    transaction: { 
      type: "course-completion", 
      txHash: mintResult.txHash, 
      tokenId: mintResult.tokenId,
      courseSlug,
      courseName
    },
  };
}
