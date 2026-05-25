import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function cleanPath(value: string) {
  const path = value.trim();
  if (!path) return "/magasin";
  return path.startsWith("/") ? path : `/${path}`;
}

function pickEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (value) return value;
  }
  return "";
}

function getSupabase() {
  const url = pickEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isAuthorized(request: NextRequest) {
  const expected = pickEnv("REALTYFLOW_CMS_SECRET", "WEBSITE_CMS_SECRET_PINOSOECOLIFE");
  if (!expected) return { ok: false, reason: "REALTYFLOW_CMS_SECRET is not configured" };
  const headerSecret = cleanString(request.headers.get("x-realtyflow-secret"));
  const auth = cleanString(request.headers.get("authorization"));
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  if (headerSecret === expected || bearer === expected) return { ok: true, reason: "" };
  return { ok: false, reason: "Unauthorized" };
}

export async function POST(request: NextRequest) {
  const auth = isAuthorized(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.reason }, { status: auth.reason.includes("configured") ? 500 : 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 500 });
  }

  const payload = await request.json().catch(() => null);
  const title = cleanString(payload?.content?.title);
  const markdown = cleanString(payload?.content?.markdown);
  if (!title || !markdown) {
    return NextResponse.json({ error: "content.title and content.markdown are required" }, { status: 400 });
  }

  const destination = payload?.destination || {};
  const destinationId = cleanString(destination.id) || "magasin";
  const destinationLabel = cleanString(destination.label) || "Magasin";
  const destinationPath = cleanPath(cleanString(destination.path) || `/${destinationId}`);
  const slug = slugify(cleanString(payload?.content?.slug) || title);
  const sourceSystem = cleanString(payload?.source?.system) || "realtyflow";
  const sourceType = cleanString(payload?.source?.type) || "content";
  const sourceId = cleanString(payload?.source?.id || "");
  const status = payload?.status === "draft" ? "draft" : "published";
  const publishedAt = status === "published"
    ? cleanString(payload?.publishedAt) || new Date().toISOString()
    : null;

  const row = {
    source_system: sourceSystem,
    source_type: sourceType,
    source_id: sourceId || null,
    brand_id: cleanString(payload?.brand?.id) || "pinosoecolife",
    destination_id: destinationId,
    destination_label: destinationLabel,
    destination_path: destinationPath,
    content_type: cleanString(destination.contentType) || "article",
    title,
    slug,
    summary: cleanString(payload?.content?.summary),
    markdown,
    image_url: cleanString(payload?.content?.imageUrl || ""),
    tags: Array.isArray(payload?.content?.tags) ? payload.content.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean) : [],
    status,
    published_at: publishedAt,
    raw_payload: payload,
    updated_at: new Date().toISOString(),
  };

  const onConflict = sourceId
    ? "source_system,source_type,source_id"
    : "brand_id,destination_id,slug";

  const { data, error } = await supabase
    .from("website_posts")
    .upsert(row, { onConflict })
    .select("id, slug, destination_path, status, published_at")
    .single();

  if (error) {
    return NextResponse.json({
      error: error.message,
      hint: "Create website_posts and configure SUPABASE_SERVICE_ROLE_KEY in Vercel.",
    }, { status: 500 });
  }

  const url = `${destinationPath.replace(/\/$/, "")}/${slug}`;
  return NextResponse.json({
    success: true,
    id: data.id,
    slug: data.slug,
    status: data.status,
    url,
    external_url: url,
    published_at: data.published_at,
  });
}
