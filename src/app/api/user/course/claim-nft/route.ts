/**
 * NFT Claiming API Route
 * Validates course completion and mints NFT credential
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { mintCourseCompletionNFT } from "@/lib/nft-service";
import { logger } from "@/lib/monitoring";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to claim NFT" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseSlug, userAddress } = body;

    if (!courseSlug) {
      return NextResponse.json(
        { error: "Missing courseSlug parameter" },
        { status: 400 }
      );
    }

    // Map course slugs to display names
    const courseMap: Record<string, string> = {
      "eips-101": "EIPs 101: From First Principles to First Proposal",
      "ens-101": "ENS 101: Ethereum Name Service Essentials",
      "0g-101": "0G 101: AI-Native Stack",
    };

    const courseName = courseMap[courseSlug];
    if (!courseName) {
      return NextResponse.json(
        { error: "Invalid course slug" },
        { status: 400 }
      );
    }

    // Find or create course
    let course = await prisma.course.findUnique({
      where: { slug: courseSlug },
    });

    if (!course) {
      course = await prisma.course.create({
        data: {
          slug: courseSlug,
          title: courseName,
          status: "PUBLISHED",
        },
      });
    }

    // Verify course completion
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
        { status: 403 }
      );
    }

    // Check if NFT already claimed for this course
    const existingNFT = await prisma.nFT.findFirst({
      where: {
        userId: session.user.id,
        name: { contains: course.title },
      },
    });

    if (existingNFT) {
      return NextResponse.json(
        {
          message: "NFT already claimed for this course",
          nft: existingNFT,
        },
        { status: 200 }
      );
    }

    // Fetch user data (including ENS name if available)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { wallets: { where: { isPrimary: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user's wallet address if available
    const primaryWallet = user.wallets?.[0];
    const walletAddress = userAddress || primaryWallet?.address || undefined;

    // Mint course completion NFT (Learning Sprout GIF)
    const mintResult = await mintCourseCompletionNFT({
      userId: session.user.id,
      courseSlug,
      courseName,
      userAddress: walletAddress,
    });

    return NextResponse.json(
      {
        message: "NFT claimed successfully! 🎉",
        nft: mintResult.nft,
        transaction: mintResult.transaction,
        explorerUrl: mintResult.transaction.explorerUrl ?? null,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("NFT claim error", "api/claim-nft", undefined, error);

    const message = error instanceof Error ? error.message : "Internal server error";

    if (message.includes('Pinata not configured') || message.includes('On-chain minting unavailable')) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    return NextResponse.json(
      {
        error: "Failed to claim NFT",
        message,
      },
      { status: 500 }
    );
  }
}
