/**
 * Instructor Course Submit for Approval
 * POST - Submit a draft course for admin review
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { requireInstructor } from "@/lib/middleware/requireInstructor";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/middleware/auditLog";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const userId = await requireInstructor();
  if (userId instanceof Response) return userId as any;
  const { courseId } = await params;

  const course = await prisma.course.findFirst({
    where: { id: courseId, creatorId: userId },
    include: { _count: { select: { lessons: true } } },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.status !== "DRAFT" && course.status !== "REJECTED") {
    return NextResponse.json(
      { error: "Only draft or rejected courses can be submitted for approval" },
      { status: 400 }
    );
  }

  if (course._count.lessons === 0) {
    return NextResponse.json(
      { error: "Course must have at least one lesson before submitting" },
      { status: 400 }
    );
  }

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: { status: "AWAITING_APPROVAL", rejectionReason: null },
  });

  await createAuditLog({
    actorId: userId,
    action: AUDIT_ACTIONS.COURSE_SUBMITTED,
    targetId: courseId,
    targetType: "COURSE",
    metadata: { title: course.title },
  });

  return NextResponse.json(updated);
}
