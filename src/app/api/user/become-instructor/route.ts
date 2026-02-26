/**
 * Become Instructor API
 * POST - Request to become an instructor
 * Requirements: User must have completed at least 1 course on the platform
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/middleware/auditLog";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Already an instructor or higher role
  if (user.role === "INSTRUCTOR" || user.role === "MODERATOR" || user.role === "ADMIN") {
    return NextResponse.json({ error: "Already an instructor or higher role" }, { status: 400 });
  }

  // Check if user has completed at least 1 course
  const completedCourses = await prisma.userCourse.count({
    where: { userId: session.user.id, completed: true },
  });

  if (completedCourses < 1) {
    return NextResponse.json(
      {
        error: "You must complete at least one course before becoming an instructor",
        completedCourses,
        required: 1,
      },
      { status: 403 }
    );
  }

  // Promote to instructor
  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "INSTRUCTOR" },
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AUDIT_ACTIONS.INSTRUCTOR_PROMOTED,
    targetId: session.user.id,
    targetType: "USER",
    metadata: { completedCourses },
  });

  return NextResponse.json({ message: "You are now an instructor!", role: "INSTRUCTOR" });
}

/**
 * GET - Check eligibility to become an instructor
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const completedCourses = await prisma.userCourse.count({
    where: { userId: session.user.id, completed: true },
  });

  const isEligible = completedCourses >= 1 && user.role === "USER";
  const isAlreadyInstructor = user.role === "INSTRUCTOR" || user.role === "MODERATOR" || user.role === "ADMIN";

  return NextResponse.json({
    eligible: isEligible,
    isAlreadyInstructor,
    currentRole: user.role,
    completedCourses,
    required: 1,
  });
}
