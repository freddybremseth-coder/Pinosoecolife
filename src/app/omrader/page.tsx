import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { ecoLifeAreas } from "@/lib/ecolife-areas";
import { areaMatchesRegion, getAreaProfiles, regions } from "@/lib/realtyflow";
import styles from "./areas.module.css";

export const metadata = {
  title: "Innlandsområder | Pinoso Eco Life",
  description:
    "Utforsk Pinoso, Monóvar, La Romana, Hondón, Aspe, Novelda, Monforte del Cid, Biar, Villena, Sax og Jumilla før du velger tomt eller bolig.",
  alternates: {
    canonical: "/omrader",
  },
};

export const dynamic = "force-dynamic";

export default async function AreasPage() {
  const profiles = await getAreaProfiles();
  const groupedProfiles = regions.map((region) => ({
    ...region,
    profiles: profiles.filter((profile) => areaMatchesRegion(profile, region.key)),
  }));
  const ungroupedProfiles = profiles.filter(
    (profile) => !regions.some((region) => areaMatchesRegion(profile, region.key)),
  );

  return (
    <main>
      <SiteHeader />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Områder</p>
          <h1>Finn riktig sted før du velger tomt og bolig</h1>
          <p className={styles.heroCopy}>
            Pinoso Eco Life starter med hverdagen: ro, natur, vinland, byservice, flyplass, fjell eller landsbyliv. Når
            området passer, begynner jakten på riktig tomt eller bolig.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/livet-i-innlandet">
              Utforsk Eco Life-områdene <ArrowRight size={17} />
            </Link>
            <Link className={styles.secondaryAction} href="/eiendommer">
              Se publiserte boliger
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.introGrid}>
          <div>
            <p className={styles.sectionEyebrow}>Eco Life-områdene</p>
            <h2 className={styles.sectionTitle}>{ecoLifeAreas.length} steder – ulike måter å leve i innlandet på</h2>
            <p className={styles.sectionCopy}>
              De redaksjonelle områdeguidene sammenligner ikke bare eiendommer. De forklarer hvordan hverdagen kan føles,
              hvem området passer for, hva slags plass du kan se etter og hvilke alternativer du bør sammenligne med.
            </p>
          </div>
          <aside className={styles.introAside}>
            <span className={styles.bigNumber}>{ecoLifeAreas.length}</span>
            <p>redaksjonelle steder i Eco Life-universet – før vi snevrer inn søket til konkret tomt eller bolig.</p>
            <Link className={styles.inlineLink} href="/livet-i-innlandet">
              Sammenlign stedene <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      </section>

      <section className={`${styles.section} ${styles.dataIntro}`}>
        <p className={styles.sectionEyebrow}>Boligdata fra RealtyFlow</p>
        <h2 className={styles.sectionTitle}>Tre datagrupper organiserer publiserte boliger – ikke hele merkevaren</h2>
        <p className={styles.sectionCopy}>
          Gruppene under brukes til å sortere områdeprofiler og boligdata publisert fra RealtyFlow. Biar, Villena, Sax,
          Jumilla og de øvrige Eco Life-guidene finner du i «Livet i innlandet» selv om de ikke ligger i en av disse tre
          tekniske datagruppene.
        </p>
      </section>

      <nav className={styles.groupGrid} aria-label="RealtyFlow-datagrupper">
        {regions.map((region) => (
          <a className={styles.groupCard} href={`#${region.key}`} key={region.key}>
            <div>
              <strong>{region.label}</strong>
              <p>{region.description}</p>
            </div>
            <span>Se publiserte profiler ↓</span>
          </a>
        ))}
      </nav>

      {groupedProfiles.map((group) => (
        <section className={`${styles.section} ${styles.groupSection}`} id={group.key} key={group.key}>
          <div className={styles.groupHeader}>
            <div>
              <p className={styles.sectionEyebrow}>RealtyFlow-gruppe</p>
              <h2 className={styles.sectionTitle}>{group.label}</h2>
              <p className={styles.sectionCopy}>{group.description}</p>
            </div>
            <div className={styles.groupActions}>
              <Link className={styles.pillLink} href={`/omrader/${group.key}`}>
                Se datagruppen
              </Link>
              <Link className={styles.pillLink} href={`/eiendommer?region=${group.key}`}>
                Se boliger
              </Link>
            </div>
          </div>

          <div className={styles.profileList}>
            {group.profiles.length > 0 ? (
              group.profiles.map((profile) => (
                <article
                  className={`${styles.profileCard} ${profile.photo_url ? "" : styles.profileCardNoPhoto}`}
                  key={profile.id || profile.slug || profile.name}
                >
                  {profile.photo_url && (
                    <div className={styles.profileImage} style={{ backgroundImage: `url(${profile.photo_url})` }} />
                  )}
                  <div className={styles.profileBody}>
                    <span className={styles.profileMeta}>{profile.region || profile.country || "Spania"}</span>
                    <h2>{profile.name}</h2>
                    {profile.hero_blurb && <strong>{profile.hero_blurb}</strong>}
                    {profile.description && <p>{profile.description}</p>}
                    {Array.isArray(profile.highlights) && profile.highlights.length > 0 && (
                      <ul>
                        {profile.highlights.slice(0, 5).map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                    <Link
                      className={styles.inlineLink}
                      href={`/eiendommer?region=${group.key}&area=${encodeURIComponent(profile.name)}`}
                    >
                      Se boliger i {profile.name} <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <article className={styles.emptyCard}>
                <MapPin size={24} />
                <div>
                  <h3>Ingen publiserte områdeprofiler ennå</h3>
                  <p>
                    Områdeguiden finnes fortsatt i Eco Life-universet selv om RealtyFlow ikke har publisert en egen
                    dataprofilsak her ennå.
                  </p>
                </div>
              </article>
            )}
          </div>
        </section>
      ))}

      {ungroupedProfiles.length > 0 && (
        <section className={`${styles.section} ${styles.groupSection}`}>
          <div className={styles.groupHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Flere publiserte profiler</p>
              <h2 className={styles.sectionTitle}>Ikke sortert i en RealtyFlow-gruppe ennå</h2>
            </div>
          </div>
          <div className={styles.profileList}>
            {ungroupedProfiles.map((profile) => (
              <article
                className={`${styles.profileCard} ${profile.photo_url ? "" : styles.profileCardNoPhoto}`}
                key={profile.id || profile.slug || profile.name}
              >
                {profile.photo_url && (
                  <div className={styles.profileImage} style={{ backgroundImage: `url(${profile.photo_url})` }} />
                )}
                <div className={styles.profileBody}>
                  <span className={styles.profileMeta}>{profile.region || profile.country || "Spania"}</span>
                  <h2>{profile.name}</h2>
                  {profile.hero_blurb && <strong>{profile.hero_blurb}</strong>}
                  {profile.description && <p>{profile.description}</p>}
                  <Link className={styles.inlineLink} href={`/eiendommer?area=${encodeURIComponent(profile.name)}`}>
                    Se boliger i {profile.name} <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.closing}>
          <p className={styles.sectionEyebrow}>Usikker på hvor du skal starte?</p>
          <h2>Velg livsstilen først – ikke datagruppen</h2>
          <p>
            Hvis du ikke allerede kjenner områdene, start med «Livet i innlandet». Derfra kan du sammenligne konkrete
            steder før bolig- og tomtesøket snevres inn.
          </p>
          <Link className={styles.primaryAction} href="/livet-i-innlandet">
            Finn din type innlandsliv <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
