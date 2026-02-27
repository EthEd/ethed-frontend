import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donate | EthEd",
  description:
    "Support Web3 education by donating to EthEd. Help make blockchain learning accessible to everyone.",
  openGraph: {
    title: "Support Web3 Education | EthEd",
    description:
      "Support Web3 education by donating to EthEd.",
  },
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
