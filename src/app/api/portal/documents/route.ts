import { NextResponse } from "next/server";

const REALTYFLOW_BASE = process.env.REALTYFLOW_BASE_URL || "https://realtyflow.chatgenius.pro";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization") || "";

  const res = await fetch(`${REALTYFLOW_BASE}/api/portal/documents`, {
    headers: {
      Authorization: authorization,
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
