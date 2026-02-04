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
      const wallet = await prisma.walletAddress.findFirst({
        where: { address },
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
          address,
          user: null
        });
      }

      return NextResponse.json({
        ensName: wallet.ensName,
        address,
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
