import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { HttpStatus } from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/projects/[id]/donate
 * Record a donation to a project. In a real implementation,
 * this would verify an on-chain transaction hash.
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { amount, txHash, chainId, message } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid donation amount" },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        userId: session.user.id,
        projectId: id,
        amount: parseFloat(amount),
        txHash: txHash || null,
        chainId: chainId ? parseInt(chainId, 10) : null,
        status: txHash ? "COMPLETED" : "PENDING",
        message: message || null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    // Update project funding raised
    if (txHash) {
      await prisma.project.update({
        where: { id },
        data: {
          fundingRaised: { increment: parseFloat(amount) },
        },
      });
    }

    return NextResponse.json({ success: true, donation }, { status: 201 });
  } catch (error) {
    console.error("Donate Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: HttpStatus.INTERNAL_ERROR }
    );
  }
}
