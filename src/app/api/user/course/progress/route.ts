import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma-client';
import { logger } from '@/lib/monitoring';
import { addXpAndProgress } from '@/lib/gamification';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const courseSlug = searchParams.get('courseSlug');
    if (!courseSlug) return NextResponse.json({ error: 'Missing courseSlug' }, { status: 400 });

    const userCourse = await prisma.userCourse.findFirst({
      where: {
        userId: session.user.id,
        course: { slug: courseSlug }
      }
    });

    return NextResponse.json({ 
      progress: userCourse?.progress || 0,
      completedModules: userCourse?.completedModules || [],
      completed: userCourse?.completed || false
    });
  } catch (err) {
    logger.error('GET /api/user/course/progress error', 'api/user/course/progress', undefined, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { courseSlug, completedCount, totalModules, completedModules } = body;
    if (!courseSlug) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    let course = await prisma.course.findUnique({ where: { slug: courseSlug } });
    if (!course) {
        course = await prisma.course.create({
            data: {
                slug: courseSlug,
                title: courseSlug.replace(/-/g, ' ').toUpperCase(),
                status: 'PUBLISHED'
            }
        });
    }

    // Check if new modules were completed to award XP
    const existingProgress = await prisma.userCourse.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      select: { completedModules: true }
    });

    const oldCompleted = (existingProgress?.completedModules as any[]) || [];
    const newCompleted = (completedModules as any[]) || [];
    
    // If the new list has more items than the old list, award XP
    // Simple logic: if new items added, award XP once for this update
    if (newCompleted.length > oldCompleted.length) {
      await addXpAndProgress(session.user.id);
    }

    let progress = 0;
    if (typeof completedCount === 'number' && typeof totalModules === 'number') {
        progress = Math.min(100, Math.round((completedCount / Math.max(1, totalModules)) * 100));
    }

    const userCourse = await prisma.userCourse.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      update: { 
        progress, 
        completedModules: completedModules || undefined,
        completed: progress === 100, 
        finishedAt: progress === 100 ? new Date() : undefined 
      },
      create: { 
        userId: session.user.id, 
        courseId: course.id, 
        progress, 
        completedModules: completedModules || [],
        completed: progress === 100, 
        finishedAt: progress === 100 ? new Date() : undefined 
      }
    });

    return NextResponse.json({ message: 'Progress updated', userCourse });
  } catch (err) {
    logger.error('POST /api/user/course/progress error', 'api/user/course/progress', undefined, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
