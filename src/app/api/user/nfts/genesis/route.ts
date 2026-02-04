import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mintGenesisNFTs } from "@/lib/nft-service";
import { getUserENS } from "@/lib/ens-service";

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
    const { petId, buddyType, walletAddress } = body;

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

    console.log(`Minting Genesis NFTs for user ${session.user.email}:`, {
      petId,
      buddyType,
      walletAddress
    });

    // Get user's ENS name if they have one
    const ensName = await getUserENS(session.user.id);

    // Mint NFTs using the service
    const result = await mintGenesisNFTs({
      userId: session.user.id,
      buddyType,
      ensName: ensName || undefined,
      petId,
      userAddress: walletAddress,
    });

    return NextResponse.json({
      message: "Genesis NFTs minted successfully",
      nfts: result.nfts,
      transactions: result.transactions,
      totalMinted: result.nfts.length,
    });

  } catch (error) {
    console.error("NFT minting error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Internal server error during NFT minting" 
      },
      { status: 500 }
    );
  }
}