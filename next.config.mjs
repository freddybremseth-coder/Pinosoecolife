/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: import.meta.dirname
  },
  async redirects() {
    return [
      { source: "/artikler", destination: "/magasin", permanent: true },
      { source: "/artikler/:slug", destination: "/magasin/:slug", permanent: true },
      { source: "/boligartikler", destination: "/magasin", permanent: true },
      { source: "/boligartikler/:slug", destination: "/magasin/:slug", permanent: true },
      { source: "/guider", destination: "/magasin", permanent: true },
      { source: "/guider/:slug", destination: "/magasin/:slug", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "realtyflow.chatgenius.pro" }
    ]
  }
};

export default nextConfig;
