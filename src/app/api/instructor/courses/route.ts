/**
 * Instructor Course Management API
 * GET  - List instructor's own courses
 * POST - Create a new course (as DRAFT)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { requireInstructor } from "@/lib/middleware/requireInstructor";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/middleware/auditLog";
import { sanitizeSlug } from "@/lib/zodSchemas";
import { z } from "zod";

const CreateCourseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100).trim(),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000).trim(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  category: z.string().max(50).optional(),
});

export async function GET(request: NextRequest) {
  const userId = await requireInstructor();
  if (userId instanceof Response) return userId as any;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const courses = await prisma.course.findMany({
    where: {
      creatorId: userId,
      ...(status ? { status: status as any } : {}),
    },
    include: {
      _count: { select: { lessons: true, users: true, sections: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ courses });
}

export async function POST(request: NextRequest) {
  const userId = await requireInstructor();
  if (userId instanceof Response) return userId as any;

  const body = await request.json();
  const parse = CreateCourseSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parse.error.issues },
      { status: 400 }
    );
  }

  const { title, description, level, category } = parse.data;
  const slug = sanitizeSlug(title);

  // Ensure unique slug
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "A course with this slug already exists" }, { status: 409 });
  }

  const course = await prisma.course.create({
    data: {
      title,
      description,
      level: level as any,
      category,
      slug,
      status: "DRAFT",
      creatorId: userId,
    },
  });

  await createAuditLog({
    actorId: userId,
    action: AUDIT_ACTIONS.COURSE_CREATED,
    targetId: course.id,
    targetType: "COURSE",
    metadata: { title, slug, createdBy: "instructor" },
  });

  return NextResponse.json(course, { status: 201 });
}
