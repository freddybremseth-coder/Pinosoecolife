import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchPublishedPosts } from "@/lib/website-content";

export const metadata = {
  title: "Eco Life-magasin | Livet i innlandet | Pinoso Eco Life",
  description:
    "Historier, ideer og praktiske guider om livet i innlandet: store tomter, ro, kjøkkenhage, privatliv, områder og trygg gjennomføring.",
};

export default async function MagazinePage() {
  const articles = await fetchPublishedPosts("magasin");
  return (
    <main>
      <SiteHeader />
      <section className="page-hero compact-hero">
        <p className="eyebrow">Pinoso Eco Life · Magasin</p>
        <h1>Livet i innlandet</h1>
        <p>
          Ikke bare guider om å kjøpe bolig. Her utforsker vi hva du faktisk kan gjøre med plassen: roligere hverdager,
          kjøkkenhage, frukttrær, aktivitet, privatliv, landsbyliv – og hva som må sjekkes før drømmen blir et prosjekt.
        </p>
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
