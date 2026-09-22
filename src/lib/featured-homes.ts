import {
  getPropertyImages,
  getPropertyRef,
  normalizeSearchText,
  type Property,
} from "@/lib/realtyflow";

const apartmentTerms = /\b(apartment|apartments|apartamento|apartamentos|apartament|apartamenty|piso|pisos|flat|flats|penthouse|atico|studio|estudio|duplex)\b/;
const homeTerms = /\b(villa|villas|finca|fincas|chalet|chalets|casa de campo|country house|detached|independent house|enebolig|landsted|cortijo|farmhouse|bungalow)\b/;

/**
 * Homepage editorial selection only. RealtyFlow inventory and the general
 * property search remain unchanged; apartments are simply not featured here.
 * Never invent or repeat a listing or use a generic photo in place of a home.
 */
export function selectEcoLifeFeaturedHomes(properties: Property[], count = 12): Property[] {
  const eligible = properties.filter((property) => {
    const nameAndType = normalizeSearchText(
      [property.property_type, property.type, property.title_no, property.title, property.title_en]
        .filter(Boolean)
        .join(" "),
    );
    const plot = Number(property.plot_size || 0);
    const hasHomeEvidence = homeTerms.test(nameAndType) || plot >= 1000;
    const images = getPropertyImages(property);
    const ref = getPropertyRef(property);
    return (
      !!ref &&
      !property.id?.startsWith("fallback-") &&
      !apartmentTerms.test(nameAndType) &&
      hasHomeEvidence &&
      images.some((image) => typeof image === "string" && image.trim().length > 0)
    );
  });

  // Shuffle independently for each dynamically rendered homepage request.
  // Keep the no-duplicate-ref/photo policy below so the mix is still useful.
  for (let i = eligible.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
  }

  const selected: Property[] = [];
  const usedRefs = new Set<string>();
  const usedImages = new Set<string>();

  for (const property of eligible) {
    const ref = getPropertyRef(property).trim().toLowerCase();
    const image = getPropertyImages(property)[0]?.trim();
    if (!image) continue;
    const imageKey = image.split(/[?#]/, 1)[0].toLowerCase();
    if (usedRefs.has(ref) || usedImages.has(imageKey)) continue;
    selected.push(property);
    usedRefs.add(ref);
    usedImages.add(imageKey);
    if (selected.length >= count) break;
  }

  return selected;
}
