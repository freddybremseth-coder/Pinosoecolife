import { Footer } from "@/components/Footer";
import { PlotsMap } from "@/components/PlotsMap";
import { SiteHeader } from "@/components/SiteHeader";
import { getLandPlots, type LandPlot } from "@/lib/realtyflow";

const CATASTRO_REF_PATTERN = /\b\d{5}[A-Z]\d{7}[A-Z0-9]{7}\b/i;

type PlotWithCatastro = LandPlot & {
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

export const metadata = {
  title: "Tomter i Pinoso-regionen",
  description: "Se tomter i Pinoso-regionen fra RealtyFlow med kart, Catastro-lag, pris, størrelse og filtrering.",
  alternates: {
    canonical: "/tomter",
  },
};

function formatEuro(value?: number) {
  if (!value) return "Pris på forespørsel";
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function normalize(value?: string | number) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeNumber(value?: string | number) {
  return String(value || "").replace(/[^0-9]/g, "").replace(/^0+/, "");
}

function plotRef(plot: PlotWithCatastro) {
  return plot.plot_number || plot.plotNumber || plot.id || "Tomt";
}

function cleanCatastroRef(value?: string | number) {
  const normalized = String(value || "").toUpperCase().replace(/[^0-9A-Z]/g, "");
  const directMatch = normalized.match(CATASTRO_REF_PATTERN);
  if (directMatch) return directMatch[0];

  const looseMatch = String(value || "").toUpperCase().match(CATASTRO_REF_PATTERN);
  return looseMatch?.[0] || "";
}

function extractCatastroRefFromPlot(plot: PlotWithCatastro) {
  return cleanCatastroRef(
    [plot.notes, plot.location, plot.municipality, plotRef(plot), plot.registry_number, plot.finca_registral]
      .filter(Boolean)
      .join(" "),
  );
}

function getCatastroRef(plot: PlotWithCatastro) {
  return (
    cleanCatastroRef(plot.cadastral_reference) ||
    cleanCatastroRef(plot.cadastralReference) ||
    cleanCatastroRef(plot.referencia_catastral) ||
    cleanCatastroRef(plot.referenciaCatastral) ||
    cleanCatastroRef(plot.catastro_ref) ||
    cleanCatastroRef(plot.catastroRef) ||
    extractCatastroRefFromPlot(plot)
  );
}

function getPolygonFromRef(ref: string) {
  const match = ref.match(/^\d{5}[A-Z](\d{3})/i);
  return normalizeNumber(match?.[1]);
}

function getParcelFromRef(ref: string) {
  const match = ref.match(/^\d{5}[A-Z]\d{3}(\d{5})/i);
  return normalizeNumber(match?.[1]);
}

function getPolygon(plot: PlotWithCatastro) {
  const direct = plot.poligono || plot.polígono || plot.polygon || "";
  return direct || getPolygonFromRef(getCatastroRef(plot));
}

function getParcel(plot: PlotWithCatastro) {
  const direct = plot.parcela || plot.parcel || "";
  return direct || getParcelFromRef(getCatastroRef(plot));
}

function matchesPolygonParcel(plot: PlotWithCatastro, polygon?: string, parcel?: string) {
  const selectedPolygon = normalizeNumber(polygon);
  const selectedParcel = normalizeNumber(parcel);
  if (!selectedPolygon && !selectedParcel) return true;

  const plotPolygon = normalizeNumber(getPolygon(plot));
  const plotParcel = normalizeNumber(getParcel(plot));
  const ref = getCatastroRef(plot);
  const haystack = plotText(plot);

  return (
    (!selectedPolygon || plotPolygon === selectedPolygon || haystack.includes(`poligono ${selectedPolygon}`) || ref.includes(selectedPolygon.padStart(3, "0"))) &&
    (!selectedParcel || plotParcel === selectedParcel || haystack.includes(`parcela ${selectedParcel}`) || ref.includes(selectedParcel.padStart(5, "0")))
  );
}

function getCatastroUrl(plot: PlotWithCatastro) {
  const params = new URLSearchParams();
  const ref = getCatastroRef(plot);

  if (ref) params.set("refcat", ref);
  if (!ref && plot.lat && plot.lng) {
    params.set("lat", String(plot.lat));
    params.set("lng", String(plot.lng));
  }

  return params.toString() ? `/api/catastro/redirect?${params.toString()}` : "https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx";
}

const pinosoPlotTerms = [
  "pinoso",
  "pinosos",
  "aspe",
  "monforte",
  "monforte del cid",
  "hondon",
  "hondón",
  "novelda",
  "la romana",
  "barbarroja",
  "barba-roja",
  "font del llop",
];

function plotText(plot: PlotWithCatastro) {
  return normalize(
    [
      plotRef(plot),
      plot.location,
      plot.municipality,
      plot.zoning,
      plot.notes,
      getCatastroRef(plot),
      getPolygon(plot),
      getParcel(plot),
      plot.registry_number,
      plot.finca_registral,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function isPinosoRegionPlot(plot: PlotWithCatastro) {
  const haystack = plotText(plot);
  return pinosoPlotTerms.some((term) => haystack.includes(normalize(term)));
}

export default async function PlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; minArea?: string; maxPrice?: string; zoning?: string; polygon?: string; parcel?: string }>;
}) {
  const params = await searchParams;
  const plots = (await getLandPlots()) as PlotWithCatastro[];
  const q = normalize(params.q);
  const minArea = Number(params.minArea || 0);
  const maxPrice = Number(params.maxPrice || 0);
  const zoning = normalize(params.zoning);
  const polygon = params.polygon || "";
  const parcel = params.parcel || "";

  const filtered = plots.filter((plot) => {
    const haystack = plotText(plot);
    return (
      (q || polygon || parcel || isPinosoRegionPlot(plot)) &&
      (!q || haystack.includes(q)) &&
      matchesPolygonParcel(plot, polygon, parcel) &&
      (!zoning || normalize(plot.zoning) === zoning) &&
      (!minArea || Number(plot.area || 0) >= minArea) &&
      (!maxPrice || Number(plot.price || 0) <= maxPrice)
    );
  }).sort((a, b) => Number(isPinosoRegionPlot(b)) - Number(isPinosoRegionPlot(a)));
  const mapped = filtered.filter((plot) => plot.lat && plot.lng);
  const withCatastro = filtered.filter((plot) => getCatastroRef(plot) || getPolygon(plot) || getParcel(plot));

  return (
    <main>
      <SiteHeader />
      <section className="page-hero compact-hero image-hero">
        <p className="eyebrow">Tomter · Catastro · kart</p>
        <h1>Tomter i Pinoso-regionen</h1>
        <p>
          Utforsk tomter med størrelse, pris, regulering og beliggenhet. Bruk omvendt Catastro-søk med polígono og parcela
          for å finne riktig tomt direkte i kartet.
        </p>
        <form className="search-card page-search plots-search catastro-search" action="/tomter">
          <input name="q" defaultValue={params.q || ""} placeholder="Søk sted, ref eller Catastro" />
          <input name="polygon" defaultValue={params.polygon || ""} placeholder="Polígono" inputMode="numeric" />
          <input name="parcel" defaultValue={params.parcel || ""} placeholder="Parcela" inputMode="numeric" />
          <select name="minArea" defaultValue={params.minArea || ""}>
            <option value="">Areal fra</option>
            <option value="800">800 m²</option>
            <option value="1000">1 000 m²</option>
            <option value="5000">5 000 m²</option>
            <option value="10000">10 000 m²</option>
          </select>
          <select name="maxPrice" defaultValue={params.maxPrice || ""}>
            <option value="">Pris til</option>
            <option value="30000">€30 000</option>
            <option value="50000">€50 000</option>
            <option value="75000">€75 000</option>
            <option value="100000">€100 000</option>
          </select>
          <select name="zoning" defaultValue={params.zoning || ""}>
            <option value="">Regulering</option>
            <option value="rustico">Rustico</option>
            <option value="urbano">Urbano</option>
            <option value="urbanizable">Urbanizable</option>
          </select>
          <button type="submit">Søk</button>
        </form>
      </section>

      <section className="catastro-summary" aria-label="Catastro-funksjoner">
        <article>
          <span className="catastro-summary-icon">◆</span>
          <strong>{withCatastro.length}</strong>
          <span>tomter med Catastro / polígono / parcela</span>
        </article>
        <article>
          <span className="catastro-summary-icon">⌖</span>
          <strong>{mapped.length}</strong>
          <span>tomter med kartposisjon</span>
        </article>
        <article>
          <span className="catastro-summary-icon">▣</span>
          <strong>WMS</strong>
          <span>Catastro-kartlag med parcelgrenser</span>
        </article>
      </section>

      <section className="plots-layout">
        <div className="plots-map">
          <PlotsMap plots={mapped} />
        </div>

        <div className="plots-list">
          <div className="list-heading">
            <h2>{filtered.length} tomter</h2>
            <span>{mapped.length} med kartposisjon</span>
          </div>
          {filtered.map((plot) => {
            const catastroRef = getCatastroRef(plot);
            const plotPolygon = getPolygon(plot);
            const plotParcel = getParcel(plot);

            return (
              <article className="plot-card" id={`plot-${plot.id || encodeURIComponent(plotRef(plot))}`} key={plot.id || plotRef(plot)}>
                <div>
                  <p>{plot.municipality || plot.location || "Spania"}</p>
                  <h2>{plotRef(plot)}</h2>
                  <strong>{formatEuro(plot.price)}</strong>
                </div>
                <dl>
                  <div><dt>Areal</dt><dd>{Number(plot.area || 0).toLocaleString("nb-NO")} m²</dd></div>
                  <div><dt>Regulering</dt><dd>{plot.zoning || "Ikke oppgitt"}</dd></div>
                  <div><dt>Vann</dt><dd>{plot.water ? "Ja" : "Ikke oppgitt"}</dd></div>
                  <div><dt>Strøm</dt><dd>{plot.electricity ? "Ja" : "Ikke oppgitt"}</dd></div>
                  {(plotPolygon || plotParcel) && <div><dt>Catastro</dt><dd>{plotPolygon ? `Pol. ${plotPolygon}` : "Pol. -"} / {plotParcel ? `Parc. ${plotParcel}` : "Parc. -"}</dd></div>}
                  {catastroRef && <div><dt>Ref. catastral</dt><dd>{catastroRef}</dd></div>}
                </dl>
                {plot.notes && <p className="plot-notes">{plot.notes}</p>}
                {(catastroRef || plot.lat || plot.lng) && (
                  <a className="catastro-link" href={getCatastroUrl(plot)} target="_blank" rel="noopener noreferrer">
                    {catastroRef ? "Åpne tomten i Catastro" : "Finn i Catastro fra kartposisjon"}
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </section>
      <Footer />
    </main>
  );
}
