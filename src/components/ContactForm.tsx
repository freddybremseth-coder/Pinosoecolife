"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { ecoLifeAreas } from "@/lib/ecolife-areas";

const standardAreas = [...ecoLifeAreas.map((area) => area.name), "Åpen for forslag"];

const lifestyleInterests = [
  "Privatliv og ro",
  "Hage og mer selvberget liv",
  "Vinland og dyrking",
  "Gåturer, sykkel og natur",
  "Familie, gjester og store uteområder",
  "Enkel logistikk og flyplass",
  "Landsbyliv og lokalmiljø",
  "Usikker – ønsker rådgivning",
];

type ContactFormProps = {
  source?: string;
  propertyRef?: string;
  propertyTitle?: string;
  requestType?: string;
  preferredArea?: string;
  lifestyleIntent?: string;
};

export function ContactForm({
  source = "pinosoecolife-next",
  propertyRef,
  propertyTitle,
  requestType = "general",
  preferredArea,
  lifestyleIntent,
}: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const areaOptions = preferredArea && !standardAreas.includes(preferredArea)
    ? [preferredArea, ...standardAreas]
    : standardAreas;
  const selectedArea = preferredArea || "Åpen for forslag";
  const selectedLifestyle = lifestyleIntent && lifestyleInterests.includes(lifestyleIntent)
    ? lifestyleIntent
    : "";
  const isPropertyInquiry = Boolean(propertyRef || propertyTitle);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        source,
        property_ref: propertyRef,
        property_title: propertyTitle,
        request_type: requestType,
        page_url: window.location.href,
      }),
    });

    if (res.ok) {
      setStatus("sent");
      form.reset();
    } else {
      setStatus("error");
    }
  }

  return (
    <form className="lead-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>
          Navn
          <input name="name" required placeholder="Ditt navn" />
        </label>
        <label>
          Telefon
          <input name="phone" placeholder="+47..." />
        </label>
      </div>

      <label>
        E-post
        <input name="email" type="email" required placeholder="din@epost.no" />
      </label>

      {isPropertyInquiry ? (
        <input type="hidden" name="preferred_area" value={selectedArea} />
      ) : (
        <>
          <div className="form-grid">
            <label>
              Område
              <select name="preferred_area" defaultValue={selectedArea}>
                {areaOptions.map((area) => <option key={area}>{area}</option>)}
              </select>
            </label>
            <label>
              Budsjett
              <input name="budget" placeholder="f.eks 350 000" />
            </label>
          </div>
          <label>
            Hva betyr mest for deg i innlandet?
            <select name="lifestyle_interest" defaultValue={selectedLifestyle}>
              <option value="">Ikke valgt</option>
              {lifestyleInterests.map((interest) => <option key={interest}>{interest}</option>)}
            </select>
          </label>
        </>
      )}

      <label>
        {isPropertyInquiry ? "Hva vil du vite?" : "Hva ser du etter?"}
        <textarea
          name="message"
          rows={isPropertyInquiry ? 4 : 5}
          placeholder={
            propertyTitle
              ? `Jeg ønsker prospekt, plantegning eller visning for ${propertyTitle}.`
              : "Fortell kort om ønsker, område, livsstil og behov."
          }
        />
      </label>

      <details className="lead-form-details">
        <summary>Flere detaljer – valgfritt</summary>
        <div className="lead-form-details-content">
          {isPropertyInquiry && (
            <div className="form-grid">
              <label>
                Budsjett
                <input name="budget" placeholder="f.eks 350 000" />
              </label>
              <label>
                Hva betyr mest for deg?
                <select name="lifestyle_interest" defaultValue={selectedLifestyle}>
                  <option value="">Ikke valgt</option>
                  {lifestyleInterests.map((interest) => <option key={interest}>{interest}</option>)}
                </select>
              </label>
            </div>
          )}

          {!isPropertyInquiry && (
            <div className="form-grid">
              <label>
                Boligtype
                <select name="property_type" defaultValue="">
                  <option value="">Ikke valgt</option>
                  <option>Nybygg</option>
                  <option>Tomt og bygging</option>
                  <option>Villa</option>
                  <option>Finca / landsted</option>
                  <option>Leilighet</option>
                  <option>Rekkehus</option>
                </select>
              </label>
              <label>
                Min. soverom
                <input name="bedrooms" type="number" min="1" placeholder="2" />
              </label>
            </div>
          )}

          <div className="form-grid">
            <label>
              Tidslinje
              <select name="timeline" defaultValue="">
                <option value="">Ikke valgt</option>
                <option>Klar nå</option>
                <option>Innen 3 mnd</option>
                <option>6-12 mnd</option>
                <option>Planlegger fremtidig pensjon</option>
              </select>
            </label>
            <label>
              Bruk av boligen
              <select name="purchase_goal" defaultValue="">
                <option value="">Ikke valgt</option>
                <option>Feriebolig</option>
                <option>Pensjon / lengre opphold</option>
                <option>Investering og utleie</option>
                <option>Flytting til Spania</option>
                <option>Tomt og bygging</option>
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              Finansiering
              <select name="financing_status" defaultValue="">
                <option value="">Ikke valgt</option>
                <option>Finansiering klar</option>
                <option>Trenger låneavklaring</option>
                <option>Skal selge bolig først</option>
                <option>Ikke avklart ennå</option>
              </select>
            </label>
            <label>
              Spania-erfaring
              <select name="spain_experience" defaultValue="">
                <option value="">Ikke valgt</option>
                <option>Har vært i området før</option>
                <option>Har kjøpt i Spania før</option>
                <option>Første gang vi vurderer Spania</option>
                <option>Usikker på område</option>
              </select>
            </label>
          </div>

          <label>
            Ønsket neste steg
            <select name="next_step" defaultValue="">
              <option value="">Ikke valgt</option>
              <option>Få shortlist</option>
              <option>Få komplett prospekt</option>
              <option>Digital visning</option>
              <option>Planlegge Spania-tur</option>
              <option>Avklaringssamtale</option>
            </select>
          </label>
        </div>
      </details>

      <button className="submit-button" disabled={status === "sending"}>
        <Send size={18} />
        {status === "sending"
          ? "Sender..."
          : isPropertyInquiry
            ? "Be om prospekt / visning"
            : "Send forespørsel"}
      </button>
      {status === "sent" && <p className="form-success">Takk. Vi har mottatt forespørselen din.</p>}
      {status === "error" && <p className="form-error">Noe gikk galt. Prøv igjen eller send e-post direkte.</p>}
    </form>
  );
}

