import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Check, MapPin, Sprout } from "lucide-react";

import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import {
  getAlternativeAreaSlugs,
  getAreaArticleSlugs,
} from "@/lib/ecolife-content-links";
import { ecoLifeAreas, getEcoLifeArea } from "@/lib/ecolife-areas";
import { fetchPublishedPosts } from "@/lib/website-content";

type Params = { slug: string };

const lifestyleContext = {
  vinland: {
    interest: "Vinland og dyrking",
    requestType: "Eco Life – vinland og dyrking",
  },
  landsby: {
    interest: "Landsbyliv og lokalmiljø",
    requestType: "Eco Life – landsbyliv og finca-ro",
  },
  praktisk: {
    interest: "Enkel logistikk og flyplass",
    requestType: "Eco Life – enkel logistikk",
  },
  fjell: {
    interest: "Gåturer, sykkel og natur",
    requestType: "Eco Life – fjell og natur",
  },
} as const;

export function generateStaticParams() {
  return ecoLifeAreas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const area = getEcoLifeArea(slug);
  if (!area) return { title: "Område ikke funnet | Pinoso Eco Life" };
  return {
    title: `Livet i ${area.name} | Pinoso Eco Life`,
    description: area.summary,
    alternates: { canonical: `/livet-i-innlandet/${area.slug}` },
  };
}

