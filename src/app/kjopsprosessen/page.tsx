import { CheckCircle2 } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { processSteps } from "@/lib/content";
import styles from "./process.module.css";

export const metadata = {
  title: "Kjøpsprosessen",
  description: "Fra livsstil og områdevalg til egnet tomt, bolig, dokumentkontroll og overtakelse i innlandet i Spania.",
  alternates: { canonical: "/kjopsprosessen" },
};

export default function BuyingProcessPage() {
  return (
    <main>
      <SiteHeader />

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
            <p className={styles.sectionEyebrow}>En rolig, strukturert reise</p>
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
              <span>Strukturert RealtyFlow-oppfølging</span>
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

      <Footer />
    </main>
  );
}