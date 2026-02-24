/**
 * GET  /api/user/notifications  — return current prefs
 * PATCH /api/user/notifications  — update prefs
 */
import { NextRequest, NextResponse } from "next/server";
import { getSessionOrUnauthorized } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma-client";

export interface NotificationPrefs {
  courseCompletion: boolean;
  newCourses: boolean;
  nftMinting: boolean;
}

const DEFAULTS: NotificationPrefs = {
  courseCompletion: true,
  newCourses: false,
  nftMinting: true,
};

function mergePrefs(raw: unknown): NotificationPrefs {
  if (!raw || typeof raw !== "object") return { ...DEFAULTS };
  const r = raw as Record<string, unknown>;
  return {
    courseCompletion: typeof r.courseCompletion === "boolean" ? r.courseCompletion : DEFAULTS.courseCompletion,
    newCourses: typeof r.newCourses === "boolean" ? r.newCourses : DEFAULTS.newCourses,
    nftMinting: typeof r.nftMinting === "boolean" ? r.nftMinting : DEFAULTS.nftMinting,
  };
}

export async function GET() {
  const { session, errorResponse } = await getSessionOrUnauthorized();
  if (errorResponse) return errorResponse;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { notificationPrefs: true },
  });

  return NextResponse.json({
    prefs: mergePrefs(user?.notificationPrefs),
  });
}

export async function PATCH(request: NextRequest) {
  const { session, errorResponse } = await getSessionOrUnauthorized();
  if (errorResponse) return errorResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prefs = mergePrefs(body);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { notificationPrefs: prefs },
  });

  return NextResponse.json({ prefs });
}
