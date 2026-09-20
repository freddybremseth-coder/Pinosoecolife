import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { ecoLifeAreaGroups, ecoLifeAreas } from "@/lib/ecolife-areas";
import styles from "./areas.module.css";

export const metadata = {
  title: "Innlandsområder",
  description:
    "Les om 14 ulike steder i innlandet i Alicante og Murcia. Sammenlign hverdagsliv, natur, vinland, nærhet til tjenester og muligheter for tomt eller bolig.",
  alternates: { canonical: "/omrader" },
};

export default function AreasPage() {
  return (
    <main>
      <SiteHeader />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Områder i Alicante og Murcia</p>
          <h1>Hvilket innlandsliv passer deg?</h1>
          <p className={styles.heroCopy}>
            Start med stedet og hverdagen. Her kan du lese om 14 ulike områder –
            fra vinmarkene rundt Pinoso til fjellandsbyer og byer med enkel hverdagslogistikk.
            Først når du finner et sted du liker, ser vi på aktuell tomt eller bolig.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#finn-livsstil">
              Finn din type innland <ArrowRight size={17} />
            </a>
            <Link className={styles.secondaryAction} href="/eiendommer">Se aktuelle boliger</Link>
          </div>
        </div>
      </section>

      <section className={styles.section} id="finn-livsstil">
        <div className={styles.introGrid}>
          <div>
            <p className={styles.sectionEyebrow}>Velg etter hverdagen du ønsker</p>
            <h2 className={styles.sectionTitle}>Ulike steder. Ulike muligheter.</h2>
            <p className={styles.sectionCopy}>
              Et lite landsbymiljø, en by med flere tjenester, vinlandskap eller fjell og turstier:
              det som føles riktig for én kjøper, er ikke nødvendigvis riktig for en annen.
              Utforsk flere steder før du bestemmer deg.
            </p>
          </div>
          <aside className={styles.introAside}>
            <span className={styles.bigNumber}>{ecoLifeAreas.length}</span>
            <p>områder med egne guider om hverdagsliv, natur, plass og hva du bør undersøke før kjøp.</p>
            <Link className={styles.inlineLink} href="/livet-i-innlandet">
              Les mer om livet i innlandet <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      </section>

      <nav className={styles.groupGrid} aria-label="Velg hva slags hverdagsliv du ønsker">
        {ecoLifeAreaGroups.map((group) => (
          <a className={styles.groupCard} href={`#${group.key}`} key={group.key}>
            <div>
              <strong>{group.title}</strong>
              <p>{group.text}</p>
            </div>
            <span>Utforsk {ecoLifeAreas.filter((area) => area.zone === group.key).length} steder ↓</span>
          </a>
        ))}
      </nav>

      {ecoLifeAreaGroups.map((group) => (
        <section className={`${styles.section} ${styles.groupSection}`} id={group.key} key={group.key}>
          <div className={styles.groupHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Steder å utforske</p>
              <h2 className={styles.sectionTitle}>{group.title}</h2>
              <p className={styles.sectionCopy}>{group.text}</p>
            </div>
            <Link className={styles.pillLink} href="/livet-i-innlandet">
              Om livet i innlandet <ArrowRight size={16} />
            </Link>
          </div>
          <nav className={styles.groupGrid} aria-label={`Les om områder: ${group.title}`}>
            {ecoLifeAreas.filter((area) => area.zone === group.key).map((area) => (
              <Link className={styles.groupCard} href={`/livet-i-innlandet/${area.slug}`} key={area.slug}>
                <div>
                  <img
                    src={area.photo}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 12, marginBottom: 18 }}
                  />
                  <strong>{area.name}</strong>
                  <p>{area.summary}</p>
                </div>
                <span>Les om livet i {area.name} <ArrowRight size={16} /></span>
              </Link>
            ))}
          </nav>
        </section>
      ))}

      <section className={styles.section}>
        <div className={styles.closing}>
          <p className={styles.sectionEyebrow}>Fra områdevalg til ditt eget sted</p>
          <h2>Har du funnet et område som frister?</h2>
          <p>
            Neste steg er å undersøke aktuelle boliger eller finne en tomt som passer både
            ønskene dine og lokale regler. En stor tomt alene betyr ikke at den kan bebygges.
            Vi hjelper deg å avklare alternativene før du bestemmer deg.
          </p>
          <div className={styles.heroActions} style={{ justifyContent: "center" }}>
            <Link className={styles.pillLink} href="/eiendommer">Se boliger <ArrowRight size={16} /></Link>
            <Link className={styles.pillLink} href="/tomter">Se tomter <MapPin size={16} /></Link>
            <Link className={styles.pillLink} href="/#kontakt">Fortell oss hva du ser etter</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
