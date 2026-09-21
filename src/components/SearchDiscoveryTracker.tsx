"use client";

import { useEffect } from "react";
import { safeDiscoverySource, safePublicDiscoveryPath } from "@/lib/seo-discovery";

export function SearchDiscoveryTracker() {
  useEffect(() => {
    const source = safeDiscoverySource(document.referrer);
    const path = safePublicDiscoveryPath(window.location.pathname);
    if (!source || !path) return;

    const storageKey = `pinoso:search-discovery:${path}:${source.source}`;
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
    } catch {
      // Storage disabled does not imply a measured arrival.
    }

    // A receipt is valid only after central RealtyFlow has persisted the
    // event, or the confirmed shared database has stored the same row.
    void fetch("/api/discovery-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, referrer: source.referrer }),
      keepalive: true,
    }).then(response => {
      if (response.status !== 204) return;
      try { window.sessionStorage.setItem(storageKey, "1"); } catch {}
    }).catch(() => undefined);
  }, []);

  return null;
}
