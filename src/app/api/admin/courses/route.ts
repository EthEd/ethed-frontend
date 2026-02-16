/**
 * Admin Course Management API
 * Handles creating, updating, and publishing courses
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { CourseCreateSchema } from "@/lib/zodSchemas";
import { sanitizeSlug } from "@/lib/zodSchemas";
import { requireAdmin } from "@/lib/middleware/requireAdmin";


/**
 * GET: Fetch all courses or a specific course
 */
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof Response) return adminCheck as any;
    const userId = adminCheck as string;

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

    const courses = await prisma.course.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ courses });
  } catch (error) {
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
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof Response) return adminCheck as any;
    const userId = adminCheck as string;

    const body = await request.json();

    // Validate request body
    const validation = CourseCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { title, description, level, category, fileKey } = validation.data;
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

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Course creation error:", error);
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
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof Response) return adminCheck as any;
    const userId = adminCheck as string;

    const body = await request.json();
    const { courseId, title, description, level, category, fileKey, status } = body;

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
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof Response) return adminCheck as any;
    const userId = adminCheck as string;

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
