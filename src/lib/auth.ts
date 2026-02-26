import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";

import { SiweProvider } from "./siwe-provider";

declare module "next-auth" {
  interface Session {
    address?: string;
    ensName?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      address?: string;
      ensName?: string;
      role?: string;
    };
  }

  interface User {
    address?: string;
    ensName?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    address?: string;
    ensName?: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    // Sign In With Ethereum
    SiweProvider(),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({ 
        clientId: process.env.GOOGLE_CLIENT_ID, 
        clientSecret: process.env.GOOGLE_CLIENT_SECRET 
      })
    ] : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      GitHubProvider({ 
        clientId: process.env.GITHUB_CLIENT_ID, 
        clientSecret: process.env.GITHUB_CLIENT_SECRET 
      })
    ] : []),
    ...(process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD && process.env.EMAIL_FROM ? [
      EmailProvider({
        server: { 
          host: process.env.EMAIL_HOST, 
          port: Number(process.env.EMAIL_PORT), 
          auth: { 
            user: process.env.EMAIL_USERNAME, 
            pass: process.env.EMAIL_PASSWORD 
          } 
        },
        from: process.env.EMAIL_FROM,
      })
    ] : []),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }
      
      try {
        const { prisma } = await import("@/lib/prisma-client");
        
        // Retry for Supabase cold-start
        const findUser = async () => prisma.user.findUnique({ where: { email: user.email! } });
        let existingUser: Awaited<ReturnType<typeof findUser>> = null;
        for (let i = 0; i < 3; i++) {
          try { existingUser = await findUser(); break; }
          catch { if (i < 2) await new Promise(r => setTimeout(r, 2000)); }
        }
        
        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: { email: user.email, name: user.name || null, image: user.image || null }
          });
          user.id = newUser.id;
        } else {
          user.id = existingUser.id;
          if (existingUser.name !== user.name || existingUser.image !== user.image) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { name: user.name || existingUser.name, image: user.image || existingUser.image }
            });
          }
        }
        
        return true;
      } catch {
        return false;
      }
    },
    async jwt({ token, user, trigger, session }) {
      const { prisma } = await import("@/lib/prisma-client");

      // If this is the first time the user signs in, user object will be available
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        // propagate wallet address from SIWE provider (if present)
        if ((user as any).address) {
          token.address = (user as any).address as string;
        }
      }

      // Handle session updates (e.g. after onboarding)
      if (trigger === "update" && session?.ensName) {
        token.ensName = session.ensName;
      }

      // Always refresh role from DB so role changes take effect on next request.
      // Wrapped in try/catch so a DB blip (e.g. Supabase cold-start) never
      // kills the session — we fall back to the cached token values.
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true },
          });
          if (dbUser) {
            token.role = dbUser.role as string;
          }
          // ENS name from wallet if not already set
          if (!token.ensName) {
            const wallet = await prisma.walletAddress.findFirst({
              where: { userId: token.id as string, isPrimary: true },
              select: { ensName: true },
            });
            if (wallet?.ensName) token.ensName = wallet.ensName;
          }
        } catch {
          // DB unreachable — keep whatever role/ensName is already in the token
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token.id) {
        session.user.id = token.id as string;
      }
      if (token.email) {
        session.user.email = token.email as string;
      }
      if (token.name) {
        session.user.name = token.name as string;
      }
      if (token.role) {
        session.user.role = token.role as string;
      }
      // expose wallet address and ENS name on the session for client usage
      if (token.address) {
        session.address = token.address as string;
        session.user.address = token.address as string;
      }
      if (token.ensName) {
        session.ensName = token.ensName as string;
        session.user.ensName = token.ensName as string;
      }
      
      return session;
    },
  },
  pages: { signIn: "/login", error: "/auth/error", verifyRequest: "/verify-request" },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET ?? undefined,
};