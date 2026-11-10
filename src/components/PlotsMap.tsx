"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { LandPlot } from "@/lib/realtyflow";

const CATASTRO_WMS_URL = "https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx";
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

function formatEuro(value?: number) {
  if (!value) return "Pris på forespørsel";
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
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
    [
      plot.notes,
      plot.location,
      plot.municipality,
      plotRef(plot),
      plot.registry_number,
      plot.finca_registral,
    ]
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

function getPolygon(plot: PlotWithCatastro) {
  return plot.poligono || plot.polígono || plot.polygon || "";
}

function getParcel(plot: PlotWithCatastro) {
  return plot.parcela || plot.parcel || "";
}

function getCatastroUrl(plot: PlotWithCatastro) {
  const url = new URL("/api/catastro/redirect", window.location.origin);
  const ref = getCatastroRef(plot);

  if (ref) {
    url.searchParams.set("refcat", ref);
    return url.toString();
  }

  if (plot.lat && plot.lng) {
    url.searchParams.set("lat", String(plot.lat));
    url.searchParams.set("lng", String(plot.lng));
    return url.toString();
  }

  return "https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx";
}

function validPosition(plot: PlotWithCatastro) {
  const lat = Number(plot.lat);
  const lng = Number(plot.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && !(lat === 0 && lng === 0);
}

function coordinates(plot: PlotWithCatastro) {
  return `${Number(plot.lat)},${Number(plot.lng)}`;
}

function googleMapsUrl(plot: PlotWithCatastro) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates(plot))}`;
}

function streetViewUrl(plot: PlotWithCatastro) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${encodeURIComponent(coordinates(plot))}`;
}

