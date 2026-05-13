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

const regionCopy: Record<RegionKey, { title: string; intro: string; proof: string[] }> = {
  pinoso: {
    title: "Tomter og villaer i Pinoso",
    intro:
      "Pinoso passer for deg som vil ha moderne villa, store tomter, rolig helårsliv, vingårder og god verdi for pengene i innlandet.",
    proof: ["Store tomter og privatliv", "Lokalt helårsliv og service", "Godt egnet for moderne villa med basseng"],
  },
  "aspe-monforte": {
    title: "Tomter og boliger rundt Aspe og Monforte del Cid",
    intro:
      "Aspe og Monforte del Cid gir en god balanse mellom inland-ro, kortere vei til Alicante, golf og praktiske servicetilbud.",
    proof: ["Kortere vei mot Alicante", "Golf og service i nærheten", "Gode tomtemuligheter i etablerte områder"],
  },
  "hondon-dalen": {
    title: "Tomter og villaer i Hondon-dalen",
    intro:
      "Hondon-dalen passer for kjøpere som vil ha landsbyliv, fjellutsikt, romslige tomter og et roligere tempo.",
    proof: ["Utsikt og landsbyfølelse", "Romslige tomter", "Ofte mye prosjekt for budsjettet"],
  },
};

export function generateStaticParams() {
  return regions.map((region) => ({ region: region.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: RegionKey }> }) {
  const { region } = await params;
  const copy = regionCopy[region];
  return {
    title: copy?.title || "Område",
    description: copy?.intro || "Finn tomter, nybygg og områder i Pinoso-regionen med Pinoso Eco Life.",
    alternates: {
      canonical: `/omrader/${region}`,
    },
  };
}

export default async function RegionPage({ params }: { params: Promise<{ region: RegionKey }> }) {
  const { region } = await params;
  const selected = regions.find((item) => item.key === region);
  const copy = regionCopy[region];

  if (!selected || !copy) {
    return (
      <main>
        <SiteHeader />
        <section className="page-hero compact-hero">
          <h1>Område ikke funnet</h1>
          <Link className="text-button light" href="/omrader">Til områder</Link>
        </section>
        <Footer />
      </main>
    );
  }

  const [profiles, properties] = await Promise.all([getAreaProfiles(), getProperties()]);
  const regionProfiles = profiles.filter((profile) => areaMatchesRegion(profile, region));
  const regionProperties = properties.filter((property) => propertyMatchesRegion(property, region));

  return (
    <main>
      <SiteHeader />
      <section className="page-hero compact-hero image-hero">
        <p className="eyebrow">Regionguide</p>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
        <div className="portal-actions">
          <Link className="contact-button" href={`/eiendommer?region=${region}`}>
            Se {regionProperties.length} boliger <ArrowRight size={18} />
          </Link>
          <Link className="text-button light" href={`/tomter?q=${encodeURIComponent(selected.label)}`}>
            Se tomter
          </Link>
          <Link className="text-button light" href="/kjopsprosessen">
            Slik kjøper du trygt
          </Link>
        </div>
      </section>

      <section className="section region-landing-grid">
        <article>
          <p className="eyebrow">Vurdering</p>
          <h2>Passer området for deg?</h2>
          <p>{selected.description}</p>
          <div className="region-proof-list">
            {copy.proof.map((item) => (
              <span key={item}>
                <ShieldCheck size={17} /> {item}
              </span>
            ))}
          </div>
        </article>
        <aside>
          <strong>{regionProperties.length}</strong>
          <span>publiserte boliger i regionen</span>
          <strong>{regionProfiles.length}</strong>
          <span>områdeprofiler fra RealtyFlow</span>
        </aside>
      </section>

      {regionProfiles.length > 0 && (
        <section className="section area-profile-grid region-area-section">
          <div className="section-heading">
            <p className="eyebrow">Steder</p>
            <h2>Områder i {selected.label}</h2>
          </div>
          {regionProfiles.slice(0, 6).map((profile) => (
            <article className={`area-profile-card${profile.photo_url ? "" : " no-photo"}`} key={profile.id || profile.name}>
              {profile.photo_url && <div style={{ backgroundImage: `url(${profile.photo_url})` }} />}
              <section>
                <span>{profile.region || selected.label}</span>
                <h2>{profile.name}</h2>
                {profile.hero_blurb && <strong>{profile.hero_blurb}</strong>}
                {profile.description && <p>{profile.description}</p>}
                <a className="text-button area-property-link" href={`/eiendommer?region=${region}&area=${encodeURIComponent(profile.name)}`}>
                  <MapPin size={17} /> Se boliger i {profile.name}
                </a>
              </section>
            </article>
          ))}
        </section>
      )}

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Aktuelle boliger</p>
          <h2>Utvalgte nybygg i {selected.label}</h2>
        </div>
        <div className="property-grid">
          {regionProperties.slice(0, 6).map((property, index) => (
            <PropertyCard key={property.id || property.ref || index} property={property} />
          ))}
        </div>
        <div className="center-action">
          <Link className="text-button" href={`/eiendommer?region=${region}`}>
            Se alle boliger i {selected.label} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
