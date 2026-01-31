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

    // For demo purposes, return mock user data
    // In production, you would fetch from database:
    // const user = await prisma.user.findUnique({ ... });

    const mockUser = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: 'user',
      createdAt: new Date(),
      wallets: [],
      pets: [],
      courses: [],
      stats: {
        coursesEnrolled: 0,
        purchasesMade: 0,
        nftsOwned: 0
      }
    };

    return NextResponse.json({
      user: mockUser
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