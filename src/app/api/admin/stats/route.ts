/**
 * GET /api/admin/stats
 * Returns real platform statistics for the admin dashboard.
 * Requires ADMIN role.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { requireAdmin } from "@/lib/middleware/requireAdmin";

export async function GET() {
  const check = await requireAdmin();
  if (check instanceof Response) return check as any;

  const [totalUsers, activeCourses, nftsMinted, totalEnrollments, completedEnrollments, moderatorCount, instructorCount, pendingReviews] =
    await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.nFT.count(),
      prisma.userCourse.count(),
      prisma.userCourse.count({ where: { completed: true } }),
      prisma.user.count({ where: { role: "MODERATOR" } }),
      prisma.user.count({ where: { role: "INSTRUCTOR" } }),
      prisma.course.count({ where: { status: "AWAITING_APPROVAL" } }),
    ]);

  const completionRate =
    totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

  return NextResponse.json({
    totalUsers,
    activeCourses,
    nftsMinted,
    totalEnrollments,
    completionRate,
    moderatorCount,
    instructorCount,
    pendingReviews,
  });
}
