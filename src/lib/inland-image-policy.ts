/** Editorial safeguard for the inland-only Pinoso Eco Life brand. */
export const INLAND_IMAGE_FALLBACK = "/assets/areas.jpg";

// Only image metadata/paths can be checked here, not the actual image pixels.
// Keep this list specific to unmistakable coastal motifs to avoid false positives.
const coastalImageTerms = [
  "beach", "beaches", "playa", "strand", "seaside", "seafront",
  "ocean", "coast", "coastal", "coastline", "waterfront", "marina",
  "sea-view", "sea_view", "seaview", "havutsikt", "kyst",
  "calpe-beach", "benidorm-beach", "villajoyosa-beach",
];

export function isCoastalImageReference(imageUrl: string): boolean {
  const normalized = imageUrl.toLowerCase();
  return coastalImageTerms.some((term) =>
    new RegExp(`(^|[^a-z])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^a-z])`).test(normalized),
  );
}

export function inlandEditorialImage(imageUrl: string | null | undefined): string {
  const value = imageUrl?.trim() || "";
  if (!value || isCoastalImageReference(value)) return INLAND_IMAGE_FALLBACK;
  return value;
}
