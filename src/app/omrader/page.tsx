import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { ecoLifeAreas } from "@/lib/ecolife-areas";
import { areaMatchesRegion, getAreaProfiles, regions } from "@/lib/realtyflow";
import styles from "./areas.module.css";

export const metadata = {
  title: "Innlandsområder",
  description:
    "Utforsk Pinoso, Monóvar, La Romana, Hondón, Aspe, Novelda, Monforte del Cid, Biar, Villena, Sax og Jumilla før du velger tomt eller bolig.",
  alternates: {
    canonical: "/omrader",
  },
};


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
              Se boliger
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
              Områdeguidene forklarer hvordan hverdagen kan føles, hvem stedet kan passe for, hva slags plass du kan se
              etter og hvilke nærliggende alternativer som er verdt å sammenligne.
            </p>
          </div>
          <aside className={styles.introAside}>
            <span className={styles.bigNumber}>{ecoLifeAreas.length}</span>
            <p>steder du kan sammenligne før søket snevres inn til en konkret tomt eller bolig.</p>
            <Link className={styles.inlineLink} href="/livet-i-innlandet">
              Sammenlign stedene <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      </section>

      <section className={`${styles.section} ${styles.dataIntro}`}>
        <p className={styles.sectionEyebrow}>Aktuelle boliger</p>
        <h2 className={styles.sectionTitle}>Se hvor vi har boliger akkurat nå</h2>
        <p className={styles.sectionCopy}>
          Utvalget endrer seg med tilgjengeligheten. Hvis du først vil finne området som passer livet du ønsker, kan du
          utforske alle Eco Life-guidene før du går videre til konkrete boliger og tomter.
        </p>
        <Link className={styles.inlineLink} href="/livet-i-innlandet">
          Utforsk alle områdene <ArrowRight size={16} />
        </Link>
      </section>

      <nav className={styles.groupGrid} aria-label="Aktuelle boligområder">
        {regions.map((region) => (
          <a className={styles.groupCard} href={`#${region.key}`} key={region.key}>
            <div>
              <strong>{region.label}</strong>
              <p>{region.description}</p>
            </div>
            <span>Utforsk området ↓</span>
          </a>
        ))}
      </nav>

      {groupedProfiles.map((group) => (
        <section className={`${styles.section} ${styles.groupSection}`} id={group.key} key={group.key}>
          <div className={styles.groupHeader}>
            <div>
              <p className={styles.sectionEyebrow}>Området og aktuelle boliger</p>
              <h2 className={styles.sectionTitle}>{group.label}</h2>
              <p className={styles.sectionCopy}>{group.description}</p>
            </div>
            <div className={styles.groupActions}>
              <Link className={styles.pillLink} href={`/omrader/${group.key}`}>
                Se området
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
                  <h3>Vil du utforske dette området nærmere?</h3>
                  <p>
                    Les om stedene og livsstilen i «Livet i innlandet», eller kontakt oss hvis du vil at vi skal lete
                    konkret etter bolig eller tomt her.
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
              <p className={styles.sectionEyebrow}>Flere områder</p>
              <h2 className={styles.sectionTitle}>Andre steder å se nærmere på</h2>
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
          <h2>Velg livsstilen først – deretter området</h2>
          <p>
            Hvis du ikke allerede kjenner innlandet, start med «Livet i innlandet». Der kan du sammenligne konkrete
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
