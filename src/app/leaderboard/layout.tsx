import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard | EthEd",
  description:
    "See the top Web3 learners on EthEd. Earn XP by completing courses and climb the ranks.",
  openGraph: {
    title: "Leaderboard | EthEd",
    description:
      "See the top Web3 learners on EthEd. Earn XP and climb the ranks.",
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
