import { NextRequest, NextResponse } from "next/server";
import { submitIndexNow } from "@/lib/indexnow";

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isAuthorized(request: NextRequest) {
  const expected =
    process.env.REALTYFLOW_CMS_SECRET ||
    process.env.WEBSITE_CMS_SECRET_PINOSOECOLIFE ||
    process.env.INDEXNOW_WEBHOOK_SECRET ||
    "";
  if (!expected) return false;

  const headerSecret = cleanString(request.headers.get("x-realtyflow-secret"));
  const authorization = cleanString(request.headers.get("authorization"));
  const bearer = authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : "";

  return headerSecret === expected || bearer === expected;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const values = [
    ...(Array.isArray(body.urls) ? body.urls : []),
    ...(body.url ? [body.url] : []),
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  if (!values.length) {
    return NextResponse.json({ error: "url or urls is required" }, { status: 400 });
  }

  const result = await submitIndexNow(values);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
