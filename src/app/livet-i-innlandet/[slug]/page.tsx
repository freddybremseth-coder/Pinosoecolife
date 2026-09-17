import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Check, MapPin, Sprout } from "lucide-react";

import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getAlternativeAreaSlugs, getAreaArticleSlugs } from "@/lib/ecolife-content-links";
import { ecoLifeAreas, getEcoLifeArea } from "@/lib/ecolife-areas";
import { fetchPublishedPosts } from "@/lib/website-content";
import styles from "../../ecolife-editorial.module.css";

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
  if (!area) return { title: "Område ikke funnet" };
  return {
    title: `Livet i ${area.name}`,
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

      <section className={styles.editorialHero}>
        <img className={styles.heroMedia} src={area.photo} alt={area.name} />
        <div className={`${styles.heroInner} ${styles.heroInnerNarrow}`}>
          <p className={styles.heroEyebrow}>{area.region} · {area.eyebrow}</p>
          <h1 className={styles.heroTitle}>Livet i {area.name}</h1>
          <p className={styles.heroLead}>{area.summary}</p>
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.storyCopy}>
          <p className={styles.sectionEyebrow}>Hverdagen</p>
          <h2 className={styles.storyTitle}>Hvordan kan det faktisk føles å bo her?</h2>
          {area.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <aside className={styles.factPanel}>
          {area.highlights.map((highlight) => (
            <div className={styles.factItem} key={highlight}><MapPin size={19} /><span>{highlight}</span></div>
          ))}
        </aside>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Passer særlig for</p>
          <h2 className={styles.sectionTitle}>Er {area.name} riktig type innlandsliv for deg?</h2>
        </div>
        <div className={styles.editorialCards}>
          {area.bestFor.map((item, index) => (
            <article className={styles.editorialCard} key={item}>
              <span className={styles.cardEyebrow}>0{index + 1}</span>
              <h3>{item}</h3>
              <p>Bruk dette som et filter når du vurderer området, tomten og hvordan du faktisk ønsker å bruke eiendommen.</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.storyCopy}>
          <p className={styles.sectionEyebrow}>Tomten som del av hjemmet</p>
          <h2 className={styles.storyTitle}>Ikke planlegg livet rundt en tomt før tomten er kontrollert.</h2>
          <p>
            Stor tomt kan gi rom for hage, trær, uteplasser, dyrking, hobbyer og privatliv, men hva som faktisk kan bygges og brukes må vurderes konkret. Arealklassifisering, byggbarhet, vann, strøm, avløp, adkomst og lokale bestemmelser må være på plass før prosjektet behandles som realistisk.
          </p>
        </div>
        <aside className={styles.factPanel}>
          <div className={styles.factItem}><Check size={19} /><span>Området og hverdagen passer deg</span></div>
          <div className={styles.factItem}><Check size={19} /><span>Tomten er egnet og dokumentasjonen kontrollert</span></div>
          <div className={styles.factItem}><Sprout size={19} /><span>Bolig og uteområder tilpasses tomt og lokale rammer</span></div>
        </aside>
      </section>

      {relevantArticles.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Les deg inn på hverdagen</p>
            <h2 className={styles.sectionTitle}>Artikler som passer særlig godt til {area.name}</h2>
            <p className={styles.sectionLead}>Områdevalget blir lettere når du også ser for deg hvordan tomten, uteområdet og hverdagen kan brukes.</p>
          </div>
          <div className={styles.editorialCards}>
            {relevantArticles.map((post) => (
              <article className={styles.editorialCard} key={post.slug}>
                <span className={styles.cardEyebrow}>Eco Life</span>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <Link className={styles.editorialLink} href={`/magasin/${post.slug}`}>Les artikkelen <ArrowRight size={16} /></Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {alternativeAreas.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Sammenlign før du bestemmer deg</p>
            <h2 className={styles.sectionTitle}>Andre steder du bør se sammen med {area.name}</h2>
            <p className={styles.sectionLead}>Et godt områdevalg blir ofte tydeligere når to eller tre realistiske alternativer ligger ved siden av hverandre.</p>
          </div>
          <div className={styles.imageCardGrid}>
            {alternativeAreas.map((candidate) => (
              <article className={styles.imageCard} key={candidate.slug}>
                <img className={styles.imageCardPhoto} src={candidate.photo} alt={candidate.name} />
                <div className={styles.imageCardBody}>
                  <span className={styles.cardEyebrow}>{candidate.region}</span>
                  <h3>{candidate.name}</h3>
                  <p>{candidate.summary}</p>
                  <Link className={styles.editorialLink} href={`/livet-i-innlandet/${candidate.slug}`}>Se livet i {candidate.name} <ArrowRight size={16} /></Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className={styles.actionBand}>
        <div>
          <p className={styles.heroEyebrow}>Fra område til konkret prosjekt</p>
          <h2>Se hva som finnes i og rundt {area.name}.</h2>
          <p>Start med stedet og hverdagen. Deretter kan vi vurdere tomt eller bolig mot behov, budsjett og lokale rammer.</p>
        </div>
        <div className={styles.actionLinks}>
          <Link href={`/tomter?q=${primarySearch}`}>Se tomter <ArrowRight size={17} /></Link>
          <Link href={`/eiendommer?area=${primarySearch}`}>Se boliger <ArrowRight size={17} /></Link>
          <a href="#kontakt">Snakk med oss <ArrowRight size={17} /></a>
        </div>
      </section>

      <section className="contact-section" id="kontakt">
        <div>
          <p className="eyebrow">{area.name}</p>
          <h2>Fortell oss hvordan du ønsker å leve her</h2>
          <p>
            Område og Eco Life-retning er allerede fylt inn. Legg til budsjett, tidslinje og det som er viktig for deg, så kan vi vurdere aktuelle tomter, boliger og neste steg.
          </p>
        </div>
        <ContactForm
          source={`pinosoecolife-area-${area.slug}`}
          preferredArea={area.name}
          lifestyleIntent={leadContext.interest}
          requestType={leadContext.requestType}
        />
      </section>

      <section className={styles.contentSection}>
        <Link className={styles.editorialLink} href="/livet-i-innlandet"><ArrowLeft size={16} /> Se alle Eco Life-områder</Link>
      </section>

      <Footer />
    </main>
  );
}