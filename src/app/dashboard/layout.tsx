import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | EthEd",
  description:
    "Track your learning progress, manage NFT certificates, and view your Web3 education journey.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
