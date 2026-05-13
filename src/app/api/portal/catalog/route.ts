import { NextResponse } from "next/server";
import { getLandPlots, getProperties } from "@/lib/realtyflow";

export async function GET() {
  const [properties, plots] = await Promise.all([getProperties(), getLandPlots()]);
  return NextResponse.json({ properties, plots });
}
