import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { ecoLifeAreas } from "@/lib/ecolife-areas";
import { areaMatchesRegion, getAreaProfiles, regions } from "@/lib/realtyflow";

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
      <section className="page-hero compact-hero image-hero">
        <p className="eyebrow">Områder</p>
        <h1>Finn riktig sted før du velger tomt og bolig</h1>
        <p>
          Pinoso Eco Life starter med hverdagen: ro, natur, vinland, byservice, flyplass, fjell eller landsbyliv. Når
          området passer, begynner jakten på riktig tomt eller bolig.
        </p>
      </section>

      <section className="section proof-section">
        <div className="section-heading">
          <p className="eyebrow">Eco Life-områdene</p>
          <h2>{ecoLifeAreas.length} steder – ulike måter å leve i innlandet på</h2>
          <p>
            De redaksjonelle områdeguidene sammenligner ikke bare eiendommer. De forklarer hvordan hverdagen kan føles,
            hvem området passer for, hva slags plass du kan se etter og hvilke alternativer du bør sammenligne med.
          </p>
        </div>
        <div className="center-action">
          <Link className="text-button" href="/livet-i-innlandet">
            Utforsk alle Eco Life-områdene <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="section area-intro">
        <div className="section-heading">
          <p className="eyebrow">Boligdata fra RealtyFlow</p>
          <h2>Tre datagrupper gjør det enklere å sortere publiserte boliger</h2>
          <p>
            Gruppene under er ikke hele Eco Life-geografien. De brukes til å organisere områdeprofiler og boligdata som
            er publisert fra RealtyFlow. Biar, Villena, Sax, Jumilla og de øvrige Eco Life-guidene finner du i
            «Livet i innlandet» selv om de ikke ligger i en av disse tre datagruppene.
          </p>
        </div>
      </section>

      <section className="region-strip">
        {regions.map((region) => (
          <a href={`#${region.key}`} key={region.key}>
            <strong>{region.label}</strong>
            <span>{region.description}</span>
          </a>
        ))}
      </section>

      {groupedProfiles.map((group) => (
        <section className="section area-profile-grid region-area-section" id={group.key} key={group.key}>
          <div className="section-heading region-heading">
            <div>
              <p className="eyebrow">RealtyFlow-gruppe</p>
              <h2>{group.label}</h2>
              <p>{group.description}</p>
            </div>
            <div className="region-heading-actions">
              <a className="text-button" href={`/omrader/${group.key}`}>
                Se datagruppen
              </a>
              <a className="text-button" href={`/eiendommer?region=${group.key}`}>
                Se boliger i {group.label}
              </a>
            </div>
          </div>
          {group.profiles.length > 0 ? (
            group.profiles.map((profile) => (
              <article
                className={`area-profile-card${profile.photo_url ? "" : " no-photo"}`}
                key={profile.id || profile.slug || profile.name}
              >
                {profile.photo_url && <div style={{ backgroundImage: `url(${profile.photo_url})` }} />}
                <section>
                  <span>{profile.region || profile.country || "Spania"}</span>
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
                  <a
                    className="text-button area-property-link"
                    href={`/eiendommer?region=${group.key}&area=${encodeURIComponent(profile.name)}`}
                  >
                    Se boliger i {profile.name}
                  </a>
                </section>
              </article>
            ))
          ) : (
            <article className="info-card muted-card">
              <MapPin />
              <div>
                <h2>Ingen publiserte områdeprofiler ennå</h2>
                <p>Områdeguiden finnes fortsatt i Eco Life-universet selv om RealtyFlow ikke har publisert en egen dataprofilsak her ennå.</p>
              </div>
            </article>
          )}
        </section>
      ))}

      {ungroupedProfiles.length > 0 && (
        <section className="section area-profile-grid region-area-section">
          <div className="section-heading">
            <p className="eyebrow">Flere publiserte profiler</p>
            <h2>Ikke sortert i en RealtyFlow-gruppe ennå</h2>
          </div>
          {ungroupedProfiles.map((profile) => (
            <article
              className={`area-profile-card${profile.photo_url ? "" : " no-photo"}`}
              key={profile.id || profile.slug || profile.name}
            >
              {profile.photo_url && <div style={{ backgroundImage: `url(${profile.photo_url})` }} />}
              <section>
                <span>{profile.region || profile.country || "Spania"}</span>
                <h2>{profile.name}</h2>
                {profile.hero_blurb && <strong>{profile.hero_blurb}</strong>}
                {profile.description && <p>{profile.description}</p>}
                <a className="text-button area-property-link" href={`/eiendommer?area=${encodeURIComponent(profile.name)}`}>
                  Se boliger i {profile.name}
                </a>
              </section>
            </article>
          ))}
        </section>
      )}

      <section className="section proof-section">
        <div className="section-heading">
          <p className="eyebrow">Usikker på hvor du skal starte?</p>
          <h2>Velg livsstilen først – ikke datagruppen</h2>
          <p>
            Hvis du ikke allerede kjenner områdene, start med «Livet i innlandet». Derfra kan du sammenligne konkrete steder før bolig- og tomtesøket snevres inn.
          </p>
        </div>
        <div className="center-action">
          <Link className="text-button" href="/livet-i-innlandet">
            Finn din type innlandsliv <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
