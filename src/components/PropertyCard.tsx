import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CompareButton } from "@/components/CompareProperties";
import {
  formatPrice,
  getPrimaryImage,
  getPropertyArea,
  getPropertyRef,
  getPropertyTitle,
  getPropertyType,
  type Property,
} from "@/lib/realtyflow";
import {
  formatEuroPerSqm,
  getPlotInPriceLabel,
  getPricingFacts,
  getPropertyPreview,
} from "@/lib/property-comparison";
import styles from "./PropertyCard.module.css";

export function PropertyCard({ property, priority = false }: { property: Property; priority?: boolean }) {
  const ref = getPropertyRef(property);
  const href = `/eiendommer/${encodeURIComponent(ref)}`;
  const title = getPropertyTitle(property);
  const image = getPrimaryImage(property);
  const pricing = getPricingFacts(property);
  const facts = [
    property.bedrooms ? `${property.bedrooms} soverom` : "",
    property.bathrooms ? `${property.bathrooms} bad` : "",
    getPropertyArea(property) ? `${getPropertyArea(property)} m² bolig` : "",
    property.plot_size ? `${Number(property.plot_size).toLocaleString("nb-NO")} m² tomt` : "",
    property.pool === true ? "Basseng" : "",
  ].filter(Boolean);

  return (
    <article className={styles.card}>
      <Link className={styles.mainLink} href={href} prefetch={priority}>
        <div className={styles.media}>
          <img
            className={styles.image}
            src={image}
            alt={title}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <span className={styles.badge}>{getPropertyType(property)}</span>
          {ref && <span className={styles.ref}>{ref}</span>}
          <span className={styles.arrow} aria-hidden="true"><ArrowUpRight size={18} /></span>
        </div>
        <div className={styles.body}>
          <p className={styles.location}>{property.location || property.town || "Innlandet"}</p>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.preview}>{getPropertyPreview(property)}</p>
          <strong className={styles.price}>{formatPrice(property.price)}</strong>
          <p className={styles.priceBasis}>{getPlotInPriceLabel(property)}</p>
          {pricing.plotInPrice === "excluded" && pricing.plotPrice !== null && (
            <p className={styles.priceBasis}>Oppgitt tomtepris: {formatPrice(pricing.plotPrice)}</p>
          )}
          {pricing.totalHouseAndPlot !== null && (
            <p className={styles.priceBasis}>Bolig + tomt: {formatPrice(pricing.totalHouseAndPlot)} før skatter og andre tillegg</p>
          )}
          {facts.length > 0 && (
            <div className={styles.facts}>
              {facts.map((fact) => <span className={styles.fact} key={fact}>{fact}</span>)}
            </div>
          )}
          <p className={styles.sqm}>Oppgitt pris / boligareal: {formatEuroPerSqm(pricing.pricePerBuiltSqm)}</p>
          <span className={styles.viewLink}>Se bolig og prisdetaljer <ArrowUpRight size={15} /></span>
        </div>
      </Link>
      <div className={styles.compareAction}>
        <CompareButton refId={ref} />
      </div>
    </article>
  );
}
