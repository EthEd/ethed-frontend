/**
 * GET /api/courses
 * Public endpoint — returns all PUBLISHED courses from the database.
 * No auth required.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";

    const where = {
      status: "PUBLISHED" as const,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const dbCourses = await prisma.course.findMany({
      where,
      include: {
        _count: { select: { lessons: true, users: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const LEVEL_MAP: Record<string, string> = {
      BEGINNER: "Beginner",
      INTERMEDIATE: "Intermediate",
      ADVANCED: "Advanced",
    };

    const courses = dbCourses.map((c) => ({
      id: c.slug,
      dbId: c.id,
      title: c.title,
      description: c.description ?? "",
      difficulty: (LEVEL_MAP[c.level] ?? "Beginner") as "Beginner" | "Intermediate" | "Advanced",
      duration: "Self-paced",
      lessons: c._count.lessons,
      students: c._count.users,
      rating: 4.8,
      price: "Free" as const,
      category: "Web3",
      tags: [LEVEL_MAP[c.level] ?? "Beginner", "Web3", "Blockchain"],
      instructor: "EthEd Team",
      thumbnail: "",
      isNew: (Date.now() - new Date(c.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000,
      isPopular: c._count.users > 50,
      nftReward: "Course Completion NFT",
      fromDb: true,
    }));

    return NextResponse.json(
      { courses },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      }
    );
  } catch {
    return NextResponse.json({ courses: [] }, { status: 200 });
  }
}
