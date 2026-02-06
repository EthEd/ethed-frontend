import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma-client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const wallets = await prisma.walletAddress.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    return NextResponse.json({ wallets });

  } catch (error) {
    console.error("Wallets fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { address, chainId = 1, ensName, ensAvatar } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    try {
      // Simple address validation - just check if it looks like an Ethereum address
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return NextResponse.json(
          { error: "Invalid address format" },
          { status: 400 }
        );
      }
      
      const checksummedAddress = address.toLowerCase();
      
      // Check if wallet already exists for this user
      const existingWallet = await prisma.walletAddress.findFirst({
        where: {
          userId: session.user.id,
          address: checksummedAddress,
          chainId: chainId
        }
      });

      if (existingWallet) {
        return NextResponse.json(
          { error: "Wallet already connected" },
          { status: 409 }
        );
      }

      // Check if this is the user's first wallet
      const walletCount = await prisma.walletAddress.count({
        where: { userId: session.user.id }
      });

      const wallet = await prisma.walletAddress.create({
        data: {
          userId: session.user.id,
          address: checksummedAddress,
          chainId: chainId,
          isPrimary: walletCount === 0, // First wallet becomes primary
          ensName: ensName || null,
          ensAvatar: ensAvatar || null
        }
      });

      return NextResponse.json({
        message: "Wallet connected successfully",
        wallet
      });

    } catch (error) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Wallet connect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}