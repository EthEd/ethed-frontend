import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { prisma } = await import("@/lib/prisma-client");
    
    const nfts = await prisma.nFT.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      nfts,
      total: nfts.length
    });

  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const { name, description, image, attributes = [] } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      );
    }

    // For demo purposes, create a mock NFT
    const nft = {
      id: `nft-${Date.now()}`,
      userId: session.user.id,
      tokenId: `token-${Date.now()}`,
      name,
      description,
      image: image || `https://ethed.app/nfts/default.png`,
      attributes,
      metadata: {
        mintedAt: new Date().toISOString()
      },
      createdAt: new Date()
    };

    return NextResponse.json({
      message: "NFT minted successfully",
      nft
    });

  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}