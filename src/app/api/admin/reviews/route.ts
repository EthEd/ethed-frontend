/**
 * Admin Course Review API
 * GET  - List courses awaiting approval
 * POST - Approve or reject a course
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/middleware/auditLog";
import { z } from "zod";

const ReviewSchema = z.object({
  courseId: z.string(),
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(), // Required for rejection
});

export async function GET(request: NextRequest) {
  const check = await requireAdmin();
  if (check instanceof Response) return check as any;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "AWAITING_APPROVAL";

  const courses = await prisma.course.findMany({
    where: { status: status as any },
    include: {
      creator: { select: { id: true, name: true, email: true, image: true } },
      _count: { select: { lessons: true, sections: true } },
      sections: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
      lessons: {
        where: { sectionId: null },
        orderBy: { order: "asc" },
        include: { contentBlocks: { orderBy: { order: "asc" } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ courses });
}

export async function POST(request: NextRequest) {
  const actorId = await requireAdmin();
  if (actorId instanceof Response) return actorId as any;

  const body = await request.json();
  const parse = ReviewSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Validation failed", details: parse.error.issues }, { status: 400 });
  }

  const { courseId, action, reason } = parse.data;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { creator: { select: { name: true, email: true } } },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.status !== "AWAITING_APPROVAL") {
    return NextResponse.json({ error: "Course is not awaiting approval" }, { status: 400 });
  }

  if (action === "approve") {
    await prisma.course.update({
      where: { id: courseId },
      data: { status: "PUBLISHED", rejectionReason: null },
    });

    await createAuditLog({
      actorId,
      action: AUDIT_ACTIONS.COURSE_APPROVED,
      targetId: courseId,
      targetType: "COURSE",
      metadata: { title: course.title, instructor: course.creator?.name },
    });

    return NextResponse.json({ message: "Course approved and published" });
  }

  if (action === "reject") {
    if (!reason) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
    }

    await prisma.course.update({
      where: { id: courseId },
      data: { status: "REJECTED", rejectionReason: reason },
    });

    await createAuditLog({
      actorId,
      action: AUDIT_ACTIONS.COURSE_REJECTED,
      targetId: courseId,
      targetType: "COURSE",
      metadata: { title: course.title, reason, instructor: course.creator?.name },
    });

    return NextResponse.json({ message: "Course rejected" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
