"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, Send } from "lucide-react";

type Advice = { title: string; text: string; href: string };

const areaOptions = [
  { name: "Pinoso", slug: "pinoso" },
  { name: "Monóvar", slug: "monovar" },
  { name: "La Romana", slug: "la-romana" },
  { name: "Hondón de las Nieves", slug: "hondon-de-las-nieves" },
  { name: "Aspe", slug: "aspe" },
  { name: "Novelda", slug: "novelda" },
  { name: "Monforte del Cid", slug: "monforte-del-cid" },
  { name: "Biar", slug: "biar" },
  { name: "Villena", slug: "villena" },
  { name: "Sax", slug: "sax" },
  { name: "Jumilla", slug: "jumilla" },
];

const profileAdvice: Record<string, Advice> = {
  vinland: {
    title: "Se nærmere på vinlandet",
    text: "Pinoso og Jumilla er naturlige steder å sammenligne når vinlandskap, store horisonter, jord og plass skal være en tydelig del av hverdagen.",
    href: "/livet-i-innlandet#vinland",
  },
  landsby: {
    title: "Se nærmere på landsby- og finca-livet",
    text: "Monóvar, La Romana og Hondón de las Nieves gir ulike varianter av landsbyliv, privatliv og landlige eiendommer med hverdagsservice i nærheten.",
    href: "/livet-i-innlandet#landsby",
  },
  praktisk: {
    title: "Se nærmere på det praktiske innlandet",
    text: "Aspe, Novelda og Monforte del Cid er relevante når mer plass skal kombineres med enkel logistikk mot Alicante, Elche og flyplassen.",
    href: "/livet-i-innlandet#praktisk",
  },
  fjell: {
    title: "Se nærmere på fjell- og Vinalopó-innlandet",
    text: "Biar, Villena og Sax passer inn i en sammenligning når natur, lokale bymiljøer, tydeligere årstider og aktivt hverdagsliv betyr mye.",
    href: "/livet-i-innlandet#fjell",
  },
  unsure: {
    title: "Start med livet du ønsker",
    text: "Sammenlign først vinland, landsbyliv, praktisk innland og fjellområder. Når retningen er klar, blir tomt og boligvalg langt enklere.",
    href: "/livet-i-innlandet",
  },
};

const lifestyleInterestByProfile: Record<string, string> = {
  vinland: "Vinland og dyrking",
  landsby: "Landsbyliv og lokalmiljø",
  praktisk: "Enkel logistikk og flyplass",
  fjell: "Gåturer, sykkel og natur",
  unsure: "Usikker – ønsker rådgivning",
};

function adviceForArea(area: string): Advice | null {
  const match = areaOptions.find((item) => item.name === area);
  if (!match) return null;
  return {
    title: `Utforsk livet i ${match.name}`,
    text: `Du har allerede pekt ut ${match.name}. Neste steg er å se om hverdagen, tomtene og den praktiske beliggenheten faktisk passer det livet du ønsker.`,
    href: `/livet-i-innlandet/${match.slug}`,
  };
}

