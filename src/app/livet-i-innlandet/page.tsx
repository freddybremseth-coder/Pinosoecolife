import Link from "next/link";
import { ArrowRight, Leaf, MapPin, Mountain, Route, Sprout } from "lucide-react";

import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { ecoLifeAreaGroups, ecoLifeAreas } from "@/lib/ecolife-areas";
import styles from "../ecolife-editorial.module.css";

export const metadata = {
  title: "Livet i innlandet",
  description:
    "Utforsk hvordan hverdagen kan se ut i Pinoso, Hondón, Aspe, La Romana, Biar, Villena, Jumilla og andre innlandsområder i Alicante og Murcia.",
  alternates: { canonical: "/livet-i-innlandet" },
};

const icons = {
  vinland: Leaf,
  landsby: Sprout,
  praktisk: Route,
  fjell: Mountain,
};

export default function InlandLifePage() {
  return (
    <main>
      <SiteHeader />

      <section className={styles.editorialHero}>
        <img className={styles.heroMedia} src="/assets/hero-pinoso-dream.jpg" alt="Landskap i innlandet i Spania" />
        <div className={`${styles.heroInner} ${styles.heroInnerNarrow}`}>
          <p className={styles.heroEyebrow}>Pinoso Eco Life · Alicante & Murcia</p>
          <h1 className={styles.heroTitle}>Livet i innlandet</h1>
          <p className={styles.heroLead}>
            Start med hverdagen du ønsker. Vinland, landsby, fjell eller enklere logistikk gir svært forskjellige liv – selv når tomtestørrelsen ser lik ut på papiret.
          </p>
        </div>
      </section>

      <section className={styles.introSection}>
        <div className={styles.introGrid}>
          <div>
            <p className={styles.sectionEyebrow}>Velg livet før adressen</p>
            <h2 className={styles.introTitle}>Den riktige tomten i feil område er fortsatt feil.</h2>
          </div>
          <p className={styles.introCopy}>
            Derfor deler vi ikke innlandet bare etter kommunegrenser. Vi ser på hvordan stedet faktisk fungerer: hvor mye service du vil ha nær deg, om naturen skal være en stor del av hverdagen, hvor ofte du reiser, og hva du ønsker å gjøre med plassen rundt boligen.
          </p>
        </div>

        <div className={styles.groupGrid}>
          {ecoLifeAreaGroups.map((group) => {
            const Icon = icons[group.key];
            const count = ecoLifeAreas.filter((area) => area.zone === group.key).length;
            return (
              <a className={styles.groupCard} href={`#${group.key}`} key={group.key}>
                <span className={styles.groupIcon}><Icon size={21} /></span>
                <h3>{group.title}</h3>
                <p>{group.text}</p>
                <span className={styles.groupCount}>{count} områder å sammenligne</span>
              </a>
            );
          })}
        </div>
      </section>

      {ecoLifeAreaGroups.map((group) => {
        const groupAreas = ecoLifeAreas.filter((area) => area.zone === group.key);
        return (
          <section className={styles.zoneSection} id={group.key} key={group.key}>
            <div className={styles.zoneHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Eco Life-områder</p>
                <h2 className={styles.sectionTitle}>{group.title}</h2>
              </div>
              <p>{group.text}</p>
            </div>

            <div className={styles.areaList}>
              {groupAreas.map((area) => (
                <article className={styles.areaCard} key={area.slug}>
                  <div className={styles.areaPhoto} style={{ backgroundImage: `url(${area.photo})` }} />
                  <div className={styles.areaBody}>
                    <span className={styles.cardEyebrow}>{area.region} · {area.eyebrow}</span>
                    <h3>{area.name}</h3>
                    <p>{area.summary}</p>
                    <ul>
                      {area.bestFor.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    <Link className={styles.editorialLink} href={`/livet-i-innlandet/${area.slug}`}>
                      Hvordan er livet i {area.name}? <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className={styles.actionBand}>
        <div>
          <p className={styles.heroEyebrow}>Område først. Tomt etterpå.</p>
          <h2>10 000 m² kan gi helt forskjellige liv.</h2>
          <p>
            Når du vet hvilket miljø du vil våkne i, hvor mye service du trenger og hva du vil gjøre med tomten, kan vi begynne å lete konkret – uten at en tilfeldig boligannonse bestemmer hvor du ender opp.
          </p>
        </div>
        <div className={styles.actionLinks}>
          <Link href="/tomter">Se aktuelle tomter <ArrowRight size={17} /></Link>
          <Link href="/magasin">Les Eco Life-magasinet <ArrowRight size={17} /></Link>
          <Link href="/#kontakt"><MapPin size={16} /> Fortell oss hvordan du vil leve</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}