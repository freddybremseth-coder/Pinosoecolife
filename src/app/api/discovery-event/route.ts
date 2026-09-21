import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { safeDiscoverySource, safePublicDiscoveryPath } from "@/lib/seo-discovery";

const CENTRAL_ENDPOINT = "https://realtyflow.chatgenius.pro/api/public/search-discovery";
const CENTRAL_DB_HOST = "ereapsfcsqtdmzosgnnn.supabase.co";
const SOURCE_ORIGIN = "https://www.pinosoecolife.com";

function localDatabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function sharesRealtyFlowDatabase() {
  const raw = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  try { return new URL(raw).hostname === CENTRAL_DB_HOST; }
  catch { return false; }
}

function storageUnavailable() {
  return NextResponse.json({ error: "SEO arrival storage unavailable" }, {
    status: 503,
    headers: { "Cache-Control": "no-store" },
  });
}

/** One public arrival is acknowledged only when centrally stored. For a
 * shared database, write once locally. For a separate Pinoso database, first
 * verify RealtyFlow's 204 durable receipt, then best-effort mirror locally.
 * Failed central sends must not be reported as captured or duplicated locally.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const path = safePublicDiscoveryPath(body.path);
  const referrer = safeDiscoverySource(body.referrer);
  if (!path || !referrer) {
    // Invalid/sensitive payloads are deliberately ignored, not counted.
    return NextResponse.json({ error: "Invalid public discovery event" }, {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const supabase = localDatabase();
  const row = {
    brand_id: "pinosoecolife",
    source: referrer.source,
    path,
    referrer_host: referrer.host,
    occurred_at: new Date().toISOString(),
  };

  if (sharesRealtyFlowDatabase()) {
    if (!supabase) return storageUnavailable();
    try {
      const { error } = await supabase.from("search_discovery_events").insert(row);
      if (error) {
        console.warn("[PinosoDiscovery] Shared first-party storage failed");
        return storageUnavailable();
      }
    } catch {
      console.warn("[PinosoDiscovery] Shared first-party storage request failed");
      return storageUnavailable();
    }
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }

  // An independent local Supabase project does not appear in Sam's central
  // dashboard. Central durable acceptance is therefore required BEFORE 204.
  try {
    const central = await fetch(CENTRAL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: SOURCE_ORIGIN },
      body: JSON.stringify({ path, referrer: referrer.referrer }),
      cache: "no-store",
      signal: AbortSignal.timeout(3500),
    });
    if (central.status !== 204) {
      console.warn("[PinosoDiscovery] Central first-party storage not confirmed");
      return storageUnavailable();
    }
  } catch {
    console.warn("[PinosoDiscovery] Central first-party storage request failed");
    return storageUnavailable();
  }

  if (supabase) {
    // A separate local dashboard is optional; a failed local mirror cannot
    // negate a confirmed central arrival or trigger duplicate central retries.
    try {
      const { error } = await supabase.from("search_discovery_events").insert(row);
      if (error) console.warn("[PinosoDiscovery] Optional local mirror failed");
    } catch {
      console.warn("[PinosoDiscovery] Optional local mirror request failed");
    }
  }
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
