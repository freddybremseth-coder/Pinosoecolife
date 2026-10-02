import { CheckCircle2 } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { processSteps } from "@/lib/content";
import styles from "./process.module.css";

export const metadata = {
  title: "Kjøpsprosessen for bolig i Pinoso og Alicante-innlandet",
  description: "Se kjøpsprosessen fra behov og områdevalg til tomt eller bolig, dokumentkontroll, reservasjon, kontrakt og overtakelse i innlandet i Spania.",
  alternates: { canonical: "/kjopsprosessen" },
  openGraph: {
    title: "Kjøpsprosessen | Pinoso Eco Life",
    description: "Fra områdevalg til kontroll, reservasjon, kontrakt og overtakelse – med tydelige beslutningspunkter underveis.",
    url: "https://www.pinosoecolife.com/kjopsprosessen",
    siteName: "Pinoso Eco Life",
    locale: "nb_NO",
    type: "website",
  },
};

export default function BuyingProcessPage() {
  const pageUrl = "https://www.pinosoecolife.com/kjopsprosessen";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: "Kjøpsprosessen for bolig i Pinoso og Alicante-innlandet",
        description: "Fra behov og områdevalg til tomt eller bolig, dokumentkontroll, reservasjon, kontrakt og overtakelse.",
        inLanguage: "nb-NO",
        isPartOf: { "@id": "https://www.pinosoecolife.com/#website" },
        about: { "@id": "https://www.pinosoecolife.com/#organization" },
        author: { "@id": "https://www.freddybremseth.com/#person" },
        dateModified: "2026-10-02",
      },
      {
        "@type": "ItemList",
        name: "Steg i kjøpsprosessen",
        itemListElement: processSteps.map((step, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: step,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Forside", item: "https://www.pinosoecolife.com/" },
          { "@type": "ListItem", position: 2, name: "Kjøpsprosessen", item: pageUrl },
        ],
      },
      {
        "@type": "Person",
        "@id": "https://www.freddybremseth.com/#person",
        name: "Freddy Bremseth",
        url: "https://www.freddybremseth.com/",
      },
    ],
  };

  return (
    <main>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Kjøpsprosessen</p>
          <h1>Fra riktig område til trygg gjennomføring</h1>
          <p className={styles.heroCopy}>
            Vi starter med hvordan du vil leve, snevrer inn område og eiendom, og følger prosessen videre gjennom
            dokumentkontroll, visning, kontrakt og overtakelse.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.intro}>
          <div>
            <p className={styles.sectionEyebrow}>Kort svar · En rolig, strukturert reise</p>
            <h2 className={styles.sectionTitle}>Riktig rekkefølge reduserer unødvendige kompromisser</h2>
            <p className={styles.sectionCopy}>
              Vi forsøker ikke å presse et bestemt prosjekt inn i et tilfeldig område. Først avklarer vi hverdagen og
              stedet. Deretter vurderer vi tomt eller bolig, dokumentasjon og de konkrete rammene for handelen.
            </p>
          </div>

          <aside className={styles.principles}>
            <div className={styles.principle}>
              <CheckCircle2 size={20} />
              <span>Livsstil og område først</span>
            </div>
            <div className={styles.principle}>
              <CheckCircle2 size={20} />
              <span>Tomt og dokumenter kontrolleres</span>
            </div>
            <div className={styles.principle}>
              <CheckCircle2 size={20} />
              <span>Rådgivning på norsk</span>
            </div>
            <div className={styles.principle}>
              <CheckCircle2 size={20} />
              <span>Tydelig oppfølging hele veien</span>
            </div>
          </aside>
        </div>

        <div className={styles.journey}>
          {processSteps.map((step, index) => (
            <article className={styles.step} key={step}>
              <span className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</span>
              <div className={styles.stepBody}>
                <p>{step}</p>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.callout}>
          <h2>Du skal vite hva du kjøper – og hvorfor akkurat dette valget passer deg</h2>
          <p>
            Derfor skiller vi mellom inspirasjon, områdevalg, teknisk og juridisk kontroll og selve kjøpsbeslutningen.
            Målet er ikke bare å finne noe som er til salgs, men å bygge en beslutning du forstår.
          </p>
        </div>
      </section>

      <section className={styles.contact}>
        <div className={styles.contactInner}>
          <div>
            <p className={styles.eyebrow}>Neste steg</p>
            <h2>Start med en kort behovsavklaring</h2>
            <p className={styles.contactCopy}>
              Fortell oss hvordan du vil leve, så kan vi begynne med område og deretter se på tomt eller bolig.
            </p>
          </div>
          <div className={styles.formShell}>
            <ContactForm source="buying-process" requestType="Kjøpsprosess – område, tomt og bolig" />
          </div>
        </div>
      </section>

      <p style={{ width: "min(1160px, calc(100% - 48px))", margin: "0 auto 48px", color: "var(--muted)", fontSize: ".8rem" }}>
        Oppdatert 2. oktober 2026 · Generell beslutningsstøtte; juridiske og tekniske forhold kontrolleres for den konkrete eiendommen.
      </p>
      <Footer />
    </main>
  );
}
