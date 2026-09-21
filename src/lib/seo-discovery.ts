/**
 * Public-site source-only SEO attribution, not authenticated customer tracking.
 * Never transmit browser searches, conversation URLs or URL query parameters.
 * Gemini precedes Google to keep AI referrals separate from web search.
 */
const SOURCES: ReadonlyArray<readonly [RegExp, string]> = [
  [/^gemini\.google\.com$/i, "google_gemini"],
  [/(^|\.)google\.(?:com|[a-z]{2}|com\.[a-z]{2}|co\.[a-z]{2})$/i, "google_search"],
  [/(^|\.)bing\.com$/i, "bing_search"],
  [/(^|\.)chatgpt\.com$/i, "chatgpt"],
  [/^copilot\.microsoft\.com$/i, "microsoft_copilot"],
  [/(^|\.)perplexity\.ai$/i, "perplexity"],
  [/^search\.brave\.com$/i, "brave_search"],
  [/(^|\.)duckduckgo\.com$/i, "duckduckgo"],
];
export function safeDiscoverySource(value: unknown): { source: string; host: string; referrer: string } | null {
  if (typeof value !== "string" || value.length === 0 || value.length > 4096) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase();
    const source = SOURCES.find(([pattern]) => pattern.test(host))?.[1];
    return source ? { source, host, referrer: "https://" + host + "/" } : null;
  } catch { return null; }
}

export function safePublicDiscoveryPath(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") ||
      value.length > 220 || /[\x00-\x1f@?#]/.test(value) || /%(?:00|0[0-9a-f]|1[0-9a-f]|2f|3f|23|40)/i.test(value) ||
      /^\/(?:api|admin|auth|login|account|konto|dashboard|portal|checkout|min-side|crm|kunde)(?:\/|$)/i.test(value)) return null;
  return value;
}
