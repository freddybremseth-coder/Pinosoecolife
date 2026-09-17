import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { SiteHeader } from "@/components/SiteHeader";
import {
  areaMatchesRegion,
  getAreaProfiles,
  getProperties,
  propertyMatchesRegion,
  type RegionKey,
  regions,
} from "@/lib/realtyflow";
import styles from "../areas.module.css";

const regionCopy: Record<RegionKey, { title: string; intro: string; proof: string[] }> = {
  pinoso: {
    title: "Pinoso og vinlandet rundt",
    intro:
      "Her kan du utforske boliger og steder rundt Pinoso og nærliggende innland. Start med hvordan du vil leve, og gå deretter videre til de konkrete boligene og tomtene som passer planen din.",
    proof: ["Store tomter og mer rom rundt boligen", "By og landsbyer som fungerer gjennom året", "Vinland, jordbruk og landlige omgivelser"],
  },
  "aspe-monforte": {
    title: "Aspe, Monforte del Cid og praktisk innland",
    intro:
      "Se boliger og steder rundt Aspe, Monforte del Cid og nærliggende områder når enkel logistikk mot Alicante og Elche er viktig, men du fortsatt ønsker mer plass og en tydelig innlandsfølelse.",
    proof: ["Praktisk forbindelse mot Alicante og Elche", "Byservice kombinert med mer åpne omgivelser", "Muligheter for både moderne bolig og landligere alternativer"],
  },
  "hondon-dalen": {
    title: "Hondón-dalen og landsbyene rundt",
    intro:
      "Utforsk boliger og steder i Hondón-dalen og nærliggende landsbyer. Her kan vinmarker, landsbyliv og større uteområder være en viktig del av hverdagen du ønsker å skape.",
    proof: ["Vinmarker, åser og landsbymiljø", "Villaer og fincaer med mer uteplass", "Landsbyliv kombinert med landlige omgivelser"],
  },
};

const ecoLifeGuideLinks: Record<RegionKey, Array<{ slug: string; name: string; note: string }>> = {
  pinoso: [
    { slug: "pinoso", name: "Pinoso", note: "Vinland, store tomter og helårsliv" },
    { slug: "monovar", name: "Monóvar", note: "Lokal vinby med finca-landskap rundt" },
    { slug: "la-romana", name: "La Romana", note: "Mindre landsby, ro og landlig hverdag" },
  ],
  "aspe-monforte": [
    { slug: "aspe", name: "Aspe", note: "Praktisk innland og moderne nybygg" },
    { slug: "novelda", name: "Novelda", note: "Byservice, kultur og landskap rundt" },
    { slug: "monforte-del-cid", name: "Monforte del Cid", note: "Åpent miljø med enkel logistikk" },
  ],
  "hondon-dalen": [
    { slug: "hondon-de-las-nieves", name: "Hondón de las Nieves", note: "Vinmarker, landsbyliv og større uteområder" },
  ],
};

