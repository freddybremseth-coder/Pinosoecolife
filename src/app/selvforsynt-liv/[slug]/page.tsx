import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { GrowingCalendar } from "@/components/GrowingCalendar";
import { selfSufficientTopics } from "@/lib/self-sufficient-content";
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
  const otherTopics = selfSufficientTopics.filter((entry) => entry.slug !== slug).slice(0, 3);
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
          <p>Et godt prosjekt starter med behovene dine og faktiske forhold på eiendommen. Mulighetene avhenger av klima, vann, regulering og infrastruktur – ikke bare hvor stor tomten er.</p>
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
      <section className={`${styles.container} ${styles.related}`}>
        <h2>Utforsk flere sider ved livet på landet</h2>
        <div className={styles.grid}>
          {otherTopics.map((entry) => <Link className={styles.card} key={entry.slug} href={`/selvforsynt-liv/${entry.slug}`}><h3>{entry.title}</h3><p>{entry.lead}</p><span className={styles.cardLink}>Les mer <ArrowRight size={17} /></span></Link>)}
