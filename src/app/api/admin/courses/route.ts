/**
 * Admin Course Management API
 * Handles creating, updating, and publishing courses
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { CourseDraftSchema, sanitizeSlug } from "@/lib/zodSchemas";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/middleware/auditLog";
import { logger } from "@/lib/monitoring";


/**
 * GET: Fetch all courses or a specific course
 */
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof Response) return adminCheck as any;

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("id");

    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { _count: { select: { users: true } } },
      });
      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
      return NextResponse.json(course);
    }

    const searchQ = searchParams.get("q") ?? "";
    const statusFilter = searchParams.get("status") ?? "";
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const PAGE_SIZE = 20;

    const where = {
      ...(searchQ
        ? {
            OR: [
              { title: { contains: searchQ, mode: "insensitive" as const } },
              { slug: { contains: searchQ, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(statusFilter ? { status: statusFilter as any } : {}),
    };

    const [rawCourses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          _count: { select: { users: true, lessons: true } },
          users: { select: { completed: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.course.count({ where }),
    ]);

    const courses = rawCourses.map(c => {
      const totalEnrolled = c._count.users;
      const completedCount = c.users.filter(u => u.completed).length;
      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        status: c.status,
        level: c.level,
        price: c.price,
        lessons: c._count.lessons,
        students: totalEnrolled,
        completionRate: totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });

    return NextResponse.json({ courses, total, page, pageSize: PAGE_SIZE, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new course
 */
export async function POST(request: NextRequest) {
  try {
    const actorId = await requireAdmin();
    if (actorId instanceof Response) return actorId as any;

    const body = await request.json();

    // Validate request body — use draft schema so only title is required
    const validation = CourseDraftSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { title, description, level } = validation.data;
    const slug = sanitizeSlug(body.slug || title);

    // Check if slug is unique
    const existingCourse = await prisma.course.findUnique({
      where: { slug },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: "Course slug already exists" },
        { status: 409 }
      );
    }

    // Create course (map `level` from schema to Prisma `level`)
    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        level: (level as any) || "BEGINNER",
        price: (validation.data as any).price ?? undefined,
        status: "DRAFT",
      },
    });

    await createAuditLog({
      actorId,
      action: AUDIT_ACTIONS.COURSE_CREATED,
      targetId: course.id,
      targetType: "COURSE",
      metadata: { title: course.title, slug: course.slug },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    logger.error("Course creation error", "api/admin/courses", undefined, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update an existing course
 */
export async function PUT(request: NextRequest) {
  try {
    const actorId = await requireAdmin();
    if (actorId instanceof Response) return actorId as any;

    const body = await request.json();
    const { courseId, title, description, level, status } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 });
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(level && { level }),
        ...(status && { status }),
      },
    });

    await createAuditLog({
      actorId,
      action: AUDIT_ACTIONS.COURSE_UPDATED,
      targetId: course.id,
      targetType: "COURSE",
      metadata: { title: course.title, changes: { title, description, level, status } },
    });

    return NextResponse.json(course);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Archive/delete a course
 */
export async function DELETE(request: NextRequest) {
  try {
    const actorId = await requireAdmin();
    if (actorId instanceof Response) return actorId as any;

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("id");

    if (!courseId) {
      return NextResponse.json({ error: "Course ID required" }, { status: 400 });
    }

    // Soft delete by archiving
    const course = await prisma.course.update({
      where: { id: courseId },
      data: { status: "ARCHIVED" },
    });

    await createAuditLog({
      actorId,
      action: AUDIT_ACTIONS.COURSE_DELETED,
      targetId: course.id,
      targetType: "COURSE",
      metadata: { title: course.title, slug: course.slug },
    });

    return NextResponse.json({ message: "Course archived", course });
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
