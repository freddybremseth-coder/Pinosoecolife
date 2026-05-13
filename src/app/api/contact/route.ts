import { NextResponse } from "next/server";
import { sendLead } from "@/lib/realtyflow";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email) {
      return NextResponse.json({ error: "Navn og e-post er påkrevd" }, { status: 400 });
    }

    await sendLead({
      name: String(body.name),
      email: String(body.email),
      phone: body.phone ? String(body.phone) : undefined,
      preferred_area: body.preferred_area ? String(body.preferred_area) : undefined,
      budget: body.budget ? String(body.budget) : undefined,
      property_type: body.property_type ? String(body.property_type) : undefined,
      bedrooms: body.bedrooms ? String(body.bedrooms) : undefined,
      timeline: body.timeline ? String(body.timeline) : undefined,
      purchase_goal: body.purchase_goal ? String(body.purchase_goal) : undefined,
      financing_status: body.financing_status ? String(body.financing_status) : undefined,
      spain_experience: body.spain_experience ? String(body.spain_experience) : undefined,
      next_step: body.next_step ? String(body.next_step) : undefined,
      message: body.message ? String(body.message) : undefined,
      source: body.source ? String(body.source) : "pinosoecolife-next",
      property_ref: body.property_ref ? String(body.property_ref) : undefined,
      property_title: body.property_title ? String(body.property_title) : undefined,
      request_type: body.request_type ? String(body.request_type) : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kunne ikke sende forespørsel" },
      { status: 500 },
    );
  }
}
