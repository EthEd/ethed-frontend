/**
 * GET /api/admin/users/[userId]
 * Returns full user detail including enrollments, NFTs, ban history.
 * Requires ADMIN role.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";
import { requireAdmin } from "@/lib/middleware/requireAdmin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const check = await requireAdmin();
  if (check instanceof Response) return check as any;

  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      banned: true,
      banReason: true,
      banExpires: true,
      xp: true,
      level: true,
      streak: true,
      createdAt: true,
      updatedAt: true,
      courses: {
        include: {
          course: {
            select: { id: true, title: true, slug: true, status: true },
          },
        },
        orderBy: { startedAt: "desc" },
      },
      nfts: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          image: true,
          tokenId: true,
          contractAddress: true,
          chainId: true,
          mintedAt: true,
          createdAt: true,
        },
      },
      wallets: {
        select: {
          id: true,
          address: true,
          chainId: true,
          isPrimary: true,
          ensName: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
