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

export const metadata = {
  title: "Innlandsboliger og villaer | Pinoso Eco Life",
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

  // The catalogue must use the full approved Pinoso Eco Life inventory.
  // getProperties() defaults to a small homepage-sized slice, while a zero
  // limit returns every website-visible property that passes the inland/brand rules.
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
  const locationLabel = area || getRegionLabel(region);

  return (
    <main>
      <SiteHeader />
      <section className="page-hero compact-hero">
        <p className="eyebrow">Boligsøk</p>
        <h1>Innlandsboliger for livet du ønsker å skape</h1>
        <p>
          Utforsk et spisset RealtyFlow-utvalg for Pinoso-regionen, Vinalopó og andre Eco Life-områder i Alicante og Murcia.
          {locationLabel ? ` Viser ${locationLabel}.` : " Velg område eller søk fritt."}
        </p>
        <div className="quick-filters">
          <a className={!region && !area ? "active" : ""} href="/eiendommer">Alle</a>
          {ecoLifeAreas.map((item) => (
            <a
              className={area === item.name ? "active" : ""}
              href={`/eiendommer?area=${encodeURIComponent(item.name)}`}
              key={item.slug}
            >
              {item.name}
            </a>
          ))}
        </div>
        <form className="search-card page-search" action="/eiendommer">
          <input name="q" defaultValue={params.q || ""} placeholder="Søk område, referanse eller stil" />
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
          <button type="submit">Søk</button>
        </form>
      </section>
      <section className="section">
        <div className="list-heading">
          <h2>{filtered.length} boliger{area ? ` i ${area}` : ""}</h2>
          <span>Viser tilgjengelige treff fra RealtyFlow</span>
        </div>
        <div className="property-grid">
          {filtered.map((property, index) => (
            <PropertyCard key={property.id || property.ref || index} property={property} />
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
