import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import AgentHover from "@/components/AgentHover";
import GlobalGrid from "@/components/GlobalGrid";
import NextAuthSessionProvider from "@/components/providers/SessionProvider";
import Navbar from "./(public)/_components/navbar";
const exo2 = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-exo2",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EthEd",
  description: "EthEd makes blockchain and Web3 education fun, verifiable, and rewarding. Earn NFTs, badges, and real progress while learning with a built-in AI tutor!",
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ scrollBehavior: "smooth" }} suppressHydrationWarning>
      <body className={`${exo2.variable} antialiased`} suppressHydrationWarning>
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