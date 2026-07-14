import type { MetadataRoute } from "next";
import { site } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
