import { MapPin } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { areas } from "@/lib/content";
import { areaMatchesRegion, getAreaProfiles, regions } from "@/lib/realtyflow";

export const metadata = {
  title: "Områder",
  description:
    "Utforsk Altea, Albir, Calpe, Finestrat, Torrevieja, Orihuela Costa, Los Alcazares og andre områder før du velger bolig i Spania.",
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
        <h1>Finn riktig sted før du velger bolig</h1>
        <p>For mange kjøpere er beliggenhet, hverdagsliv og avstand til tjenester viktigere enn selve boligen.</p>
      </section>
      <section className="region-strip">
        {regions.map((region) => (
          <a href={`#${region.key}`} key={region.key}>
            <strong>{region.label}</strong>
            <span>{region.description}</span>
          </a>
        ))}
      </section>
      <section className="section area-intro">
        <div className="section-heading">
          <p className="eyebrow">Fra RealtyFlow</p>
          <h2>Områder valgt for nettsiden</h2>
          <p>Disse områdeprofilene er hentet fra RealtyFlow og vises når de er markert for nettsiden.</p>
        </div>
      </section>
      {groupedProfiles.map((group) => (
        <section className="section area-profile-grid region-area-section" id={group.key} key={group.key}>
          <div className="section-heading region-heading">
            <div>
              <p className="eyebrow">Områder</p>
              <h2>{group.label}</h2>
              <p>{group.description}</p>
            </div>
            <div className="region-heading-actions">
              <a className="text-button" href={`/omrader/${group.key}`}>
                Les regionguide
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
                <h2>Ingen publiserte områder ennå</h2>
                <p>Når et område i RealtyFlow er huket av for nettsiden, dukker det opp her automatisk.</p>
              </div>
            </article>
          )}
        </section>
      ))}
      {ungroupedProfiles.length > 0 && (
        <section className="section area-profile-grid region-area-section">
          <div className="section-heading">
            <p className="eyebrow">Flere områder</p>
            <h2>Ikke sortert i region ennå</h2>
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
      <section className="section card-list">
        {areas.map((area) => (
          <article className="info-card" key={area.name}>
            <MapPin />
            <div>
              <h2>{area.name}</h2>
              <strong>{area.places}</strong>
              <p>{area.text}</p>
            </div>
          </article>
        ))}
      </section>
      <Footer />
    </main>
  );
}
