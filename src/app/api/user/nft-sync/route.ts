import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncUserNFTs } from "@/lib/nft-service";
import arcjet, { shield, slidingWindow } from "@/lib/arcjet";
import { HttpStatus } from "@/lib/api-response";
import { logger } from "@/lib/monitoring";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    const decision = await arcjet
      .withRule(
        slidingWindow({
          mode: "LIVE",
          interval: "1m",
          max: 5, // Limit sync to 5 times per minute
        })
      )
      .protect(request, { fingerprint: session.user.id });

    if (decision.isDenied()) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: HttpStatus.RATE_LIMITED }
      );
    }

    const result = await syncUserNFTs(session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    logger.error("NFT Sync Error", "NFTSyncAPI", undefined, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: HttpStatus.INTERNAL_ERROR }
    );
  }
}
