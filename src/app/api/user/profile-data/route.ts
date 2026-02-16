import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch comprehensive user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        wallets: true,
        courses: {
          include: {
            course: true
          }
        },
        nfts: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate comprehensive stats
    const coursesCompleted = user.courses.filter(c => c.completed).length;
    const totalProgress = user.courses.reduce((sum, c) => sum + (c.progress || 0), 0);
    const avgProgress = user.courses.length > 0 ? totalProgress / user.courses.length : 0;

    // Get all course details with slugs
    const coursesWithDetails = user.courses.map(uc => {
      const courseInfo = uc.course;
      return {
        id: uc.courseId,
        slug: courseInfo.slug,
        title: courseInfo.title,
        progress: uc.progress || 0,
        completed: uc.completed,
        completedAt: uc.finishedAt,
        startedAt: uc.startedAt,
        nftClaimed: user.nfts.some(nft => 
          nft.metadata && 
          typeof nft.metadata === 'object' && 
          'courseSlug' in nft.metadata && 
          nft.metadata.courseSlug === courseInfo.slug
        )
      };
    });

    // Get NFTs with metadata
    const nftsWithDetails = user.nfts.map(nft => ({
      id: nft.id,
      name: nft.name,
      description: nft.metadata && typeof nft.metadata === 'object' && 'description' in nft.metadata 
        ? String(nft.metadata.description) 
        : null,
      image: nft.image,
      tokenId: nft.tokenId,
      metadata: nft.metadata,
      createdAt: nft.createdAt,
      type: nft.metadata && typeof nft.metadata === 'object' && 'courseSlug' in nft.metadata 
        ? 'course-completion' 
        : 'achievement'
    }));

    const stats = {
      coursesEnrolled: user.courses.length,
      coursesCompleted,
      coursesInProgress: user.courses.length - coursesCompleted,
      nftsEarned: user.nfts.length,
      averageProgress: Math.round(avgProgress),
      totalLessonsCompleted: user.courses.reduce((sum, c) => {
        // Estimate lessons completed based on progress
        // Each course has approximately 8 lessons
        return sum + Math.floor((c.progress || 0) / 100 * 8);
      }, 0),
      studyStreak: 0, // Implement streak tracking in future
      joinedDate: user.createdAt,
      lastActive: user.courses.length > 0 
        ? new Date(Math.max(...user.courses.map(c => new Date(c.startedAt).getTime())))
        : user.createdAt
    };

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        ensName: user.wallets.find(w => w.ensName)?.ensName || null,
        ensAvatar: user.wallets.find(w => w.ensAvatar)?.ensAvatar || null,
        walletAddress: user.wallets[0]?.address || null,
        stats,
        courses: coursesWithDetails,
        nfts: nftsWithDetails
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
