"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

type LeadInfo = { name: string; email: string; phone: string; need: string };
type ChatMessage = { role: "assistant" | "user"; text: string };

function createAdvisorReply(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("tomt") || lower.includes("bygge")) {
    return "Da bør vi vurdere tomt på en annen måte enn bolig: regulering, vann, strøm, adkomst, grunnforhold, byggekost og avstand til service. Vil du ha rolig innland/Pinoso, eller tomt nærmere kysten?";
  }
  if (lower.includes("invest") || lower.includes("utleie") || lower.includes("leie")) {
    return "For investering bør vi ikke bare se på pris. Vi bør vurdere turistlisens, sesong, område, konkurranse, felleskostnader og hvem boligen passer for. Hva er viktigst: trygg utleie, verdistigning eller egen bruk?";
  }
  if (lower.includes("pinoso") || lower.includes("vingård") || lower.includes("vingard")) {
    return "Det peker mot Pinoso. Der bør vi sammenligne tomtestørrelse, vann, strøm, adkomst, utsikt, avstand til service og hva som kan bygges.";
  }
  if (lower.includes("aspe") || lower.includes("monforte") || lower.includes("golf") || lower.includes("alicante")) {
    return "Det peker mot Aspe eller Monforte del Cid. Der får du ofte god balanse mellom tomt, golf/service og kortere vei til Alicante.";
  }
  if (lower.includes("kost") || lower.includes("skatt") || lower.includes("pris")) {
    return "Som tommelfingerregel bør du beregne ca. 13,5% ekstra på kjøpesummen til skatt og kjøpskostnader. Vi bør også sjekke betalingsplan, hva som er inkludert, møbler, basseng og løpende kostnader.";
  }
  return "For å gi en god anbefaling trenger jeg mål med kjøpet, budsjett, område, soverom, om du vil ha basseng/nær sjø/golf, og når du tidligst kan reise til Spania. Da kan Freddy lage en konkret shortlist.";
}

export function PinosoChatbot() {
  const [open, setOpen] = useState(false);
  const [lead, setLead] = useState<LeadInfo | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hei, jeg kan hjelpe deg å finne riktig tomt, område eller bolig i Pinoso-regionen. Først tar jeg kontaktinfo, så kan jeg stille bedre spørsmål og sende ønskene dine til Freddy i RealtyFlow.",
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
        text: "Takk. Jeg har lagret forespørselen i RealtyFlow. Hva er viktigst for deg nå: feriebolig, pensjon, investering, flytting eller tomt/bygging?",
      },
    ]);
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...nextLead,
        source: "pinosoecolife-chatbot",
        request_type: "Chatbot lead",
        message: nextLead.need,
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
              <strong>Pinoso Eco rådgiver</strong>
              <span>Boliger, tomter og kjøpsprosess</span>
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
              <textarea name="need" placeholder="Hva ser du etter?" required />
              <button type="submit"><Send size={15} /> Start rådgivning</button>
            </form>
          ) : (
            <form className="chatbot-input" onSubmit={sendMessage}>
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Spør om bolig, tomt eller område" />
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
