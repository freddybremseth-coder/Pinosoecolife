import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
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
    title: `${topic.title} i Alicante-innlandet | Pinoso Eco Life`,
    description: topic.lead,
    alternates: { canonical: `/selvforsynt-liv/${slug}` },
  };
}

export default async function SelfSufficientGuide({ params }: Props) {
  const { slug } = await params;
  const topic = selfSufficientTopics.find((entry) => entry.slug === slug);
  if (!topic) notFound();
  const otherTopics = selfSufficientTopics.filter((entry) => entry.slug !== slug).slice(0, 3);

  return (
    <main>
      <SiteHeader />
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
        </div>
      </section>
      <Footer />
    </main>
  );
}
