import type { MetadataRoute } from "next";

const baseUrl = "https://www.pinosoecolife.com";
const privatePaths = ["/auth/", "/min-side", "/api/portal/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: privatePaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
