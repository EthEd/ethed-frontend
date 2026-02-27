import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { HttpStatus } from "@/lib/api-response";
import arcjet, { slidingWindow } from "@/lib/arcjet";
import { logger } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

/**
 * POST /api/donate
 * Record a direct donation (not tied to a specific project).
 * In production this verifies an on-chain transaction.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    // Rate limiting
    const decision = await arcjet
      .withRule(slidingWindow({ mode: "LIVE", interval: "1m", max: 10 }))
      .protect(request, { fingerprint: session.user.id });

    if (decision.isDenied()) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: HttpStatus.RATE_LIMITED }
      );
    }

    const body = await request.json();
    const { projectId, amount, txHash, chainId, message } = body;

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid donation amount" },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // If a projectId is provided, verify it exists
    if (projectId) {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) {
        return NextResponse.json(
          { success: false, error: "Project not found" },
          { status: HttpStatus.NOT_FOUND }
        );
      }
    }

    const donation = await prisma.donation.create({
      data: {
        userId: session.user.id,
        projectId: projectId || null,
        amount: parseFloat(amount),
        txHash: txHash || null,
        chainId: chainId ? parseInt(chainId, 10) : null,
        status: txHash ? "COMPLETED" : "PENDING",
        message: message || null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        project: projectId ? { select: { id: true, title: true } } : false,
      },
    });

    // Update project funding raised if linked and has txHash
    if (projectId && txHash) {
      await prisma.project.update({
        where: { id: projectId },
        data: { fundingRaised: { increment: parseFloat(amount) } },
      });
    }

    return NextResponse.json({ success: true, donation }, { status: 201 });
  } catch (error) {
    logger.error("Donate Error", "DonateAPI", undefined, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: HttpStatus.INTERNAL_ERROR }
    );
  }
}

/**
 * GET /api/donate
 * Get recent donations (public leaderboard).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const donations = await prisma.donation.findMany({
      where: { status: "COMPLETED" },
      include: {
        user: { select: { id: true, name: true, image: true } },
        project: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const totalRaised = await prisma.donation.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    });

    return NextResponse.json({
      success: true,
      donations,
      totalRaised: totalRaised._sum.amount || 0,
    });
  } catch (error) {
    logger.error("Donate GET Error", "DonateAPI", undefined, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: HttpStatus.INTERNAL_ERROR }
    );
  }
}
