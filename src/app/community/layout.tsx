import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community | EthEd",
  description:
    "Join the EthEd community of Web3 learners, builders, and educators. Collaborate, earn rewards, and grow together.",
  openGraph: {
    title: "Community | EthEd",
    description:
      "Join the EthEd community of Web3 learners, builders, and educators.",
  },
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
