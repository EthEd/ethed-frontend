/**
 * NFT Claiming API Route
 * Validates course completion and mints NFT credential
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { mintCourseCompletionNFT } from "@/lib/nft-service";
import { getUserENS } from "@/lib/ens-service";
import { logger } from "@/lib/monitoring";
import { HttpStatus } from "@/lib/api-response";
import arcjet, { detectBot, shield, slidingWindow } from "@/lib/arcjet";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to claim NFT" },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    const decision = await arcjet
      .withRule(
        detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] })
      )
      .withRule(
        slidingWindow({
          mode: "LIVE",
          interval: "1h",
          max: 10, // Max 10 claim attempts per hour
        })
      )
      .protect(request, { fingerprint: session.user.id });

    if (decision.isDenied()) {
      return NextResponse.json(
        { success: false, error: "Access denied by security policy" },
        { status: HttpStatus.FORBIDDEN }
      );
    }

    const body = await request.json();
    const { courseSlug, userAddress: providedAddress } = body;

    // 1. Validation
    if (!courseSlug) {
      return NextResponse.json(
        { error: "Missing courseSlug parameter" },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    // 2. Fetch User and Wallets
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { wallets: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: HttpStatus.NOT_FOUND });
    }

    // Determine recipient address
    const userAddress = providedAddress || user.wallets.find(w => w.isPrimary)?.address || user.wallets[0]?.address;

    if (!userAddress) {
      return NextResponse.json(
        { error: "No wallet connected", message: "Please connect a wallet to claim your NFT" },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // 3. Verify course completion
    const userCourse = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
    });

    if (!userCourse?.completed) {
      return NextResponse.json(
        {
          error: "Course not completed",
          message: "You must complete the course before claiming the NFT",
        },
        { status: HttpStatus.FORBIDDEN }
      );
    }

    // 4. Check if NFT already claimed for this course (using metadata check)
    const existingNFT = await prisma.nFT.findFirst({
      where: {
        userId: session.user.id,
        OR: [
          { name: { contains: course.title } },
          { 
            metadata: {
              path: ['courseSlug'],
              equals: courseSlug
            }
          }
        ]
      },
    });

    if (existingNFT) {
      return NextResponse.json(
        {
          success: true,
          message: "NFT already claimed for this course",
          nft: existingNFT,
        },
        { status: HttpStatus.OK }
      );
    }

    // 5. Mint NFT
    logger.info(`Minting NFT for user ${session.user.id}, course ${courseSlug}`, "nft-api");
    
    // Get user's ENS name or display name for the certificate
    const ensName = await getUserENS(session.user.id);
    const recipientName = ensName || user.name || "Scholar";

    const result = await mintCourseCompletionNFT({
      userId: session.user.id,
      courseSlug,
      courseName: course.title,
      userAddress,
      recipientName
    });

    return NextResponse.json({
      success: true,
      message: "NFT claimed successfully",
      nft: result.nft,
      transaction: result.transaction
    });

  } catch (error) {
    logger.error(`NFT Claim Error: ${error}`, "nft-api");
    return NextResponse.json(
      { success: false, error: "Internal server error", details: String(error) },
      { status: HttpStatus.INTERNAL_ERROR }
    );
  }
}
