import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContactForm } from "@/components/ContactForm";
import MarkdownArticle from "@/components/MarkdownArticle";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getArticleAreaSlugs, getRelatedArticleSlugs } from "@/lib/ecolife-content-links";
import { getEcoLifeArea } from "@/lib/ecolife-areas";
import { fetchPublishedPost, fetchPublishedPosts } from "@/lib/website-content";
import styles from "../../ecolife-editorial.module.css";

function formatDate(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function inferLifestyleIntent(tags: string[]) {
  const values = tags.map((tag) => tag.toLowerCase());
  if (values.some((tag) => ["privatliv", "ro"].includes(tag))) return "Privatliv og ro";
  if (values.some((tag) => ["kjøkkenhage", "selvberget", "hage"].includes(tag))) return "Hage og mer selvberget liv";
  if (values.some((tag) => ["vin", "druer"].includes(tag))) return "Vinland og dyrking";
  if (values.some((tag) => ["sykkel", "aktivt liv", "natur"].includes(tag))) return "Gåturer, sykkel og natur";
  if (values.some((tag) => ["familie", "gjester"].includes(tag))) return "Familie, gjester og store uteområder";
  if (values.some((tag) => ["landsbyliv", "fellesskap"].includes(tag))) return "Landsbyliv og lokalmiljø";
  return undefined;
}

type Params = { slug: string };

const BASE = "https://www.pinosoecolife.com";

function absoluteUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://") ? value : `${BASE}${value}`;
}

export async function generateStaticParams() {
  const posts = await fetchPublishedPosts("magasin");
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPublishedPost("magasin", slug);
  if (!post) return { title: "Artikkel ikke funnet", robots: { index: false, follow: false } };

  const description = post.summary || "Guider og innsikt fra Pinoso Eco Life.";
  const image = post.image_url || "/assets/hero-pinoso-dream.jpg";
  const publishedTime = post.published_at || post.created_at;

  return {
    title: post.title,
    description,
    alternates: { canonical: `/magasin/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      url: `${BASE}/magasin/${post.slug}`,
      siteName: "Pinoso Eco Life",
      locale: "nb_NO",
      type: "article",
      publishedTime,
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image],
    },
  };
}

export default async function MagazineArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await fetchPublishedPost("magasin", slug);

  if (!post) notFound();

  const lifestyleIntent = inferLifestyleIntent(post.tags || []);
  const allPosts = await fetchPublishedPosts("magasin");
  const relevantAreas = getArticleAreaSlugs(post.slug, 4).flatMap((areaSlug) => {
    const area = getEcoLifeArea(areaSlug);
    return area ? [area] : [];
  });
  const relatedArticles = getRelatedArticleSlugs(post.slug, 3).flatMap((articleSlug) => {
    const article = allPosts.find((candidate) => candidate.slug === articleSlug);
    return article ? [article] : [];
  });
  const heroImage = post.image_url || "/assets/hero-pinoso-dream.jpg";
  const publishedTime = post.published_at || post.created_at;
  const articleUrl = `${BASE}/magasin/${post.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${articleUrl}#article`,
        headline: post.title,
        description: post.summary || "Guider og innsikt fra Pinoso Eco Life.",
        image: [absoluteUrl(heroImage)],
        datePublished: publishedTime,
        dateModified: publishedTime,
        inLanguage: "nb-NO",
        keywords: post.tags || [],
        author: { "@id": `${BASE}/#organization` },
        publisher: { "@id": `${BASE}/#organization` },
        mainEntityOfPage: { "@id": `${articleUrl}#webpage` },
      },
      {
        "@type": "WebPage",
        "@id": `${articleUrl}#webpage`,
        url: articleUrl,
        name: post.title,
        description: post.summary || "Guider og innsikt fra Pinoso Eco Life.",
        inLanguage: "nb-NO",
        isPartOf: { "@id": `${BASE}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Forside", item: BASE },
          { "@type": "ListItem", position: 2, name: "Magasin", item: `${BASE}/magasin` },
          { "@type": "ListItem", position: 3, name: post.title, item: articleUrl },
        ],
      },
    ],
  };

  return (
    <main>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <section className={styles.articleHero}>
        <img className={styles.heroMedia} src={heroImage} alt={`${post.title} – Pinoso Eco Life`} />
        <div className={styles.articleHeroContent}>
          <p className={styles.heroEyebrow}>Livet i innlandet · Eco Life-magasin</p>
          <h1 className={styles.articleTitle}>{post.title}</h1>
          <p>{post.summary || "Innsikt og praktisk beslutningsstøtte for deg som vurderer livet i innlandet i Spania."}</p>
        </div>
      </section>

      <article className={styles.articleShell}>
        <div className={styles.articleMeta}>
          <Link href="/magasin"><ArrowLeft size={16} /> Tilbake til magasinet</Link>
          {publishedTime && <span><Calendar size={16} /> {formatDate(publishedTime)}</span>}
          <span>Pinoso Eco Life</span>
        </div>
        <MarkdownArticle markdown={post.markdown} skipFirstH1 />
      </article>

      {relevantAreas.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Fra idé til sted</p>
            <h2 className={styles.sectionTitle}>Områder der dette livet er naturlig å utforske videre</h2>
            <p className={styles.sectionLead}>Temaet i artikkelen kan se forskjellig ut fra sted til sted. Disse områdene er gode utgangspunkt før du velger tomt eller bolig.</p>
          </div>
          <div className={styles.imageCardGrid}>
            {relevantAreas.map((area) => (
              <article className={styles.imageCard} key={area.slug}>
                <img className={styles.imageCardPhoto} src={area.photo} alt={area.name} />
                <div className={styles.imageCardBody}>
                  <span className={styles.cardEyebrow}>{area.region}</span>
                  <h3>{area.name}</h3>
                  <p>{area.summary}</p>
                  <Link className={styles.editorialLink} href={`/livet-i-innlandet/${area.slug}`}>Se livet i {area.name} <ArrowRight size={16} /></Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {relatedArticles.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Les videre</p>
            <h2 className={styles.sectionTitle}>Bygg et tydeligere bilde av livet du ønsker</h2>
            <p className={styles.sectionLead}>De beste beslutningene kommer sjelden fra én boligannonse. Les videre om plass, hverdagsliv, tomt og hvordan eiendommen faktisk kan brukes.</p>
          </div>
          <div className={styles.editorialCards}>
            {relatedArticles.map((article) => (
              <article className={styles.editorialCard} key={article.slug}>
                <span className={styles.cardEyebrow}>Eco Life</span>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <Link className={styles.editorialLink} href={`/magasin/${article.slug}`}>Les artikkelen <ArrowRight size={16} /></Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="contact-section" id="kontakt">
        <div>
          <p className="eyebrow">Fra inspirasjon til konkret neste steg</p>
          <h2>Er dette en del av livet du ser for deg?</h2>
          <p>
            Fortell oss hva som traff deg i artikkelen. Vi kan bruke det som utgangspunkt når vi sammenligner områder, tomter og boliger – i stedet for å starte med en tilfeldig boligliste.
          </p>
        </div>
        <ContactForm
          source={`pinosoecolife-article-${post.slug}`}
          requestType={`Eco Life-artikkel – ${post.slug}`}
          lifestyleIntent={lifestyleIntent}
        />
      </section>

      <Footer />
    </main>
  );
}