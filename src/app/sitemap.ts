import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { caseStudies } from "@/content/case-studies";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-11-24");
  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/work`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...caseStudies.map((c) => ({
      url: `${site.url}/work/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${site.url}/resume`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];
}
