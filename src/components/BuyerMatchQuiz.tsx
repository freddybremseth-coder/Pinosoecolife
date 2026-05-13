"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Send } from "lucide-react";

const areaAdvice: Record<string, { title: string; text: string; href: string }> = {
  Pinoso: {
    title: "Pinoso passer ofte best",
    text: "Du prioriterer store tomter, ro, lokalt hverdagsliv, god verdi og mulighet for moderne villa med privatliv.",
    href: "/tomter?region=pinoso",
  },
  "Aspe og Monforte del Cid": {
    title: "Aspe og Monforte kan være riktig balanse",
    text: "Du får inland-følelse, tomtemuligheter og kortere vei mot Alicante, golf og større servicetilbud.",
    href: "/tomter?q=Aspe",
  },
  "Hondon-dalen": {
    title: "Hondon-dalen bør vurderes",
    text: "Dette passer godt hvis du vil ha dal, utsikt, landsbyliv og store tomter i rolige omgivelser.",
    href: "/tomter?q=Hondon",
  },
  "Usikker": {
    title: "Vi bør starte med områdevalget",
    text: "Når du er usikker på område, er riktig første steg å sammenligne livsstil, reisevei, prisnivå og bruk gjennom året.",
    href: "/omrader",
  },
};

export function BuyerMatchQuiz() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resultArea, setResultArea] = useState("Usikker");

  const result = useMemo(() => areaAdvice[resultArea] || areaAdvice.Usikker, [resultArea]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    const preferredArea = data.preferred_area || "Usikker";
    setResultArea(preferredArea);

    const message = [
      `Boligmatch-quiz: ${data.goal || "Ikke valgt"}`,
      `Viktigst: ${data.priority || "Ikke valgt"}`,
      `Strand/golf/ro: ${data.lifestyle || "Ikke valgt"}`,
      `Flyplass: ${data.airport || "Ikke valgt"}`,
      `Utleie: ${data.rental || "Ikke valgt"}`,
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
        message,
        source: "pinosoecolife-buyer-match",
        request_type: "Finn riktig område og bolig",
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
        <p className="eyebrow">Boligmatch</p>
        <h2>Finn riktig område, tomt og boligtype på 2 minutter</h2>
        <p>
          Svar på noen få spørsmål, så får RealtyFlow et bedre grunnlag for shortlist, oppfølging og anbefalte neste steg.
        </p>
      </div>
      <div className="quiz-layout">
        <form className="quiz-form" onSubmit={onSubmit}>
          <div className="form-grid">
            <label>
              Hva er målet?
              <select name="goal" defaultValue="Feriebolig">
                <option>Feriebolig</option>
                <option>Pensjon / lengre opphold</option>
                <option>Investering og utleie</option>
                <option>Flytting til Spania</option>
                <option>Tomt og bygging</option>
              </select>
            </label>
            <label>
              Foretrukket område
              <select name="preferred_area" defaultValue="Usikker">
                <option>Pinoso</option>
                <option>Aspe og Monforte del Cid</option>
                <option>Hondon-dalen</option>
                <option>Usikker</option>
              </select>
            </label>
          </div>
          <div className="form-grid">
            <label>
              Viktigst for deg
              <select name="priority" defaultValue="Trygg kjøpsprosess">
                <option>Trygg kjøpsprosess</option>
                <option>Mest bolig for pengene</option>
                <option>Stor tomt og privatliv</option>
                <option>Nærhet til Alicante</option>
                <option>Rolig livsstil</option>
              </select>
            </label>
            <label>
              Livsstil
              <select name="lifestyle" defaultValue="Strand og restauranter">
                <option>Strand og restauranter</option>
                <option>Golf og resort</option>
                <option>Ro, natur og plass</option>
                <option>Helårsby med service</option>
              </select>
            </label>
          </div>
          <div className="form-grid">
            <label>
              Budsjett
              <input name="budget" placeholder="f.eks 350 000 EUR" />
            </label>
            <label>
              Soverom
              <input name="bedrooms" min="1" type="number" placeholder="2" />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Flyplassavstand
              <select name="airport" defaultValue="Maks 60 min">
                <option>Maks 45 min</option>
                <option>Maks 60 min</option>
                <option>Inntil 90 min er ok</option>
              </select>
            </label>
            <label>
              Utleie
              <select name="rental" defaultValue="Usikker">
                <option>Viktig</option>
                <option>Ikke viktig</option>
                <option>Usikker</option>
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
            <textarea name="message" rows={4} placeholder="Skriv gjerne dato for Spania-tur, område du vurderer eller spesielle krav." />
          </label>
          <button className="submit-button" disabled={status === "sending"}>
            <Send size={18} />
            {status === "sending" ? "Sender..." : "Få anbefaling"}
          </button>
          {status === "sent" && <p className="form-success">Takk. Vi har sendt svarene til RealtyFlow og viser en første anbefaling her.</p>}
          {status === "error" && <p className="form-error">Noe gikk galt. Prøv igjen om litt.</p>}
        </form>
        <aside className="quiz-result">
          <CheckCircle2 />
          <p className="eyebrow">Foreløpig anbefaling</p>
          <h3>{result.title}</h3>
          <p>{result.text}</p>
          <a className="text-button" href={result.href}>
            Se aktuelle boliger <ArrowRight size={18} />
          </a>
        </aside>
      </div>
    </section>
  );
}
