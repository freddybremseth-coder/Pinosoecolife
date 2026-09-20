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
  const included =
    typeof property.plot_included_in_price === "boolean"
      ? property.plot_included_in_price
      : typeof property.land_included_in_price === "boolean"
        ? property.land_included_in_price
        : null;
  const plotInPrice: PlotInPrice =
    included === true ? "included" : included === false ? "excluded" : "unknown";
  const rawPlotPrice = Number(property.plot_price_eur ?? property.land_price_eur);
  const plotPrice = Number.isFinite(rawPlotPrice) && rawPlotPrice > 0 ? rawPlotPrice : null;
  const rawPrice = Number(property.price);
  const price = Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : null;
  const rawArea = Number(getPropertyArea(property));
  const area = Number.isFinite(rawArea) && rawArea > 0 ? rawArea : null;

  const totalHouseAndPlot =
    price !== null && plotInPrice === "included"
      ? price
      : price !== null && plotInPrice === "excluded" && plotPrice !== null
        ? price + plotPrice
        : null;

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
  if (status === "excluded") return "Tomt kommer i tillegg";
  return "Tomt inkludert? Ikke bekreftet";
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
