/**
 * Instructor Content Block Management API
 * POST   - Create a content block for a lesson
 * PUT    - Update/reorder content blocks
 * DELETE - Delete a content block
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { requireInstructor } from "@/lib/middleware/requireInstructor";
import { z } from "zod";

const CreateBlockSchema = z.object({
  lessonId: z.string(),
  type: z.enum(["TEXT", "VIDEO", "YOUTUBE", "CODE", "QUIZ"]),
  textContent: z.string().optional(),
  videoUrl: z.string().optional(),
  codeLanguage: z.string().optional(),
  quizData: z.any().optional(),
});

const UpdateBlockSchema = z.object({
  blockId: z.string(),
  type: z.enum(["TEXT", "VIDEO", "YOUTUBE", "CODE", "QUIZ"]).optional(),
  textContent: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  codeLanguage: z.string().nullable().optional(),
  quizData: z.any().optional(),
  order: z.number().int().min(0).optional(),
});

async function verifyOwnership(userId: string, courseId: string) {
  return prisma.course.findFirst({ where: { id: courseId, creatorId: userId } });
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
  const parse = CreateBlockSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Validation failed", details: parse.error.issues }, { status: 400 });
  }

  // Verify lesson belongs to course
  const lesson = await prisma.lesson.findFirst({
    where: { id: parse.data.lessonId, courseId },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const maxOrder = await prisma.contentBlock.aggregate({
    where: { lessonId: parse.data.lessonId },
    _max: { order: true },
  });

  const block = await prisma.contentBlock.create({
    data: {
      lessonId: parse.data.lessonId,
      type: parse.data.type as any,
      textContent: parse.data.textContent || null,
      videoUrl: parse.data.videoUrl || null,
      codeLanguage: parse.data.codeLanguage || null,
      quizData: parse.data.quizData || undefined,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  return NextResponse.json(block, { status: 201 });
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

  // Batch reorder: { blocks: [{id, order}] }
  if (body.blocks && Array.isArray(body.blocks)) {
    const updates = body.blocks.map((b: { id: string; order: number }) =>
      prisma.contentBlock.update({ where: { id: b.id }, data: { order: b.order } })
    );
    await prisma.$transaction(updates);
    return NextResponse.json({ message: "Blocks reordered" });
  }

  const parse = UpdateBlockSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const { blockId, ...updates } = parse.data;
  const block = await prisma.contentBlock.update({
    where: { id: blockId },
    data: {
      ...(updates.type && { type: updates.type as any }),
      ...(updates.textContent !== undefined && { textContent: updates.textContent }),
      ...(updates.videoUrl !== undefined && { videoUrl: updates.videoUrl }),
      ...(updates.codeLanguage !== undefined && { codeLanguage: updates.codeLanguage }),
      ...(updates.quizData !== undefined && { quizData: updates.quizData }),
      ...(updates.order !== undefined && { order: updates.order }),
    },
  });

  return NextResponse.json(block);
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
  const blockId = searchParams.get("id");
  if (!blockId) {
    return NextResponse.json({ error: "Block ID required" }, { status: 400 });
  }

  await prisma.contentBlock.delete({ where: { id: blockId } });

  return NextResponse.json({ message: "Content block deleted" });
}
