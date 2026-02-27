import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";
import { HttpStatus } from "@/lib/api-response";
import arcjet, { shield, slidingWindow } from "@/lib/arcjet";
import { logger } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects
 * List all projects with optional category/status filters.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const type = searchParams.get("type"); // INDIVIDUAL | GROUP
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 50);

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (type) where.type = type;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, image: true } },
          members: {
            include: { user: { select: { id: true, name: true, image: true } } },
            take: 5,
          },
          _count: { select: { members: true, donations: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Projects GET Error", "ProjectsAPI", undefined, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: HttpStatus.INTERNAL_ERROR }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project. Requires authenticated user.
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
      .withRule(slidingWindow({ mode: "LIVE", interval: "1m", max: 5 }))
      .protect(request, { fingerprint: session.user.id });

    if (decision.isDenied()) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: HttpStatus.RATE_LIMITED }
      );
    }

    const body = await request.json();
    const { title, description, category, type, fundingGoal, maxMembers, tags, imageUrl } = body;

    if (!title || !description || !type) {
      return NextResponse.json(
        { success: false, error: "Title, description, and type are required" },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Generate slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        slug,
        category: category || "general",
        type: type || "INDIVIDUAL",
        status: "OPEN",
        fundingGoal: fundingGoal ? parseFloat(fundingGoal) : undefined,
        maxMembers: maxMembers ? parseInt(maxMembers, 10) : undefined,
        tags: tags || [],
        imageUrl: imageUrl || null,
        creatorId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        creator: { select: { id: true, name: true, image: true } },
        members: { include: { user: { select: { id: true, name: true, image: true } } } },
      },
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    logger.error("Projects POST Error", "ProjectsAPI", undefined, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: HttpStatus.INTERNAL_ERROR }
    );
  }
}
