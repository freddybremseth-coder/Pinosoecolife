"use client";

import { useEffect } from "react";

function knownDiscoveryReferrer(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return (
      /(^|\.)google\.(?:com|[a-z]{2}|com\.[a-z]{2}|co\.[a-z]{2})$/.test(host) ||
      host === "bing.com" ||
      host.endsWith(".bing.com") ||
      host === "chatgpt.com" ||
      host.endsWith(".chatgpt.com") ||
      host === "copilot.microsoft.com" ||
      host === "perplexity.ai" ||
      host.endsWith(".perplexity.ai") ||
      host === "gemini.google.com" ||
      host === "search.brave.com" ||
      host === "duckduckgo.com" ||
      host.endsWith(".duckduckgo.com")
    );
  } catch {
    return false;
  }
}

export function SearchDiscoveryTracker() {
  useEffect(() => {
    const rawReferrer = document.referrer;
    if (!rawReferrer || !knownDiscoveryReferrer(rawReferrer)) return;

    // Forward only the referring origin: query terms and unrelated URL paths
    // are not required to categorize a genuine search/AI arrival.
    const referrer = new URL(rawReferrer).origin;
    const path = window.location.pathname;
    const storageKey = `pinoso:search-discovery:${path}:${referrer}`;
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      // Tracking remains best-effort when sessionStorage is unavailable.
    }

    void fetch("/api/discovery-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, referrer }),
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  return null;
}
