import {
  getPropertyArea,
  getPropertyDescription,
  type Property,
} from "@/lib/realtyflow";

export type PlotInPrice = "included" | "excluded" | "unknown";

type PricingFacts = {
  plotInPrice: PlotInPrice;
  plotPrice: number | null;
  totalHouseAndPlot: number | null;
  pricePerBuiltSqm: number | null;
  totalPricePerBuiltSqm: number | null;
};

// These are strictly documented structured pricing fields. Plot size and
// marketing prose alone must never be treated as proof of inclusion.
export function getPricingFacts(property: Property): PricingFacts {
  // Only an explicit inclusion statement in the original RedSP listing can
  // override the buyer-safe default that land is priced separately.
  // A plot size, an illustrative plot price, or a generic marketing claim is
  // not proof that a specific plot is part of the advertised house price.
  const source = property.source_description ||
    (property.source?.toLowerCase() === "redsp" ? property.description || "" : "");
  const explicitlyIncluded = /(?:tomt(?:en)?|parcela|plot|land)\s*(?:.{0,55}?)\s*(?:inkludert i (?:bolig)?prisen|included in (?:the )?price|incluida? en (?:el )?precio)|(?:prisen|the price|el precio)\s+(?:inkluderer|includes|incluye)\s+(?:.{0,25}?)\s*(?:tomt|plot|parcela)/i.test(source);
  const explicitlyExcluded = /(?:tomt|parcela|plot|land).{0,45}(?:ikke inkludert|not included|no incluida?|kommer i tillegg|extra cost|separat pris)/i.test(source);
  const plotInPrice: PlotInPrice = explicitlyIncluded && !explicitlyExcluded ? "included" : "excluded";
  const rawPlotPrice = Number(property.plot_price_eur ?? property.land_price_eur);
  const plotPrice = Number.isFinite(rawPlotPrice) && rawPlotPrice > 0 ? rawPlotPrice : null;
  const rawPrice = Number(property.price);
  const price = Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : null;
  const rawArea = Number(getPropertyArea(property));
  const area = Number.isFinite(rawArea) && rawArea > 0 ? rawArea : null;

  // An illustrative plot price might already be reflected in the developer's
  // model price. Never add it to that price without a sourced breakdown.
  const totalHouseAndPlot = price !== null && plotInPrice === "included" ? price : null;

  return {
    plotInPrice,
    plotPrice,
    totalHouseAndPlot,
    pricePerBuiltSqm: price !== null && area !== null ? price / area : null,
    totalPricePerBuiltSqm:
      totalHouseAndPlot !== null && area !== null ? totalHouseAndPlot / area : null,
  };
}

export function getPlotInPriceLabel(property: Property): string {
  const status = getPricingFacts(property).plotInPrice;
  if (status === "included") return "Tomt inkludert i oppgitt pris";
  if (status === "excluded") return "Tomt beregnes separat – ikke dokumentert inkludert i boligprisen";
  return "Tomt beregnes separat til inkludering er uttrykkelig bekreftet i RedSP-beskrivelsen";
}

export function formatSquareMetres(value?: number | null): string {
  const parsed = Number(value);
  return value != null && Number.isFinite(parsed) && parsed > 0
    ? `${new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 }).format(parsed)} m²`
    : "Ikke oppgitt";
}

export function formatEuroPerSqm(value: number | null): string {
  return value !== null && Number.isFinite(value)
    ? `${new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 }).format(value)} €/m²`
    : "Ikke oppgitt";
}

export function getPropertyPreview(property: Property, maxLength = 220): string {
  const text = getPropertyDescription(property).replace(/\s+/g, " ").trim();
  if (!text) return "Be om komplett prospekt med informasjon om bolig, tomt, utstyr og hva som er inkludert i prisen.";
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > maxLength / 2 ? lastSpace : maxLength).trimEnd()}…`;
}

export function compareUrl(refs: string[]): string {
  const query = new URLSearchParams();
  refs.forEach((ref) => query.append("ref", ref));
  return `/sammenlign?${query.toString()}`;
}
