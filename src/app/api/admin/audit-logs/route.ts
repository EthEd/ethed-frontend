/**
 * GET /api/admin/audit-logs
 * Returns paginated audit log entries.
 * Requires ADMIN role.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { requireAdmin } from "@/lib/middleware/requireAdmin";

const PAGE_SIZE = 25;

export async function GET(request: NextRequest) {
  const check = await requireAdmin();
  if (check instanceof Response) return check as any;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const actionFilter = searchParams.get("action") ?? "";

  const where = actionFilter ? { action: actionFilter } : {};

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({
    logs,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}
