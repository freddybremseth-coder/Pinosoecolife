import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchPublishedPosts } from "@/lib/website-content";
import styles from "../ecolife-editorial.module.css";

export const metadata = {
  title: "Eco Life-magasin | Livet i innlandet",
  description:
    "Historier, ideer og praktiske guider om livet i innlandet: store tomter, ro, kjøkkenhage, privatliv, områder og trygg gjennomføring.",
  alternates: { canonical: "/magasin" },
  openGraph: {
    title: "Eco Life-magasin | Livet i innlandet",
    description: "Guider og historier om bolig, tomt, hverdagsliv og tryggere valg i Alicante- og Murcia-innlandet.",
    url: "https://www.pinosoecolife.com/magasin",
    siteName: "Pinoso Eco Life",
    locale: "nb_NO",
    type: "website",
  },
};

function formatDate(value?: string | null) {
  if (!value) return "Eco Life";
  return new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

export default async function MagazinePage() {
  const articles = await fetchPublishedPosts("magasin");
  const [featured, ...rest] = articles;
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://www.pinosoecolife.com/magasin#collection",
        url: "https://www.pinosoecolife.com/magasin",
        name: "Eco Life-magasin",
        description: "Guider og historier om bolig, tomt, hverdagsliv og tryggere valg i Alicante- og Murcia-innlandet.",
        isPartOf: { "@id": "https://www.pinosoecolife.com/#website" },
        publisher: { "@id": "https://www.pinosoecolife.com/#organization" },
      },
      {
        "@type": "ItemList",
        name: "Publiserte artikler i Eco Life-magasinet",
        itemListElement: articles.slice(0, 30).map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: article.title,
          url: `https://www.pinosoecolife.com/magasin/${article.slug}`,
        })),
      },
    ],
  };

  return (
    <main>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />

      <section className={styles.magazineHero}>
        <div className={styles.magazineIntro}>
          <div>
            <p className={styles.sectionEyebrow}>Pinoso Eco Life · Magasin</p>
            <h1>Livet i innlandet</h1>
          </div>
          <p>
            Ikke bare guider om å kjøpe bolig. Her utforsker vi hva du faktisk kan gjøre med plassen: roligere hverdager, kjøkkenhage, frukttrær, aktivitet, privatliv, landsbyliv – og hva som må sjekkes før drømmen blir et prosjekt.
          </p>
        </div>
      </section>

      {featured && (
        <article className={styles.featureArticle}>
          <div
            className={styles.featureMedia}
            style={{ backgroundImage: `url(${featured.image_url || "/assets/hero-pinoso-dream.jpg"})` }}
            role="img"
            aria-label={featured.title}
          />
          <div className={styles.featureContent}>
            <span className={styles.cardEyebrow}>{formatDate(featured.published_at || featured.created_at)}</span>
            <h2 className={styles.featureTitle}>{featured.title}</h2>
            <p>{featured.summary}</p>
            <Link className={styles.editorialLink} href={`/magasin/${featured.slug}`}>
              Les hovedsaken <ArrowRight size={17} />
            </Link>
          </div>
        </article>
      )}

      {rest.length > 0 && (
        <section className={styles.magazineGrid} aria-label="Flere artikler">
          {rest.map((article) => (
            <article className={styles.magazineCard} key={article.slug}>
              <img
                className={styles.magazineThumb}
                src={article.image_url || "/assets/hero-pinoso-dream.jpg"}
                alt=""
                loading="lazy"
              />
              <div className={styles.magazineCardBody}>
                <span className={styles.cardEyebrow}>{formatDate(article.published_at || article.created_at)}</span>
                <h2>{article.title}</h2>
                <p>{article.summary}</p>
                <Link className={styles.editorialLink} href={`/magasin/${article.slug}`}>
                  Les mer <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      {!articles.length && (
        <section className={styles.contentSection}>
          <p>Ingen artikler er publisert ennå.</p>
        </section>
      )}

      <section className={styles.actionBand}>
        <div>
          <p className={styles.heroEyebrow}>Fra inspirasjon til beslutning</p>
          <h2>Bruk magasinet til å finne riktig område og neste steg.</h2>
          <p>Les deg inn på hverdagen først. Deretter kan du sammenligne områder, aktuelle tomter og boliger med et tydeligere bilde av hva som faktisk passer.</p>
        </div>
        <div className={styles.actionLinks}>
          <Link href="/livet-i-innlandet">Sammenlign områdene <ArrowRight size={17} /></Link>
          <Link href="/bolig-i-pinoso">Guide til bolig i Pinoso <ArrowRight size={17} /></Link>
          <Link href="/tomt-i-pinoso">Guide til tomt i Pinoso <ArrowRight size={17} /></Link>
          <Link href="/#kontakt">Fortell oss hva du ser etter <ArrowRight size={17} /></Link>
        </div>
      </section>

      <div className={styles.updatedNote}>Oppdatert 2. oktober 2026 · Pinoso Eco Life-magasin</div>
      <Footer />
    </main>
  );
}