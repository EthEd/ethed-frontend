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
    const { walletAddress } = body;

    // Get user's ENS name if they have one
    const ensName = await getUserENS(session.user.id);

    // Mint NFT using the service
    const result = await mintGenesisNFTs({
      userId: session.user.id,
      ensName: ensName || undefined,
      userAddress: walletAddress,
    });

    return NextResponse.json({
      message: "eth.ed Pioneer NFT minted successfully",
      nfts: result.nfts,
      transactions: result.transactions,
      totalMinted: result.nfts.length,
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Internal server error during NFT minting" 
      },
      { status: 500 }
    );
  }
}