/**
 * Instructor Lesson Management API
 * GET    - List lessons for a course
 * POST   - Create a lesson
 * PUT    - Update/reorder lessons
 * DELETE - Delete a lesson
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { requireInstructor } from "@/lib/middleware/requireInstructor";
import { z } from "zod";

const CreateLessonSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  sectionId: z.string().optional(),
  duration: z.number().int().positive().optional(),
});

const UpdateLessonSchema = z.object({
  lessonId: z.string(),
  title: z.string().min(3).max(200).trim().optional(),
  sectionId: z.string().nullable().optional(),
  duration: z.number().int().positive().nullable().optional(),
  order: z.number().int().min(0).optional(),
});

async function verifyOwnership(userId: string, courseId: string) {
  return prisma.course.findFirst({ where: { id: courseId, creatorId: userId } });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const userId = await requireInstructor();
  if (userId instanceof Response) return userId as any;
  const { courseId } = await params;

  const course = await verifyOwnership(userId, courseId);
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
    include: {
      contentBlocks: { orderBy: { order: "asc" } },
      section: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json({ lessons });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const userId = await requireInstructor();
  if (userId instanceof Response) return userId as any;
  const { courseId } = await params;

  const course = await verifyOwnership(userId, courseId);
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const body = await request.json();
  const parse = CreateLessonSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Validation failed", details: parse.error.issues }, { status: 400 });
  }

  const maxOrder = await prisma.lesson.aggregate({
    where: { courseId },
    _max: { order: true },
  });

  const lesson = await prisma.lesson.create({
    data: {
      courseId,
      title: parse.data.title,
      sectionId: parse.data.sectionId || null,
      duration: parse.data.duration || null,
      order: (maxOrder._max.order ?? -1) + 1,
      content: "",
    },
    include: { contentBlocks: true },
  });

  return NextResponse.json(lesson, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const userId = await requireInstructor();
  if (userId instanceof Response) return userId as any;
  const { courseId } = await params;

  const course = await verifyOwnership(userId, courseId);
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const body = await request.json();

  // Batch reorder: { lessons: [{id, order}] }
  if (body.lessons && Array.isArray(body.lessons)) {
    const updates = body.lessons.map((l: { id: string; order: number }) =>
      prisma.lesson.update({ where: { id: l.id }, data: { order: l.order } })
    );
    await prisma.$transaction(updates);
    return NextResponse.json({ message: "Lessons reordered" });
  }

  const parse = UpdateLessonSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { lessonId, ...updates } = parse.data;
  const lesson = await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      ...(updates.title && { title: updates.title }),
      ...(updates.sectionId !== undefined && { sectionId: updates.sectionId }),
      ...(updates.duration !== undefined && { duration: updates.duration }),
      ...(updates.order !== undefined && { order: updates.order }),
    },
  });

  return NextResponse.json(lesson);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const userId = await requireInstructor();
  if (userId instanceof Response) return userId as any;
  const { courseId } = await params;

  const course = await verifyOwnership(userId, courseId);
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("id");
  if (!lessonId) {
    return NextResponse.json({ error: "Lesson ID required" }, { status: 400 });
  }

  await prisma.lesson.delete({ where: { id: lessonId } });

  return NextResponse.json({ message: "Lesson deleted" });
}
