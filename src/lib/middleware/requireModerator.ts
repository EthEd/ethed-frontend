import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { logger } from "@/lib/monitoring";

/**
 * Require the current session to belong to a MODERATOR or ADMIN.
 *
 * Returns the userId (string) on success.
 * Returns a NextResponse (401 or 403) that the caller must return immediately.
 *
 * Usage:
 * ```ts
 * const check = await requireModerator();
 * if (check instanceof Response) return check;
 * const userId = check;
 * ```
 */
export async function requireModerator(): Promise<string | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (user.role !== "MODERATOR" && user.role !== "ADMIN") {
    logger.warn(
      `Insufficient role (${user.role}) for moderator endpoint — ${user.email ?? session.user.id}`,
      "requireModerator"
    );
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return session.user.id;
}
