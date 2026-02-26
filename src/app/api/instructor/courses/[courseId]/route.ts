/**
 * Instructor Single Course API
 * GET    - Get course details (only if owned by instructor)
 * PUT    - Update course details
 * DELETE - Delete draft course
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { requireInstructor } from "@/lib/middleware/requireInstructor";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/middleware/auditLog";
import { z } from "zod";

const UpdateCourseSchema = z.object({
  title: z.string().min(5).max(100).trim().optional(),
  description: z.string().min(10).max(5000).trim().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  category: z.string().max(50).optional(),
});

async function getOwnedCourse(userId: string, courseId: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId, creatorId: userId },
    include: {
      sections: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      lessons: {
        where: { sectionId: null },
        orderBy: { order: "asc" },
        include: { contentBlocks: { orderBy: { order: "asc" } } },
      },
      _count: { select: { users: true } },
    },
  });
  return course;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const userId = await requireInstructor();
  if (userId instanceof Response) return userId as any;
  const { courseId } = await params;

  const course = await getOwnedCourse(userId, courseId);
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const userId = await requireInstructor();
  if (userId instanceof Response) return userId as any;
  const { courseId } = await params;

  const course = await prisma.course.findFirst({
    where: { id: courseId, creatorId: userId },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Only allow editing DRAFT or REJECTED courses
  if (course.status !== "DRAFT" && course.status !== "REJECTED") {
    return NextResponse.json(
      { error: "Only draft or rejected courses can be edited" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parse = UpdateCourseSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parse.error.issues },
      { status: 400 }
    );
  }

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: {
      ...parse.data,
      level: parse.data.level as any,
      status: "DRAFT", // Reset to draft if it was rejected
      rejectionReason: null,
    },
  });

  await createAuditLog({
    actorId: userId,
    action: AUDIT_ACTIONS.COURSE_UPDATED,
    targetId: courseId,
    targetType: "COURSE",
    metadata: { changes: parse.data },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const userId = await requireInstructor();
  if (userId instanceof Response) return userId as any;
  const { courseId } = await params;

  const course = await prisma.course.findFirst({
    where: { id: courseId, creatorId: userId },
  });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.status === "PUBLISHED") {
    return NextResponse.json({ error: "Cannot delete published courses" }, { status: 400 });
  }

  await prisma.course.delete({ where: { id: courseId } });

  await createAuditLog({
    actorId: userId,
    action: AUDIT_ACTIONS.COURSE_DELETED,
    targetId: courseId,
    targetType: "COURSE",
    metadata: { title: course.title },
  });

  return NextResponse.json({ message: "Course deleted" });
}
