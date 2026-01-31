import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to mint NFTs" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { petId, ensName, buddyType } = body;

    // Validate required fields
    if (!buddyType) {
      return NextResponse.json(
        { error: "Buddy type is required for NFT minting" },
        { status: 400 }
      );
    }

    // Validate buddy type format
    const validBuddyTypes = ['spark-dragon', 'cyber-fox', 'prof-owl', 'cosmic-cat'];
    if (!validBuddyTypes.includes(buddyType)) {
      return NextResponse.json(
        { error: "Invalid buddy type provided" },
        { status: 400 }
      );
    }

    // Validate ENS name format if provided
    if (ensName && typeof ensName === 'string') {
      const ensNameRegex = /^[a-z0-9-]{3,20}\.ethed\.eth$/;
      if (!ensNameRegex.test(ensName)) {
        return NextResponse.json(
          { error: "Invalid ENS name format" },
          { status: 400 }
        );
      }
    }

    console.log(`Minting Genesis NFTs for user ${session.user.email}:`, {
      petId,
      ensName,
      buddyType
    });

    // For demo purposes, create mock NFT objects
    // In production, you would:
    // 1. Interact with blockchain to mint actual NFTs
    // 2. Store NFT metadata in IPFS
    // 3. Save NFT records to database
    
    const genesisScholarNFT = {
      id: `nft-genesis-${Date.now()}`,
      userId: session.user.id,
      tokenId: `genesis-${Date.now()}`,
      name: "Genesis Scholar NFT",
      description: "Commemorates being an early EthEd pioneer and completing the onboarding journey",
      image: `https://ethed.app/nfts/genesis-scholar-${buddyType}.png`,
      attributes: [
        { trait_type: "Type", value: "Genesis Scholar" },
        { trait_type: "Buddy", value: buddyType },
        { trait_type: "Rarity", value: "Founder" },
        { trait_type: "Minted Date", value: new Date().toISOString().split('T')[0] }
      ],
      metadata: {
        petId,
        ensName,
        buddyType,
        mintedAt: new Date().toISOString()
      },
      createdAt: new Date()
    };

    const buddyBondNFT = {
      id: `nft-buddy-${Date.now()}`,
      userId: session.user.id,
      tokenId: `buddy-${Date.now()}`,
      name: "Buddy Bond NFT",
      description: `Represents the special bond formed with your learning companion`,
      image: `https://ethed.app/nfts/buddy-bond-${buddyType}.png`,
      attributes: [
        { trait_type: "Type", value: "Buddy Bond" },
        { trait_type: "Buddy", value: buddyType },
        { trait_type: "Rarity", value: "Rare" },
        { trait_type: "Bond Date", value: new Date().toISOString().split('T')[0] }
      ],
      metadata: {
        petId,
        buddyType,
        bondedAt: new Date().toISOString()
      },
      createdAt: new Date()
    };

    // Simulate blockchain transaction
    const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;

    return NextResponse.json({
      message: "Genesis NFTs minted successfully",
      nfts: [genesisScholarNFT, buddyBondNFT],
      transactionHash,
      totalMinted: 2
    });

  } catch (error) {
    console.error("NFT minting error:", error);
    return NextResponse.json(
      { error: "Internal server error during NFT minting" },
      { status: 500 }
    );
  }
}