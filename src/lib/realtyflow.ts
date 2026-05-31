export type Property = {
  id?: string;
  ref?: string;
  external_id?: string;
  title?: string;
  title_no?: string;
  title_en?: string;
  description?: string;
  description_no?: string;
  description_en?: string;
  marketing_description?: string;
  location?: string;
  town?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  built_area?: number;
  area?: number;
  plot_size?: number;
  terrace_size?: number;
  primary_image?: string;
  image_path?: string;
  gallery?: string[];
  images_json?: string | string[];
  property_type?: string;
  type?: string;
  pool?: boolean;
  energy_rating?: string;
  status?: string;
  region?: string;
  show_on_website?: boolean | null;
  website_visible?: boolean | null;
};

export type RegionKey = "pinoso" | "aspe-monforte" | "hondon-dalen";

export type AreaProfile = {
  id?: string;
  brand_id?: string;
  name: string;
  slug?: string;
  country?: string | null;
  region?: string | null;
  hero_blurb?: string | null;
  description?: string | null;
  highlights?: string[] | null;
  climate?: string | null;
  lifestyle?: string | null;
  photo_url?: string | null;
  show_on_website?: boolean | null;
  website_visible?: boolean | null;
  is_public?: boolean | null;
  published?: boolean | null;
};

export type LandPlot = {
  id?: string;
  plot_number?: string;
  plotNumber?: string;
  area?: number;
  price?: number;
  location?: string;
  municipality?: string;
  zoning?: string;
  water?: boolean;
  electricity?: boolean;
  slope?: string;
  road_access?: boolean;
  roadAccess?: boolean;
  notes?: string;
  lat?: number;
  lng?: number;
  source?: string;
  cadastral_reference?: string;
  cadastralReference?: string;
  referencia_catastral?: string;
  referenciaCatastral?: string;
  catastro_ref?: string;
  catastroRef?: string;
  polygon?: string | number;
  poligono?: string | number;
  polígono?: string | number;
  parcel?: string | number;
  parcela?: string | number;
  registry_number?: string;
  finca_registral?: string;
};

export type LeadPayload = {
  name: string;
  email: string;
  phone?: string;
  preferred_area?: string;
  budget?: string;
  property_type?: string;
  bedrooms?: string;
  timeline?: string;
  purchase_goal?: string;
  financing_status?: string;
  spain_experience?: string;
  next_step?: string;
  message?: string;
  source?: string;
  property_ref?: string;
  property_title?: string;
  request_type?: string;
  page_url?: string;
};

const REALTYFLOW_BASE = process.env.REALTYFLOW_BASE_URL || "https://realtyflow.chatgenius.pro";
const REALTYFLOW_BRAND_ID = "pinosoecolife";

const inlandLocationTerms = [
  "pinoso",
  "pinos",
  "el pinos",
  "aspe",
  "monforte",
  "monforte del cid",
  "novelda",
  "la romana",
  "hondon",
  "hondón",
  "hondon de las nieves",
  "hondón de las nieves",
  "hondon de los frailes",
  "hondón de los frailes",
  "monovar",
  "monóvar",
  "sax",
  "elda",
  "petrer",
  "villena",
  "font del llop",
  "barbarroja",
  "barba-roja",
  "costa blanca inland",
  "costa blanca south inland",
  "costa blanca north inland",
  "alicante inland",
];

