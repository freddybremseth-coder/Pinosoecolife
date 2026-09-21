import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { safeDiscoverySource, safePublicDiscoveryPath } from "../src/lib/seo-discovery.ts";

test("Pinoso reports exact search/AI sources without personal referrer URLs", () => {
  const cases = [
    ["https://www.google.com/search?q=secret&email=person@example.com", "google_search", "www.google.com"],
    ["https://www.google.es/search?q=secret", "google_search", "www.google.es"],
    ["https://www.google.co.uk/search?q=secret", "google_search", "www.google.co.uk"],
    ["https://gemini.google.com/app/private-conversation", "google_gemini", "gemini.google.com"],
    ["https://www.bing.com/search?q=secret", "bing_search", "www.bing.com"],
    ["https://chatgpt.com/c/private-conversation", "chatgpt", "chatgpt.com"],
    ["https://copilot.microsoft.com/chat/private", "microsoft_copilot", "copilot.microsoft.com"],
    ["https://www.perplexity.ai/search/private", "perplexity", "www.perplexity.ai"],
    ["https://search.brave.com/search?q=private", "brave_search", "search.brave.com"],
    ["https://duckduckgo.com/?q=private", "duckduckgo", "duckduckgo.com"],
  ];
  for (const [url, source, host] of cases) {
    const result = safeDiscoverySource(url);
    assert.deepEqual(result, { source, host, referrer: "https://" + host + "/" });
    assert.ok(!JSON.stringify(result).includes("secret"));
    assert.ok(!JSON.stringify(result).includes("private"));
  }
});
test("reject spoofed hosts, credentials, insecure sources and non-public paths", () => {
  for (const referrer of [
    "", "not a URL", "https://notgoogle.com/", "https://google.com.evil.invalid/",
    "https://fakechatgpt.com/", "https://evil-google.com/", "https://gemini.google.com.evil.invalid/",
    "http://www.google.com/search?q=secret", "https://user:pass@google.com/",
    "https://google.com:8443/", "javascript:alert(1)",
  ]) assert.equal(safeDiscoverySource(referrer), null, referrer);
  for (const pathname of [
    "", "//evil.invalid", "/api/contact", "/admin/private", "/account",
    "/min-side", "/checkout", "/crm/people", "/eiendommer/user@example.com",
    "/eiendommer/%40example.com", "/eiendommer/%2fsecret", "/eiendommer/x?email=private",
    "/a".repeat(130),
  ]) assert.equal(safePublicDiscoveryPath(pathname), null, pathname);
  for (const pathname of ["/", "/eiendommer", "/eiendommer/N9950", "/omrader/pinoso", "/magasin"]) {
    assert.equal(safePublicDiscoveryPath(pathname), pathname);
  }
});
test("server and client only acknowledge persisted central or shared database arrivals", () => {
  const route=readFileSync(new URL("../src/app/api/discovery-event/route.ts",import.meta.url),"utf8");
  const tracker=readFileSync(new URL("../src/components/SearchDiscoveryTracker.tsx",import.meta.url),"utf8");
  assert.match(tracker,/if \(response\.status !== 204\) return;/);
  assert.match(tracker,/sessionStorage\.setItem\(storageKey, "1"\)/);
  assert.ok(tracker.indexOf("if (response.status !== 204) return;") < tracker.indexOf('sessionStorage.setItem(storageKey, "1")'));
  assert.match(route,/if \(sharesRealtyFlowDatabase\(\)\) \{/);
  assert.match(route,/if \(error\) \{[\s\S]*?return storageUnavailable\(\)/);
  assert.match(route,/if \(central\.status !== 204\) \{[\s\S]*?return storageUnavailable\(\)/);
  assert.match(route,/if \(supabase\) \{[\s\S]*?Optional local mirror/);
  assert.match(route,/return new NextResponse\(null, \{ status: 204/);
});
