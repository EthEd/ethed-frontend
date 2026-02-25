import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
  try {
    const topUsers = await prisma.user.findMany({
      take: 50,
      orderBy: [
        { xp: "desc" },
        { createdAt: "asc" }
      ],
      select: {
        id: true,
        name: true,
        image: true,
        xp: true,
        level: true,
        streak: true,
        wallets: {
          where: {
            ensName: { not: null }
          },
          select: {
            ensName: true
          }
        }
      }
    });

    const formattedUsers = topUsers.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name,
      image: user.image,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      ensName: user.wallets[0]?.ensName || null,
    }));

    return NextResponse.json({ success: true, leaderboard: formattedUsers });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
