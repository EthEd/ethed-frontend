import type { Metadata } from "next";
import { Geist, Geist_Mono, Merriweather } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import AgentHover from "@/components/AgentHover";
import GlobalGrid from "@/components/GlobalGrid";
import NextAuthSessionProvider from "@/components/providers/SessionProvider";
import DevChildrenGuard from "@/components/DevChildrenGuard";
import Navbar from "./(public)/_components/navbar";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ethed.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "EthEd - Master Blockchain and Web3",
  description: "EthEd makes blockchain and Web3 education fun, verifiable, and rewarding. Earn NFTs, badges, and real progress while learning with a built-in AI tutor!",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "EthEd - Master Blockchain and Web3",
    description: "EthEd makes blockchain and Web3 education fun, verifiable, and rewarding. Earn NFTs, badges, and real progress while learning with a built-in AI tutor!",
    url: siteUrl,
    siteName: "EthEd",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "EthEd - Master Blockchain and Web3",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EthEd - Master Blockchain and Web3",
    description: "EthEd makes blockchain and Web3 education fun, verifiable, and rewarding. Earn NFTs, badges, and real progress while learning with a built-in AI tutor!",
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${merriweather.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          <NextAuthSessionProvider>
          <GlobalGrid enabled={true} adaptiveGlow={true} />
          <Navbar/>
          {/* Dev-only children guard: throws (with stack) if a non-primitive React child is rendered */}
          <DevChildrenGuard>{children}</DevChildrenGuard>
          <Toaster />
          {/* <AgentHover
            posterSrc="/pause.png"
            p1Src="/p1.gif"
            p2Src="/p2.gif"
            p3Src="/p3.gif"
            pause2Src="/pause 2.png"
            size={130}
            offset={{ right: -14, bottom: 0 }}
          /> */}
          </NextAuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}