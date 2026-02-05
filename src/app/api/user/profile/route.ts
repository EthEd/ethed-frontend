import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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
      joinedDate: user.createdAt
    };

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        wallets: user.wallets,
        // pet data intentionally omitted from the response for MVP
        courses: user.courses,
        nfts: user.nfts,
        stats
      }
    });

  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { onboardingCompleted, selectedBuddy, ensName, name, image } = body;

    console.log("Profile update for user:", session.user.email, body);

    // For demo purposes, just return success
    // In production, you would update the database:
    // const user = await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: updates
    // });

    const mockUser = {
      id: session.user.id,
      name: name || session.user.name,
      email: session.user.email,
      image: image || session.user.image,
      onboardingCompleted: onboardingCompleted || false,
      selectedBuddy: selectedBuddy || null,
      ensName: ensName || null,
      updatedAt: new Date()
    };

    return NextResponse.json({
      message: "Profile updated successfully",
      user: mockUser
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}