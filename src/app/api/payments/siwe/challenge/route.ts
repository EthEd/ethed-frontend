import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateNonce, SiweMessage } from "siwe";
import { AMOY_CHAIN_ID } from "@/lib/contracts";

/**
 * POST /api/payments/siwe/challenge
 * Body: { amount: number, courseSlug?: string }
 * Returns a proper SIWE message string (client should sign it) and sets `siwe-nonce` cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, courseSlug, address } = body;

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!address || typeof address !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Valid Ethereum address required" }, { status: 400 });
    }

    const nonce = generateNonce();

    const statement = `Authorize payment of ${(amount / 100).toFixed(2)} USD to eth.ed` +
      (courseSlug ? ` for course "${courseSlug}"` : "") +
      `. Payment ID: ${nonce}`;

    // Build a proper SIWE message
    const origin = request.headers.get("origin") || "https://ethed.app";
    const domain = new URL(origin).host;

    const siweMessage = new SiweMessage({
      domain,
      address,
      statement,
      uri: origin,
      version: "1",
      chainId: AMOY_CHAIN_ID,
      nonce,
      issuedAt: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
      resources: courseSlug ? [`course:${courseSlug}`] : undefined,
    });

    const message = siweMessage.prepareMessage();

    const response = NextResponse.json({ message, nonce });

    // Set HttpOnly nonce cookie (short lived)
    response.cookies.set("siwe-payment-nonce", nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: "Failed to create payment challenge" }, { status: 500 });
  }
}
