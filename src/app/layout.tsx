import type { Metadata } from "next";
import { Geist, Geist_Mono, Merriweather } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import AgentHover from "@/components/AgentHover";
import GlobalGrid from "@/components/GlobalGrid";
import NextAuthSessionProvider from "@/components/providers/SessionProvider";
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

export const metadata: Metadata = {
  title: "EIPSInsight - Master blockchain and Web3",
  description: "EIPSInsight makes blockchain and Web3 education fun, verifiable, and rewarding. Earn NFTs, badges, and real progress while learning with a built-in AI tutor!",
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
          {children}
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