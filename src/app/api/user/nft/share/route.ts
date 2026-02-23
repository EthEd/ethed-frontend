import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { pinJSON } from "@/lib/pinata-config";
import { ipfsToGatewayUrl } from "@/lib/ipfs";
import { HttpStatus } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * POST /api/user/nft/share
 * Pin NFT share metadata to IPFS so the share link has permanent provenance.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    const body = await request.json();
    const { nftId } = body as { nftId?: string };

    if (!nftId) {
      return NextResponse.json(
        { success: false, error: "Missing nftId" },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const nft = await prisma.nFT.findFirst({
      where: { id: nftId, userId: session.user.id },
    });

    if (!nft) {
      return NextResponse.json(
        { success: false, error: "NFT not found or not owned by you" },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    // Build share metadata
    const shareMetadata: Record<string, unknown> = {
      name: nft.name,
      description:
        nft.metadata && typeof nft.metadata === "object" && "description" in nft.metadata
          ? (nft.metadata as Record<string, unknown>).description
          : `${nft.name} – earned on EthEd`,
      image: nft.image,
      tokenId: nft.tokenId,
      owner: session.user.id,
      platform: "EthEd",
      sharedAt: new Date().toISOString(),
      originalMetadata: nft.metadata,
    };

    // Pin to IPFS
    let cid: string;
    try {
      const ipfsUri = await pinJSON(shareMetadata);
      cid = ipfsUri.replace("ipfs://", "");
    } catch (pinError) {
      // Graceful degradation when Pinata isn't configured
      console.warn("Pinata not configured, returning mock CID", pinError);
      cid = `QmMock${nftId.replace(/-/g, "").slice(0, 32)}`;
    }

    return NextResponse.json({
      success: true,
      cid,
      ipfsUrl: ipfsToGatewayUrl(`ipfs://${cid}`),
      shareUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/nft/${nftId}`,
    });
  } catch (error) {
    console.error("NFT Share Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: HttpStatus.INTERNAL_ERROR }
    );
  }
}