export function BuyerMatchQuiz() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [result, setResult] = useState<Advice>(profileAdvice.unsure);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    const preferredArea = data.preferred_area || "Åpen for forslag";
    const profile = data.profile || "unsure";
    setResult(adviceForArea(preferredArea) || profileAdvice[profile] || profileAdvice.unsure);

    const message = [
      `Eco Life-match: ${data.goal || "Ikke valgt"}`,
      `Ønsket hverdag: ${data.profile_label || "Ikke valgt"}`,
      `Bruk av tomten: ${data.land_use || "Ikke valgt"}`,
      `Reise/logistikk: ${data.travel || "Ikke valgt"}`,
      `Vedlikehold: ${data.maintenance || "Ikke valgt"}`,
      data.message ? `Kommentar: ${data.message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        preferred_area: preferredArea,
        lifestyle_interest: lifestyleInterestByProfile[profile] || lifestyleInterestByProfile.unsure,
        message,
        page_url: window.location.href,
        source: "pinosoecolife-eco-life-match",
        request_type: `Eco Life-match – ${profile}`,
      }),
    });

    if (res.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
    }
  }

  return (
    <section className="section buyer-match" id="boligmatch">
      <div className="section-heading">
        <p className="eyebrow">Eco Life-match</p>
        <h2>Hvilken type innlandsliv passer det du ser for deg?</h2>
        <p>
          Start med hverdagen, plassen og hvordan du vil bruke eiendommen. Deretter kan vi snevre inn område, tomt og boligmodell.
        </p>
      </div>
      <div className="quiz-layout">
        <form className="quiz-form" onSubmit={onSubmit}>
          <div className="form-grid">
            <label>
              Hva er målet?
              <select name="goal" defaultValue="Tomt og bygging">
                <option>Tomt og bygging</option>
                <option>Moderne villa / nybygg</option>
                <option>Finca eller landsted</option>
                <option>Flytting til Spania</option>
                <option>Pensjon / lengre opphold</option>
                <option>Feriebolig med mye uteplass</option>
              </select>
            </label>
            <label>
              Har du allerede et område i tankene?
              <select name="preferred_area" defaultValue="Åpen for forslag">
                <option>Åpen for forslag</option>
                {areaOptions.map((area) => <option key={area.slug}>{area.name}</option>)}
              </select>
            </label>
          </div>

          <label>
            Hvilken hverdag frister mest?
            <select name="profile" defaultValue="unsure" onChange={(event) => {
              const select = event.currentTarget;
              const labelInput = select.form?.elements.namedItem("profile_label") as HTMLInputElement | null;
              if (labelInput) labelInput.value = select.options[select.selectedIndex]?.text || "";
            }}>
              <option value="unsure">Usikker – jeg vil sammenligne</option>
              <option value="vinland">Vinland, dyrking og store horisonter</option>
              <option value="landsby">Landsbyliv, ro og privatliv</option>
              <option value="praktisk">Mer plass med enkel logistikk og flyplass</option>
              <option value="fjell">Fjell, natur og et aktivt hverdagsliv</option>
            </select>
            <input type="hidden" name="profile_label" defaultValue="Usikker – jeg vil sammenligne" />
          </label>

          <div className="form-grid">
            <label>
              Hva vil du bruke plassen til?
              <select name="land_use" defaultValue="Privatliv og gode uteområder">
                <option>Privatliv og gode uteområder</option>
                <option>Kjøkkenhage og frukttrær</option>
                <option>Vinranker, oliven eller mandler</option>
                <option>Familie, gjester og bassengliv</option>
                <option>Dyr / høner der reglene tillater det</option>
                <option>Sykkel, tur og natur</option>
                <option>Minst mulig vedlikehold</option>
              </select>
            </label>
            <label>
              Budsjett
              <input name="budget" placeholder="f.eks 350 000 EUR" />
            </label>
          </div>

          <div className="form-grid">
            <label>
              Hvor viktig er enkel reise til flyplass/by?
              <select name="travel" defaultValue="Viktig, men ikke avgjørende">
                <option>Svært viktig</option>
                <option>Viktig, men ikke avgjørende</option>
                <option>Jeg prioriterer ro og plass høyere</option>
              </select>
            </label>
            <label>
              Hvor mye vedlikehold ønsker du?
              <select name="maintenance" defaultValue="Noe hage og uteprosjekter er fint">
                <option>Minst mulig</option>
                <option>Noe hage og uteprosjekter er fint</option>
                <option>Jeg ønsker aktivt å dyrke og utvikle tomten</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              Min. soverom
              <input name="bedrooms" min="1" type="number" placeholder="2" />
            </label>
            <label>
              Tidslinje
              <select name="timeline" defaultValue="6-12 mnd">
                <option>Klar nå</option>
                <option>Innen 3 mnd</option>
                <option>6-12 mnd</option>
                <option>Planlegger fremtidig flytting/pensjon</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              Navn
              <input name="name" required placeholder="Ditt navn" />
            </label>
            <label>
              E-post
              <input name="email" required type="email" placeholder="din@epost.no" />
            </label>
          </div>
          <label>
            Kommentar
            <textarea name="message" rows={4} placeholder="Fortell gjerne hva du drømmer om å gjøre med stedet." />
          </label>
          <button className="submit-button" disabled={status === "sending"}>
            <Send size={18} />
            {status === "sending" ? "Sender..." : "Få en første retning"}
          </button>
          {status === "sent" && <p className="form-success">Takk. Vi har mottatt Eco Life-profilen din og viser en første retning her.</p>}
          {status === "error" && <p className="form-error">Noe gikk galt. Prøv igjen om litt.</p>}
        </form>
        <aside className="quiz-result">
          <CheckCircle2 />
          <p className="eyebrow">Første retning</p>
          <h3>{result.title}</h3>
          <p>{result.text}</p>
          <a className="text-button" href={result.href}>
            Utforsk områdene <ArrowRight size={18} />
          </a>
        </aside>
      </div>
    </section>
  );
}
