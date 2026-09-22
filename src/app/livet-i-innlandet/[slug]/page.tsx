import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, MapPin, Sprout } from "lucide-react";

import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getAlternativeAreaSlugs, getAreaArticleSlugs } from "@/lib/ecolife-content-links";
import { ecoLifeAreas, getEcoLifeArea } from "@/lib/ecolife-areas";
import { fetchPublishedPosts } from "@/lib/website-content";
import styles from "../../ecolife-editorial.module.css";
import factStyles from "../../ecolife-area-facts.module.css";
import { AREA_ROUTE_DESTINATIONS, ECO_LIFE_AREA_FACTS, areaDrivingDirections, areaMapEmbed, straightLineKm } from "@/lib/ecolife-area-facts";

type Params = { slug: string };

const BASE = "https://www.pinosoecolife.com";

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
    title: `${area.name}: bolig, tomt og livet i innlandet`,
    description: area.summary,
    alternates: { canonical: `/livet-i-innlandet/${area.slug}` },
    openGraph: {
      title: `${area.name}: bolig, tomt og livet i innlandet`,
      description: area.summary,
      url: `${BASE}/livet-i-innlandet/${area.slug}`,
      siteName: "Pinoso Eco Life",
      locale: "nb_NO",
      type: "website",
      images: [{ url: area.photo, alt: area.name }],
    },
  };
}

export default async function EcoLifeAreaPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const area = getEcoLifeArea(slug);

  if (!area) notFound();

  const primarySearch = encodeURIComponent(area.searchTerms[0] || area.name);
  const areaFacts = ECO_LIFE_AREA_FACTS[area.slug];
  const populationSource = area.region === "Murcia"
    ? "https://econet.carm.es/web/crem/inicio/-/crem/sicrem/PM2100/sec2_c1.html"
    : "https://datos.diputacionalicante.es/censo/";
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
  const pageUrl = `${BASE}/livet-i-innlandet/${area.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${area.name}: bolig, tomt og livet i innlandet`,
        description: area.summary,
        inLanguage: "nb-NO",
        isPartOf: { "@id": `${BASE}/#website` },
        about: { "@id": `${pageUrl}#place` },
      },
      {
        "@type": "Place",
        "@id": `${pageUrl}#place`,
        name: area.name,
        description: area.summary,
        image: area.photo,
        address: {
          "@type": "PostalAddress",
          addressLocality: area.name,
          addressRegion: area.region,
          addressCountry: "ES",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Forside", item: BASE },
          { "@type": "ListItem", position: 2, name: "Livet i innlandet", item: `${BASE}/livet-i-innlandet` },
          { "@type": "ListItem", position: 3, name: area.name, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <main>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className={styles.editorialHero}>
        <img className={styles.heroMedia} src={area.photo} alt={area.name} />
        {area.slug === "jumilla" && (
          <a
            href="https://commons.wikimedia.org/wiki/File:Castillo_de_Jumilla.jpg"
            target="_blank"
            rel="noopener noreferrer license"
            style={{ position: "absolute", zIndex: 2, right: 16, bottom: 12, color: "#fff", fontSize: 11, textShadow: "0 1px 4px #000", opacity: 0.9 }}
          >
            Foto: Leire navagil / Wikimedia Commons · CC BY-SA 4.0
          </a>
        )}
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

      {areaFacts && (
        <section className={factStyles.buyerSection} aria-labelledby="area-local-facts">
          <div className={factStyles.buyerIntro}>
            <p className={factStyles.eyebrow}>Før du bestemmer deg</p>
            <h2 id="area-local-facts" className={factStyles.heading}>Bli kjent med {area.name} – også utenfor boligannonsen</h2>
            {areaFacts.practical.map((paragraph) => <p className={factStyles.copy} key={paragraph}>{paragraph}</p>)}
            <p className={factStyles.copy}>Besøk stedet på en vanlig ukedag. Test daglige ærender, lokale tjenester, turmuligheter og hvor mye bilkjøring du faktisk vil ha i hverdagen.</p>
          </div>
          <div className={factStyles.layout}>
            <div className={factStyles.mapColumn}>
              <iframe
                className={factStyles.mapFrame}
                title={`Kart over ${area.name} og nærområdet`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={areaMapEmbed(areaFacts)}
              />
              <p className={factStyles.mapCaption}>Kart: OpenStreetMap. Markøren viser et omtrentlig sentrumspunkt i {area.name}, ikke en bestemt tomt eller bolig.</p>
            </div>
            <aside className={factStyles.factsColumn} aria-label={`Innbyggertall og avstander fra ${area.name}`}>
              <div className={factStyles.population}>
                <span className={factStyles.populationLabel}>Innbyggere · 1. januar 2025</span>
                {areaFacts.population !== null ? (
                  <strong className={factStyles.populationNumber}>{areaFacts.population.toLocaleString("nb-NO")}</strong>
                ) : areaFacts.populationBreakdown ? (
                  <strong className={factStyles.populationNumber}>To kommuner</strong>
                ) : null}
                {areaFacts.populationBreakdown?.map((part) => (
                  <span className={factStyles.smallNote} key={part.name}>{part.name}: {part.population.toLocaleString("nb-NO")} innbyggere</span>
                ))}
                <span className={factStyles.smallNote}>Offisielt folketall for kommunen, ikke bare sentrum eller boligområdet.</span>
                <a className={factStyles.source} href={populationSource} target="_blank" rel="noopener noreferrer">Se offentlig statistikk ↗</a>
              </div>
              <h3 className={factStyles.distanceHeading}>Hvor ligger stedet?</h3>
              <p className={factStyles.distanceIntro}>Omtrentlige avstander i luftlinje fra sentrum, <strong>ikke kjøreavstander eller reisetider</strong>. Åpne kjøreruten for å vurdere reisen fra området.</p>
              <ul className={factStyles.distanceList}>
                {AREA_ROUTE_DESTINATIONS.map((destination) => (
                  <li className={factStyles.distanceItem} key={destination.label}>
                    <span>{destination.label}: ca. {straightLineKm(areaFacts, destination)} km</span>
                    <a href={areaDrivingDirections(areaFacts, destination)} target="_blank" rel="noopener noreferrer" aria-label={`Beregn kjørerute fra ${area.name} til ${destination.label}`}>Se kjørerute ↗</a>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>
      )}

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
          {area.slug === "pinoso" && <Link href="/bolig-i-pinoso">Guide: kjøpe bolig i Pinoso <ArrowRight size={17} /></Link>}
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