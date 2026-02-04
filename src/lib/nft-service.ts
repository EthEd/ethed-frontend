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
  buddyType: string;
  ensName?: string;
  petId?: string;
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
  buddyType: string,
  imageUri: string,
  ensName?: string
): NFTMetadata {
  return {
    name: "Genesis Scholar NFT",
    description: `Commemorates being an early EthEd pioneer and completing the onboarding journey with ${buddyType}`,
    image: imageUri,
    attributes: [
      { trait_type: "Type", value: "Genesis Scholar" },
      { trait_type: "Buddy", value: buddyType },
      { trait_type: "Rarity", value: "Founder" },
      { trait_type: "Minted Date", value: new Date().toISOString().split("T")[0] },
      ...(ensName ? [{ trait_type: "ENS Name", value: ensName }] : []),
    ],
    external_url: "https://ethed.app",
  };
}

/**
 * Generate NFT metadata for Buddy Bond
 */
export function generateBuddyBondMetadata(
  buddyType: string,
  imageUri: string
): NFTMetadata {
  return {
    name: "Buddy Bond NFT",
    description: `Represents the special bond formed with your ${buddyType} learning companion`,
    image: imageUri,
    attributes: [
      { trait_type: "Type", value: "Buddy Bond" },
      { trait_type: "Buddy", value: buddyType },
      { trait_type: "Rarity", value: "Rare" },
      { trait_type: "Bond Date", value: new Date().toISOString().split("T")[0] },
    ],
    external_url: "https://ethed.app",
  };
}

/**
 * Mint NFT on blockchain (mock implementation - replace with actual contract call)
 * In production, this would use ethers.js or viem to interact with smart contract
 */
export async function mintOnChain(
  recipientAddress: string,
  metadataUri: string,
  nftType: "genesis" | "buddy"
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
  const { userId, buddyType, ensName, userAddress } = params;

  // In production, you would:
  // 1. Fetch actual image files from your assets
  // 2. Upload them to IPFS
  // 3. Generate metadata with IPFS image URIs
  // 4. Upload metadata to IPFS
  // 5. Mint on-chain using metadata URI
  // 6. Save to database with transaction hash

  // For now, using placeholder URIs
  const genesisImageUri = `ipfs://QmGenesisScholar${buddyType}`;
  const buddyImageUri = `ipfs://QmBuddyBond${buddyType}`;

  // Generate metadata
  const genesisMetadata = generateGenesisScholarMetadata(
    buddyType,
    genesisImageUri,
    ensName
  );
  const buddyMetadata = generateBuddyBondMetadata(buddyType, buddyImageUri);

  // Upload metadata to IPFS (in production)
  // const genesisMetadataUri = await uploadMetadataToIPFS(genesisMetadata);
  // const buddyMetadataUri = await uploadMetadataToIPFS(buddyMetadata);

  // Placeholder metadata URIs
  const genesisMetadataUri = `ipfs://QmGenesisMetadata${Date.now()}`;
  const buddyMetadataUri = `ipfs://QmBuddyMetadata${Date.now()}`;

  // Mint on-chain (requires user wallet address)
  const defaultAddress = userAddress || "0x0000000000000000000000000000000000000000";
  
  const genesisResult = await mintOnChain(
    defaultAddress,
    genesisMetadataUri,
    "genesis"
  );
  
  const buddyResult = await mintOnChain(
    defaultAddress,
    buddyMetadataUri,
    "buddy"
  );

  // Save to database
  const genesisNFT = await saveNFTToDatabase({
    userId,
    tokenId: genesisResult.tokenId,
    name: "Genesis Scholar NFT",
    image: genesisImageUri,
    metadata: genesisMetadata,
  });

  const buddyNFT = await saveNFTToDatabase({
    userId,
    tokenId: buddyResult.tokenId,
    name: "Buddy Bond NFT",
    image: buddyImageUri,
    metadata: buddyMetadata,
  });

  return {
    nfts: [genesisNFT, buddyNFT],
    transactions: [
      { type: "genesis", txHash: genesisResult.txHash, tokenId: genesisResult.tokenId },
      { type: "buddy", txHash: buddyResult.txHash, tokenId: buddyResult.tokenId },
    ],
  };
}
