import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SiweMessage } from "siwe";
import { prisma } from "@/lib/prisma-client";

/**
 * POST /api/payments/siwe/verify
 * Body: { message: string, signature: string, amount: number, courseSlug?: string }
 * Verifies SIWE-signed payment authorization and creates a Purchase (status=PENDING).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, signature, amount, courseSlug } = body;

    if (!message || !signature) {
      return NextResponse.json({ error: "Missing message or signature" }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const cookieHeader = request.headers.get('cookie') || undefined;
    const nonceCookie = cookieHeader?.split(';').map(p => p.trim()).find(p => p.startsWith('siwe-nonce='))?.split('=')[1];

    if (!nonceCookie) {
      return NextResponse.json({ error: 'Missing SIWE nonce cookie' }, { status: 400 });
    }

    let siweMessage: SiweMessage;
    try {
      siweMessage = new SiweMessage(message);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid SIWE message format' }, { status: 400 });
    }

    if (siweMessage.nonce !== nonceCookie) {
      return NextResponse.json({ error: 'Invalid SIWE nonce' }, { status: 400 });
    }

    try {
      await siweMessage.verify({ signature });
    } catch (err: any) {
      return NextResponse.json({ error: 'SIWE signature verification failed' }, { status: 400 });
    }

    const payerAddress = siweMessage.address?.toLowerCase();

    // Create or find the course
    let course = null;
    if (courseSlug) {
      course = await prisma.course.findUnique({ where: { slug: courseSlug } });
      if (!course) {
        course = await prisma.course.create({ data: { slug: courseSlug, title: courseSlug, status: 'PUBLISHED' } });
      }
    }

    // Create Purchase record (status PENDING) — amount in cents
    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        courseId: course?.id ?? undefined,
        amount: Math.floor(amount),
        status: 'PENDING',
        txHash: null,
      }
    });

    // Optionally create a Payment record to track the authorization
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: Math.floor(amount),
        chainId: 80002, // record Amoy as default for now
        txHash: '',
        type: 'MICROPAYMENT',
        status: 'PENDING',
      }
    });

    return NextResponse.json({ message: 'Payment authorization accepted', purchase });
  } catch (err) {
    console.error('SIWE payment verify error:', err);
    return NextResponse.json({ error: 'Failed to verify SIWE payment' }, { status: 500 });
  }
}
