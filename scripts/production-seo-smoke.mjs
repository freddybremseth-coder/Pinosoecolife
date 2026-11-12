#!/usr/bin/env node
/**
 * Public production smoke audit for Pinoso Eco Life.
 * Run: node scripts/production-seo-smoke.mjs
 * Optional: ECO_LIFE_BASE_URL=https://www.pinosoecolife.com
 * Uses no credentials and checks only public pages.
 */
const base = (process.env.ECO_LIFE_BASE_URL || "https://www.pinosoecolife.com").replace(/\/$/, "");
const guides = [
  "solenergi", "dyrk-egen-mat", "vann", "planlegg-tomten",
  "dyr-og-smabruk", "baerekraftig-bolig", "regenerativt-jordbruk",
  "aret-pa-fincaen", "eksempel-10000m2",
];
const mandatory = [
  "/", "/magasin", "/livet-i-innlandet", "/omrader", "/tomter",
  "/selvforsynt-liv", "/selvforsynt-liv/planlegger",
  ...guides.map((slug) => `/selvforsynt-liv/${slug}`),
];
const results = [];
const failures = [];
const requests = new Map();

async function load(path) {
  if (requests.has(path)) return requests.get(path);
  const task = (async () => {
    const url = new URL(path, base);
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(18000),
      headers: { "user-agent": "PinosoEcoLifeProductionSmoke/1.0" },
    });
    const body = await response.text();
    return { status: response.status, url: response.url, body, headers: response.headers };
  })();
  requests.set(path, task);
  return task;
}
function record(name, ok, note) {
  results.push({ name, ok, note });
  if (!ok) failures.push(name);
}
function normalize(path) {
  try {
    const value = new URL(path, base);
    if (value.origin !== new URL(base).origin) return null;
    return value.pathname.replace(/\/$/, "") || "/";
  } catch { return null; }
}
async function checkPage(path) {
  try {
    const { status, url, body, headers } = await load(path);
    const html = (headers.get("content-type") || "").includes("text/html");
    record(`Page ${path}`, status === 200 && html, `HTTP ${status} ${url}`);
    if (status !== 200 || !html) return;
    record(`H1 ${path}`, (body.match(/<h1(?:\s|>)/gi) || []).length === 1, "Expect exactly one H1");
    // These public landing pages should never accidentally be marked noindex.
    const robotsMeta = [...body.matchAll(/<meta\b[^>]*name=["']robots["'][^>]*>/gi)]
      .map((match) => match[0]).join(" ");
    const noindex = /content=["'][^"']*noindex/i.test(robotsMeta) ||
      /noindex/i.test(headers.get("x-robots-tag") || "");
    record(`Indexable ${path}`, !noindex, noindex ? robotsMeta || headers.get("x-robots-tag") : "No noindex directive");
    if (path.startsWith("/selvforsynt-liv/") && path !== "/selvforsynt-liv/planlegger") {
      const canonical = body.match(/<link[^>]*rel=["']canonical["'][^>]*>/i)?.[0] ||
        body.match(/<link[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["'][^>]*>/i)?.[0] || "";
      record(`Canonical ${path}`, canonical.includes(path), canonical || "Missing canonical");
      record(`JSON-LD ${path}`, body.includes('application/ld+json') && body.includes('BreadcrumbList'), "Structured data and breadcrumb");
    }
    return body;
  } catch (error) {
    record(`Page ${path}`, false, String(error));
  }
}
async function checkLegacyUrls() {
  // The apex domain may redirect to www before the legacy PHP rewrite applies.
  for (const origin of ["https://pinosoecolife.com", "https://www.pinosoecolife.com"]) {
    let current = `${origin}/index.php`;
    const hops = [];
    try {
      for (let i = 0; i < 4; i++) {
        const response = await fetch(current, {
          redirect: "manual",
          signal: AbortSignal.timeout(18000),
          headers: { "user-agent": "PinosoEcoLifeProductionSmoke/1.0" },
        });
        const location = response.headers.get("location") || "";
        hops.push(`${response.status} ${new URL(current).pathname} -> ${location}`);
        if (![301, 308].includes(response.status) || !location) break;
        current = new URL(location, current).href;
        if (new URL(current).pathname === "/") break;
      }
      const final = new URL(current);
      record(`Legacy index.php redirect ${origin}`,
        hops.length > 0 && hops.every((hop) => /^(301|308) /.test(hop)) &&
        final.protocol === "https:" && final.pathname === "/",
        hops.join(" | "));
    } catch (error) {
      record(`Legacy index.php redirect ${origin}`, false, String(error));
    }
  }
  // Old numeric IDs are diagnostics, not current page failures.
  const retired = [];
  for (const path of ["/property.php?id=2", "/property.php?id=3", "/blog-post.php?id=8"]) {
    try {
      const response = await fetch(new URL(path, base), {
        redirect: "manual",
        signal: AbortSignal.timeout(18000),
        headers: { "user-agent": "PinosoEcoLifeProductionSmoke/1.0" },
      });
      retired.push({ path, status: response.status, note: "Old ID mapping not established; do not force a homepage redirect" });
    } catch (error) {
      retired.push({ path, error: String(error) });
    }
  }
  return retired;
}
async function run() {
  const retiredLegacyUrls = await checkLegacyUrls();
  let sitemapPaths = [];
  try {
    const { status, body } = await load("/sitemap.xml");
    record("sitemap.xml", status === 200 && body.includes("<urlset"), `HTTP ${status}`);
    sitemapPaths = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => normalize(match[1])).filter(Boolean);
    record("Sitemap has no duplicate URLs", sitemapPaths.length === new Set(sitemapPaths).size,
      `${sitemapPaths.length} entries; ${new Set(sitemapPaths).size} unique paths`);
    record("Sitemap excludes obsolete PHP pages", !sitemapPaths.some((path) =>
      /\.php(?:$|\?)/i.test(path)), "Old PHP URLs must not be submitted to Google");
    for (const path of mandatory.filter((p) => p.startsWith("/selvforsynt-liv"))) {
      record(`Sitemap includes ${path}`, sitemapPaths.includes(path), "Guide or guide landing is indexed in sitemap");
    }
  } catch (error) {
    record("sitemap.xml", false, String(error));
  }
  try {
    const { status, body } = await load("/robots.txt");
    record("robots.txt", status === 200 && /sitemap:/i.test(body) && body.includes("/sitemap.xml"), `HTTP ${status}`);
  } catch (error) {
    record("robots.txt", false, String(error));
  }
  for (let i = 0; i < mandatory.length; i += 4) {
    await Promise.all(mandatory.slice(i, i + 4).map(checkPage));
  }
  // Test links from editorial hub pages, avoiding the volatile property inventory.
  const editorial = ["/selvforsynt-liv", "/magasin"];
  for (const path of editorial) {
    try {
      const { body } = await load(path);
      const hrefs = [...body.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((x) => x[1]);
      const candidates = [...new Set(hrefs.map(normalize).filter((x) =>
        x && (x.startsWith("/selvforsynt-liv/") || x.startsWith("/magasin/"))
      ))].slice(0, 35);
      for (let i = 0; i < candidates.length; i += 4) {
        await Promise.all(candidates.slice(i, i + 4).map(async (target) => {
          try {
            const { status } = await load(target);
            record(`Link ${path} → ${target}`, status === 200, `HTTP ${status}`);
          } catch (error) {
            record(`Link ${path} → ${target}`, false, String(error));
          }
        }));
      }
    } catch (error) {
      record(`Editorial link scan ${path}`, false, String(error));
    }
  }
  const passed = results.filter((item) => item.ok).length;
  console.log(JSON.stringify({
    base, testedAt: new Date().toISOString(),
    passed, failed: failures.length, checks: results, retiredLegacyUrls,
    note: "Only checks publicly served URLs. Google Search Console indexing and rankings are not inferred.",
  }, null, 2));
  if (failures.length) process.exitCode = 1;
}
await run();
