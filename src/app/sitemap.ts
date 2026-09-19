import type { MetadataRoute } from "next";
import { ecoLifeAreas } from "@/lib/ecolife-areas";
import { fallbackProperties, getProperties, getPropertyRef, regions } from "@/lib/realtyflow";
import { seoLandingPages } from "@/lib/seoLandingPages";
import { fetchPublishedPosts } from "@/lib/website-content";

const baseUrl = "https://www.pinosoecolife.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/livet-i-innlandet",
    "/eiendommer",
    "/tomter",
    "/omrader",
    ...regions.map((region) => `/omrader/${region.key}`),
    ...seoLandingPages.map((page) => `/${page.slug}`),
    "/kjopsprosessen",
    "/om-freddy",
    "/magasin",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
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
    changeFrequency: "monthly",
    priority: 0.82,
  }));

  // Website list views may use illustrative fallback properties when the
  // RealtyFlow feed is offline. Never advertise those demo records to Google.
  // Listing freshness and validity must be based on real public inventory.
  const fallbackIds = new Set(fallbackProperties.map((property) => property.id));
  const realProperties = (await getProperties(0)).filter(
    (property) => !fallbackIds.has(property.id),
  );
  const propertyByRef = new Map<string, (typeof realProperties)[number]>();
  for (const property of realProperties) {
    const ref = getPropertyRef(property);
    if (ref) propertyByRef.set(ref, property);
  }
  const lastModified = (value: string | null | undefined) =>
    value && Number.isFinite(Date.parse(value)) ? { lastModified: new Date(value) } : {};

  const propertyRoutes = Array.from(propertyByRef.entries()).map(([ref, property]) => ({
    url: `${baseUrl}/eiendommer/${encodeURIComponent(ref)}`,
    ...lastModified(property.updated_at || property.updatedAt),
    changeFrequency: "daily" as const,
    priority: 0.72,
  }));

  const articlesBySlug = new Map(
    (await fetchPublishedPosts("magasin"))
      .filter((post) => /^[a-z0-9][a-z0-9-]{0,150}$/i.test(post.slug))
      .map((post) => [post.slug, post] as const),
  );
  const articleRoutes = Array.from(articlesBySlug.values()).map((post) => ({
    url: `${baseUrl}/magasin/${post.slug}`,
    ...lastModified(post.updated_at || post.published_at || post.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.74,
  }));

  // An upstream outage must not cause stale/cached fake listing references,
  // duplicate article URLs or invalid lastmod timestamps in Search Console.
  return [...staticRoutes, ...ecoLifeAreaRoutes, ...propertyRoutes, ...articleRoutes];
}