export function generateStaticParams() {
  return regions.map((region) => ({ region: region.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: RegionKey }> }) {
  const { region } = await params;
  const copy = regionCopy[region];
  return {
    title: copy?.title || "Område",
    description: copy?.intro || "Utforsk innlandsområder, aktuelle boliger og steder å bo med Pinoso Eco Life.",
    alternates: {
      canonical: `/omrader/${region}`,
    },
  };
}

export default async function RegionPage({ params }: { params: Promise<{ region: RegionKey }> }) {
  const { region } = await params;
  const selected = regions.find((item) => item.key === region);
  const copy = regionCopy[region];
  const guideLinks = ecoLifeGuideLinks[region] || [];

  if (!selected || !copy) {
    return (
      <main>
        <SiteHeader />
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <p className={styles.eyebrow}>Område</p>
            <h1>Område ikke funnet</h1>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="/omrader">Til områder</Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const [profiles, properties] = await Promise.all([getAreaProfiles(), getProperties(0)]);
  const regionProfiles = profiles.filter((profile) => areaMatchesRegion(profile, region));
  const regionProperties = properties.filter((property) => propertyMatchesRegion(property, region));

  return (
    <main>
      <SiteHeader />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Områdevalg</p>
          <h1>{copy.title}</h1>
          <p className={styles.heroCopy}>{copy.intro}</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href={`/eiendommer?region=${region}`}>
              Se {regionProperties.length} aktuelle boliger <ArrowRight size={17} />
            </Link>
            <Link className={styles.secondaryAction} href={`/tomter?q=${encodeURIComponent(selected.label)}`}>
              Se tomter
            </Link>
            <Link className={styles.secondaryAction} href="/livet-i-innlandet">
              Sammenlign flere områder
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.introGrid}>
          <div>
            <p className={styles.sectionEyebrow}>Hva området kan passe for</p>
            <h2 className={styles.sectionTitle}>Se på hverdagen før du velger bolig</h2>
            <p className={styles.sectionCopy}>{selected.description}</p>
            <div className={styles.guideGrid}>
              {copy.proof.map((item) => (
                <article className={styles.guideCard} key={item}>
                  <ShieldCheck size={20} />
                  <h3>{item}</h3>
                </article>
              ))}
            </div>
          </div>
          <aside className={styles.statsGrid}>
            <div className={styles.stat}>
              <strong>{regionProperties.length}</strong>
              <span>aktuelle boliger i området</span>
            </div>
            <div className={styles.stat}>
              <strong>{guideLinks.length}</strong>
              <span>steder å utforske nærmere</span>
            </div>
          </aside>
        </div>
      </section>

      {guideLinks.length > 0 && (
        <section className={`${styles.section} ${styles.groupSection}`}>
          <p className={styles.sectionEyebrow}>Steder å se nærmere på</p>
          <h2 className={styles.sectionTitle}>Sammenlign hverdagen før du bestemmer deg</h2>
          <p className={styles.sectionCopy}>
            Les om forskjellene i landsbyliv, natur, tomter, service og logistikk. Det gjør det enklere å snevre inn
            søket før du bruker tid på konkrete visninger.
          </p>
          <div className={styles.guideGrid}>
            {guideLinks.map((guide) => (
              <article className={styles.guideCard} key={guide.slug}>
                <span>Område</span>
                <h3>{guide.name}</h3>
                <p>{guide.note}</p>
                <Link className={styles.inlineLink} href={`/livet-i-innlandet/${guide.slug}`}>
                  Se livet i {guide.name} <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {regionProfiles.length > 0 && (
        <section className={`${styles.section} ${styles.groupSection}`}>
          <div className={styles.groupHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Flere steder i området</p>
              <h2 className={styles.sectionTitle}>Se boligmuligheter sted for sted</h2>
            </div>
          </div>
          <div className={styles.profileList}>
            {regionProfiles.slice(0, 6).map((profile) => (
              <article
                className={`${styles.profileCard} ${profile.photo_url ? "" : styles.profileCardNoPhoto}`}
                key={profile.id || profile.name}
              >
                {profile.photo_url && (
                  <div className={styles.profileImage} style={{ backgroundImage: `url(${profile.photo_url})` }} />
                )}
                <div className={styles.profileBody}>
                  <span className={styles.profileMeta}>{profile.region || selected.label}</span>
                  <h2>{profile.name}</h2>
                  {profile.hero_blurb && <strong>{profile.hero_blurb}</strong>}
                  {profile.description && <p>{profile.description}</p>}
                  <Link
                    className={styles.inlineLink}
                    href={`/eiendommer?region=${region}&area=${encodeURIComponent(profile.name)}`}
                  >
                    <MapPin size={16} /> Se boliger i {profile.name}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className={`${styles.section} ${styles.propertySection}`}>
        <p className={styles.sectionEyebrow}>Aktuelle boliger</p>
        <h2 className={styles.sectionTitle}>Boliger i {selected.label}</h2>
        <p className={styles.sectionCopy}>
          Se boligene som konkrete alternativer etter at område, livsstil og behov er avklart. Pris, tilgjengelighet og
          detaljer bekreftes alltid på nytt før reservasjon eller kjøpsbeslutning.
        </p>
        {regionProperties.length > 0 ? (
          <div className={styles.propertyGrid}>
            {regionProperties.slice(0, 6).map((property, index) => (
              <PropertyCard key={property.id || property.ref || index} property={property} />
            ))}
          </div>
        ) : (
          <article className={styles.emptyCard}>
            <MapPin size={24} />
            <div>
              <h3>Ingen boliger i dette utvalget akkurat nå</h3>
              <p>
                Området kan fortsatt være aktuelt. Utforsk områdeguidene eller kontakt oss hvis du vil at vi skal lete
                etter en bolig eller tomt som passer kriteriene dine.
              </p>
            </div>
          </article>
        )}
        <div className={styles.heroActions}>
          <Link className={styles.pillLink} href={`/eiendommer?region=${region}`}>
            Se alle boliger i {selected.label} <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
