import Link from "next/link";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { EcoLifePlanner } from "@/components/EcoLifePlanner";
import styles from "../self-sufficient.module.css";

export const metadata = {
  title: "Eco Life-planlegger | Planlegg et mer selvforsynt liv",
  description: "Lag en foreløpig Eco Life-profil med ønsket tomtestørrelse, solenergi, dyrking og vann. Finn aktuelle tomter etter areal og pris.",
  alternates: { canonical: "/selvforsynt-liv/planlegger" },
};

export default function EcoLifePlannerPage() {
  return (
    <main>
      <SiteHeader />
      <header className={styles.guideHero}>
        <div className={styles.container}>
          <Link className={styles.backLink} href="/selvforsynt-liv">← Tilbake til Selvforsynt liv</Link>
          <p className={styles.eyebrow}>Eco Life-planlegger</p>
          <h1>Hvordan vil du leve på landet?</h1>
          <p>Beskriv ønskene dine og få en praktisk sjekkliste. Se deretter tomter som passer de dokumenterte areal- og prisfiltrene.</p>
        </div>
      </header>
      <section className={`${styles.container} ${styles.plannerSection}`}>
        <EcoLifePlanner />
      </section>
      <Footer />
    </main>
  );
}
