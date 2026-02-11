import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import { env } from "@/env";
import { SiweProvider } from "./siwe-provider";

declare module "next-auth" {
  interface Session {
    address?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      address?: string;
    };
  }

  interface User {
    address?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    address?: string;
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
    // Demo/Test credentials provider
    CredentialsProvider({
      id: "demo",
      name: "Demo Account",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@ethed.app" },
        name: { label: "Name", type: "text", placeholder: "Demo User" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }
        
        try {
          // Create or find user in database
          const { prisma } = await import("@/lib/prisma-client");
          
          let dbUser = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
          
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.name || "Demo User",
                image: null,
              }
            });
          }
          
          const user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            image: dbUser.image,
          };
          
          return user;
        } catch (error) {
          console.error("Demo auth error:", error);
          return null;
        }
      }
    }),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({ 
        clientId: env.GOOGLE_CLIENT_ID, 
        clientSecret: env.GOOGLE_CLIENT_SECRET 
      })
    ] : []),
    ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET ? [
      GitHubProvider({ 
        clientId: env.GITHUB_CLIENT_ID, 
        clientSecret: env.GITHUB_CLIENT_SECRET 
      })
    ] : []),
    ...(env.EMAIL_HOST && env.EMAIL_PORT && env.EMAIL_USERNAME && env.EMAIL_PASSWORD && env.EMAIL_FROM ? [
      EmailProvider({
        server: { 
          host: env.EMAIL_HOST, 
          port: env.EMAIL_PORT, 
          auth: { 
            user: env.EMAIL_USERNAME, 
            pass: env.EMAIL_PASSWORD 
          } 
        },
        from: env.EMAIL_FROM,
      })
    ] : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        console.error("No email provided by provider");
        return false;
      }
      
      try {
        // Create or update user in database
        const { prisma } = await import("@/lib/prisma-client");
        
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });
        
        if (!existingUser) {
          // Create new user
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || null,
              image: user.image || null,
            }
          });
          user.id = newUser.id;
        } else {
          // Update existing user
          user.id = existingUser.id;
          // Optionally update name/image if changed
          if (existingUser.name !== user.name || existingUser.image !== user.image) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
              }
            });
          }
        }
        
        return true;
      } catch (error) {
        console.error("Error creating/updating user:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      // If this is the first time the user signs in, user object will be available
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
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
      
      return session;
    },
  },
  pages: { signIn: "/login", error: "/auth/error", verifyRequest: "/verify-request" },
  debug: env.NODE_ENV === "development",
  secret: env.NEXTAUTH_SECRET,
};