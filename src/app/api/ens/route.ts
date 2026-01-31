import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const { subdomain, buddyId } = body;

    // Validate subdomain format
    if (!subdomain || typeof subdomain !== 'string') {
      return NextResponse.json(
        { error: "Subdomain is required" },
        { status: 400 }
      );
    }

    // Clean and validate the subdomain
    const cleanSubdomain = subdomain.trim().toLowerCase();
    
    // ENS name validation rules
    const ensNameRegex = /^[a-z0-9-]{3,20}$/;
    if (!ensNameRegex.test(cleanSubdomain)) {
      return NextResponse.json(
        { 
          error: "ENS name must be 3-20 characters long and contain only lowercase letters, numbers, and hyphens" 
        },
        { status: 400 }
      );
    }

    // Additional validation rules
    if (cleanSubdomain.startsWith('-') || cleanSubdomain.endsWith('-')) {
      return NextResponse.json(
        { error: "ENS name cannot start or end with a hyphen" },
        { status: 400 }
      );
    }

    if (cleanSubdomain.includes('--')) {
      return NextResponse.json(
        { error: "ENS name cannot contain consecutive hyphens" },
        { status: 400 }
      );
    }

    // Reserved names
    const reservedNames = ['admin', 'api', 'www', 'mail', 'ftp', 'localhost', 'ethed', 'test'];
    if (reservedNames.includes(cleanSubdomain)) {
      return NextResponse.json(
        { error: "This ENS name is reserved" },
        { status: 400 }
      );
    }

    const fullEnsName = `${cleanSubdomain}.ethed.eth`;

    // For demo purposes, we'll just return success
    // In production, you would:
    // 1. Check if the name is actually available
    // 2. Register it with ENS
    // 3. Store the registration in your database
    
    console.log(`ENS registration for ${session.user.email}: ${fullEnsName}`);

    // Simulate ENS registration
    const ensRegistration = {
      id: `ens-${Date.now()}`,
      userId: session.user.id,
      subdomain: cleanSubdomain,
      fullName: fullEnsName,
      buddyId: buddyId,
      registeredAt: new Date(),
      status: 'active'
    };

    return NextResponse.json({
      message: "ENS name registered successfully",
      ens: ensRegistration,
      fullName: fullEnsName
    });

  } catch (error) {
    console.error("ENS registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}