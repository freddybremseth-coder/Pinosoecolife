"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { LandPlot } from "@/lib/realtyflow";

function formatEuro(value?: number) {
  if (!value) return "Pris på forespørsel";
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function plotRef(plot: LandPlot) {
  return plot.plot_number || plot.plotNumber || plot.id || "Tomt";
}

export function PlotsMap({ plots }: { plots: LandPlot[] }) {
  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    async function initMap() {
      if (!mapNode.current || mapRef.current) return;
      const L = (await import("leaflet")).default;
      if (!mounted || !mapNode.current) return;

      const validPlots = plots.filter((plot) => Number(plot.lat) && Number(plot.lng));
      const center: [number, number] = validPlots.length
        ? [Number(validPlots[0].lat), Number(validPlots[0].lng)]
        : [38.45, -0.95];

      const map = L.map(mapNode.current, {
        center,
        zoom: validPlots.length > 1 ? 10 : 12,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const bounds: Array<[number, number]> = [];
      validPlots.forEach((plot) => {
        const lat = Number(plot.lat);
        const lng = Number(plot.lng);
        bounds.push([lat, lng]);

        const marker = L.circleMarker([lat, lng], {
          radius: 8,
          color: "#ffffff",
          weight: 3,
          fillColor: "#b9935a",
          fillOpacity: 0.95,
        }).addTo(map);

        marker.bindTooltip(
          `<strong>${plotRef(plot)}</strong><br>${formatEuro(plot.price)} · ${Number(plot.area || 0).toLocaleString("nb-NO")} m²`,
          { direction: "top", sticky: true },
        );

        marker.bindPopup(
          `<strong>${plotRef(plot)}</strong><br>${plot.location || plot.municipality || "Spania"}<br>${formatEuro(plot.price)}<br>${Number(plot.area || 0).toLocaleString("nb-NO")} m²`,
        );
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
  }, [plots]);

  return (
    <div className="map-surface real-map">
      <span className="map-label">Kartoversikt</span>
      <div ref={mapNode} className="leaflet-plot-map" />
    </div>
  );
}
