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
  const relatedFirst = slug === "aret-pa-fincaen"
    ? ["dyrk-egen-mat", "vann", "regenerativt-jordbruk"]
    : slug === "regenerativt-jordbruk"
      ? ["dyrk-egen-mat", "vann", "aret-pa-fincaen"]
    : slug === "dyrk-egen-mat" || slug === "planlegg-tomten" || slug === "vann"
      ? ["regenerativt-jordbruk", "aret-pa-fincaen", "dyrk-egen-mat", "vann", "planlegg-tomten"]
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
                      : slug === "aret-pa-fincaen"
                        ? "Året på landet handler om å planlegge etter lokale forhold, følge med på været og prioritere de oppgavene som ikke kan vente. Bruk månedskapitlene som en fleksibel sjekkliste."
                        : "Et behagelig hus i innlandet må fungere både i sommervarme og på kalde vinterdager. Byggets form og klimaskjerm er like viktig som teknologien."}</p>
          {topic.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </section>
          ))}
          {"deepDive" in topic && topic.deepDive.map((section) => (
            <section key={section.title}>
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