export default async function EcoLifeAreaPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const area = getEcoLifeArea(slug);

  if (!area) {
    return (
      <main>
        <SiteHeader />
        <section className="page-hero compact-hero">
          <p className="eyebrow">Livet i innlandet</p>
          <h1>Området ble ikke funnet</h1>
          <Link className="text-button" href="/livet-i-innlandet"><ArrowLeft size={16} /> Tilbake til områdene</Link>
        </section>
        <Footer />
      </main>
    );
  }

  const primarySearch = encodeURIComponent(area.searchTerms[0] || area.name);
  const leadContext = lifestyleContext[area.zone];
  const publishedPosts = await fetchPublishedPosts("magasin");
  const relevantArticleSlugs = getAreaArticleSlugs(area.slug, 4);
  const relevantArticles = relevantArticleSlugs.flatMap((articleSlug) => {
    const post = publishedPosts.find((candidate) => candidate.slug === articleSlug);
    return post ? [post] : [];
  });
  const alternativeAreas = getAlternativeAreaSlugs(area.slug, 3).flatMap((areaSlug) => {
    const candidate = getEcoLifeArea(areaSlug);
    return candidate ? [candidate] : [];
  });

  return (
    <main>
      <SiteHeader />

      <section className="page-hero compact-hero image-hero">
        <p className="eyebrow">{area.region} · {area.eyebrow}</p>
        <h1>Livet i {area.name}</h1>
        <p>{area.summary}</p>
      </section>

      <section className="section split">
        <div>
          <p className="eyebrow">Hverdagen</p>
          <h2>Hvordan kan det faktisk føles å bo her?</h2>
          {area.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="feature-panel">
          {area.highlights.map((highlight) => (
            <div key={highlight}><MapPin /> {highlight}</div>
          ))}
        </div>
      </section>

      <section className="section proof-section">
        <div className="section-heading">
          <p className="eyebrow">Passer særlig for</p>
          <h2>Er {area.name} riktig type innlandsliv for deg?</h2>
        </div>
        <div className="proof-grid">
          {area.bestFor.map((item, index) => (
            <article key={item}>
              <strong>0{index + 1}</strong>
              <h3>{item}</h3>
              <p>Bruk dette som et filter når du vurderer området, tomten og hvordan du ønsker å bruke eiendommen.</p>
            </article>
          ))}
        </div>
      </section>

      {relevantArticles.length > 0 && (
        <section className="section proof-section">
          <div className="section-heading">
            <p className="eyebrow">Les deg inn på hverdagen</p>
            <h2>Artikler som er særlig relevante for {area.name}</h2>
            <p>
              Områdevalget blir lettere når du også ser for deg hvordan tomten, uteområdet og hverdagen faktisk kan brukes.
            </p>
          </div>
          <div className="proof-grid">
            {relevantArticles.map((post) => (
              <article key={post.slug}>
                <strong>Eco Life</strong>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <Link className="text-button" href={`/magasin/${post.slug}`}>
                  Les artikkelen <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="section split">
        <div>
          <p className="eyebrow">Tomten som del av hjemmet</p>
          <h2>Ikke planlegg livet rundt en tomt før tomten er kontrollert</h2>
          <p>
            Stor tomt kan gi rom for hage, trær, uteplasser, dyrking, hobbyer og privatliv, men hva som faktisk kan
            bygges og brukes må vurderes konkret. Arealklassifisering, byggbarhet, vann, strøm, avløp, adkomst og
            lokale bestemmelser må være på plass før prosjektet behandles som realistisk.
          </p>
          <div className="check-list">
            <span><Check size={18} /> Området og hverdagen passer deg</span>
            <span><Check size={18} /> Tomten er egnet og dokumentasjonen kontrollert</span>
            <span><Check size={18} /> Boligmodellen tilpasses tomt og lokale rammer</span>
          </div>
        </div>
        <div className="feature-panel">
          <div><Sprout /> Hva vil du dyrke eller skape?</div>
          <div><MapPin /> Hvor langt vil du ha til daglig service?</div>
          <div><Check /> Hvor mye vedlikehold ønsker du?</div>
        </div>
      </section>

      <section className="section proof-section">
        <div className="section-heading">
          <p className="eyebrow">Fra idé til konkret prosjekt</p>
          <h2>Se hva som finnes i og rundt {area.name}</h2>
          <p>
            Vi starter med område og livsstil. Deretter kan vi se etter tomt eller bolig og vurdere om prosjektet faktisk
            passer behov, budsjett og lokale rammer.
          </p>
        </div>
        <div className="center-action">
          <Link className="text-button" href={`/tomter?q=${primarySearch}`}>Se tomter <ArrowRight size={18} /></Link>
          <Link className="text-button" href={`/eiendommer?area=${primarySearch}`}>Se boliger <ArrowRight size={18} /></Link>
          <a className="text-button" href="#kontakt">Snakk med oss <ArrowRight size={18} /></a>
        </div>
      </section>

      {alternativeAreas.length > 0 && (
        <section className="section proof-section">
          <div className="section-heading">
            <p className="eyebrow">Sammenlign før du bestemmer deg</p>
            <h2>Andre områder du bør se sammen med {area.name}</h2>
            <p>
              Et godt områdevalg handler ofte om å se to eller tre realistiske alternativer ved siden av hverandre før du velger tomt.
            </p>
          </div>
          <div className="proof-grid">
            {alternativeAreas.map((candidate) => (
              <article key={candidate.slug}>
                <strong>{candidate.region}</strong>
                <h3>{candidate.name}</h3>
                <p>{candidate.summary}</p>
                <Link className="text-button" href={`/livet-i-innlandet/${candidate.slug}`}>
                  Se livet i {candidate.name} <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="contact-section" id="kontakt">
        <div>
          <p className="eyebrow">{area.name}</p>
          <h2>Fortell oss hvordan du ønsker å leve her</h2>
          <p>
            Område og Eco Life-retning er allerede fylt inn. Legg til budsjett, tidslinje og det som er viktig for deg,
            så kan vi vurdere aktuelle tomter, boliger og neste steg.
          </p>
        </div>
        <ContactForm
          source={`pinosoecolife-area-${area.slug}`}
          preferredArea={area.name}
          lifestyleIntent={leadContext.interest}
          requestType={leadContext.requestType}
        />
      </section>

      <section className="section">
        <Link className="text-button" href="/livet-i-innlandet"><ArrowLeft size={16} /> Se alle Eco Life-områder</Link>
      </section>

      <Footer />
    </main>
  );
}
