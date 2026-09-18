import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SeoLandingView } from "@/components/SeoLandingView";
import { getSeoLandingPage, seoLandingPages } from "@/lib/seoLandingPages";

const BASE = "https://www.pinosoecolife.com";

export function generateStaticParams() {
  return seoLandingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoLandingPage(slug);
  if (!page) return { title: "Side ikke funnet", robots: { index: false, follow: false } };

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      title: page.seoTitle,
      description: page.seoDescription,
      url: `${BASE}/${page.slug}`,
      siteName: "Pinoso Eco Life",
      locale: "nb_NO",
      type: "website",
      images: [{ url: "/assets/hero-pinoso-dream.jpg", alt: page.hero }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.seoTitle,
      description: page.seoDescription,
      images: ["/assets/hero-pinoso-dream.jpg"],
    },
  };
}

export default async function SeoLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getSeoLandingPage(slug);
  if (!page) notFound();

  return <SeoLandingView page={page} />;
}
