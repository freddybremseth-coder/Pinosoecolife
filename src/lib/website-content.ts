import { createClient } from "@supabase/supabase-js";

import { articles } from "@/lib/content";
import { ecoLifePhase2Articles } from "@/lib/ecolife-phase2";

const fallbackArticles = [...articles, ...ecoLifePhase2Articles];

export type PublicWebsitePost = {
  id: string;
  destination_id: string;
  destination_label: string;
  destination_path: string;
  content_type: string;
  title: string;
  slug: string;
  summary: string;
  markdown: string;
  image_url: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
};

const selectColumns = [
  "id",
  "destination_id",
  "destination_label",
  "destination_path",
  "content_type",
  "title",
  "slug",
  "summary",
  "markdown",
  "image_url",
  "tags",
  "published_at",
  "created_at",
].join(",");

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function toFallbackPost(article: (typeof fallbackArticles)[number]): PublicWebsitePost {
  return {
    id: `fallback-${article.slug}`,
    destination_id: "magasin",
    destination_label: "Magasin",
    destination_path: "/magasin",
    content_type: "magazine",
    title: article.title,
    slug: article.slug,
    summary: article.excerpt,
    markdown: article.markdown || `# ${article.title}\n\n${article.excerpt}`,
    image_url: article.image || null,
    tags: article.tags || [],
    published_at: article.date,
    created_at: article.date,
  };
}

function mergeMagazinePosts(rows: PublicWebsitePost[]) {
  const bySlug = new Map<string, PublicWebsitePost>();

  // Curated Eco Life articles are a durable baseline. CMS rows with the same slug
  // may override them so editorial updates can still be published without code changes.
  for (const article of fallbackArticles) {
    bySlug.set(article.slug, toFallbackPost(article));
  }
  for (const row of rows) {
    bySlug.set(row.slug, row);
  }

  return Array.from(bySlug.values()).sort((a, b) => {
    const aDate = new Date(a.published_at || a.created_at).getTime();
    const bDate = new Date(b.published_at || b.created_at).getTime();
    return bDate - aDate;
  });
}

export async function fetchPublishedPosts(destinationId: string): Promise<PublicWebsitePost[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return destinationId === "magasin" ? fallbackArticles.map(toFallbackPost) : [];
  }

  const { data, error } = await supabase
    .from("website_posts")
    .select(selectColumns)
    .eq("status", "published")
    .eq("destination_id", destinationId)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[PinosoEcoLife] Could not fetch website posts", error.message);
    return destinationId === "magasin" ? fallbackArticles.map(toFallbackPost) : [];
  }

  const rows = (data || []) as unknown as PublicWebsitePost[];
  if (destinationId === "magasin") return mergeMagazinePosts(rows);
  return rows;
}

export async function fetchPublishedPost(destinationId: string, slug: string): Promise<PublicWebsitePost | null> {
  const supabase = getSupabase();
  if (!supabase) {
    const fallback = fallbackArticles.find((article) => article.slug === slug);
    return fallback ? toFallbackPost(fallback) : null;
  }

  const { data, error } = await supabase
    .from("website_posts")
    .select(selectColumns)
    .eq("status", "published")
    .eq("destination_id", destinationId)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.warn("[PinosoEcoLife] Could not fetch website post", error.message);
    const fallback = fallbackArticles.find((article) => article.slug === slug);
    return fallback ? toFallbackPost(fallback) : null;
  }

  if (data) return data as unknown as PublicWebsitePost;
  const fallback = fallbackArticles.find((article) => article.slug === slug);
  return fallback ? toFallbackPost(fallback) : null;
}
