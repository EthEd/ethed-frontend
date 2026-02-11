import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const address = searchParams.get("address");

    // Lookup by ENS name
    if (name) {
      const cleanName = name.trim().toLowerCase();
      const ensName = cleanName.endsWith(".ethed.eth") ? cleanName : `${cleanName}.ethed.eth`;

      const wallet = await prisma.walletAddress.findFirst({
        where: { ensName },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              createdAt: true
            }
          }
        }
      });

      if (!wallet) {
        return NextResponse.json({
          available: true,
          ensName,
          message: "This ENS name is available!"
        });
      }

      return NextResponse.json({
        available: false,
        ensName,
        address: wallet.address,
        user: wallet.user,
        message: "This ENS name is already registered"
      });
    }

    // Lookup by address
    if (address) {
      const cleanAddress = address.trim().toLowerCase();

      // Validate simple Ethereum address format (lowercase hex)
      if (!/^0x[a-f0-9]{40}$/.test(cleanAddress)) {
        return NextResponse.json(
          { error: "Invalid Ethereum address" },
          { status: 400 }
        );
      }

      const wallet = await prisma.walletAddress.findFirst({
        where: { address: cleanAddress },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              createdAt: true
            }
          }
        }
      });

      if (!wallet?.ensName) {
        return NextResponse.json({
          ensName: null,
          address: cleanAddress,
          user: null
        });
      }

      return NextResponse.json({
        ensName: wallet.ensName,
        address: cleanAddress,
        user: wallet.user
      });
    }

    return NextResponse.json(
      { error: "Please provide either 'name' or 'address' query parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("ENS lookup error:", error);
    return NextResponse.json(
      { error: "Failed to check ENS. Please try again." },
      { status: 500 }
    );
  }
}
