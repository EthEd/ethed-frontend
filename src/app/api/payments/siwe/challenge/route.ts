import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateNonce } from "siwe";

/**
 * POST /api/payments/siwe/challenge
 * Body: { amount: number, courseSlug?: string }
 * Returns a SIWE message string (client should sign it) and sets `siwe-nonce` cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, courseSlug } = body;

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const nonce = generateNonce();

    const statement = `Authorize payment of ${amount} cents to eth.ed` + (courseSlug ? ` for course ${courseSlug}` : ".");

    // Build minimal SIWE message string for client to sign (client will use domain/origin)
    const message = `\nService: eth.ed\nStatement: ${statement}\nNonce: ${nonce}`;

    const response = NextResponse.json({ message, nonce });

    // Set HttpOnly nonce cookie (short lived)
    response.cookies.set("siwe-nonce", nonce, {
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
