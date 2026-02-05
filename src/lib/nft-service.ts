/**
 * NFT Minting Service
 * Handles IPFS uploads, metadata generation, and blockchain minting
 */

import { pinata } from "./pinata-config";
import { prisma } from "./prisma-client";

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
    name: "EthEd Pioneer NFT",
    description: `Commemorates being an early EthEd pioneer and completing the onboarding journey.`,
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
  nftType: "pioneer"
): Promise<{ tokenId: string; txHash: string }> {
  // TODO: Replace with actual smart contract interaction
  // Example using ethers.js:
  // const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, ABI, signer);
  // const tx = await contract.mint(recipientAddress, metadataUri);
  // const receipt = await tx.wait();
  // return { tokenId: receipt.events[0].args.tokenId.toString(), txHash: receipt.transactionHash };

  console.log(`Minting ${nftType} NFT to ${recipientAddress}`);
  console.log(`Metadata URI: ${metadataUri}`);

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
  const genesisImageUri = `ipfs://QmEthEdPioneer1`;

  // Generate metadata
  const genesisMetadata = generateGenesisScholarMetadata(
    genesisImageUri,
    ensName
  );

  // Placeholder metadata URIs
  const genesisMetadataUri = `ipfs://QmGenesisMetadata${Date.now()}`;

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
    name: "EthEd Pioneer NFT",
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
