import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { addXpAndProgress } from "@/lib/gamification";
import { HttpStatus } from "@/lib/api-response";
import { logger } from "@/lib/monitoring";
import arcjet, { shield, slidingWindow } from "@/lib/arcjet";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: HttpStatus.UNAUTHORIZED });
    }

    const decision = await arcjet
      .withRule(
        slidingWindow({
          mode: "LIVE",
          interval: "1m",
          max: 5, // Max 5 completions per minute
        })
      )
      .protect(request, { fingerprint: session.user.id });

    if (decision.isDenied()) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: HttpStatus.RATE_LIMITED }
      );
    }

    const body = await request.json();
    const { courseSlug } = body;
    if (!courseSlug) {
      return NextResponse.json({ error: "Missing courseSlug" }, { status: HttpStatus.BAD_REQUEST });
    }

    const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: HttpStatus.NOT_FOUND });
    }

    // 1. Mark completion in DB first
    const userCourse = await prisma.userCourse.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      update: { progress: 100, completed: true, finishedAt: new Date() },
      create: { userId: session.user.id, courseId: course.id, progress: 100, completed: true, finishedAt: new Date() }
    });

    // 2. Award XP and update levels (Standard Lesson XP + 50 Bonus for course completion)
    const bonusXp = 50;
    const totalXpAwarded = 10 + bonusXp; // 10 for the final module + 50 for the course 
    await addXpAndProgress(session.user.id, undefined, totalXpAwarded);

    logger.info(`User ${session.user.id} completed course ${courseSlug}`, "course-api");

    return NextResponse.json({ 
      success: true, 
      message: "Course marked complete", 
      userCourse,
      bonusXp 
    });
  } catch (error) {
    console.error("Course completion Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: HttpStatus.INTERNAL_ERROR });
  }
}
