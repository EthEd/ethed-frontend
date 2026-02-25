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
 * POST /api/projects/[id]/join
 * Join a group project as a member.
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
    const project = await prisma.project.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    if (project.type !== "GROUP") {
      return NextResponse.json(
        { success: false, error: "Only group projects accept members" },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    if (project.status !== "OPEN") {
      return NextResponse.json(
        { success: false, error: "Project is not accepting new members" },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    if (project.maxMembers && project._count.members >= project.maxMembers) {
      return NextResponse.json(
        { success: false, error: "Project is full" },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Check if already a member
    const existing = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Already a member of this project" },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const membership = await prisma.projectMember.create({
      data: {
        userId: session.user.id,
        projectId: id,
        role: "MEMBER",
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        project: { select: { title: true } },
      },
    });

    return NextResponse.json({ success: true, membership }, { status: 201 });
  } catch (error) {
    console.error("Project Join Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: HttpStatus.INTERNAL_ERROR }
    );
  }
}
