import { Footer } from "@/components/Footer";
import { PlotsMap } from "@/components/PlotsMap";
import { SiteHeader } from "@/components/SiteHeader";
import { getLandPlots, type LandPlot } from "@/lib/realtyflow";

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

function normalize(value?: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function plotRef(plot: PlotWithCatastro) {
  return plot.plot_number || plot.plotNumber || plot.id || "Tomt";
}

function getCatastroRef(plot: PlotWithCatastro) {
  return (
    plot.cadastral_reference ||
    plot.cadastralReference ||
    plot.referencia_catastral ||
    plot.referenciaCatastral ||
    plot.catastro_ref ||
    plot.catastroRef ||
    ""
  );
}

function getPolygon(plot: PlotWithCatastro) {
  return plot.poligono || plot.polígono || plot.polygon || "";
}

function getParcel(plot: PlotWithCatastro) {
  return plot.parcela || plot.parcel || "";
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
  searchParams: Promise<{ q?: string; minArea?: string; maxPrice?: string; zoning?: string }>;
}) {
  const params = await searchParams;
  const plots = (await getLandPlots()) as PlotWithCatastro[];
  const q = normalize(params.q);
  const minArea = Number(params.minArea || 0);
  const maxPrice = Number(params.maxPrice || 0);
  const zoning = normalize(params.zoning);

  const filtered = plots.filter((plot) => {
    const haystack = plotText(plot);
    return (
      (q || isPinosoRegionPlot(plot)) &&
      (!q || haystack.includes(q)) &&
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
          Utforsk tomter med størrelse, pris, regulering og beliggenhet. Kartet er utvidet med Catastro-lag slik at du kan se
          parcelgrenser sammen med dine egne tomtedata fra RealtyFlow.
        </p>
        <form className="search-card page-search plots-search" action="/tomter">
          <input name="q" defaultValue={params.q || ""} placeholder="Søk sted, ref, Catastro, polígono eller parcela" />
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
          <strong>{withCatastro.length}</strong>
          <span>tomter med Catastro/polígono/parcela</span>
        </article>
        <article>
          <strong>{mapped.length}</strong>
          <span>tomter med kartposisjon</span>
        </article>
        <article>
          <strong>WMS</strong>
          <span>offentlig Catastro-kartlag med parcelgrenser</span>
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
            const polygon = getPolygon(plot);
            const parcel = getParcel(plot);

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
                  {(polygon || parcel) && <div><dt>Catastro</dt><dd>{polygon ? `Pol. ${polygon}` : "Pol. -"} / {parcel ? `Parc. ${parcel}` : "Parc. -"}</dd></div>}
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
