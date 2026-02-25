import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { logger } from "@/lib/monitoring";

/**
 * Require the current session to belong to an ADMIN user.
 *
 * Returns the userId (string) on success.
 * Returns a NextResponse (401 or 403) that the caller must return immediately.
 *
 * Usage:
 * ```ts
 * const check = await requireAdmin();
 * if (check instanceof Response) return check;
 * const userId = check; // string
 * ```
 */
export async function requireAdmin(): Promise<string | NextResponse> {
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

  if (user.role !== "ADMIN") {
    logger.warn(
      `Non-admin access attempt by ${user.email ?? session.user.id}`,
      "requireAdmin"
    );
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return session.user.id;
}
