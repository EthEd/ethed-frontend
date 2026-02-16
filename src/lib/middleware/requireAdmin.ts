import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

/**
 * Require the current session to be an admin user.
 * Returns the userId string on success, otherwise returns a NextResponse to be returned by the caller.
 */
export async function requireAdmin(): Promise<string | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.email || !user.email.endsWith('@admin.ethed.app')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return session.user.id;
}
