import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { CompareRemoveLink } from "@/components/CompareProperties";
import { SiteHeader } from "@/components/SiteHeader";
import {
  formatPrice,
  getPrimaryImage,
  getProperties,
  getPropertyArea,
  getPropertyRef,
  getPropertyTitle,
  getPropertyType,
  type Property,
} from "@/lib/realtyflow";
import {
  compareUrl,
  formatEuroPerSqm,
  formatSquareMetres,
  getPricingFacts,
  getPropertyPreview,
} from "@/lib/property-comparison";
import styles from "./comparison.module.css";

export const metadata: Metadata = {
  title: "Sammenlign boliger, tomt og pris",
  description: "Sammenlign boliger side om side og undersøk hva som er inkludert i oppgitt pris.",
  robots: { index: false, follow: true },
};

const numberOrUnknown = (value?: number) =>
  value != null && Number.isFinite(Number(value))
    ? new Intl.NumberFormat("nb-NO").format(Number(value))
    : "Ikke oppgitt";
const boolOrUnknown = (value?: boolean) =>
  typeof value === "boolean" ? (value ? "Ja" : "Nei") : "Ikke oppgitt";

type Row = {
  label: string;
  show: (property: Property) => ReactNode;
};

const comparisonRows: Row[] = [
  { label: "Referanse", show: (p) => getPropertyRef(p) },
  { label: "Boligtype", show: (p) => getPropertyType(p) },
  { label: "Område", show: (p) => p.location || p.town || "Ikke oppgitt" },
  { label: "Oppgitt pris", show: (p) => formatPrice(p.price) },
  {
    label: "Tomt inkludert i oppgitt pris?",
    show: (p) => {
      const status = getPricingFacts(p).plotInPrice;
      return status === "included" ? "Ja, dokumentert" : status === "excluded" ? "Nei, kommer i tillegg" : "Ikke bekreftet";
    },
  },
  { label: "Tomtepris ved separat kjøp", show: (p) => {
    const info = getPricingFacts(p);
    return info.plotInPrice === "excluded" && info.plotPrice !== null
      ? formatPrice(info.plotPrice)
      : info.plotInPrice === "included" ? "Inkludert" : "Ikke oppgitt";
  }},
  { label: "Bolig + tomt, før kjøpsomkostninger", show: (p) => {
    const info = getPricingFacts(p);
    return info.totalHouseAndPlot !== null ? formatPrice(info.totalHouseAndPlot) : "Kan ikke beregnes uten bekreftet tomtepris og inkludering";
  }},
  { label: "Soverom", show: (p) => numberOrUnknown(p.bedrooms) },
  { label: "Bad", show: (p) => numberOrUnknown(p.bathrooms) },
  { label: "Boligareal", show: (p) => formatSquareMetres(getPropertyArea(p)) },
  { label: "Tomtestørrelse", show: (p) => formatSquareMetres(p.plot_size) },
  { label: "Terrasse", show: (p) => formatSquareMetres(p.terrace_size) },
  { label: "Basseng", show: (p) => boolOrUnknown(p.pool) },
  { label: "Garasje", show: (p) => boolOrUnknown(p.garage) },
  {
    label: "Oppgitt pris per m² bolig",
    show: (p) => formatEuroPerSqm(getPricingFacts(p).pricePerBuiltSqm),
  },
  {
    label: "Bolig + tomt per m² bolig",
    show: (p) => formatEuroPerSqm(getPricingFacts(p).totalPricePerBuiltSqm),
  },
  { label: "Om boligen", show: (p) => getPropertyPreview(p, 300) },
];

export default async function ComparePropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string | string[] }>;
}) {
  const params = await searchParams;
  const requested = (Array.isArray(params.ref) ? params.ref : params.ref ? [params.ref] : [])
    .filter((value) => typeof value === "string" && value.length > 0 && value.length <= 120);
  const refs = [...new Set(requested)].slice(0, 4);
  const all = refs.length ? await getProperties(0) : [];
  const selected = refs.flatMap((ref) => {
    const property = all.find((item) => getPropertyRef(item) === ref && !item.id?.startsWith("fallback-"));
    return property ? [property] : [];
  });
  const foundRefs = selected.map(getPropertyRef);

  return (
    <main>
      <SiteHeader />
      <section className={styles.hero}>
        <p className={styles.kicker}>Pinoso Eco Life · Boligvalg</p>
        <h1>Sammenlign boliger</h1>
        <p>Velg to til fire boliger og sammenlign dokumentert pris, tomt, størrelse og utstyr på samme grunnlag.</p>
        <Link className={styles.back} href="/eiendommer">← Velg flere boliger</Link>
      </section>
      <section className={styles.shell}>
        {selected.length < 2 ? (
          <div className={styles.empty}>
            <h2>Velg minst to boliger</h2>
            <p>Trykk «Legg til sammenligning» på boligkortene. Når du har valgt minst to, åpner du sammenligningen fra linjen nederst på skjermen.</p>
            <Link href="/eiendommer">Finn boliger →</Link>
          </div>
        ) : (
          <>
            <p className={styles.notice}>
              «Oppgitt pris» er annonsens pris og er ikke nødvendigvis total kjøpesum. Pris per m² er regnet som
              oppgitt pris delt på boligareal, ikke et mål på verdien av selve bygget når tomt er inkludert.
              Tomt, basseng, avgifter og andre tillegg må bekreftes i komplett tilbud. Ukjente fakta er merket tydelig.
            </p>
            <div className={styles.scroll} tabIndex={0} role="region" aria-label="Sammenligningstabell; bla sidelengs på små skjermer">
              <table className={styles.table}>
                <caption className={styles.caption}>Sammenligning av {selected.length} boliger i innlandet</caption>
                <thead>
                  <tr>
                    <th scope="col">Sammenligning</th>
                    {selected.map((property) => {
                      const ref = getPropertyRef(property);
                      const remaining = foundRefs.filter((candidate) => candidate !== ref);
                      return (
                        <th scope="col" key={ref}>
                          <Link href={`/eiendommer/${encodeURIComponent(ref)}`} className={styles.propertyLink}>
                            <img src={getPrimaryImage(property)} alt={getPropertyTitle(property)} loading="lazy" />
                            <strong>{getPropertyTitle(property)}</strong>
                          </Link>
                          <CompareRemoveLink refId={ref} href={remaining.length ? compareUrl(remaining) : "/eiendommer"} />
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      {selected.map((property) => <td key={getPropertyRef(property)}>{row.show(property)}</td>)}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">Neste steg</th>
                    {selected.map((p) => (
                      <td key={getPropertyRef(p)}>
                        <Link className={styles.detailLink} href={`/eiendommer/${encodeURIComponent(getPropertyRef(p))}`}>
                          Se komplett boligside og be om bekreftet tilbud →
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.footnote}>Beregnet total inkluderer bare oppgitt boligpris og eventuelt oppgitt separat tomtepris, ikke skatter, notar, registrering, tilvalg eller andre kostnader.</p>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
