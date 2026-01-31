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

    const pets = await prisma.pet.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ pets });

  } catch (error) {
    console.error("Pets fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("Pets API - Session:", session);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to create a learning buddy" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, petType = "buddy" } = body;

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Pet name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // For demo purposes, create a simple pet object without database
    // In production, you'd save to the database
    const pet = {
      id: `pet-${Date.now()}`,
      userId: session.user.id,
      name: name,
      level: 1,
      experience: 0,
      state: {
        type: petType,
        mood: "happy",
        lastFed: new Date().toISOString(),
        personality: generatePersonality(),
        achievements: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log("Created demo pet:", pet);

    return NextResponse.json({
      message: "Pet created successfully",
      pet
    });

  } catch (error) {
    console.error("Pet creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generatePersonality() {
  const traits = [
    "curious", "playful", "wise", "energetic", "calm", 
    "adventurous", "friendly", "mysterious", "loyal", "creative"
  ];
  
  const selectedTraits = traits
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
    
  return {
    traits: selectedTraits,
    favoriteActivity: ["learning", "exploring", "coding", "gaming"][Math.floor(Math.random() * 4)],
    mood: "happy"
  };
}