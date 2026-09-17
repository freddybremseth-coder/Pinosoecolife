import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.pinosoecolife.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/auth/", "/min-side", "/api/portal/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
