import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { selfSufficientTopics } from "@/lib/self-sufficient-content";
import styles from "./self-sufficient.module.css";

export const metadata = {
  title: "Selvforsynt liv i Spania | Solenergi, dyrking og store tomter",
  description: "Utforsk et mer selvstendig liv i Alicante-innlandet: solceller, dyrking, regenerativt jordbruk, tomteplanlegging, årstider, vann, småbruk og planlegging av stor tomt. Praktiske guider uten urealistiske løfter.",
  alternates: { canonical: "/selvforsynt-liv" },
};

export default function SelfSufficientLifePage() {
  return (
    <main>
      <SiteHeader />
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Pinoso Eco Life · Kunnskap</p>
          <h1>Et mer selvstendig liv. På dine premisser.</h1>
          <p>Drømmer du om egen mat, solenergi og plass rundt huset? Her finner du praktisk kunnskap om mulighetene og begrensningene ved et mer selvforsynt liv i Alicante- og Murcia-innlandet.</p>
          <a className={styles.heroLink} href="#temaer">Utforsk temaene <ArrowRight size={18} /></a>
        </div>
      </section>
      <section className={styles.container} id="temaer">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Ni veier inn i Eco Life</p>
          <h2>Begynn med det som betyr mest for deg.</h2>
          <p>Du behøver ikke bli fullstendig selvforsynt. Kanskje er målet lavere energiforbruk, en kjøkkenhage eller bare mer plass til å leve.</p>
        </div>
        <div className={styles.grid}>
          {selfSufficientTopics.map((topic, index) => (
            <Link className={styles.card} href={`/selvforsynt-liv/${topic.slug}`} key={topic.slug}>
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <h3>{topic.title}</h3>
              <p>{topic.lead}</p>
              <span className={styles.cardLink}>Les guiden <ArrowRight size={17} /></span>
            </Link>
          ))}
        </div>
      </section>
      <section className={styles.container} aria-labelledby="eco-stories-title">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Fra Magasin til praktisk kunnskap</p>
          <h2 id="eco-stories-title">Historier som gir guidene liv.</h2>
          <p>Les om erfaringene og mulighetene, og gå deretter videre til guiden som hjelper deg å vurdere ditt eget prosjekt.</p>
        </div>
        <div className={styles.grid}>
          <Link className={styles.card} href="/magasin/10000-m2-hva-gjor-du-med-plassen">
            <span className={styles.number}>MAGASIN · TOMT</span>
            <h3>Hva gjør du med 10 000 m²?</h3>
            <p>Fra plass og privatliv til en konkret plan for tomten.</p>
            <span className={styles.cardLink}>Les artikkelen <ArrowRight size={17} /></span>
          </Link>
          <Link className={styles.card} href="/magasin/fra-supermarked-til-egen-hage">
            <span className={styles.number}>MAGASIN · MAT</span>
            <h3>Fra supermarked til egen hage</h3>
            <p>Et realistisk første steg mot å dyrke mer av maten selv.</p>
            <span className={styles.cardLink}>Les artikkelen <ArrowRight size={17} /></span>
          </Link>
          <Link className={styles.card} href="/magasin/fra-blank-tomt-til-eget-landskap">
            <span className={styles.number}>MAGASIN · LANDSKAP</span>
            <h3>Fra blank tomt til eget landskap</h3>
            <p>Hvordan en eiendom kan utvikles over flere sesonger.</p>
            <span className={styles.cardLink}>Les artikkelen <ArrowRight size={17} /></span>
          </Link>
        </div>
      </section>
      <section className={`${styles.container} ${styles.band}`}>
        <div>
          <p className={styles.eyebrow}>Planlegg ditt Eco Life</p>
          <h2>Finn ut hva som er viktig for deg.</h2>
          <p>Størrelse alene sier ikke om tomten har byggeadgang, tilstrekkelig vann eller mulighet for ønsket bruk. Vi begynner med behovene og undersøker deretter konkrete alternativer.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/selvforsynt-liv/planlegger">Lag din Eco Life-plan <ArrowRight size={17} /></Link>
          <Link href="/tomter">Se aktuelle tomter <ArrowRight size={17} /></Link>
          <Link href="/magasin">Les historier fra innlandet <ArrowRight size={17} /></Link>
          <Link href="/#kontakt">Fortell oss om planen din <ArrowRight size={17} /></Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
