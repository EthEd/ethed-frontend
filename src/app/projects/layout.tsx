import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | EthEd",
  description:
    "Browse and contribute to open-source Web3 projects built by the EthEd community.",
  openGraph: {
    title: "Projects | EthEd",
    description:
      "Browse and contribute to open-source Web3 projects built by the EthEd community.",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
