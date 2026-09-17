import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  formatPrice,
  getPrimaryImage,
  getPropertyArea,
  getPropertyRef,
  getPropertyTitle,
  getPropertyType,
  type Property,
} from "@/lib/realtyflow";
import styles from "./PropertyCard.module.css";

export function PropertyCard({ property, priority = false }: { property: Property; priority?: boolean }) {
  const ref = getPropertyRef(property);
  const href = `/eiendommer/${encodeURIComponent(ref)}`;
  const title = getPropertyTitle(property);
  const image = getPrimaryImage(property);
  const facts = [
    property.bedrooms ? `${property.bedrooms} soverom` : "",
    property.bathrooms ? `${property.bathrooms} bad` : "",
    getPropertyArea(property) ? `${getPropertyArea(property)} m² bolig` : "",
    property.plot_size ? `${Number(property.plot_size).toLocaleString("nb-NO")} m² tomt` : "",
  ].filter(Boolean);

  return (
    <Link className={styles.card} href={href} prefetch={priority}>
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
        <strong className={styles.price}>{formatPrice(property.price)}</strong>
        {facts.length > 0 && (
          <div className={styles.facts}>
            {facts.map((fact) => <span className={styles.fact} key={fact}>{fact}</span>)}
          </div>
        )}
      </div>
    </Link>
  );
}
