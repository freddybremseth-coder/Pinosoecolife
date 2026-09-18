import type { MetadataRoute } from "next";
import { ecoLifeAreas } from "@/lib/ecolife-areas";
import { getProperties, getPropertyRef, regions } from "@/lib/realtyflow";
import { seoLandingPages } from "@/lib/seoLandingPages";
import { fetchPublishedPosts } from "@/lib/website-content";

const baseUrl = "https://www.pinosoecolife.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/livet-i-innlandet",
    "/eiendommer",
    "/tomter",
    "/omrader",
    ...regions.map((region) => `/omrader/${region.key}`),
    ...seoLandingPages.map((page) => `/${page.slug}`),
    "/kjopsprosessen",
    "/magasin",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency:
      route === "/eiendommer" || route === "/tomter"
        ? "daily"
        : route.startsWith("/omrader/") || seoLandingPages.some((page) => route === `/${page.slug}`)
          ? "monthly"
          : "weekly",
    priority:
      route === ""
        ? 1
        : route === "/livet-i-innlandet"
          ? 0.92
          : seoLandingPages.some((page) => route === `/${page.slug}`)
            ? 0.88
            : 0.8,
  }));

  const ecoLifeAreaRoutes: MetadataRoute.Sitemap = ecoLifeAreas.map((area) => ({
    url: `${baseUrl}/livet-i-innlandet/${area.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.82,
  }));

  const properties = await getProperties(0);
  const propertyRoutes = properties
    .map((property) => getPropertyRef(property))
    .filter(Boolean)
    .map((ref) => ({
      url: `${baseUrl}/eiendommer/${encodeURIComponent(ref)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.72,
    }));

  const articleRoutes = (await fetchPublishedPosts("magasin")).map((post) => ({
    url: `${baseUrl}/magasin/${post.slug}`,
    lastModified: new Date(post.published_at || post.created_at || now),
    changeFrequency: "monthly" as const,
    priority: 0.74,
  }));

  return [...staticRoutes, ...ecoLifeAreaRoutes, ...propertyRoutes, ...articleRoutes];
}
