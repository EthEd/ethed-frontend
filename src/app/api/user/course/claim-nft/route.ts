import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { mintCourseCompletionNFT } from "@/lib/nft-service";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseSlug } = body;
    if (!courseSlug) {
      return NextResponse.json({ error: "Missing courseSlug" }, { status: 400 });
    }

    // Map course slugs to titles
    const courseMap: Record<string, string> = {
      'eips-101': 'EIPs 101: From First Principles to First Proposal',
      'ens-101': 'ENS 101: Ethereum Name Service Essentials',
      '0g-101': '0G 101: AI-Native Stack'
    };

    const courseName = courseMap[courseSlug];
    if (!courseName) {
      return NextResponse.json({ error: "Invalid course" }, { status: 400 });
    }

    // Find or create course in DB
    let course = await prisma.course.findUnique({ where: { slug: courseSlug } });
    if (!course) {
      course = await prisma.course.create({
        data: {
          slug: courseSlug,
          title: courseName,
          status: 'PUBLISHED'
        }
      });
    }

    // Verify course completion
    const userCourse = await prisma.userCourse.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } }
    });

    if (!userCourse?.completed) {
      return NextResponse.json({ error: "Course not completed" }, { status: 400 });
    }

    // Check if NFT already claimed
    const existingNFT = await prisma.nFT.findFirst({
      where: {
        userId: session.user.id,
        name: { contains: course.title }
      }
    });

    if (existingNFT) {
      return NextResponse.json({ 
        message: "NFT already claimed", 
        nft: existingNFT 
      });
    }

    // Get user wallet address (optional)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { wallets: true }
    });
    const userAddress = user?.wallets?.[0]?.address;

    // Mint NFT using the service
    const result = await mintCourseCompletionNFT({
      userId: session.user.id,
      courseSlug,
      courseName: course.title,
      userAddress
    });

    return NextResponse.json({
      message: `${course.title} completion NFT minted successfully`,
      nft: result.nft,
      transaction: result.transaction
    });
  } catch (error) {
    console.error("NFT claim error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error during NFT claim" },
      { status: 500 }
    );
  }
}
