import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SiweMessage } from "siwe";
import { prisma } from "@/lib/prisma-client";
import { AMOY_CHAIN_ID, getExplorerTxUrl } from "@/lib/contracts";
import { logger } from "@/lib/monitoring";

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

    // Read nonce from the payment-specific cookie
    const nonceCookie = request.cookies.get("siwe-payment-nonce")?.value;

    if (!nonceCookie) {
      return NextResponse.json({ error: 'Missing SIWE payment nonce cookie — challenge may have expired' }, { status: 400 });
    }

    let siweMessage: SiweMessage;
    try {
      siweMessage = new SiweMessage(message);
    } catch {
      return NextResponse.json({ error: 'Invalid SIWE message format' }, { status: 400 });
    }

    if (siweMessage.nonce !== nonceCookie) {
      return NextResponse.json({ error: 'Invalid SIWE nonce — request a new challenge' }, { status: 400 });
    }

    try {
      await siweMessage.verify({ signature });
    } catch {
      return NextResponse.json({ error: 'SIWE signature verification failed' }, { status: 400 });
    }

    const payerAddress = siweMessage.address?.toLowerCase();

    logger.info(`SIWE payment verified from ${payerAddress}`, "payments", { amount, courseSlug });

    // Create or find the course
    let course = null;
    if (courseSlug) {
      course = await prisma.course.findUnique({ where: { slug: courseSlug } });
      if (!course) {
        return NextResponse.json({ error: `Course "${courseSlug}" not found` }, { status: 404 });
      }
    }

    // Create Purchase record (status PENDING) — amount in cents
    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        courseId: course?.id ?? "",
        amount: Math.floor(amount),
        status: 'PENDING',
        txHash: null,
      }
    });

    // Create a Payment record to track the authorization
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: Math.floor(amount),
        chainId: AMOY_CHAIN_ID,
        txHash: `siwe-auth:${siweMessage.nonce}`, // Authorization reference (not on-chain yet)
        type: 'MICROPAYMENT',
        status: 'PENDING',
      }
    });

    // Clear the nonce cookie
    const response = NextResponse.json({
      message: 'Payment authorization accepted',
      purchase: {
        id: purchase.id,
        amount: purchase.amount,
        status: purchase.status,
        courseSlug,
      },
      paymentId: payment.id,
      payerAddress,
    });

    response.cookies.set("siwe-payment-nonce", "", {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err) {
    logger.error('SIWE payment verify error', 'payments', {}, err);
    return NextResponse.json({ error: 'Failed to verify SIWE payment' }, { status: 500 });
  }
}
