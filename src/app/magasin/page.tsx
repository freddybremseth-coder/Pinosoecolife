import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchPublishedPosts } from "@/lib/website-content";

export const metadata = {
  title: "Magasin | Pinoso Eco Life",
};

export default async function MagazinePage() {
  const articles = await fetchPublishedPosts("magasin");
  return (
    <main>
      <SiteHeader />
      <section className="page-hero compact-hero">
        <p className="eyebrow">Magasin</p>
        <h1>Guider og inspirasjon</h1>
        <p>Kunnskap om nybygg, områder og trygg bolighandel i Spania.</p>
      </section>
      <section className="section article-grid">
        {articles.map((article) => (
          <article className="article-card" key={article.slug}>
            <span>{new Intl.DateTimeFormat("nb-NO").format(new Date(article.published_at || article.created_at))}</span>
            <h2>{article.title}</h2>
            <p>{article.summary}</p>
            <Link href={`/magasin/${article.slug}`}>
              Les mer <ArrowRight size={17} />
            </Link>
          </article>
        ))}
      </section>
      <Footer />
    </main>
  );
}
