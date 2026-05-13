import Link from "next/link";
import {
  formatPrice,
  getPrimaryImage,
  getPropertyArea,
  getPropertyRef,
  getPropertyTitle,
  getPropertyType,
  type Property,
} from "@/lib/realtyflow";

export function PropertyCard({ property, priority = false }: { property: Property; priority?: boolean }) {
  const href = `/eiendommer/${encodeURIComponent(getPropertyRef(property))}`;
  const title = getPropertyTitle(property);
  const image = getPrimaryImage(property);
  const facts = [
    property.bedrooms ? `${property.bedrooms} sov` : "",
    property.bathrooms ? `${property.bathrooms} bad` : "",
    getPropertyArea(property) ? `${getPropertyArea(property)} m²` : "",
  ].filter(Boolean);

  return (
    <Link className="property-card" href={href} prefetch={priority}>
      <div className="property-image" style={{ backgroundImage: `url(${image})` }}>
        <span>{getPropertyType(property)}</span>
      </div>
      <div className="property-body">
        <p>{property.location || property.town || "Pinoso-regionen"}</p>
        <h3>{title}</h3>
        <strong>{formatPrice(property.price)}</strong>
        {facts.length > 0 && (
          <div className="facts">
            {facts.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
