"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type LeadInfo = { name: string; email: string; phone: string; need: string };
type ChatMessage = { role: "assistant" | "user"; text: string };

function createAdvisorReply(text: string) {
  const lower = text.toLowerCase();

  if (lower.includes("tomt") || lower.includes("bygge")) {
    return "Da bør vi starte med området og deretter kontrollere den konkrete tomten: planstatus, byggbarhet, registrering, adkomst, vann, strøm, avløp, terreng og hvordan du faktisk vil bruke plassen. Hvilken type hverdag ønsker du – vinland, landsby/finca, fjell/natur eller enklere logistikk mot Alicante og Elche?";
  }

  if (lower.includes("invest") || lower.includes("utleie") || lower.includes("leie")) {
    return "Hvis utleie er viktig, bør vi skille egen bruk fra forventet leieinntekt. Beliggenhet, etterspørsel, sesong, kostnader og gjeldende regler eller lisenser der det er relevant må vurderes konkret før du legger inntekt til grunn for kjøpet. Hvor mye skal boligen brukes av deg selv?";
  }

  if (lower.includes("pinoso") || lower.includes("vingård") || lower.includes("vingard") || lower.includes("vinland")) {
    return "Da bør vi sammenligne Pinoso, Monóvar og eventuelt Jumilla. De gir ulike grader av vinland, byservice og avstand, men fellesnevneren er mer plass og et tydelig innlandsliv. Er egne druer, hage eller stor tomt en del av planen?";
  }

  if (lower.includes("jumilla") || lower.includes("druer") || lower.includes("vin")) {
    return "Vininteressen gjør Pinoso, Monóvar og Jumilla naturlige å sammenligne. Jumilla er et tydeligere og dypere innlandsvalg, mens Pinoso og Monóvar gir andre kombinasjoner av service, internasjonalt miljø og landlig eiendom.";
  }

  if (lower.includes("biar") || lower.includes("sax") || lower.includes("fjell") || lower.includes("sykkel") || lower.includes("natur")) {
    return "Da ville jeg sett nærmere på Biar, Sax og også Villena som praktisk base. Her blir fjell, tur, sykkel og tydeligere årstider en større del av hverdagen enn i de lavere vinområdene.";
  }

  if (lower.includes("hondon") || lower.includes("hondón") || lower.includes("la romana") || lower.includes("monovar") || lower.includes("monóvar") || lower.includes("landsby")) {
    return "Det peker mot landsby- og finca-sporet. Hondón de las Nieves, La Romana og Monóvar gir forskjellige kombinasjoner av lokalmiljø, vinmarker, uteplass og daglig service. Hvor viktig er et etablert internasjonalt miljø for deg?";
  }

  if (lower.includes("aspe") || lower.includes("monforte") || lower.includes("novelda") || lower.includes("alicante") || lower.includes("flyplass")) {
    return "Da bør vi sammenligne Aspe, Novelda og Monforte del Cid. De passer bedre når du vil ha mer plass og innlandsfølelse, men fortsatt prioriterer enkel logistikk mot Alicante, Elche og flyplassen.";
  }

  if (lower.includes("kost") || lower.includes("skatt") || lower.includes("pris")) {
    return "Jeg vil ikke bruke én fast prosent for kjøpskostnader. Skatter og øvrige kostnader varierer blant annet med om boligen er ny eller brukt, region, pris og hvilke tjenester handelen krever. Når vi har en konkret tomt eller bolig kan kostnadsbildet beregnes langt mer presist.";
  }

  if (lower.includes("hage") || lower.includes("selvberget") || lower.includes("selvforsynt") || lower.includes("høner") || lower.includes("honer")) {
    return "Da bør tomten vurderes ut fra mer enn størrelse: vann, jord, sol, vind, terreng og hvor mye vedlikehold du faktisk ønsker. Dyrking eller dyrehold må også vurderes mot den konkrete eiendommen og lokale regler. Vil du ha et lite, enkelt prosjekt eller la tomten bli en stor del av hverdagen?";
  }

  return "For å finne riktig retning trenger jeg først å forstå hvordan du vil leve: privatliv, hage og dyrking, vinland, sykkel/natur, familieplass, landsbyliv eller enkel logistikk. Deretter ser vi på område, budsjett, tidslinje og til slutt tomt eller bolig.";
}

export function PinosoChatbot() {
  const [open, setOpen] = useState(false);
  const [lead, setLead] = useState<LeadInfo | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hei. Jeg kan hjelpe deg å sortere livsstil, område, tomt og bolig i innlandet i Alicante og Murcia. Fortell først litt om hva du ser for deg, så sender jeg ønskene dine videre til Freddy i RealtyFlow.",
    },
  ]);

  async function captureLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const nextLead = {
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      need: data.need || "",
    };
    setLead(nextLead);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: nextLead.need },
      {
        role: "assistant",
        text: "Takk. Jeg har sendt forespørselen til RealtyFlow. Neste spørsmål er ikke bare hvilken bolig du vil ha, men hvordan du ønsker å leve: mer plass og privatliv, hage/dyrking, vinland, natur/aktivitet, landsbyliv eller enkel logistikk?",
      },
    ]);
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...nextLead,
        source: "pinosoecolife-chatbot",
        request_type: "Eco Life-rådgivning via chatbot",
        message: nextLead.need,
        page_url: window.location.href,
      }),
    }).catch(() => {});
    form.reset();
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    const reply = createAdvisorReply(text);
    setMessages((prev) => [...prev, { role: "user", text }, { role: "assistant", text: reply }]);
  }

  return (
    <div className="chatbot-shell">
      {open && (
        <section className="chatbot-panel">
          <header>
            <div>
              <strong>Eco Life-rådgiver</strong>
              <span>Livsstil · områder · tomter · boliger</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Lukk chat">
              <X size={18} />
            </button>
          </header>
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <p className={message.role} key={`${message.role}-${index}`}>{message.text}</p>
            ))}
          </div>
          {!lead ? (
            <form className="chatbot-form" onSubmit={captureLead}>
              <input name="name" placeholder="Navn" required />
              <input name="email" placeholder="E-post" required type="email" />
              <input name="phone" placeholder="Telefon" required />
              <textarea name="need" placeholder="Hvordan ønsker du å leve – og hva ser du etter?" required />
              <button type="submit"><Send size={15} /> Start rådgivning</button>
            </form>
          ) : (
            <form className="chatbot-input" onSubmit={sendMessage}>
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Spør om område, tomt eller bolig" />
              <button type="submit" aria-label="Send"><Send size={16} /></button>
            </form>
          )}
        </section>
      )}
      <button className="chatbot-toggle" type="button" onClick={() => setOpen((value) => !value)}>
        <MessageCircle size={22} />
      </button>
    </div>
  );
}
