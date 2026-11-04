"use client";

import { useEffect } from "react";
import { safeDiscoverySource, safePublicDiscoveryPath } from "@/lib/seo-discovery";
import { analyticsAllowed, CONSENT_CHANGED } from "@/components/CookieConsentBanner";

export function SearchDiscoveryTracker() {
  useEffect(() => {
    const sendIfAllowed = () => {
    if (!analyticsAllowed()) return;
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
    };
    sendIfAllowed();
    window.addEventListener(CONSENT_CHANGED, sendIfAllowed);
    return () => window.removeEventListener(CONSENT_CHANGED, sendIfAllowed);
  }, []);

  return null;
}
