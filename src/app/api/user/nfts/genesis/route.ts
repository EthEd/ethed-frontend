import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mintGenesisNFTs } from "@/lib/nft-service";
import { getUserENS } from "@/lib/ens-service";
import aj, { slidingWindow } from "@/lib/arcjet";

// Rate limiting for NFT minting - expensive on-chain operation
const nftRateLimit = aj.withRule(
  slidingWindow({
    mode: "LIVE",
    interval: "1d",
    max: 3, // 3 mint attempts per day per user
  })
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to mint NFTs" },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const decision = await nftRateLimit.protect(request, {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Rate limit exceeded. You can mint up to 3 NFTs per day." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { walletAddress: providedAddress, ensName: bodyEnsName } = body;

    const { prisma } = await import("@/lib/prisma-client");
    
    // Fetch user with primary wallet
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        wallets: {
          where: { isPrimary: true },
          take: 1
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine recipient address: provided in body -> primary wallet -> session address
    const recipientAddress = providedAddress || user.wallets[0]?.address || session.address;

    if (!recipientAddress) {
      return NextResponse.json(
        { error: "No wallet address found. Please connect your wallet first." },
        { status: 400 }
      );
    }

    // Get user's ENS name from DB, use body as fallback
    const dbEnsName = await getUserENS(session.user.id);
    const ensName = dbEnsName || bodyEnsName;

    // Mint NFT using the service
    const result = await mintGenesisNFTs({
      userId: session.user.id,
      ensName: ensName || undefined,
      userAddress: recipientAddress,
    });

    return NextResponse.json({
      message: "eth.ed Pioneer NFT minted successfully",
      nfts: result.nfts,
      transactions: result.transactions,
      totalMinted: result.nfts.length,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error during NFT minting";
    if (message.includes('Pinata not configured')) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}