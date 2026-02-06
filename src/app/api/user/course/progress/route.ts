import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma-client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { courseSlug, completedCount, totalModules } = body;
    if (!courseSlug || typeof completedCount !== 'number' || typeof totalModules !== 'number') {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    const progress = Math.min(100, Math.round((completedCount / Math.max(1, totalModules)) * 100));

    const userCourse = await prisma.userCourse.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      update: { progress, completed: progress === 100, finishedAt: progress === 100 ? new Date() : undefined },
      create: { userId: session.user.id, courseId: course.id, progress, completed: progress === 100, finishedAt: progress === 100 ? new Date() : undefined }
    });

    return NextResponse.json({ message: 'Progress updated', userCourse });
  } catch (err) {
    console.error('Course progress error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
