import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { registerENS, validateSubdomain, checkAvailability } from "@/lib/ens-service";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to register ENS" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subdomain, walletAddress } = body;

    // Validate subdomain format
    const validation = validateSubdomain(subdomain);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const cleanSubdomain = subdomain.trim().toLowerCase();
    
    console.log(`ENS registration for ${session.user.email}: ${cleanSubdomain}.ethed.eth`);

    // Register ENS using the service
    const result = await registerENS({
      userId: session.user.id,
      subdomain: cleanSubdomain,
      walletAddress,
    });

    return NextResponse.json({
      message: "ENS name registered successfully",
      ensName: result.ensName,
      txHash: result.txHash,
      wallet: result.wallet,
    });

  } catch (error) {
    console.error("ENS registration error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get("subdomain");

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomain parameter is required" },
        { status: 400 }
      );
    }

    const validation = validateSubdomain(subdomain);
    if (!validation.valid) {
      return NextResponse.json(
        { available: false, error: validation.error },
        { status: 200 }
      );
    }

    const available = await checkAvailability(subdomain);

    return NextResponse.json({
      available,
      subdomain: subdomain.trim().toLowerCase(),
      fullName: `${subdomain.trim().toLowerCase()}.ethed.eth`,
    });

  } catch (error) {
    console.error("ENS availability check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}