import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ethed.com";

const publicRoutes = [
  "",
  "/learn",
  "/how-it-works",
  "/about",
  "/community",
  "/pricing",
  "/leaderboard",
  "/onboarding",
  "/login",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.7,
  }));
}
