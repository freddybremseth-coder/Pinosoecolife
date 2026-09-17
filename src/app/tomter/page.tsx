import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { CatastroSummary } from "@/components/CatastroSummary";
import { Footer } from "@/components/Footer";
import { PlotsMap } from "@/components/PlotsMap";
import { SiteHeader } from "@/components/SiteHeader";
import { getLandPlots, type LandPlot } from "@/lib/realtyflow";
import styles from "./plots.module.css";

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
  title: "Tomter i innlandet i Alicante og Murcia",
  description:
    "Utforsk tomter i Pinoso, Monóvar, La Romana, Hondón, Aspe, Novelda, Monforte del Cid, Biar, Villena, Sax og Jumilla med kart og Catastro-referanser som utgangspunkt for videre kontroll.",
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

function parseSourceArea(notes?: string) {
  if (!notes) return 0;
  const matches = Array.from(notes.matchAll(/(\d{1,3}(?:[.\s-]\d{3})+|\d{4,6})\s*m(?:²|2)/gi));
  const values = matches
    .map((match) => Number(String(match[1] || "").replace(/[.\s-]/g, "")))
    .filter((value) => Number.isFinite(value) && value > 0);
  return values.length ? Math.max(...values) : 0;
}

function getPlotArea(plot: PlotWithCatastro) {
  const importedArea = Number(plot.area || 0);
  const sourceArea = parseSourceArea(plot.notes);

  if (!sourceArea) return importedArea;
  if (!importedArea) return sourceArea;
  if (importedArea < 1000 && sourceArea >= 1000) return sourceArea;
  if (sourceArea >= importedArea * 5) return sourceArea;
  return importedArea;
}

function getPlotZoning(plot: PlotWithCatastro) {
  const sourceText = normalize([plotRef(plot), plot.location, plot.notes].filter(Boolean).join(" "));
  if (/\burbanizable\b/.test(sourceText)) return "urbanizable";
  if (/\burbano\b|\burbana\b/.test(sourceText)) return "urbano";
  if (/\brustico\b|\brustica\b/.test(sourceText)) return "rustico";
  return normalize(plot.zoning) || "";
}

