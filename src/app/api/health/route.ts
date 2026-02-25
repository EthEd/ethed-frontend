import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-client';

/**
 * Health check endpoint for monitoring and load balancers.
 * Returns 200 if the service is healthy, 503 if the DB is unreachable.
 */
export async function GET() {
  let dbStatus = 'ok';
  let dbLatencyMs: number | null = null;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch {
    dbStatus = 'error';
  }

  const healthy = dbStatus === 'ok';

  const healthData = {
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptime: process.uptime(),
    db: { status: dbStatus, latencyMs: dbLatencyMs },
  };

  return NextResponse.json(healthData, {
    status: healthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
