/**
 * Moderator User Management API
 * GET /api/moderator/users  — paginated user list
 * PUT /api/moderator/users  — ban / unban only (no role changes)
 * Requires MODERATOR or ADMIN role.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { requireModerator } from "@/lib/middleware/requireModerator";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/middleware/auditLog";
import { z } from "zod";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const check = await requireModerator();
  if (check instanceof Response) return check as any;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const search = searchParams.get("q") ?? "";

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        createdAt: true,
        xp: true,
        level: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

const BanSchema = z.object({
  userId: z.string().min(1),
  banned: z.boolean(),
  banReason: z.string().optional(),
});

export async function PUT(request: NextRequest) {
  const actorId = await requireModerator();
  if (actorId instanceof Response) return actorId as any;

  const body = await request.json();
  const parse = BanSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid request", details: parse.error.issues }, { status: 400 });
  }

  const { userId, banned, banReason } = parse.data;

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, banned: true, email: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Moderators cannot ban other admins or moderators
  if (existing.role === "ADMIN" || existing.role === "MODERATOR") {
    return NextResponse.json(
      { error: "Cannot ban users with elevated roles" },
      { status: 403 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      banned,
      banReason: banned ? (banReason ?? null) : null,
    },
    select: { id: true, name: true, email: true, banned: true },
  });

  await createAuditLog({
    actorId,
    action: banned ? AUDIT_ACTIONS.USER_BANNED : AUDIT_ACTIONS.USER_UNBANNED,
    targetId: userId,
    targetType: "User",
    metadata: { banReason: banReason ?? null, email: existing.email },
  });

  return NextResponse.json(updated);
}
