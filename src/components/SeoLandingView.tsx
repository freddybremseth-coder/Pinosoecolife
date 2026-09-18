import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import type { SeoLandingPage } from "@/lib/seoLandingPages";
import styles from "@/app/ecolife-editorial.module.css";

const BASE = "https://www.pinosoecolife.com";

export function SeoLandingView({ page }: { page: SeoLandingPage }) {
  const selfUrl = `${BASE}/${page.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${selfUrl}#webpage`,
        url: selfUrl,
        name: page.seoTitle,
        description: page.seoDescription,
        inLanguage: "nb-NO",
        isPartOf: { "@id": `${BASE}/#website` },
        about: page.about,
      },
      {
        "@type": "Service",
        "@id": `${selfUrl}#service`,
        name: page.title,
        serviceType: page.serviceType,
        description: page.description,
        url: selfUrl,
        provider: { "@id": `${BASE}/#organization` },
        areaServed: ["Pinoso", "Alicante", "Murcia", "Spain"],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Forside", item: BASE },
          { "@type": "ListItem", position: 2, name: page.title, item: selfUrl },
        ],
      },
    ],
  };

  return (
    <main>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className={styles.editorialHero}>
        <img
          className={styles.heroMedia}
          src="/assets/hero-pinoso-dream.jpg"
          alt="Vinlandskap og landlig miljø i Pinoso-området"
        />
        <div className={`${styles.heroInner} ${styles.heroInnerNarrow}`}>
          <p className={styles.heroEyebrow}>{page.eyebrow}</p>
          <h1 className={styles.heroTitle}>{page.hero}</h1>
          <p className={styles.heroLead}>{page.description}</p>
          <div className={styles.actionLinks} style={{ marginTop: 28 }}>
            <Link href={page.primaryCta.href}>
              {page.primaryCta.label} <ArrowRight size={17} />
            </Link>
            {page.secondaryCta && (
              <Link href={page.secondaryCta.href}>
                {page.secondaryCta.label} <ArrowRight size={17} />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Beslutningsguide</p>
          <h2 className={styles.sectionTitle}>Det viktigste før du går videre</h2>
          <p className={styles.sectionLead}>
            Innholdet er laget for å svare på spørsmål en kjøper faktisk må løse – ikke for å gjenta søkeord.
          </p>
        </div>

        <div className={styles.editorialCards}>
          {page.sections.map((section, index) => (
            <article className={styles.editorialCard} key={section.heading}>
              <span className={styles.cardEyebrow}>{String(index + 1).padStart(2, "0")}</span>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets && (
                <ul>
                  {section.bullets.map((bullet) => <li key={bullet}><Check size={16} /> {bullet}</li>)}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.relatedSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Vanlige spørsmål</p>
          <h2 className={styles.sectionTitle}>Svar før du bestiller visning eller binder deg</h2>
        </div>
        <div className={styles.editorialCards}>
          {page.faq.map((item) => (
            <article className={styles.editorialCard} key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.actionBand}>
        <div>
          <p className={styles.heroEyebrow}>Neste steg</p>
          <h2>Gå fra generell søking til et konkret beslutningsgrunnlag.</h2>
          <p>
            Se området, aktuelle boliger og tomter i sammenheng. Når noe er interessant, kontrolleres opplysninger og
            forutsetninger for den konkrete eiendommen før du tar en bindende beslutning.
          </p>
        </div>
        <div className={styles.actionLinks}>
          {page.related.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label} <ArrowRight size={17} />
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
