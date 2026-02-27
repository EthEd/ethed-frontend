import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { HttpStatus } from "@/lib/api-response";
import { logger } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]
 * Fetch a single project by id or slug.
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        creator: { select: { id: true, name: true, image: true } },
        members: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
        donations: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: { select: { members: true, donations: true } },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    logger.error("Project GET Error", "ProjectAPI", undefined, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: HttpStatus.INTERNAL_ERROR }
    );
  }
}

/**
 * PATCH /api/projects/[id]
 * Update project details. Only the creator can update.
 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    const { id } = await params;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    if (project.creatorId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Only the project creator can update" },
        { status: HttpStatus.FORBIDDEN }
      );
    }

    const body = await request.json();
    const { title, description, status, category, imageUrl, fundingGoal, maxMembers, tags } = body;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(category && { category }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(fundingGoal !== undefined && { fundingGoal: fundingGoal ? parseFloat(fundingGoal) : null }),
        ...(maxMembers !== undefined && { maxMembers: maxMembers ? parseInt(maxMembers, 10) : null }),
        ...(tags && { tags }),
      },
      include: {
        creator: { select: { id: true, name: true, image: true } },
        members: { include: { user: { select: { id: true, name: true, image: true } } } },
      },
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    logger.error("Project PATCH Error", "ProjectAPI", undefined, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: HttpStatus.INTERNAL_ERROR }
    );
  }
}
