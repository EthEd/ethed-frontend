/**
 * GET /api/admin/nfts
 * Returns paginated list of all minted NFTs.
 * Supports: ?q= (user name/email), ?courseId=, ?page=
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
  const search = searchParams.get("q") ?? "";

  const where = search
    ? {
        user: {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        },
      }
    : {};

  const [nfts, total] = await Promise.all([
    prisma.nFT.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.nFT.count({ where }),
  ]);

  return NextResponse.json({
    nfts,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}
