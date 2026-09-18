const BASE = "https://www.pinosoecolife.com";
const HOST = "www.pinosoecolife.com";
export const INDEXNOW_KEY = "219cdc0a09cc2dd06d65ca7df6e42840";
export const INDEXNOW_KEY_LOCATION = `${BASE}/${INDEXNOW_KEY}.txt`;

function normalizeUrl(value: string) {
  try {
    const url = new URL(value, BASE);
    if (url.hostname !== HOST && url.hostname !== "pinosoecolife.com") return null;
    url.protocol = "https:";
    url.hostname = HOST;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export async function submitIndexNow(values: string[]) {
  const urlList = Array.from(
    new Set(values.map((value) => normalizeUrl(value)).filter((value): value is string => Boolean(value))),
  ).slice(0, 10000);

  if (!urlList.length) {
    return { ok: true, submitted: 0, status: 204, urlList: [] as string[] };
  }

  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: INDEXNOW_KEY_LOCATION,
        urlList,
      }),
      cache: "no-store",
    });

    const ok = response.status === 200 || response.status === 202;
    if (!ok) {
      console.warn("[IndexNow] Submission failed", {
        status: response.status,
        urls: urlList,
      });
    }

    return {
      ok,
      submitted: urlList.length,
      status: response.status,
      urlList,
    };
  } catch (error) {
    console.warn("[IndexNow] Submission error", error);
    return {
      ok: false,
      submitted: 0,
      status: 0,
      urlList,
    };
  }
}
