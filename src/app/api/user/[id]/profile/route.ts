import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { logger } from "@/lib/monitoring";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        wallets: true,
        courses: {
          include: {
            course: true
          }
        },
        nfts: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Public profile data (filter out sensitive fields)
    const stats = {
      coursesEnrolled: user.courses.length,
      coursesCompleted: user.courses.filter(c => c.completed).length,
      nftsOwned: user.nfts.length,
      walletConnected: user.wallets.length > 0,
      ensName: user.wallets.find(w => w.ensName)?.ensName || null,
      joinedDate: user.createdAt,
      xp: (user as any).xp || 0,
      level: (user as any).level || 1,
      streak: (user as any).streak || 0,
    };

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
        createdAt: user.createdAt,
        ensName: stats.ensName,
        xp: stats.xp,
        level: stats.level,
        streak: stats.streak,
        courses: user.courses.map(c => ({
          id: c.id,
          title: c.course.title,
          slug: c.course.slug,
          completed: c.completed,
          progress: c.progress,
        })),
        nfts: user.nfts.map(n => ({
          id: n.id,
          name: n.name,
          image: n.image,
          createdAt: n.createdAt,
        })),
        stats
      }
    });

  } catch (error) {
    logger.error("Public profile fetch error", "UserProfileAPI", undefined, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
