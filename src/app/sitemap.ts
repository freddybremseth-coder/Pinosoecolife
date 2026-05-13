import type { MetadataRoute } from "next";
import { getProperties, getPropertyRef, regions } from "@/lib/realtyflow";

const baseUrl = "https://www.pinosoecolife.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/eiendommer",
    "/tomter",
    "/omrader",
    ...regions.map((region) => `/omrader/${region.key}`),
    "/kjopsprosessen",
    "/magasin",
    "/min-side",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "/eiendommer" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  const properties = await getProperties(100);
  const propertyRoutes = properties
    .map((property) => getPropertyRef(property))
    .filter(Boolean)
    .map((ref) => ({
      url: `${baseUrl}/eiendommer/${encodeURIComponent(ref)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

  return [...staticRoutes, ...propertyRoutes];
}
