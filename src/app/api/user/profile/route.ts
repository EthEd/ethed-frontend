import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { getSessionOrUnauthorized } from "@/lib/api-auth";

export async function GET() {
  try {
    const { session, errorResponse } = await getSessionOrUnauthorized();
    if (errorResponse) return errorResponse;

    // Fetch real user data from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        wallets: true,
        // Keep pet data in DB for future use, but do not return to the UI
        // pets: true,
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

    // Calculate stats
    const stats = {
      coursesEnrolled: user.courses.length,
      coursesCompleted: user.courses.filter(c => c.completed).length,
      nftsOwned: user.nfts.length,
      walletConnected: user.wallets.length > 0,
      ensName: user.wallets.find(w => w.ensName)?.ensName || null,
      joinedDate: user.createdAt,
      xp: user.xp,
      level: user.level,
      streak: user.streak
    };

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        onboardingStep: user.onboardingStep,
        createdAt: user.createdAt,
        wallets: user.wallets,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        // pet data intentionally omitted from the response for MVP
        courses: user.courses,
        nfts: user.nfts,
        stats
      }
    });

  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { session, errorResponse } = await getSessionOrUnauthorized();
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { onboardingStep, name, image } = body;

    // Update user in database
    const { prisma } = await import("@/lib/prisma-client");
    
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        image: image || undefined,
        onboardingStep: typeof onboardingStep === 'number' ? onboardingStep : undefined,
      }
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const { session, errorResponse } = await getSessionOrUnauthorized();
    if (errorResponse) return errorResponse;

    const { prisma } = await import("@/lib/prisma-client");

    await prisma.user.delete({ where: { id: session.user.id } });

    return NextResponse.json({ message: "Account deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}