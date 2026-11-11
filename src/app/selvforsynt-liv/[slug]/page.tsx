import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { GrowingCalendar } from "@/components/GrowingCalendar";
import { selfSufficientTopics } from "@/lib/self-sufficient-content";
import { getGuideArticleSlugs } from "@/lib/ecolife-content-links";
import { fetchPublishedPosts } from "@/lib/website-content";
import styles from "../self-sufficient.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return selfSufficientTopics.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = selfSufficientTopics.find((entry) => entry.slug === slug);
  if (!topic) return {};
  return {
    title: `${topic.title} i Alicante-innlandet`,
    description: topic.lead,
    alternates: { canonical: `/selvforsynt-liv/${slug}` },
  };
}

export default async function SelfSufficientGuide({ params }: Props) {
  const { slug } = await params;
  const topic = selfSufficientTopics.find((entry) => entry.slug === slug);
  if (!topic) notFound();
  const relatedFirst = slug === "eksempel-10000m2"
    ? ["planlegg-tomten", "vann", "regenerativt-jordbruk"]
    : slug === "aret-pa-fincaen"
    ? ["dyrk-egen-mat", "vann", "regenerativt-jordbruk"]
    : slug === "regenerativt-jordbruk"
      ? ["dyrk-egen-mat", "vann", "aret-pa-fincaen"]
    : slug === "dyrk-egen-mat" || slug === "planlegg-tomten" || slug === "vann"
      ? ["eksempel-10000m2", "regenerativt-jordbruk", "aret-pa-fincaen", "dyrk-egen-mat", "vann", "planlegg-tomten"]
      : ["planlegg-tomten", "vann", "regenerativt-jordbruk"];
  const otherTopics = selfSufficientTopics
    .filter((entry) => entry.slug !== slug)
    .sort((a, b) => {
      const rank = (key: string) => {
        const index = relatedFirst.indexOf(key);
        return index === -1 ? 99 : index;
      };
      return rank(a.slug) - rank(b.slug);
    })
    .slice(0, 3);
  const publishedArticles = await fetchPublishedPosts("magasin");
  const relatedArticles = getGuideArticleSlugs(slug).flatMap((articleSlug) => {
    const article = publishedArticles.find((entry) => entry.slug === articleSlug);
    return article ? [article] : [];
  });
  const guideSections = [...topic.sections, ...("deepDive" in topic ? topic.deepDive : [])];
  const articleUrl = `https://www.pinosoecolife.com/selvforsynt-liv/${slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: topic.title, description: topic.lead, mainEntityOfPage: articleUrl, inLanguage: "nb-NO", publisher: { "@type": "Organization", name: "Pinoso Eco Life" } },
      { "@type": "FAQPage", mainEntity: topic.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
    ],
  };

  return (
    <main>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <article>
        <header className={styles.guideHero}>
          <div className={styles.container}>
            <Link className={styles.backLink} href="/selvforsynt-liv">← Alle guider om selvforsynt liv</Link>
            <p className={styles.eyebrow}>Praktisk Eco Life-guide</p>
            <h1>{topic.title}</h1>
            <p>{topic.lead}</p>
          </div>
        </header>
        <div className={styles.articleBody}>
          <h2>{topic.question}</h2>
          <p>{slug === "regenerativt-jordbruk"
            ? "Du kan begynne med en liten del av eiendommen og bygge kunnskap over flere sesonger. Under finner du konkrete tiltak, en 90-dagers startplan og måter å kontrollere om jorda faktisk blir bedre."
            : slug === "dyrk-egen-mat"
              ? "En god kjøkkenhage er tilpasset sesong, mikroklima og vannforsyning. Begynn med et håndterbart areal, observer stedet og utvid først når du kjenner forholdene."
              : slug === "vann"
                ? "Vann er ofte den viktigste begrensningen på en finca. Før du planlegger hage, trær eller tekniske systemer, bør du vite både hvor vannet kommer fra og hvilken bruk som er tillatt."
                : slug === "planlegg-tomten"
                  ? "Planleggingen starter med juridiske rammer, terreng og tilgang til infrastruktur. Først deretter er det tid for å plassere bolig, hage og andre funksjoner."
                  : slug === "dyr-og-smabruk"
                    ? "Et lite dyrehold kan være meningsfylt, men krever daglig ansvar, også på varme sommerdager og når eieren er bortreist."
                    : slug === "solenergi"
                      ? "Et godt energisystem dimensjoneres etter faktisk forbruk, døgnprofil og vinterbehov – ikke bare etter hvor mange soltimer regionen har."
                      : slug === "eksempel-10000m2"
                        ? "Her får du et tydelig arealbudsjett, en illustrasjon, en plan for utvikling i etapper og punktene som må avklares før en stor tomt kan realiseres."
                        : slug === "aret-pa-fincaen"
                        ? "Året på landet handler om å planlegge etter lokale forhold, følge med på været og prioritere de oppgavene som ikke kan vente. Bruk månedskapitlene som en fleksibel sjekkliste."
                        : "Et behagelig hus i innlandet må fungere både i sommervarme og på kalde vinterdager. Byggets form og klimaskjerm er like viktig som teknologien."}</p>
          <nav className={styles.guideToc} aria-label="Innhold i guiden">
            <details>
              <summary>Innhold i guiden · {guideSections.length} temaer</summary>
              <ol>{guideSections.map((section, index) => (
                <li key={`${index}-${section.title}`}><a href={`#guide-section-${index + 1}`}>{section.title}</a></li>
              ))}</ol>
            </details>
          </nav>
          {slug === "eksempel-10000m2" && (
            <figure className={styles.plotFigure}>
              <figcaption>
                <strong>Et tenkt arealbudsjett: 10 000 m²</strong>
                <span>Skjematisk fordeling av areal, ikke et kart eller en situasjonsplan. Byggetillatelse og faktisk bruk må avklares særskilt.</span>
              </figcaption>
              <svg className={styles.plotDiagram} viewBox="0 0 1000 600" role="img" aria-labelledby="plot-title plot-desc">
                <title id="plot-title">Eksempelfordeling av en tomt på 10 000 kvadratmeter</title>
                <desc id="plot-desc">45 prosent natur, 20 prosent eksisterende trær, 15 prosent mulig fruktareal, 7 prosent adkomst, 5 prosent kjøkkenhage, 5 prosent buffer og 3 prosent mulig boligfunksjon. Kun illustrative funksjoner.</desc>
                <rect x="0" y="0" width="600" height="450" fill="#789b82" />
                <rect x="600" y="0" width="400" height="300" fill="#a5b189" />
                <rect x="0" y="450" width="600" height="150" fill="#c8b477" />
                <rect x="600" y="300" width="200" height="210" fill="#c5a88f" />
                <rect x="800" y="300" width="200" height="150" fill="#d5c58e" />
                <rect x="800" y="450" width="200" height="150" fill="#95b5aa" />
                <rect x="600" y="510" width="200" height="90" fill="#bb9ba0" />
                <g fill="#20342a" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="700">
                  <text x="300" y="216" fontSize="29">Natur og vegetasjon</text>
                  <text x="300" y="254" fontSize="23">4 500 m²</text>
                  <text x="800" y="132" fontSize="27">Eksisterende trær</text>
                  <text x="800" y="169" fontSize="23">2 000 m²</text>
                  <text x="300" y="526" fontSize="26">Nytt fruktareal · 1 500 m²</text>
                  <text x="700" y="393" fontSize="21">Adkomst</text>
                  <text x="700" y="424" fontSize="18">700 m²</text>
                  <text x="900" y="369" fontSize="19">Kjøkkenhage</text>
                  <text x="900" y="399" fontSize="18">500 m²</text>
                  <text x="900" y="518" fontSize="19">Buffersone</text>
                  <text x="900" y="548" fontSize="18">500 m²</text>
                  <text x="700" y="551" fontSize="17">Boligsone*</text>
                  <text x="700" y="576" fontSize="16">300 m²</text>
                </g>
                <path d="M600 0 V600 M0 450 H600 M600 300 H1000 M800 300 V600 M800 450 H1000 M600 510 H800" stroke="#ffffff" strokeWidth="5" fill="none" opacity="0.85" />
              </svg>
              <div className={styles.plotLegend} aria-label="Arealfordeling i illustrasjonen">
                <h3>Arealfordelingen i klartekst</h3>
                <ul>
                  <li><span>Natur og vegetasjon</span><strong>4 500 m²</strong></li>
                  <li><span>Eksisterende trær</span><strong>2 000 m²</strong></li>
                  <li><span>Nytt fruktareal</span><strong>1 500 m²</strong></li>
                  <li><span>Adkomst</span><strong>700 m²</strong></li>
                  <li><span>Kjøkkenhage</span><strong>500 m²</strong></li>
                  <li><span>Buffersone</span><strong>500 m²</strong></li>
                  <li><span>Mulig boligsone*</span><strong>300 m²</strong></li>
                </ul>
              </div>
              <p className={styles.plotDisclaimer}>* «Boligsone» viser kun avsatt plass i tankeeksperimentet. Den innebærer ingen byggerett eller godkjent bygningsstørrelse.</p>
            </figure>
          )}
          {topic.sections.map((section, index) => (
            <section id={`guide-section-${index + 1}`} key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </section>
          ))}
          {"deepDive" in topic && topic.deepDive.map((section, index) => (
            <section id={`guide-section-${topic.sections.length + index + 1}`} key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </section>
          ))}
          {slug === "dyrk-egen-mat" && <GrowingCalendar />}
          {slug === "dyrk-egen-mat" && (
            <aside className={styles.farmStory}>
              <p className={styles.eyebrow}>Fra innlandet · Biar</p>
              <h2>Et ekte eksempel: olivenlunden bak Doña Anna</h2>
              <p>
                Freddy og Anna Bremseth har også en oliveneiendom i Biar i Alicante-innlandet.
                Under navnet Doña Anna forteller de om oliventrærne, arbeidet på gården og
                olivenoljen fra egen produksjon. Innhøstingen av 2025-avlingen begynte i
                desember 2025 og fortsatte inn i januar 2026.
              </p>
              <p>
                Det er et nært eksempel på noe vi også legger vekt på her: Å dyrke på landet
                handler om å følge sesongene, lære stedet å kjenne og planlegge arbeidet rundt
                det man faktisk har tid og ressurser til. Pinoso Eco Life hjelper deg med å
                forstå tomter og hverdagen i innlandet; Doña Anna handler om olivenlunden,
                produksjonen og det som kommer fra trærne.
              </p>
              <a href="https://www.donaanna.com/" target="_blank" rel="noopener noreferrer">
                Bli kjent med Doña Anna og olivenlunden i Biar <ArrowRight size={17} />
              </a>
            </aside>
          )}
          <section className={styles.checklist}>
            <h2>Dette bør du undersøke</h2>
            <ul>{topic.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section className={styles.faq}>
            <h2>Vanlige spørsmål</h2>
            {topic.faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </section>
          <aside className={styles.notice}>
            <h2>Før du investerer</h2>
            <p>Dette er generell orientering. Byggemuligheter, vannrettigheter, elektriske installasjoner og eventuelt dyrehold må bekreftes for den konkrete eiendommen av kompetente lokale fagpersoner og myndigheter.</p>
          </aside>
          {topic.links.length > 0 && (
            <section>
              <h2>Offisielle kilder og videre lesning</h2>
              <ul>{topic.links.map((link) => <li key={link.href}><a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a></li>)}</ul>
            </section>
          )}
          <div className={styles.guideActions}>
            <Link href="/tomter">Utforsk tomter <ArrowRight size={17} /></Link>
            <Link href="/#kontakt">Diskuter ditt Eco Life-prosjekt <ArrowRight size={17} /></Link>
          </div>
        </div>
      </article>
      {relatedArticles.length > 0 && (
        <section className={`${styles.container} ${styles.related}`} aria-label="Relaterte magasinartikler">
          <h2>Historier fra magasinet om dette temaet</h2>
          <div className={styles.grid}>
            {relatedArticles.map((article) => (
              <Link className={styles.card} key={article.slug} href={`/magasin/${article.slug}`}>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <span className={styles.cardLink}>Les magasinartikkelen <ArrowRight size={17} /></span>
              </Link>
            ))}
          </div>
        </section>
      )}
      <section className={`${styles.container} ${styles.related}`}>
        <h2>Utforsk flere sider ved livet på landet</h2>
        <div className={styles.grid}>
          {otherTopics.map((entry) => <Link className={styles.card} key={entry.slug} href={`/selvforsynt-liv/${entry.slug}`}><h3>{entry.title}</h3><p>{entry.lead}</p><span className={styles.cardLink}>Les mer <ArrowRight size={17} /></span></Link>)}
        </div>
      </section>
      <Footer />
    </main>
  );
}
