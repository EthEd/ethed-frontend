import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn | EthEd",
  description:
    "Explore Web3 courses on blockchain, Solidity, DeFi, NFTs, and more. Learn at your own pace with hands-on projects.",
  openGraph: {
    title: "Learn Web3 & Blockchain | EthEd",
    description:
      "Explore Web3 courses on blockchain, Solidity, DeFi, NFTs, and more.",
  },
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
