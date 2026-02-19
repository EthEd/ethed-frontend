import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Ensures the user is authenticated and returns the session
 * If not authenticated, returns a 401 response
 */
export async function getSessionOrUnauthorized() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    };
  }

  return { session, errorResponse: null };
}
