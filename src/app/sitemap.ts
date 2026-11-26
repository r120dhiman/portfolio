import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { caseStudies } from "@/content/case-studies";
import { posts } from "@/content/lab";

/** Evaluated once at build time, so the sitemap stays statically generated but no longer reports a frozen date. */
const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/work`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...caseStudies.map((c) => ({
      url: `${site.url}/work/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${site.url}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...posts.map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: new Date(p.post.date),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    { url: `${site.url}/resume`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];
}
