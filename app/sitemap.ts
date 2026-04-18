import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://quodo.app";

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/invoice`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/quotation`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/receipt`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/upgrade`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
