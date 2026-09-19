import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SOURCE_BY_HOST: Array<[RegExp, string]> = [
  [/(^|\.)google\.(?:com|[a-z]{2}|com\.[a-z]{2}|co\.[a-z]{2})$/i, "google_search"],
  [/(^|\.)bing\.com$/i, "bing_search"],
  [/(^|\.)chatgpt\.com$/i, "chatgpt"],
  [/^copilot\.microsoft\.com$/i, "microsoft_copilot"],
  [/(^|\.)perplexity\.ai$/i, "perplexity"],
  [/^gemini\.google\.com$/i, "google_gemini"],
  [/^search\.brave\.com$/i, "brave_search"],
  [/(^|\.)duckduckgo\.com$/i, "duckduckgo"],
];

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function classifyReferrer(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    const match = SOURCE_BY_HOST.find(([pattern]) => pattern.test(host));
    return match ? { source: match[1], host } : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const path = typeof body.path === "string" ? body.path.trim() : "";
  const referrer = typeof body.referrer === "string" ? body.referrer.trim() : "";
  const classified = classifyReferrer(referrer);

  if (!classified || !path.startsWith("/") || path.length > 500) {
    return new NextResponse(null, { status: 204 });
  }

  const cleanPath = path.split("?")[0].split("#")[0];
  const localDbUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const sharesRealtyFlowDatabase = (() => {
    try { return new URL(localDbUrl).hostname === "ereapsfcsqtdmzosgnnn.supabase.co"; }
    catch { return false; }
  })();

  // Retain the local dashboard. If the Pinoso website uses a separate database,
  // ALSO deliver one aggregated referral arrival to RealtyFlow's central
  // portfolio endpoint so Sam SEO can include inland properties in his review.
  // Do not send twice when both apps use the same Supabase project.
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("search_discovery_events").insert({
      brand_id: "pinosoecolife",
      source: classified.source,
      path: cleanPath,
      referrer_host: classified.host,
      occurred_at: new Date().toISOString(),
    });
    if (error) console.warn("[SearchDiscovery] Local insert failed", error.message);
  }

  if (!sharesRealtyFlowDatabase) {
    try {
      const response = await fetch("https://realtyflow.chatgenius.pro/api/public/search-discovery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://www.pinosoecolife.com",
        },
        body: JSON.stringify({ path: cleanPath, referrer: new URL(referrer).origin }),
        cache: "no-store",
        signal: AbortSignal.timeout(3500),
      });
      if (!response.ok) console.warn("[SearchDiscovery] Central ingestion returned HTTP", response.status);
    } catch (error) {
      console.warn("[SearchDiscovery] Central ingestion unavailable", error instanceof Error ? error.message : "request failed");
    }
  }

  return new NextResponse(null, { status: 204 });
}
