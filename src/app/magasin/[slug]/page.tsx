import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import type { Metadata } from "next";

import { ContactForm } from "@/components/ContactForm";
import MarkdownArticle from "@/components/MarkdownArticle";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchPublishedPost, fetchPublishedPosts } from "@/lib/website-content";

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

export async function generateStaticParams() {
  const posts = await fetchPublishedPosts("magasin");
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPublishedPost("magasin", slug);
  if (!post) {
    return { title: "Artikkel ikke funnet | Pinoso Eco Life" };
  }
  return {
    title: `${post.title} | Pinoso Eco Life`,
    description: post.summary || "Guider og innsikt fra Pinoso Eco Life.",
  };
}

export default async function MagazineArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await fetchPublishedPost("magasin", slug);

  if (!post) {
    return (
      <main>
        <SiteHeader />
        <section className="page-hero compact-hero">
          <p className="eyebrow">Magasin</p>
          <h1>Artikkelen ble ikke funnet</h1>
          <p>Denne saken er ikke publisert, eller lenken er ikke lenger aktiv.</p>
          <Link href="/magasin" className="button-primary mt-6 inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Tilbake til magasin
          </Link>
        </section>
        <Footer />
      </main>
    );
  }

  const lifestyleIntent = inferLifestyleIntent(post.tags || []);

  return (
    <main>
      <SiteHeader />
      <section className="page-hero compact-hero">
        <p className="eyebrow">Livet i innlandet</p>
        <h1>{post.title}</h1>
        <p>{post.summary || "Innsikt, guider og tryggere beslutningsstøtte for boligkjøpere i Spania."}</p>
      </section>
      <section className="section">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <Link href="/magasin" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900">
            <ArrowLeft size={16} /> Tilbake til magasin
          </Link>
          {post.published_at && (
            <p className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500">
              <Calendar size={16} /> {formatDate(post.published_at)}
            </p>
          )}
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={post.title}
              className="mb-10 aspect-[16/9] w-full rounded-2xl object-cover"
            />
          ) : null}
          <MarkdownArticle markdown={post.markdown} />
        </div>
      </section>

      <section className="contact-section" id="kontakt">
        <div>
          <p className="eyebrow">Fra inspirasjon til konkret neste steg</p>
          <h2>Er dette en del av livet du ser for deg?</h2>
          <p>
            Fortell oss hva som traff deg i artikkelen. Vi kan bruke det som utgangspunkt når vi sammenligner områder,
            tomter og boliger – i stedet for å starte med en tilfeldig boligliste.
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
