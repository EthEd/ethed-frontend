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
          ensAvatar: null,
          message: "This ENS name is available!"
        });
      }

      return NextResponse.json({
        available: false,
        ensName,
        address: wallet.address,
        ensAvatar: wallet.ensAvatar || null,
        user: wallet.user,
        message: "This ENS name is already registered"
      });
    }

    // Lookup by address
    if (address) {
      // Sanitize: strip zero-width characters, smart quotes, extra whitespace
      const cleanAddress = address
        .replace(/[\u200B-\u200D\uFEFF\u00AD\u2060\u180E]/g, "")
        .replace(/[\u2018\u2019\u201C\u201D]/g, "")
        .replace(/[\s\u00A0]+/g, "")
        .trim()
        .toLowerCase();

      // Validate Ethereum address format (case-insensitive hex, then lowercased)
      if (!/^0x[a-f0-9]{40}$/.test(cleanAddress)) {
        return NextResponse.json(
          { error: "Invalid Ethereum address. Expected a 42-character hex string starting with 0x." },
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
          ensAvatar: null,
          address: cleanAddress,
          user: null
        });
      }

      return NextResponse.json({
        ensName: wallet.ensName,
        ensAvatar: wallet.ensAvatar || null,
        address: cleanAddress,
        user: wallet.user
      });
    }

    return NextResponse.json(
      { error: "Please provide either 'name' or 'address' query parameter" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check ENS. Please try again." },
      { status: 500 }
    );
  }
}