const coastalExclusionTerms = [
  "torrevieja",
  "orihuela costa",
  "campoamor",
  "la zenia",
  "guardamar",
  "santa pola",
  "benidorm",
  "calpe",
  "altea",
  "javea",
  "xabia",
  "denia",
  "moraira",
  "villajoyosa",
  "playa",
  "beach",
  "seafront",
  "sea front",
];

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export const regions: Array<{ key: RegionKey; label: string; description: string; aliases: string[]; locations: string[] }> = [
  {
    key: "pinoso",
    label: "Pinoso",
    description: "Vingårder, fjell, store tomter og rolig helårsliv rundt Pinoso.",
    aliases: ["pinoso", "el pinos", "el pinós", "pinoso inland"],
    locations: ["pinoso", "el pinos", "el pinós", "ulea", "canyada del trigo", "lel", "la zarza", "torre del rico"],
  },
  {
    key: "aspe-monforte",
    label: "Aspe og Monforte del Cid",
    description: "Kortere vei mot Alicante, golf, service og gode tomtemuligheter.",
    aliases: ["aspe", "monforte", "monforte del cid", "monforte del cid inland", "novelda"],
    locations: [
      "alicante",
      "aspe",
      "monforte",
      "monforte del cid",
      "novelda",
      "petrer",
      "font del llop",
      "agost",
      "la romana",
    ],
  },
  {
    key: "hondon-dalen",
    label: "Hondon-dalen",
    description: "Hondon de las Nieves, Hondon de los Frailes og nærliggende landsbyer med plass og utsikt.",
    aliases: ["hondon", "hondon de las nieves", "hondon de los frailes", "fondó", "el fondo"],
    locations: [
      "hondon",
      "hondón",
      "hondon de las nieves",
      "hondón de las nieves",
      "hondon de los frailes",
      "hondón de los frailes",
      "la canalosa",
      "barbarroja",
      "albatera",
    ],
  },
];

export function getPropertyTitle(property: Property) {
  return property.title_no || property.title || property.title_en || "Nybygg i Spania";
}

export function getPropertyDescription(property: Property) {
  const descriptions = [property.marketing_description, property.description_no, property.description, property.description_en]
    .map((value) => cleanPropertyText(value || ""))
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  return descriptions[0] || "";
}

