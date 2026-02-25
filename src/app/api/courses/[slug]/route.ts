/**
 * GET /api/courses/[slug]
 * Public endpoint — returns a single PUBLISHED course with its lessons.
 * No auth required.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const course = await prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      lessons: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          content: true,
          duration: true,
          createdAt: true,
        },
      },
      _count: { select: { users: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const LEVEL_MAP: Record<string, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
  };

  return NextResponse.json({
    id: course.slug,
    dbId: course.id,
    title: course.title,
    description: course.description ?? "",
    level: LEVEL_MAP[course.level] ?? "Beginner",
    students: course._count.users,
    lessons: course.lessons.map((l, idx) => ({
      id: `${course.slug}-l${idx + 1}`,
      lessonNumber: idx + 1,
      title: l.title,
      duration: l.duration ? `${l.duration} mins` : "10 mins",
      type: "reading",
      xpReward: 10,
      difficulty: LEVEL_MAP[course.level] ?? "Beginner",
      content: l.content,
      keyTakeaways: [],
    })),
  });
}
