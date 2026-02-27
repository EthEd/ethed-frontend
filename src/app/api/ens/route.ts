import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { registerENS, validateSubdomain, checkAvailability } from "@/lib/ens-service";
import { ENS_ROOT_DOMAIN } from "@/lib/contracts";
import aj, { slidingWindow } from "@/lib/arcjet";

// Rate limiting for ENS registration - expensive on-chain operation
const ensRateLimit = aj.withRule(
  slidingWindow({
    mode: "LIVE",
    interval: "1h",
    max: 5, // 5 registrations per hour per user
  })
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to register ENS" },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const decision = await ensRateLimit.protect(request, {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { subdomain, walletAddress: rawWalletAddress } = body;
    
    // Fallback: if no address in body, check session (SIWE) or user's existing wallets
    let walletAddress = rawWalletAddress;
    
    if (!walletAddress) {
       walletAddress = session.address;
    }

    if (!subdomain || typeof subdomain !== 'string') {
      return NextResponse.json({ error: 'Missing subdomain parameter' }, { status: 400 });
    }

    // Accept either a label ("alice") or a full name ("alice.ayushetty.eth")
    const input = subdomain.trim().toLowerCase();
    let label = input;
    let rootDomain = ENS_ROOT_DOMAIN;

    if (input.includes('.')) {
      // If user passed a full name, extract label and root
      const parts = input.split('.');
      label = parts[0];
      const suffix = parts.slice(1).join('.');
      if (suffix === 'ayushetty.eth' || suffix.endsWith('.ayushetty.eth')) {
        rootDomain = 'ayushetty.eth';
      } else {
        // disallow other roots for now
        return NextResponse.json({ error: 'Unsupported ENS root domain' }, { status: 400 });
      }
    }

    // Validate label format
    const validation = validateSubdomain(label);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const cleanSubdomain = label;

    // Validate provided wallet address if present
    if (walletAddress) {
      const cleanAddress = String(walletAddress)
        .replace(/[\u200B-\u200D\uFEFF\u00AD\u2060\u180E]/g, "")
        .replace(/[\u2018\u2019\u201C\u201D]/g, "")
        .replace(/[\s\u00A0]+/g, "")
        .trim()
        .toLowerCase();
      if (!/^0x[a-f0-9]{40}$/.test(cleanAddress)) {
        return NextResponse.json(
          { error: "Invalid Ethereum address. Expected a 42-character hex string starting with 0x." },
          { status: 400 }
        );
      }
      walletAddress = cleanAddress;
    }

    // Check availability for the requested root domain
    const available = await checkAvailability(cleanSubdomain, rootDomain);
    if (!available) {
      return NextResponse.json({ error: 'This ENS name is already registered' }, { status: 409 });
    }

    // Register ENS using the service (keeps the same registerENS API — it will build the full name using default root)
    const result = await registerENS({
      userId: session.user.id,
      subdomain: cleanSubdomain,
      walletAddress,
      rootDomain,
    });

    return NextResponse.json({
      message: "ENS name registered successfully",
      ensName: result.ensName,
      fullName: `${cleanSubdomain}.${rootDomain}`,
      txHash: result.txHash,
      explorerUrl: result.explorerUrl ?? null,
      wallet: result.wallet,
    });

  } catch (error) {
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
      fullName: `${subdomain.trim().toLowerCase()}.${ENS_ROOT_DOMAIN}`,
    });

  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}