export function cleanPropertyText(value: string) {
  return value
    .replace(/&#13;|&#x0d;|&#xD;/gi, "\n")
    .replace(/&#10;|&#x0a;|&#xA;/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function getPropertyRef(property: Property) {
  return property.ref || property.external_id || property.id || "";
}

export function getPropertyType(property: Property) {
  return property.property_type || property.type || "Nybygg";
}

export function getPropertyArea(property: Property) {
  return property.built_area || property.area || 0;
}

export function getPropertyImages(property: Property) {
  const images = new Set<string>();
  if (property.primary_image) images.add(property.primary_image);
  if (property.image_path) images.add(property.image_path);

  if (Array.isArray(property.gallery)) {
    property.gallery.filter(Boolean).forEach((image) => images.add(image));
  }

  if (Array.isArray(property.images_json)) {
    property.images_json.filter(Boolean).forEach((image) => images.add(image));
  }

  if (typeof property.images_json === "string") {
    try {
      const parsed = JSON.parse(property.images_json);
      if (Array.isArray(parsed)) parsed.filter(Boolean).forEach((image) => images.add(String(image)));
    } catch {
      if (property.images_json.startsWith("http")) images.add(property.images_json);
    }
  }

  return Array.from(images);
}

export function getPrimaryImage(property: Property, fallback = fallbackImages[0]) {
  return getPropertyImages(property)[0] || fallback;
}

export function formatPrice(price?: number) {
  if (!price) return "Pris på forespørsel";
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getRegionLabel(region?: string) {
  return regions.find((item) => item.key === region)?.label || "";
}

export function getPropertySearchText(property: Property) {
  return normalizeSearchText(
    [
      property.region,
      property.location,
      property.town,
      property.title,
      property.title_no,
      property.title_en,
      property.description,
      property.description_no,
      property.description_en,
      property.ref,
      property.external_id,
      property.property_type,
      property.type,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function propertyMatchesInlandFocus(property: Property) {
  const haystack = getPropertySearchText(property);
  const explicitInland = haystack.includes("inland") || haystack.includes("interior");
  const inlandMatch = inlandLocationTerms.some((term) => haystack.includes(normalizeSearchText(term)));
  const coastalMatch = coastalExclusionTerms.some((term) => haystack.includes(normalizeSearchText(term)));
  return inlandMatch && (!coastalMatch || explicitInland);
}

export function propertyMatchesRegion(property: Property, region?: string) {
  if (!region) return true;
  const selected = regions.find((item) => item.key === region);
  if (!selected) return true;
  const explicitRegionText = normalizeSearchText([property.region, property.location].filter(Boolean).join(" "));
  if (explicitRegionText) {
    const regionAliases = regions.flatMap((item) =>
      item.aliases.map((alias) => ({ region: item.key, alias: normalizeSearchText(alias) })),
    );
    const explicitMatch = regionAliases.find(({ alias }) => explicitRegionText.includes(alias));
    if (explicitMatch) return explicitMatch.region === selected.key;
  }
  const normalizedHaystack = getPropertySearchText(property);
  const regionTerms = [...selected.aliases, ...selected.locations];
  return regionTerms.some((term) => normalizedHaystack.includes(normalizeSearchText(term)));
}

export function propertyMatchesArea(property: Property, area?: string) {
  if (!area) return true;
  const areaTerm = normalizeSearchText(area);
  const normalizedHaystack = getPropertySearchText(property);
  return normalizedHaystack.includes(areaTerm);
}

export function propertyMatchesLifestyle(property: Property, lifestyle?: string) {
  if (!lifestyle) return true;
  const haystack = getPropertySearchText(property);
  const terms: Record<string, string[]> = {
    pool: ["pool", "basseng", "private pool", "privat basseng"],
    sea: ["sea", "sjo", "sjø", "beach", "strand", "hav", "seafront", "sea view", "havutsikt"],
    golf: ["golf", "golf resort", "golfbane", "la marquesa", "altaona", "roda"],
  };

  if (lifestyle === "pool" && property.pool) return true;
  return (terms[lifestyle] || []).some((term) => haystack.includes(normalizeSearchText(term)));
}

export function areaMatchesRegion(profile: AreaProfile, region?: string) {
  if (!region) return true;
  const selected = regions.find((item) => item.key === region);
  if (!selected) return true;
  const haystack = [profile.region, profile.name, profile.slug]
    .filter(Boolean)
    .join(" ")
    .toString();
  const normalizedHaystack = normalizeSearchText(haystack);

  if (region === "pinoso" && /pinos|pinós/.test(normalizedHaystack)) return true;
  if (region === "aspe-monforte" && /(aspe|monforte|novelda|petrer|font del llop)/.test(normalizedHaystack)) return true;
  if (region === "hondon-dalen" && /(hondon|hondón|fondo|frailes|nieves)/.test(normalizedHaystack)) return true;

  return [...selected.aliases, ...selected.locations].some((location) =>
    normalizedHaystack.includes(normalizeSearchText(location)),
  );
}

export async function getProperties(limit = 12): Promise<Property[]> {
  try {
    const url = new URL("/api/properties", REALTYFLOW_BASE);
    url.searchParams.set("brandId", REALTYFLOW_BRAND_ID);

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return fallbackProperties.slice(0, limit);
    const data = await res.json();
    const items = (Array.isArray(data) ? data : [])
      .filter((property: Property) => {
        if (typeof property.show_on_website === "boolean") return property.show_on_website;
        if (typeof property.website_visible === "boolean") return property.website_visible;
        return true;
      })
      .filter(propertyMatchesInlandFocus);
    return (limit ? items.slice(0, limit) : items) as Property[];
  } catch {
    return fallbackProperties.slice(0, limit);
  }
}

export async function getAreaProfiles(): Promise<AreaProfile[]> {
  try {
    const res = await fetch(`${REALTYFLOW_BASE}/api/area-profiles?brandId=pinosoecolife&public=1`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const profiles = Array.isArray(data.profiles) ? (data.profiles as AreaProfile[]) : [];
    return profiles.filter((profile) => {
      const visibilityFields = [
        profile.show_on_website,
        profile.website_visible,
        profile.is_public,
        profile.published,
      ].filter((value) => typeof value === "boolean");
      return visibilityFields.length ? visibilityFields.some(Boolean) : true;
    });
  } catch {
    return [];
  }
}

export async function getLandPlots(): Promise<LandPlot[]> {
  try {
    const url = new URL("/api/plots", REALTYFLOW_BASE);
    url.searchParams.set("brandId", REALTYFLOW_BRAND_ID);

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.plots) ? (data.plots as LandPlot[]) : [];
  } catch {
    return [];
  }
}

export async function getProperty(id: string): Promise<Property | null> {
  const properties = await getProperties();
  return (
    properties.find((property) => {
      const ref = getPropertyRef(property);
      return property.id === id || ref === id;
    }) || null
  );
}

export async function sendLead(payload: LeadPayload) {
  const pipelineValue = payload.budget ? Number(String(payload.budget).replace(/[^0-9]/g, "")) || 0 : 0;
  const propertyInterest = [payload.property_ref, payload.property_title].filter(Boolean).join(" - ");
  const notes = [
    payload.request_type ? `Forespørsel: ${payload.request_type}` : "",
    payload.property_ref ? `Boligref: ${payload.property_ref}` : "",
    payload.property_title ? `Bolig: ${payload.property_title}` : "",
    payload.message,
    payload.preferred_area ? `Område: ${payload.preferred_area}` : "",
    payload.budget ? `Budsjett: ${payload.budget}` : "",
    payload.property_type ? `Boligtype: ${payload.property_type}` : "",
    payload.bedrooms ? `Soverom: ${payload.bedrooms}` : "",
    payload.timeline ? `Tidslinje: ${payload.timeline}` : "",
    payload.purchase_goal ? `Bruk/mål: ${payload.purchase_goal}` : "",
    payload.financing_status ? `Finansiering: ${payload.financing_status}` : "",
    payload.spain_experience ? `Spania-erfaring: ${payload.spain_experience}` : "",
    payload.next_step ? `Ønsket neste steg: ${payload.next_step}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const sourceKey = process.env.PINOSO_API_KEY || process.env.PINOSOECOLIFE_API_KEY;
  if (sourceKey) {
    headers["x-realtyflow-source-key"] = sourceKey;
  }

  const res = await fetch(`${REALTYFLOW_BASE}/api/public/leads`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      page_url: payload.page_url || null,
      source: payload.source || "pinosoecolife-next",
      notes,
      pipeline_status: "NEW",
      pipeline_value: pipelineValue,
      property_interest: propertyInterest || payload.preferred_area || "",
      brand: "pinosoecolife",
      brand_id: "pinosoecolife",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    throw new Error("Kunne ikke sende lead til RealtyFlow");
  }

  return res.json();
}

export const fallbackImages = [
  "/assets/hero-pinoso-dream.jpg",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=82",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=82",
];

export const fallbackProperties: Property[] = [
  {
    id: "fallback-pinoso",
    ref: "PEL-PIN-001",
    title_no: "Moderne villa på stor tomt",
    location: "Pinoso",
    price: 545000,
    bedrooms: 3,
    bathrooms: 3,
    built_area: 156,
    property_type: "Villa",
    primary_image: fallbackImages[0],
    description_no:
      "Et stilrent nybygg med privat uteområde, moderne planløsning og romslig tomt i Pinoso-området.",
  },
  {
    id: "fallback-aspe",
    ref: "PEL-ASP-002",
    title_no: "Villa nær golf og Alicante",
    location: "Aspe",
    price: 349000,
    bedrooms: 2,
    bathrooms: 2,
    built_area: 98,
    property_type: "Villa",
    primary_image: fallbackImages[1],
    description_no:
      "Moderne villaalternativ for deg som vil bo roligere, men ha kort vei til Alicante, golf og service.",
  },
  {
    id: "fallback-hondon",
    ref: "PEL-HON-003",
    title_no: "Energieffektiv villa med utsikt",
    location: "Hondon-dalen",
    price: 289000,
    bedrooms: 3,
    bathrooms: 2,
    built_area: 112,
    property_type: "Villa",
    primary_image: fallbackImages[2],
    description_no:
      "Et innbydende nybygg for deg som vil ha roligere omgivelser, fjellutsikt og mye plass rundt boligen.",
  },
];
