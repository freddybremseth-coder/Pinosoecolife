import Link from "next/link";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { SiteHeader } from "@/components/SiteHeader";
import { ecoLifeAreas } from "@/lib/ecolife-areas";
import {
  getProperties,
  getPropertySearchText,
  getPropertyType,
  getRegionLabel,
  normalizeSearchText,
  propertyMatchesArea,
  propertyMatchesLifestyle,
  propertyMatchesRegion,
} from "@/lib/realtyflow";
import styles from "./properties.module.css";

export const metadata = {
  title: "Innlandsboliger og villaer",
  description:
    "Søk blant villaer, nybygg og landlige boliger i Pinoso, Vinalopó og utvalgte innlandsområder i Alicante og Murcia.",
  alternates: {
    canonical: "/eiendommer",
  },
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    region?: string;
    area?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    bathrooms?: string;
    lifestyle?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const q = normalizeSearchText(params.q || "");
  const type = (params.type || "").toLowerCase();
  const region = params.region || "";
  const area = params.area || "";
  const minPrice = Number(params.minPrice || 0);
  const maxPrice = Number(params.maxPrice || 0);
  const minBedrooms = Number(params.bedrooms || 0);
  const minBathrooms = Number(params.bathrooms || 0);
  const lifestyle = params.lifestyle || "";
  const sort = params.sort || "";
  const properties = await getProperties(0);

  const filtered = properties.filter((property) => {
    const haystack = getPropertySearchText(property);
    const matchesQuery = q ? haystack.includes(q) : true;
    const matchesType = type ? getPropertyType(property).toLowerCase().includes(type) : true;
    const matchesRegion = propertyMatchesRegion(property, region);
    const matchesArea = propertyMatchesArea(property, area);
    const matchesMinPrice = minPrice && property.price ? property.price >= minPrice : true;
    const matchesMaxPrice = maxPrice && property.price ? property.price <= maxPrice : true;
    const matchesBedrooms = minBedrooms && property.bedrooms ? property.bedrooms >= minBedrooms : true;
    const matchesBathrooms = minBathrooms && property.bathrooms ? property.bathrooms >= minBathrooms : true;
    const matchesLifestyle = propertyMatchesLifestyle(property, lifestyle);
    return (
      matchesQuery &&
      matchesType &&
      matchesRegion &&
      matchesArea &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesBedrooms &&
      matchesBathrooms &&
      matchesLifestyle
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price-asc") return Number(a.price || Number.MAX_SAFE_INTEGER) - Number(b.price || Number.MAX_SAFE_INTEGER);
    if (sort === "price-desc") return Number(b.price || 0) - Number(a.price || 0);
    if (sort === "area-desc") return Number(b.built_area || b.area || 0) - Number(a.built_area || a.area || 0);
    if (sort === "plot-desc") return Number(b.plot_size || 0) - Number(a.plot_size || 0);
    return 0;
  });

  const locationLabel = area || getRegionLabel(region);

  return (
    <main>
      <SiteHeader />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroGrid}>
            <div>
              <p className={styles.eyebrow}>Boliger · modeller · prosjekter</p>
              <h1 className={styles.title}>Finn boligen etter at du har valgt livet.</h1>
            </div>
            <p className={styles.lead}>
              Utforsk aktuelle villaer, nybygg, fincaer og landlige boliger i innlandet. Bruk område, pris og boligtype
              som filter. Mange nybygg er boligmodeller som kan vurderes sammen med en egnet tomt og de lokale rammene
              for hva som kan bygges.
              {locationLabel ? ` Du ser nå treff for ${locationLabel}.` : ""}
            </p>
          </div>
        </div>

        <nav className={styles.areaStrip} aria-label="Filtrer på område">
          <a className={`${styles.areaLink} ${!region && !area ? styles.areaLinkActive : ""}`} href="/eiendommer">Alle</a>
          {ecoLifeAreas.map((item) => (
            <a
              className={`${styles.areaLink} ${area === item.name ? styles.areaLinkActive : ""}`}
              href={`/eiendommer?area=${encodeURIComponent(item.name)}`}
              key={item.slug}
            >
              {item.name}
            </a>
          ))}
        </nav>
      </section>

      <div className={styles.filterShell}>
        <form className={styles.filters} action="/eiendommer">
          <input name="q" defaultValue={params.q || ""} placeholder="Søk modell, område eller referanse" />
          {region && <input type="hidden" name="region" value={region} />}
          {area && <input type="hidden" name="area" value={area} />}
          <select name="type" defaultValue={params.type || ""}>
            <option value="">Alle typer</option>
            <option>Villa</option>
            <option>Nybygg</option>
            <option>Finca</option>
            <option>Landsted</option>
            <option>Leilighet</option>
            <option>Rekkehus</option>
          </select>
          <select name="minPrice" defaultValue={params.minPrice || ""}>
            <option value="">Pris fra</option>
            <option value="200000">€200 000</option>
            <option value="300000">€300 000</option>
            <option value="400000">€400 000</option>
            <option value="500000">€500 000</option>
            <option value="750000">€750 000</option>
            <option value="1000000">€1 000 000</option>
          </select>
          <select name="maxPrice" defaultValue={params.maxPrice || ""}>
            <option value="">Pris til</option>
            <option value="300000">€300 000</option>
            <option value="400000">€400 000</option>
            <option value="500000">€500 000</option>
            <option value="750000">€750 000</option>
            <option value="1000000">€1 000 000</option>
            <option value="1500000">€1 500 000</option>
          </select>
          <select name="bedrooms" defaultValue={params.bedrooms || ""}>
            <option value="">Soverom</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
          <select name="bathrooms" defaultValue={params.bathrooms || ""}>
            <option value="">Bad</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
          <select name="lifestyle" defaultValue={params.lifestyle || ""}>
            <option value="">Egenskap</option>
            <option value="pool">Basseng</option>
            <option value="golf">Golf</option>
          </select>
          <select name="sort" defaultValue={params.sort || ""}>
            <option value="">Standard rekkefølge</option>
            <option value="price-asc">Pris: lavest først</option>
            <option value="price-desc">Pris: høyest først</option>
            <option value="area-desc">Størst bolig først</option>
            <option value="plot-desc">Størst tomt først</option>
          </select>
          <button type="submit">Vis treff</button>
        </form>
      </div>

      <section className={styles.catalogue}>
        <div className={styles.catalogueHeading}>
          <h2>{sorted.length} boliger{area ? ` i ${area}` : ""}</h2>
          <p>Pris og tilgjengelighet kan endre seg og bekreftes alltid på nytt før reservasjon eller kjøpsbeslutning.</p>
        </div>

        {sorted.length > 0 ? (
          <div className={styles.grid}>
            {sorted.map((property, index) => (
              <PropertyCard key={property.id || property.ref || index} property={property} priority={index < 6} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <h3>Ingen boliger traff disse filtrene.</h3>
            <p>Prøv et annet område, større prisintervall eller færre kriterier – eller fortell oss hva du leter etter, så kan vi lete mer konkret.</p>
            <div className={styles.emptyActions}>
              <Link className={styles.emptyPrimary} href="/eiendommer">Nullstill filtre</Link>
              <Link className={styles.emptySecondary} href="/#kontakt">Fortell oss hva du leter etter</Link>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
