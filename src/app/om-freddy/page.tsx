import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Check, MapPin } from "lucide-react";

import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import styles from "../ecolife-editorial.module.css";

const BASE = "https://www.pinosoecolife.com";

export const metadata: Metadata = {
  title: "Om Freddy Bremseth | Norsk rådgiver for Pinoso og Alicante-innlandet",
  description:
    "Møt Freddy Bremseth, norsk eiendomsrådgiver bosatt i Alicante-provinsen med erfaring fra boligkjøp, utleie, tomter og livet både på Costa Blanca og i innlandet.",
  alternates: { canonical: "/om-freddy" },
  openGraph: {
    title: "Om Freddy Bremseth | Pinoso Eco Life",
    description:
      "Norsk eiendomsrådgivning for Pinoso og Alicante-innlandet, med områdevalg, tomter, villaer, fincaer og nybygg i sammenheng.",
    url: `${BASE}/om-freddy`,
    siteName: "Pinoso Eco Life",
    locale: "nb_NO",
    type: "profile",
    images: [
      {
        url: "https://www.zenecohomes.com/assets/freddy-bremseth.jpg",
        alt: "Freddy Bremseth",
      },
    ],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${BASE}/om-freddy#person`,
  name: "Freddy Bremseth",
  jobTitle: "Eiendomsrådgiver",
  url: `${BASE}/om-freddy`,
  image: "https://www.zenecohomes.com/assets/freddy-bremseth.jpg",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Benidorm",
    addressRegion: "Alicante",
    addressCountry: "ES",
  },
  knowsLanguage: ["no", "en", "es"],
  knowsAbout: [
    "Bolig i Pinoso",
    "Tomt i Pinoso",
    "Nybygg i Alicante-innlandet",
    "Finca og landlig eiendom",
    "Boligkjøp i Spania",
    "Områdevalg i Alicante og Murcia",
  ],
  worksFor: { "@id": `${BASE}/#organization` },
  sameAs: [
    "https://www.freddybremseth.com",
    "https://www.zenecohomes.com/om-freddy",
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Forside", item: BASE },
    { "@type": "ListItem", position: 2, name: "Om Freddy Bremseth", item: `${BASE}/om-freddy` },
  ],
};

export default function AboutFreddyPage() {
  return (
    <main>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className={styles.editorialHero}>
        <img
          className={styles.heroMedia}
          src="https://www.zenecohomes.com/assets/freddy-bremseth.jpg"
          alt="Freddy Bremseth, norsk eiendomsrådgiver i Alicante"
          style={{ objectPosition: "center 30%" }}
        />
        <div className={`${styles.heroInner} ${styles.heroInnerNarrow}`}>
          <p className={styles.heroEyebrow}>Pinoso Eco Life · rådgivning først</p>
          <h1 className={styles.heroTitle}>Freddy Bremseth</h1>
          <p className={styles.heroLead}>
            Norsk eiendomsrådgiver bosatt i Alicante-provinsen. Jeg hjelper kjøpere å vurdere området, tomten,
            boligen og den praktiske kjøpsreisen som én beslutning.
          </p>
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.storyCopy}>
          <p className={styles.sectionEyebrow}>Hvorfor Pinoso Eco Life?</p>
          <h2 className={styles.storyTitle}>Jeg kjenner forskjellen på å kjøpe en bolig og å velge et liv.</h2>
          <p>
            Jeg har arbeidet med bolig i Spania over flere perioder og har selv stått på kjøpersiden når
            informasjon mangler, svarene er uklare og visningstiden er begrenset. Det har formet måten jeg
            arbeider på: færre tilfeldige visninger, flere avklaringer før du bruker tid og penger.
          </p>
          <p>
            Tidligere bodde jeg flere år på Costa Blanca sør og arbeidet blant annet med eiendomssystemer og
            utleie. Senere holdt jeg regelmessige informasjonsmøter i Norge for mennesker som vurderte bolig i
            Spania. I dag bor jeg fast i Alicante-provinsen og familien har også en oliveneiendom i Biar.
          </p>
          <p>
            Den kombinasjonen er viktig for Pinoso Eco Life. Jeg kjenner både den internasjonale kysten og det
            mer lokale innlandet, og vet at den beste boligen ikke hjelper hvis området, logistikken eller
            tomten ikke passer livet du faktisk ønsker.
          </p>
        </div>

        <aside className={styles.factPanel}>
          <div className={styles.factItem}><MapPin size={19} /><span>Bosatt i Alicante-provinsen</span></div>
          <div className={styles.factItem}><Check size={19} /><span>Erfaring med bolig, utleie og kjøpsprosesser i Spania</span></div>
          <div className={styles.factItem}><Check size={19} /><span>Egen erfaring med landlig eiendom i Alicante-innlandet</span></div>
          <div className={styles.factItem}><Check size={19} /><span>Norsk, engelsk og spansk i rådgivningsarbeidet</span></div>
        </aside>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Arbeidsmåten</p>
          <h2 className={styles.sectionTitle}>Område først. Deretter tomt eller bolig.</h2>
          <p className={styles.sectionLead}>
            Målet er et bedre beslutningsgrunnlag, ikke flest mulig objekter i innboksen.
          </p>
        </div>

        <div className={styles.editorialCards}>
          <article className={styles.editorialCard}>
            <span className={styles.cardEyebrow}>01</span>
            <h3>Forstå behovet</h3>
            <p>
              Vi avklarer hvordan boligen skal brukes, budsjett, logistikk, ønsket privatliv, uteområder og hva
              du faktisk ønsker av hverdagen i Spania.
            </p>
          </article>
          <article className={styles.editorialCard}>
            <span className={styles.cardEyebrow}>02</span>
            <h3>Sammenlign områdene</h3>
            <p>
              Pinoso, Aspe, Hondón, Biar, Villena og de andre innlandsområdene gir forskjellige liv. Det bør
              være tydelig før du forelsker deg i en boligannonse.
            </p>
          </article>
          <article className={styles.editorialCard}>
            <span className={styles.cardEyebrow}>03</span>
            <h3>Kontroller det konkrete</h3>
            <p>
              Pris, tilgjengelighet, tomt, dokumentasjon og prosjektforutsetninger må verifiseres for den
              konkrete eiendommen av riktige fagpersoner før en bindende beslutning.
            </p>
          </article>
        </div>
      </section>

      <section className={styles.actionBand}>
        <div>
          <p className={styles.heroEyebrow}>Start med stedet</p>
          <h2>Finn ut hvilket innlandsliv som passer deg.</h2>
          <p>
            Bruk områdeguidene og kjøperguidene først. Når retningen er tydelig, kan vi snevre inn til aktuelle
            tomter og boliger.
          </p>
        </div>
        <div className={styles.actionLinks}>
          <Link href="/livet-i-innlandet">Sammenlign områdene <ArrowRight size={17} /></Link>
          <Link href="/bolig-i-pinoso">Guide til bolig i Pinoso <ArrowRight size={17} /></Link>
          <Link href="/tomt-i-pinoso">Guide til tomt i Pinoso <ArrowRight size={17} /></Link>
          <Link href="/#kontakt">Kontakt Freddy <ArrowRight size={17} /></Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
