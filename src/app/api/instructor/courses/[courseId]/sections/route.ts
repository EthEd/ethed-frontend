/**
 * Instructor Section Management API
 * POST   - Create a section
 * PUT    - Update/reorder sections
 * DELETE - Delete a section
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { requireInstructor } from "@/lib/middleware/requireInstructor";
import { z } from "zod";

const CreateSectionSchema = z.object({
  title: z.string().min(2).max(100).trim(),
});

const UpdateSectionSchema = z.object({
  sectionId: z.string(),
  title: z.string().min(2).max(100).trim().optional(),
  order: z.number().int().min(0).optional(),
});

async function verifyOwnership(userId: string, courseId: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, creatorId: userId },
  });
  return course;
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
  const parse = CreateSectionSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Validation failed", details: parse.error.issues }, { status: 400 });
  }

  // Get max order
  const maxOrder = await prisma.section.aggregate({
    where: { courseId },
    _max: { order: true },
  });

  const section = await prisma.section.create({
    data: {
      courseId,
      title: parse.data.title,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  return NextResponse.json(section, { status: 201 });
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

  // Support batch reorder: { sections: [{id, order}] }
  if (body.sections && Array.isArray(body.sections)) {
    const updates = body.sections.map((s: { id: string; order: number }) =>
      prisma.section.update({ where: { id: s.id }, data: { order: s.order } })
    );
    await prisma.$transaction(updates);
    return NextResponse.json({ message: "Sections reordered" });
  }

  const parse = UpdateSectionSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const section = await prisma.section.update({
    where: { id: parse.data.sectionId },
    data: {
      ...(parse.data.title && { title: parse.data.title }),
      ...(parse.data.order !== undefined && { order: parse.data.order }),
    },
  });

  return NextResponse.json(section);
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
  const sectionId = searchParams.get("id");
  if (!sectionId) {
    return NextResponse.json({ error: "Section ID required" }, { status: 400 });
  }

  await prisma.section.delete({ where: { id: sectionId } });

  return NextResponse.json({ message: "Section deleted" });
}
