import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { articles } from "@/lib/content";

export const metadata = {
  title: "Magasin | Pinoso Eco Life",
};

export default function MagazinePage() {
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
            <span>{new Intl.DateTimeFormat("nb-NO").format(new Date(article.date))}</span>
            <h2>{article.title}</h2>
            <p>{article.excerpt}</p>
            <Link href={`/magasin#${article.slug}`}>
              Les mer <ArrowRight size={17} />
            </Link>
          </article>
        ))}
      </section>
      <Footer />
    </main>
  );
}
