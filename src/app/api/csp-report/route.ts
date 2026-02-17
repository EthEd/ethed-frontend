import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/monitoring';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    // Nicely format important fields when available
    const report = body?.['csp-report'] || body?.['CSP-Report'] || body || {};
    const summary = {
      'document-uri': report['document-uri'],
      'source-file': report['source-file'],
      'violated-directive': report['violated-directive'],
      'blocked-uri': report['blocked-uri'],
      'line-number': report['line-number'],
      'column-number': report['column-number'],
    };

    logger.warn('CSP report received', 'api/csp-report', { summary });

    // Optionally persist reports or forward to an external monitoring service here

    // 204 must not include a response body — use NextResponse for an empty response
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    logger.error('Failed to process CSP report', 'api/csp-report', undefined, err);
    return NextResponse.json({ error: 'Failed to process CSP report' }, { status: 500 });
  }
}
