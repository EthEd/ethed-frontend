import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import { env } from "@/env";

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
    // Demo/Test credentials provider
    CredentialsProvider({
      id: "demo",
      name: "Demo Account",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@ethed.app" },
        name: { label: "Name", type: "text", placeholder: "Demo User" }
      },
      async authorize(credentials) {
        console.log("Demo auth attempt:", credentials);
        
        if (!credentials?.email) {
          console.log("No email provided");
          return null;
        }
        
        try {
          // For demo purposes, we'll create a simple user object without database
          // In a real app, you'd validate against a database
          const user = {
            id: `demo-${Date.now()}`, // Simple ID generation
            email: credentials.email,
            name: credentials.name || "Demo User",
            image: null,
          };
          
          console.log("Demo auth successful:", user);
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
      console.log("SignIn callback:", { user, account: account?.provider });
      
      if (!user.email) {
        console.error("No email provided by provider");
        return false;
      }
      
      // For demo purposes, always allow sign in
      // In production, you'd validate against your database
      console.log("Sign in successful for:", user.email);
      return true;
    },
    async jwt({ token, user }) {
      console.log("JWT callback:", { token: !!token, user: !!user });
      
      // If this is the first time the user signs in, user object will be available
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback:", { session: !!session, token: !!token });
      
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