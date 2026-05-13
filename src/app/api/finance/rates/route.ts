import { NextResponse } from "next/server";

export async function GET() {
  let eurNok = 11.75;
  let updatedAt = new Date().toISOString();
  let exchangeSource = "Fallback";

  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=EUR&to=NOK", {
      next: { revalidate: 60 * 60 * 6 },
    });
    if (res.ok) {
      const data = await res.json();
      eurNok = Number(data.rates?.NOK || eurNok);
      updatedAt = data.date ? `${data.date}T12:00:00.000Z` : updatedAt;
      exchangeSource = "Frankfurter / ECB";
    }
  } catch {
    // Keep fallback values so the calculator remains usable.
  }

  return NextResponse.json({
    eurNok,
    updatedAt,
    exchangeSource,
    purchaseCostRate: 0.135,
    loanAssumptions: {
      spainRate: 0.0425,
      norwayRate: 0.055,
      sourceNote:
        "Veiledende kalkulatorrenter. Faktiske lånebetingelser må bekreftes med bank, belåningsgrad, inntekt og sikkerhet.",
    },
  });
}