function directionsUrl(plot: PlotWithCatastro) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coordinates(plot))}&travelmode=driving`;
}

function plotKey(plot: PlotWithCatastro) {
  return String(plot.id || `${plotRef(plot)}-${coordinates(plot)}`);
}

function popupHtml(plot: PlotWithCatastro) {
  const ref = getCatastroRef(plot);
  const polygon = getPolygon(plot);
  const parcel = getParcel(plot);
  const facts = [
    plot.location || plot.municipality || "Spania",
    formatEuro(plot.price),
    `${Number(plot.area || 0).toLocaleString("nb-NO")} m²`,
    polygon ? `Polígono ${polygon}` : "",
    parcel ? `Parcela ${parcel}` : "",
    ref ? `Catastro: ${ref}` : "",
  ]
    .filter(Boolean)
    .join("<br>");

  const linkText = ref ? "Åpne i Catastro" : "Finn i Catastro fra kartposisjon";
  return `<strong>${plotRef(plot)}</strong><br>${facts}<br><a href="${getCatastroUrl(plot)}" target="_blank" rel="noopener noreferrer">${linkText}</a><br><a href="${googleMapsUrl(plot)}" target="_blank" rel="noopener noreferrer">Google Maps</a> · <a href="${streetViewUrl(plot)}" target="_blank" rel="noopener noreferrer">Street View</a> · <a href="${directionsUrl(plot)}" target="_blank" rel="noopener noreferrer">Veibeskrivelse</a>`;
}

export function PlotsMap({ plots }: { plots: LandPlot[] }) {
  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const osmLayerRef = useRef<any>(null);
  const catastroLayerRef = useRef<any>(null);
  const [catastroEnabled, setCatastroEnabled] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [nearbyStatus, setNearbyStatus] = useState("");
  const [nearbyPosition, setNearbyPosition] = useState<{ lat: number; lng: number } | null>(null);
  const typedPlots = useMemo(() => plots as PlotWithCatastro[], [plots]);
  const validPlotsForVisit = useMemo(() => typedPlots.filter(validPosition), [typedPlots]);
  const orderedPlots = useMemo(() => {
    if (!nearbyPosition) return validPlotsForVisit;
    return [...validPlotsForVisit].sort((a, b) => {
      const distance = (p: PlotWithCatastro) => {
        const latDiff = (Number(p.lat) - nearbyPosition.lat) * Math.PI / 180;
        const lngDiff = (Number(p.lng) - nearbyPosition.lng) * Math.PI / 180;
        const cos = Math.cos(nearbyPosition.lat * Math.PI / 180);
        return latDiff * latDiff + lngDiff * lngDiff * cos * cos;
      };
      return distance(a) - distance(b);
    });
  }, [validPlotsForVisit, nearbyPosition]);
  const selectedPlots = orderedPlots.filter((plot) => selectedKeys.includes(plotKey(plot)));
  const routeUrl = selectedPlots.length
    ? `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${encodeURIComponent(coordinates(selectedPlots[selectedPlots.length - 1]))}${selectedPlots.length > 1 ? `&waypoints=${encodeURIComponent(selectedPlots.slice(0, -1).map(coordinates).join("|"))}` : ""}`
    : "";
  function togglePlot(key: string) {
    setSelectedKeys((current) => current.includes(key) ? current.filter((item) => item !== key) : current.length < 4 ? [...current, key] : current);
  }
  function findNearbyPlots() {
    if (!navigator.geolocation) {
      setNearbyStatus("Posisjon er ikke tilgjengelig i denne nettleseren.");
      return;
    }
    setNearbyStatus("Henter posisjon …");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNearbyPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
        setNearbyStatus("Sortert etter luftlinje fra din posisjon. Kontroller faktisk kjøretid i Google Maps.");
      },
      () => setNearbyStatus("Kunne ikke hente posisjon. Tillat posisjonstilgang for nettstedet."),
      { enableHighAccuracy: false, timeout: 12000 },
    );
  }

  useEffect(() => {
    let mounted = true;

    async function initMap() {
      if (!mapNode.current || mapRef.current) return;
      const L = (await import("leaflet")).default;
      if (!mounted || !mapNode.current) return;

      const validPlots = typedPlots.filter(validPosition);
      const center: [number, number] = validPlots.length
        ? [Number(validPlots[0].lat), Number(validPlots[0].lng)]
        : [38.45, -0.95];

      const map = L.map(mapNode.current, {
        center,
        zoom: validPlots.length > 1 ? 10 : 12,
        scrollWheelZoom: true,
      });

      const osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const catastroLayer = L.tileLayer.wms(CATASTRO_WMS_URL, {
        layers: "Catastro",
        format: "image/png",
        transparent: true,
        version: "1.1.1",
        attribution: "Dirección General del Catastro",
        maxZoom: 22,
      });

      if (catastroEnabled) catastroLayer.addTo(map);
      osmLayerRef.current = osmLayer;
      catastroLayerRef.current = catastroLayer;

      const bounds: Array<[number, number]> = [];
      validPlots.forEach((plot) => {
        const lat = Number(plot.lat);
        const lng = Number(plot.lng);
        bounds.push([lat, lng]);

        const marker = L.circleMarker([lat, lng], {
          radius: 8,
          color: "#ffffff",
          weight: 3,
          fillColor: "#10b981",
          fillOpacity: 0.95,
        }).addTo(map);

        const catastroRef = getCatastroRef(plot);
        const polygon = getPolygon(plot);
        const parcel = getParcel(plot);
        const tooltipParts = [
          `<strong>${plotRef(plot)}</strong>`,
          `${formatEuro(plot.price)} · ${Number(plot.area || 0).toLocaleString("nb-NO")} m²`,
          polygon || parcel ? `Polígono ${polygon || "-"} · Parcela ${parcel || "-"}` : "",
          catastroRef ? `Ref. catastral: ${catastroRef}` : "",
        ].filter(Boolean);

        marker.bindTooltip(tooltipParts.join("<br>"), { direction: "top", sticky: true });
        marker.bindPopup(popupHtml(plot));
      });

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
      }

      setTimeout(() => map.invalidateSize(), 120);
      mapRef.current = map;
    }

    initMap();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [typedPlots, catastroEnabled]);

  useEffect(() => {
    const map = mapRef.current;
    const catastroLayer = catastroLayerRef.current;
    if (!map || !catastroLayer) return;

    if (catastroEnabled && !map.hasLayer(catastroLayer)) {
      catastroLayer.addTo(map);
    }

    if (!catastroEnabled && map.hasLayer(catastroLayer)) {
      map.removeLayer(catastroLayer);
    }
  }, [catastroEnabled]);

  return (
    <div className="map-surface real-map catastro-map-surface">
      <span className="map-label">Kartoversikt</span>
      <div className="catastro-map-tools" aria-label="Kartvalg">
        <button type="button" className={catastroEnabled ? "active" : ""} onClick={() => setCatastroEnabled((value) => !value)}>
          {catastroEnabled ? "Catastro på" : "Catastro av"}
        </button>
        <span>WMS-lag med parcelgrenser</span>
      </div>
      <div className="plot-visit-planner" aria-label="Planlegg tomtevisning">
        <div className="plot-visit-heading">
          <strong>Planlegg tomtevisning</strong>
          <span>Velg inntil 4 tomter og åpne kjøreruten i Google Maps.</span>
        </div>
        <div className="plot-visit-actions">
          <button type="button" onClick={findNearbyPlots}>Tomter nær meg</button>
          <button type="button" onClick={() => setSelectedKeys([])} disabled={!selectedKeys.length}>Nullstill</button>
          {routeUrl && <a href={routeUrl} target="_blank" rel="noopener noreferrer">Åpne rute ({selectedPlots.length})</a>}
        </div>
        {nearbyStatus && <p role="status">{nearbyStatus}</p>}
        <div className="plot-visit-options">
          {orderedPlots.map((plot) => (
            <label key={plotKey(plot)}>
              <input type="checkbox" checked={selectedKeys.includes(plotKey(plot))} disabled={selectedKeys.length >= 4 && !selectedKeys.includes(plotKey(plot))} onChange={() => togglePlot(plotKey(plot))} />
              <span>{plotRef(plot)} · {plot.municipality || plot.location || "Spania"}</span>
              <a href={directionsUrl(plot)} target="_blank" rel="noopener noreferrer" aria-label={`Veibeskrivelse til ${plotRef(plot)}`}>Kjør</a>
            </label>
          ))}
        </div>
      </div>
      <div ref={mapNode} className="leaflet-plot-map" />
      <style jsx global>{`
        .plot-visit-planner { position: relative; z-index: 2; padding: 16px; background: #fff; color: #182238; border-radius: 8px 8px 0 0; }
        .plot-visit-heading { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; margin-bottom: 10px; }
        .plot-visit-heading span { font-size: .83rem; color: #526075; }
        .plot-visit-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
        .plot-visit-actions button, .plot-visit-actions a { border: 1px solid #cbd5e1; background: #f8fafc; color: #173a32; border-radius: 6px; padding: 8px 11px; font-size: .85rem; font-weight: 700; text-decoration: none; cursor: pointer; }
        .plot-visit-actions a { background: #087f5b; color: white; border-color: #087f5b; }
        .plot-visit-actions button:disabled { opacity: .5; cursor: default; }
        .plot-visit-planner p { font-size: .78rem; margin: 0 0 8px; }
        .plot-visit-options { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 5px; }
        .plot-visit-options label { display: flex; align-items: center; gap: 6px; flex: 0 0 auto; max-width: 270px; border: 1px solid #dbe3e8; border-radius: 6px; padding: 7px 9px; font-size: .79rem; cursor: pointer; }
        .plot-visit-options label span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .plot-visit-options label a { color: #087f5b; font-weight: 800; }
        .catastro-map-surface .leaflet-popup-content a {
          color: #047857;
          font-weight: 900;
        }

        .catastro-map-tools {
          position: absolute;
          right: 18px;
          top: 18px;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 12px 32px rgba(22, 34, 43, 0.16);
        }

        .catastro-map-tools button {
          min-height: 36px;
          border: 0;
          border-radius: 4px;
          padding: 0 12px;
          background: #171e3a;
          color: white;
          cursor: pointer;
          font-weight: 900;
        }

        .catastro-map-tools button.active {
          background: #10b981;
        }

        .catastro-map-tools span {
          color: #617084;
          font-size: 0.78rem;
          font-weight: 800;
        }

        @media (max-width: 720px) {
          .catastro-map-tools {
            left: 18px;
            right: 18px;
            top: 58px;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}
