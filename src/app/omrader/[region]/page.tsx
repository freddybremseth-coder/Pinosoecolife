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
    title: "Pinoso og vinlandet rundt",
    intro:
      "Denne RealtyFlow-gruppen samler publiserte boliger og områdeprofiler rundt Pinoso og nærliggende innland. For selve livsstilsvalget bruker vi de mer detaljerte Eco Life-guidene.",
    proof: ["Store tomter og mer rom rundt boligen", "By og landsbyer som fungerer gjennom året", "Vinland, jordbruk og landlige omgivelser"],
  },
  "aspe-monforte": {
    title: "Aspe, Monforte del Cid og praktisk innland",
    intro:
      "Denne RealtyFlow-gruppen organiserer publiserte boliger rundt Aspe, Monforte del Cid og nærliggende steder med praktisk forbindelse mot Alicante og Elche.",
    proof: ["Praktisk forbindelse mot Alicante og Elche", "Byservice kombinert med mer åpne omgivelser", "Muligheter for både moderne bolig og landligere alternativer"],
  },
  "hondon-dalen": {
    title: "Hondón-dalen og landsbyene rundt",
    intro:
      "Denne RealtyFlow-gruppen samler publiserte boliger og områdeprofiler i Hondón-dalen og nærliggende landsbyer. Den detaljerte Eco Life-guiden forklarer hvordan hverdagen i Hondón de las Nieves faktisk kan se ut.",
    proof: ["Vinmarker, åser og landsbymiljø", "Villaer og fincaer med mer uteplass", "Et område kjent blant både lokale og internasjonale boligeiere"],
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
    description: copy?.intro || "Publiserte område- og boligdata for Pinoso Eco Life.",
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
        <p className="eyebrow">RealtyFlow-datagruppe</p>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
        <div className="portal-actions">
          <Link className="contact-button" href={`/eiendommer?region=${region}`}>
            Se {regionProperties.length} publiserte boliger <ArrowRight size={18} />
          </Link>
          <Link className="text-button light" href={`/tomter?q=${encodeURIComponent(selected.label)}`}>
            Se tomter
          </Link>
          <Link className="text-button light" href="/livet-i-innlandet">
            Sammenlign Eco Life-områder
          </Link>
        </div>
      </section>

      <section className="section region-landing-grid">
        <article>
          <p className="eyebrow">Hva gruppen dekker</p>
          <h2>Bruk boligdataene etter at du har vurdert hverdagen</h2>
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
          <span>publiserte boliger i datagruppen</span>
          <strong>{regionProfiles.length}</strong>
          <span>publiserte områdeprofiler fra RealtyFlow</span>
        </aside>
      </section>

      {guideLinks.length > 0 && (
        <section className="section proof-section">
          <div className="section-heading">
            <p className="eyebrow">Eco Life-guidene</p>
            <h2>Les om stedene som steder å leve – ikke bare som boligmarkeder</h2>
            <p>
              Datagruppen hjelper med sortering. De konkrete guidene forklarer forskjellen i hverdagsliv, tomt, natur og praktisk bruk.
            </p>
          </div>
          <div className="proof-grid">
            {guideLinks.map((guide) => (
              <article key={guide.slug}>
                <strong>Område</strong>
                <h3>{guide.name}</h3>
                <p>{guide.note}</p>
                <Link className="text-button" href={`/livet-i-innlandet/${guide.slug}`}>
                  Se livet i {guide.name} <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {regionProfiles.length > 0 && (
        <section className="section area-profile-grid region-area-section">
          <div className="section-heading">
            <p className="eyebrow">Publiserte områdeprofiler</p>
            <h2>Data og beskrivelser fra RealtyFlow</h2>
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
          <p className="eyebrow">Publiserte boliger</p>
          <h2>Boliger i {selected.label}</h2>
          <p>
            Bruk disse som konkrete alternativer etter at område, livsstil og behov er avklart. Tilgjengelighet og detaljer må alltid kontrolleres på nytt før en beslutning.
          </p>
        </div>
        {regionProperties.length > 0 ? (
          <div className="property-grid">
            {regionProperties.slice(0, 6).map((property, index) => (
              <PropertyCard key={property.id || property.ref || index} property={property} />
            ))}
          </div>
        ) : (
          <article className="info-card muted-card">
            <MapPin />
            <div>
              <h2>Ingen publiserte boliger i denne datagruppen akkurat nå</h2>
              <p>Området kan fortsatt være aktuelt. Start med Eco Life-guiden eller kontakt oss hvis du vil at vi skal lete konkret.</p>
            </div>
          </article>
        )}
        <div className="center-action">
          <Link className="text-button" href={`/eiendommer?region=${region}`}>
            Se alle publiserte boliger i {selected.label} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
