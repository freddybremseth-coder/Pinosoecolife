"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type ContactFormProps = {
  source?: string;
  propertyRef?: string;
  propertyTitle?: string;
  requestType?: string;
};

export function ContactForm({
  source = "pinosoecolife-next",
  propertyRef,
  propertyTitle,
  requestType = "general",
}: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, source, property_ref: propertyRef, property_title: propertyTitle, request_type: requestType }),
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
      <div className="form-grid">
        <label>
          Område
          <select name="preferred_area" defaultValue="Pinoso">
            <option>Pinoso</option>
            <option>Aspe og Monforte del Cid</option>
            <option>Hondon-dalen</option>
            <option>Åpen for forslag</option>
          </select>
        </label>
        <label>
          Budsjett
          <input name="budget" placeholder="f.eks 350 000" />
        </label>
      </div>
      <div className="form-grid">
        <label>
          Boligtype
          <select name="property_type" defaultValue="Nybygg">
            <option>Nybygg</option>
            <option>Villa</option>
            <option>Leilighet</option>
            <option>Rekkehus</option>
          </select>
        </label>
        <label>
          Min. soverom
          <input name="bedrooms" type="number" min="1" placeholder="2" />
        </label>
      </div>
      <label>
        Tidslinje
        <select name="timeline" defaultValue="Innen 3 mnd">
          <option>Klar nå</option>
          <option>Innen 3 mnd</option>
          <option>6-12 mnd</option>
          <option>Planlegger fremtidig pensjon</option>
        </select>
      </label>
      <div className="form-grid">
        <label>
          Bruk av boligen
          <select name="purchase_goal" defaultValue="Feriebolig">
            <option>Feriebolig</option>
            <option>Pensjon / lengre opphold</option>
            <option>Investering og utleie</option>
            <option>Flytting til Spania</option>
            <option>Tomt og bygging</option>
          </select>
        </label>
        <label>
          Finansiering
          <select name="financing_status" defaultValue="Ikke avklart ennå">
            <option>Finansiering klar</option>
            <option>Trenger låneavklaring</option>
            <option>Skal selge bolig først</option>
            <option>Ikke avklart ennå</option>
          </select>
        </label>
      </div>
      <div className="form-grid">
        <label>
          Spania-erfaring
          <select name="spain_experience" defaultValue="Har vært i området før">
            <option>Har vært i området før</option>
            <option>Har kjøpt i Spania før</option>
            <option>Første gang vi vurderer Spania</option>
            <option>Usikker på område</option>
          </select>
        </label>
        <label>
          Ønsket neste steg
          <select name="next_step" defaultValue="Få shortlist">
            <option>Få shortlist</option>
            <option>Digital visning</option>
            <option>Planlegge Spania-tur</option>
            <option>Avklaringssamtale</option>
          </select>
        </label>
      </div>
      <label>
        Hva ser du etter?
        <textarea
          name="message"
          rows={5}
          placeholder={
            propertyTitle
              ? `Jeg ønsker komplett tilbud/prospekt for ${propertyTitle}.`
              : "Fortell kort om ønsker, område, livsstil og behov."
          }
        />
      </label>
      <button className="submit-button" disabled={status === "sending"}>
        <Send size={18} />
        {status === "sending" ? "Sender..." : "Send forespørsel"}
      </button>
      {status === "sent" && <p className="form-success">Takk. Vi har mottatt forespørselen din.</p>}
      {status === "error" && <p className="form-error">Noe gikk galt. Prøv igjen eller send e-post direkte.</p>}
    </form>
  );
}
