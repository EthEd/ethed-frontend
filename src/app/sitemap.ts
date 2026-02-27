import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ethed.com";

const publicRoutes = [
  { path: "", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/learn", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/how-it-works", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/community", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/pricing", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/leaderboard", priority: 0.7, changeFrequency: "daily" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date("2026-02-27"),
    changeFrequency,
    priority,
  }));
}
