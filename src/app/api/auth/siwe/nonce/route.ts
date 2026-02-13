import { NextRequest, NextResponse } from "next/server";
import { generateNonce } from "siwe";

export async function GET(req: NextRequest) {
  try {
    const nonce = generateNonce();
    const response = NextResponse.json({ nonce });
    
    // Set nonce in a secure httpOnly cookie
    response.cookies.set("siwe-nonce", nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    // Log for diagnostics (helps debug missing-cookie/SameSite issues)
    console.info('[siwe/nonce] nonce generated and cookie set');

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate nonce" },
      { status: 500 }
    );
  }
}
