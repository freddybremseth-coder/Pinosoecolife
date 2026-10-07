import type { MetadataRoute } from "next";

const baseUrl = "https://www.pinosoecolife.com";
const blockedPaths = ["/api/portal/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Public portal/auth pages stay crawlable so search engines can read
        // their explicit noindex directives. Private API resources stay blocked.
        disallow: blockedPaths,
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: blockedPaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
