import { NextRequest, NextResponse } from "next/server";

const CATASTRO_MAP_URL = "https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx";
const CATASTRO_COORDINATE_SERVICE =
  "https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx/Consulta_RCCOOR";

function catastroMapUrl(refcat: string) {
  const url = new URL(CATASTRO_MAP_URL);
  url.searchParams.set("refcat", refcat);
  return url;
}

function coordinateLookupUrl(lat: string, lng: string) {
  const url = new URL(CATASTRO_COORDINATE_SERVICE);
  url.searchParams.set("SRS", "EPSG:4326");
  url.searchParams.set("Coordenada_X", lng);
  url.searchParams.set("Coordenada_Y", lat);
  return url;
}

function extractRefcat(xml: string) {
  const pc1 = xml.match(/<pc1>([^<]+)<\/pc1>/i)?.[1]?.trim() || "";
  const pc2 = xml.match(/<pc2>([^<]+)<\/pc2>/i)?.[1]?.trim() || "";

  if (pc1 && pc2) return `${pc1}${pc2}`;

  const refcat = xml.match(/<refcat>([^<]+)<\/refcat>/i)?.[1]?.trim() || "";
  return refcat;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const refcat = searchParams.get("refcat")?.trim();
  const lat = searchParams.get("lat")?.trim();
  const lng = searchParams.get("lng")?.trim();

  if (refcat) {
    return NextResponse.redirect(catastroMapUrl(refcat));
  }

  if (!lat || !lng) {
    return NextResponse.redirect(new URL(CATASTRO_MAP_URL));
  }

  const lookupUrl = coordinateLookupUrl(lat, lng);

  try {
    const response = await fetch(lookupUrl, {
      headers: { Accept: "application/xml,text/xml,*/*" },
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!response.ok) {
      return NextResponse.redirect(lookupUrl);
    }

    const xml = await response.text();
    const discoveredRefcat = extractRefcat(xml);

    if (discoveredRefcat) {
      return NextResponse.redirect(catastroMapUrl(discoveredRefcat));
    }

    return NextResponse.redirect(lookupUrl);
  } catch {
    return NextResponse.redirect(lookupUrl);
  }
}
