/**
 * Admin User Management API
 * GET  /api/admin/users  — paginated user list
 * PUT  /api/admin/users  — update role or ban status
 * Requires ADMIN role.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { createAuditLog, AUDIT_ACTIONS } from "@/lib/middleware/auditLog";
import { z } from "zod";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const check = await requireAdmin();
  if (check instanceof Response) return check as any;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const search = searchParams.get("q") ?? "";
  const roleFilter = searchParams.get("role") ?? "";

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(roleFilter ? { role: roleFilter as any } : {}),
  };

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
        banExpires: true,
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

const UpdateUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "MODERATOR", "ADMIN"]).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional(),
});

export async function PUT(request: NextRequest) {
  const actorId = await requireAdmin();
  if (actorId instanceof Response) return actorId as any;

  const body = await request.json();
  const parse = UpdateUserSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid request", details: parse.error.issues }, { status: 400 });
  }

  const { userId, role, banned, banReason } = parse.data;

  // Prevent admins from demoting themselves
  if (userId === actorId && role && role !== "ADMIN") {
    return NextResponse.json({ error: "Cannot change your own admin role" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, banned: true, email: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(role !== undefined ? { role: role as any } : {}),
      ...(banned !== undefined
        ? {
            banned,
            banReason: banned ? (banReason ?? null) : null,
            banExpires: banned ? null : null,
          }
        : {}),
    },
    select: { id: true, name: true, email: true, role: true, banned: true },
  });

  // Write audit log entries
  if (role !== undefined && role !== existing.role) {
    await createAuditLog({
      actorId,
      action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
      targetId: userId,
      targetType: "User",
      metadata: { from: existing.role, to: role, email: existing.email },
    });
  }
  if (banned !== undefined && banned !== existing.banned) {
    await createAuditLog({
      actorId,
      action: banned ? AUDIT_ACTIONS.USER_BANNED : AUDIT_ACTIONS.USER_UNBANNED,
      targetId: userId,
      targetType: "User",
      metadata: { banReason: banReason ?? null, email: existing.email },
    });
  }

  return NextResponse.json(updated);
}
