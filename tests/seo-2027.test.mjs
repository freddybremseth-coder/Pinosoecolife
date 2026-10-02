import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("homepage keeps the 2027 intent-first journey and entity graph", () => {
  const page = read("src/app/page.tsx");
  assert.match(page, /id="intent-title"/);
  for (const href of ["/livet-i-innlandet", "/eiendommer", "/tomter"]) {
    assert.ok(page.includes(`href: "${href}"`), "missing intent path " + href);
  }
  assert.match(page, /"@type": "WebPage"/);
  assert.match(page, /"@type": "ItemList"/);
  assert.match(page, /https:\/\/www\.freddybremseth\.com\/#person/);
  assert.match(page, /dateModified: "2026-10-02"/);
});

test("SEO landing pages expose visible direct answers and matching FAQ schema", () => {
  const view = read("src/components/SeoLandingView.tsx");
  assert.match(view, /className=\{styles\.answerBand\}/);
  assert.match(view, />Kort svar</);
  assert.match(view, /"@type": "FAQPage"/);
  assert.match(view, /mainEntity: page\.faq\.map/);
  assert.match(view, /https:\/\/www\.freddybremseth\.com\/#person/);
  assert.match(view, /dateModified: "2026-10-02"/);

  const route = read("src/app/(seo)/[slug]/page.tsx");
  assert.match(route, /title: \{ absolute: page\.seoTitle \}/);
});

test("Freddy profile uses one canonical Person entity and a real identity sameAs", () => {
  const page = read("src/app/om-freddy/page.tsx");
  assert.match(page, /"@id": "https:\/\/www\.freddybremseth\.com\/#person"/);
  assert.match(page, /sameAs: \["https:\/\/no\.linkedin\.com\/in\/freddybremseth"\]/);
  assert.ok(!page.includes(`${BASE}/om-freddy#person`), "must not create a second Freddy Person entity");
  assert.ok(!/sameAs:\s*\[[\s\S]*zenecohomes/.test(page), "brand profile pages must not be used as sameAs identities");
});

test("magazine hub and articles keep structured discovery and next steps", () => {
  const hub = read("src/app/magasin/page.tsx");
  assert.match(hub, /"@type": "CollectionPage"/);
  assert.match(hub, /"@type": "ItemList"/);
  assert.match(hub, /Fra inspirasjon til beslutning/);
  assert.match(hub, /Oppdatert 2\. oktober 2026/);

  const article = read("src/app/magasin/[slug]/page.tsx");
  assert.match(article, /"@id": "https:\/\/www\.freddybremseth\.com\/#person"/);
  assert.match(article, /"@type": "BreadcrumbList"/);
  assert.match(article, /Fra inspirasjon til konkret neste steg/);
});

test("buying process and area hubs expose WebPage, breadcrumbs and update signals", () => {
  const process = read("src/app/kjopsprosessen/page.tsx");
  assert.match(process, /"@type": "WebPage"/);
  assert.match(process, /"@type": "ItemList"/);
  assert.match(process, /"@type": "BreadcrumbList"/);
  assert.match(process, /dateModified: "2026-10-02"/);

  const inland = read("src/app/livet-i-innlandet/page.tsx");
  assert.match(inland, /"@type": "CollectionPage"/);
  assert.match(inland, /"@type": "ItemList"/);

  const detail = read("src/app/livet-i-innlandet/[slug]/page.tsx");
  assert.match(detail, /author: \{ "@id": "https:\/\/www\.freddybremseth\.com\/#person" \}/);
  assert.match(detail, /dateModified: "2026-10-02"/);

  const region = read("src/app/omrader/[region]/page.tsx");
  assert.match(region, /"@type": "WebPage"/);
  assert.match(region, /"@type": "ItemList"/);
  assert.match(region, /"@type": "BreadcrumbList"/);
});

test("sitewide 2027 system, sitemap and project network stay connected", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /import "\.\/design-system\.css"/);
  assert.match(layout, /import "\.\/ecolife-advisor\.css"/);
  assert.match(layout, /https:\/\/www\.freddybremseth\.com\/#person/);

  const sitemap = read("src/app/sitemap.ts");
  assert.match(sitemap, /seoLandingPages/);
  assert.match(sitemap, /ecoLifeAreas/);
  assert.match(sitemap, /fetchPublishedPosts\("magasin"\)/);

  const footer = read("src/components/Footer.tsx");
  for (const url of [
    "https://www.freddybremseth.com/",
    "https://www.zenecohomes.com/",
    "https://www.donaanna.com/",
    "https://www.chatgenius.pro/",
    "https://books.freddybremseth.com/",
    "https://art.freddybremseth.com/",
    "https://remaster.freddybremseth.com/"
  ]) assert.ok(footer.includes(url), "missing project-network link " + url);
});
