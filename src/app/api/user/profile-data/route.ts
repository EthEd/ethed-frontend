import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { getExplorerTxUrl } from "@/lib/contracts";
import arcjet, { shield, slidingWindow } from "@/lib/arcjet";
import { HttpStatus } from "@/lib/api-response";
import { logger } from "@/lib/monitoring";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    // 1. Arcjet Protection
    const decision = await arcjet
      .withRule(
        slidingWindow({
          mode: "LIVE",
          interval: "1m",
          max: 30, // 30 requests per minute
        })
      )
      .protect(request, { fingerprint: session.user.id });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { success: false, error: "Too many requests" },
          { status: HttpStatus.RATE_LIMITED }
        );
      }
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: HttpStatus.FORBIDDEN }
      );
    }

    // Fetch comprehensive user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        wallets: true,
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                price: true,
                level: true,
                status: true,
                createdAt: true,
                updatedAt: true
              }
            }
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
        { status: HttpStatus.NOT_FOUND }
      );
    }

    // 2. Security Check: Banned Users
    if (user.banned) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Account banned", 
          reason: user.banReason,
          expires: user.banExpires
        },
        { status: HttpStatus.FORBIDDEN }
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

    // Get NFTs with metadata and explorer links
    const nftsWithDetails = user.nfts.map(nft => {
      const txHash = (nft as any).transactionHash as string | null;
      const chainId = (nft as any).chainId as number | null;
      const explorerUrl = txHash && chainId && !txHash.startsWith("0x" + "0".repeat(64))
        ? getExplorerTxUrl(chainId, txHash)
        : null;

      return {
        id: nft.id,
        name: nft.name,
        description: nft.metadata && typeof nft.metadata === 'object' && 'description' in nft.metadata 
          ? String(nft.metadata.description) 
          : null,
        image: nft.image,
        tokenId: nft.tokenId,
        metadata: nft.metadata,
        createdAt: nft.createdAt,
        contractAddress: (nft as any).contractAddress ?? null,
        transactionHash: txHash ?? null,
        ownerAddress: (nft as any).ownerAddress ?? null,
        chainId: chainId ?? null,
        explorerUrl,
        type: nft.metadata && typeof nft.metadata === 'object' && 'courseSlug' in nft.metadata 
          ? 'course-completion' 
          : 'achievement',
      };
    });

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
      studyStreak: user.streak || 0,
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
    logger.error("Profile Data Error", "ProfileDataAPI", undefined, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: HttpStatus.INTERNAL_ERROR }
    );
  }
}
