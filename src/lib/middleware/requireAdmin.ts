import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { logger } from "@/lib/monitoring";

/** Admin domain suffix — users with emails ending with this are admins */
const ADMIN_EMAIL_SUFFIX = "@admin.ethed.app";

/**
 * Require the current session to be an admin user.
 * Returns the userId string on success, otherwise returns a NextResponse to be returned by the caller.
 *
 * Usage in route handlers:
 * ```ts
 * const adminCheck = await requireAdmin();
 * if (adminCheck instanceof Response) return adminCheck;
 * const userId = adminCheck; // string
 * ```
 */
export async function requireAdmin(): Promise<string | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (!user || !user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isAdmin =
    user.email.endsWith(ADMIN_EMAIL_SUFFIX) || user.role === "admin";

  if (!isAdmin) {
    logger.warn(
      `Non-admin access attempt by ${user.email}`,
      "requireAdmin"
    );
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return session.user.id;
}