function formatZoning(plot: PlotWithCatastro) {
  const zoning = getPlotZoning(plot);
  if (zoning === "rustico") return "Rústico";
  if (zoning === "urbano") return "Urbano";
  if (zoning === "urbanizable") return "Urbanizable";
  return plot.zoning || "Ikke oppgitt";
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

const ecoLifePlotTerms = [
  "pinoso",
  "pinosos",
  "el pinos",
  "monovar",
  "la romana",
  "hondon",
  "aspe",
  "novelda",
  "monforte",
  "monforte del cid",
  "biar",
  "villena",
  "sax",
  "jumilla",
  "altiplano",
  "barbarroja",
  "barba-roja",
  "font del llop",
  "alenda golf",
  "ubeda",
  "culebron",
  "lel",
  "encebras",
  "raspay",
  "casas pastor",
  "rodriguillo",
  "el prado",
  "herrada",
  "paredon",
  "canada del trigo",
];

const ecoLifeCadastralPrefixes = [
  "03105",
  "03089",
  "03114",
  "03077",
  "03078",
  "03019",
  "03093",
  "03088",
  "03043",
  "03140",
  "03123",
  "30022",
];

const outsideEcoLifeTerms = [
  "benissa",
  "calpe",
  "altea",
  "el campello",
  "campello",
  "busot",
  "crevillent",
  "elche",
  "matola",
  "balsares",
  "torrellano",
  "las bayas",
  "baya alta",
  "asprillas",
  "daimes",
];

const inactivePlotTerms = ["sold", "solgt", "reservado", "reserved", "reservert", "kjopt", "kjøpt"];

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

function isInactivePlot(plot: PlotWithCatastro) {
  const haystack = plotText(plot);
  return inactivePlotTerms.some((term) => haystack.includes(term));
}

function isEcoLifeAreaPlot(plot: PlotWithCatastro) {
  const haystack = plotText(plot);
  if (outsideEcoLifeTerms.some((term) => haystack.includes(normalize(term)))) return false;

  const termMatch = ecoLifePlotTerms.some((term) => haystack.includes(normalize(term)));
  const catastroRef = getCatastroRef(plot);
  const cadastralMatch = ecoLifeCadastralPrefixes.some((prefix) => catastroRef.startsWith(prefix));
  return termMatch || cadastralMatch;
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

  const publishedPlots = plots.filter((plot) => isEcoLifeAreaPlot(plot) && !isInactivePlot(plot));
  const filtered = publishedPlots.filter((plot) => {
    const haystack = plotText(plot);
    return (
      (!q || haystack.includes(q)) &&
      matchesPolygonParcel(plot, polygon, parcel) &&
      (!zoning || getPlotZoning(plot) === zoning) &&
      (!minArea || getPlotArea(plot) >= minArea) &&
      (!maxPrice || Number(plot.price || 0) <= maxPrice)
    );
  });
  const mapped = filtered.filter((plot) => plot.lat && plot.lng);
  const withCatastro = filtered.filter((plot) => getCatastroRef(plot) || getPolygon(plot) || getParcel(plot));

  return (
    <main>
      <SiteHeader />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroGrid}>
            <div>
              <p className={styles.eyebrow}>Område først · tomt nummer to</p>
              <h1 className={styles.title}>Finn tomten som kan bære livet du vil bygge.</h1>
            </div>
            <div>
              <p className={styles.lead}>
                Bruk kart, areal, pris og Catastro-data til første sortering. Deretter må hver tomt kontrolleres juridisk og teknisk før den behandles som et realistisk byggeprosjekt.
              </p>
              <div className={styles.heroLinks}>
                <Link className={styles.heroLink} href="/livet-i-innlandet">Finn riktig område først <ArrowRight size={17} /></Link>
                <Link className={styles.heroLink} href="/magasin/10000-m2-i-praksis-for-du-bygger">Hva må sjekkes før du bygger? <ArrowRight size={17} /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.filterShell}>
        <form className={styles.filters} action="/tomter">
          <input name="q" defaultValue={params.q || ""} placeholder="Søk område, ref eller Catastro" />
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
            <option value="rustico">Rústico</option>
            <option value="urbano">Urbano</option>
            <option value="urbanizable">Urbanizable</option>
          </select>
          <button type="submit">Vis tomter</button>
        </form>
      </div>

      <section className={styles.process}>
        <div className={styles.processIntro}>
          <div>
            <p className={styles.eyebrow}>Før boligmodellen</p>
            <h2 className={styles.processTitle}>En stor og vakker tomt er bare starten.</h2>
          </div>
          <p>
            Vi vil først vite at stedet passer hverdagen du ønsker. Deretter må tomten tåle kontroll før arkitektur, basseng og uteområder planlegges rundt den.
          </p>
        </div>
        <div className={styles.processGrid}>
          <article className={styles.processItem}>
            <span className={styles.processNumber}>01</span>
            <h3>Riktig område</h3>
            <p>Hverdagsliv, klima, natur, reisevei og lokale tjenester bør passe før en konkret tomt får styre valget.</p>
          </article>
          <article className={styles.processItem}>
            <span className={styles.processNumber}>02</span>
            <h3>Egnet tomt</h3>
            <p>Planstatus, byggbarhet, registrering, adkomst, vann, strøm, avløp og andre forhold må kontrolleres konkret.</p>
          </article>
          <article className={styles.processItem}>
            <span className={styles.processNumber}>03</span>
            <h3>Boligen tilpasses stedet</h3>
            <p>Når tomten fungerer, kan boligmodell, orientering og uteområder tilpasses de faktiske rammene og budsjettet.</p>
          </article>
        </div>
      </section>

      <div className={styles.summaryWrap}>
        <CatastroSummary withCatastro={withCatastro.length} mapped={mapped.length} total={filtered.length} />
      </div>

      <section className={styles.workspace}>
        <div className={styles.mapPanel}>
          <div className={styles.mapHeader}>
            <strong>Kart</strong>
            <span>{mapped.length} tomter med kartposisjon</span>
          </div>
          <PlotsMap plots={mapped} />
        </div>

        <div className={styles.list}>
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>{filtered.length} tomter</h2>
            <p className={styles.resultsMeta}>{withCatastro.length} med Catastro-data</p>
          </div>

          {filtered.length === 0 && (
            <article className={styles.empty}>
              <h2>Ingen tomter traff disse filtrene.</h2>
              <p>Prøv et annet område eller et bredere pris-/arealfilter. Du kan også kontakte oss hvis du vil at vi skal lete etter en bestemt type tomt.</p>
            </article>
          )}

          {filtered.map((plot) => {
            const catastroRef = getCatastroRef(plot);
            const plotPolygon = getPolygon(plot);
            const plotParcel = getParcel(plot);
            const plotArea = getPlotArea(plot);

            return (
              <article className={styles.card} id={`plot-${plot.id || encodeURIComponent(plotRef(plot))}`} key={plot.id || plotRef(plot)}>
                <div className={styles.cardTop}>
                  <div>
                    <p className={styles.cardLocation}>{plot.municipality || plot.location || "Innlandet"}</p>
                    <h2>{plotRef(plot)}</h2>
                  </div>
                  <strong className={styles.price}>{formatEuro(plot.price)}</strong>
                </div>

                <dl className={styles.facts}>
                  <div className={styles.fact}><dt>Areal</dt><dd>{plotArea ? `${plotArea.toLocaleString("nb-NO")} m²` : "Ikke oppgitt"}</dd></div>
                  <div className={styles.fact}><dt>Regulering</dt><dd>{formatZoning(plot)}</dd></div>
                  <div className={styles.fact}><dt>Vann</dt><dd>{plot.water ? "Ja" : "Ikke oppgitt"}</dd></div>
                  <div className={styles.fact}><dt>Strøm</dt><dd>{plot.electricity ? "Ja" : "Ikke oppgitt"}</dd></div>
                  {(plotPolygon || plotParcel) && <div className={styles.fact}><dt>Catastro</dt><dd>{plotPolygon ? `Pol. ${plotPolygon}` : "Pol. -"} / {plotParcel ? `Parc. ${plotParcel}` : "Parc. -"}</dd></div>}
                  {catastroRef && <div className={styles.fact}><dt>Ref. catastral</dt><dd>{catastroRef}</dd></div>}
                </dl>

                {plot.notes && <p className={styles.notes}>{plot.notes}</p>}
                {(catastroRef || plot.lat || plot.lng) && (
                  <a className={styles.catastroLink} href={getCatastroUrl(plot)} target="_blank" rel="noopener noreferrer">
                    {catastroRef ? "Åpne tomten i Catastro" : "Finn i Catastro fra kartposisjon"} <ExternalLink size={15} />
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.nextStep}>
        <div>
          <p className={styles.eyebrow}>Neste steg</p>
          <h2 className={styles.nextTitle}>Fant du en tomt som ser interessant ut?</h2>
          <p>Ikke start med å bestemme husmodell. Start med å kontrollere at tomten faktisk fungerer for prosjektet og hverdagen du ønsker.</p>
        </div>
        <div className={styles.nextLinks}>
          <Link href="/kjopsprosessen">Se hvordan vi kontrollerer veien videre <ArrowRight size={17} /></Link>
          <Link href="/#kontakt">Fortell oss hvilken tomt du vurderer <ArrowRight size={17} /></Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
