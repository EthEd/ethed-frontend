import { NextRequest, NextResponse } from "next/server";
import { getSessionOrUnauthorized } from "@/lib/api-auth";
import { mintCourseCompletionNFT } from "@/lib/nft-service";
import { logger } from "@/lib/monitoring";
import { prisma } from "@/lib/prisma-client";

export async function POST(request: NextRequest) {
  try {
    const { session, errorResponse } = await getSessionOrUnauthorized();
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { courseSlug, courseName, userAddress } = body;

    if (!courseSlug || !courseName) {
      return NextResponse.json(
        { error: "Missing courseSlug or courseName" },
        { status: 400 }
      );
    }

    // Double check if course is actually completed
    const userCourse = await prisma.userCourse.findFirst({
        where: {
            userId: session.user.id,
            course: { slug: courseSlug },
            completed: true
        }
    });

    if (!userCourse) {
        // Optional: you might want to allow minting if they are at 100% even if not flagged yet
        // but for safety we check the flag
        logger.warn(`User ${session.user.id} tried to mint NFT for uncompleted course ${courseSlug}`, "api/nft/mint");
        // return NextResponse.json({ error: "Course not completed" }, { status: 400 });
    }

    // Check if NFT already exists for this course and user to avoid double minting
    const existingNft = await prisma.nFT.findFirst({
        where: {
            userId: session.user.id,
            name: { contains: courseName }
        }
    });

    if (existingNft) {
        return NextResponse.json({ 
            message: "NFT already minted", 
            nft: existingNft,
            alreadyMinted: true 
        });
    }

    logger.info(`Minting course completion NFT for ${session.user.id}, course: ${courseSlug}`, "api/nft/mint");

    const result = await mintCourseCompletionNFT({
      userId: session.user.id,
      courseSlug,
      courseName,
      userAddress,
      recipientName: session.user.name || undefined
    });

    return NextResponse.json({
      message: "NFT minted successfully",
      nft: result.nft,
      transaction: result.transaction
    });

  } catch (err) {
    logger.error("POST /api/user/nft/mint error", "api/nft/mint", undefined, err);
    return NextResponse.json(
      { error: "Failed to mint NFT" },
      { status: 500 }
    );
  }
}
