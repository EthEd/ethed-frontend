import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { addXpAndProgress } from "@/lib/gamification";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseSlug } = body;
    if (!courseSlug) {
      return NextResponse.json({ error: "Missing courseSlug" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Award bonus XP for course completion
    await addXpAndProgress(session.user.id); // Base XP + Streak
    
    // Additional bonus for completing a full course (50 XP)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: 50 } }
    });

    // Upsert the UserCourse record to mark completion
    const userCourse = await prisma.userCourse.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      update: { progress: 100, completed: true, finishedAt: new Date() },
      create: { userId: session.user.id, courseId: course.id, progress: 100, completed: true, finishedAt: new Date() }
    });

    return NextResponse.json({ message: "Course marked complete", userCourse });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
