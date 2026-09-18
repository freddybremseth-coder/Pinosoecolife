import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SOURCE_BY_HOST: Array<[RegExp, string]> = [
  [/(^|\.)google\./i, "google_search"],
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

  const supabase = getSupabase();
  if (!supabase) {
    return new NextResponse(null, { status: 204 });
  }

  const { error } = await supabase.from("search_discovery_events").insert({
    brand_id: "pinosoecolife",
    source: classified.source,
    path: path.split("?")[0],
    referrer_host: classified.host,
    occurred_at: new Date().toISOString(),
  });

  if (error) {
    console.warn("[SearchDiscovery] Could not store event", error.message);
  }

  return new NextResponse(null, { status: 204 });
}
