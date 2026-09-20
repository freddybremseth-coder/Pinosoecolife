"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, Send, Sprout, X } from "lucide-react";

type Stage = "chat" | "name" | "phone" | "email" | "done";
type Message = { role: "assistant" | "user"; text: string };
type Profile = {
  area?: string;
  areaSlug?: string;
  budget?: string;
  propertyType?: string;
  bedrooms?: string;
  timeline?: string;
  goal?: string;
  priorities: string[];
};
type Lead = { name: string; phone: string; email?: string };

const AREAS = [
  { name: "Pinoso", slug: "pinoso", match: /(^|\W)(pinoso|pinos)(\W|$)/ },
  { name: "Monóvar", slug: "monovar", match: /monovar/ },
  { name: "La Romana", slug: "la-romana", match: /la romana/ },
  { name: "Hondón de las Nieves", slug: "hondon-de-las-nieves", match: /hondon|fondo de les neus/ },
  { name: "Aspe", slug: "aspe", match: /(^|\W)aspe(\W|$)/ },
  { name: "Novelda", slug: "novelda", match: /novelda/ },
  { name: "Monforte del Cid", slug: "monforte-del-cid", match: /monforte/ },
  { name: "Biar", slug: "biar", match: /(^|\W)biar(\W|$)/ },
  { name: "Villena", slug: "villena", match: /villena/ },
  { name: "Sax", slug: "sax", match: /(^|\W)sax(\W|$)/ },
  { name: "Jumilla", slug: "jumilla", match: /jumilla/ },
] as const;

const QUICK = [
  { label: "Hvilket område passer meg?", text: "Jeg vil finne et innlandsområde som passer hverdagen min." },
  { label: "Tomt og ny villa", text: "Jeg vil finne egnet tomt og bygge moderne villa." },
  { label: "Hage, oliven og frukt", text: "Jeg ønsker stor tomt med hage og mulighet for å dyrke." },
  { label: "Hva koster hele prosjektet?", text: "Hva må jeg beregne i totalbudsjett for tomt og hus?" },
];

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function parseProfile(text: string, previous: Profile): Profile {
  const lower = normalize(text);
  const next: Profile = { ...previous, priorities: [...previous.priorities] };
  for (const area of AREAS) {
    if (area.match.test(lower)) {
      next.area = area.name;
      next.areaSlug = area.slug;
      break;
    }
  }
  if (/tomt|parsell|parcela|plot|bygge/.test(lower)) next.propertyType = "Tomt og bygging";
  else if (/finca|landsted|gard|gård/.test(lower)) next.propertyType = "Finca / landsted";
  else if (/villa|nybygg|hus/.test(lower)) next.propertyType = "Villa / nybygg";
  const budget = text.match(/(?:€|eur|euro|budsjett|maks|under|ca\.?)\s*([\d][\d .]{3,})/i) || text.match(/\b([1-9]\d{1,2}(?:[ .]\d{3})+)\s*(?:€|eur|euro)?\b/i);
  if (budget) {
    const value = Number(budget[1].replace(/[^\d]/g, ""));
    if (value >= 50000 && value <= 10000000) next.budget = "€" + value.toLocaleString("nb-NO");
  }
  const bedrooms = text.match(/([1-6])\s*soverom/i);
  if (bedrooms) next.bedrooms = bedrooms[1];
  if (/flytte|helars|helårs|fast bo|permanent/.test(lower)) next.goal = "Helårsbolig";
  if (/ferie|fritid/.test(lower)) next.goal = "Feriebolig";
  if (/pensjon|senere/.test(lower)) next.goal = "Lengre opphold / pensjon";
  if (/snart|nå|i ar|i år|3 mnd/.test(lower)) next.timeline = "Nær fremtid";
  if (/neste ar|neste år|6.?12/.test(lower)) next.timeline = "6–12 måneder";
  const interests: Array<[RegExp, string]> = [
    [/privat|ro|stille|nabo|utsikt/, "Privatliv og ro"],
    [/hage|tomat|frukt|dyrk|oliven|hon(er|s)|høner|egg/, "Hage og mer selvberget liv"],
    [/vin|druer|vingard|vingård/, "Vinland og dyrking"],
    [/sykkel|tur|fjell|natur|vandring/, "Gåturer, sykkel og natur"],
    [/barn|familie|gjest/, "Familie og gjester"],
    [/flyplass|reise|pendle|logistikk|service/, "Reisevei og hverdagsservice"],
    [/landsby|lokalmiljo|lokalmiljø|nabo/, "Landsbyliv og lokalmiljø"],
  ];
  for (const [regex, interest] of interests) {
    if (regex.test(lower) && !next.priorities.includes(interest)) next.priorities.push(interest);
  }
  return next;
}

function answer(text: string, profile: Profile, turns: number) {
  const lower = normalize(text);
  if (/skatt|kost|avgift|pris|finansier|budsjett/.test(lower)) {
    return "Skill tomtepris, selve huset, grunnarbeid, vann/strøm/avløp og kjøps- og byggekostnader. Skatt og avgifter avhenger av type handel og region; en fast prosent blir misvisende. Har du et samlet budsjett for tomt og ferdig bolig?";
  }
  if (/tillat|bygge|tomt|parsell|reguler|rustic|rustik|10.?000|hektar/.test(lower)) {
    return "Velg området først. Deretter må den konkrete tomten undersøkes: planstatus, byggbarhet, adkomst, vannrettigheter/tilgang, strøm, avløp, terreng og totale kostnader. 10 000 m² gir ikke automatisk byggetillatelse. Villa-modeller fra Aspe/Pinoso kan inspirere også i andre innlandsområder, men tomten og lokale rammer avgjør hva som kan bygges. Har du allerede en tomt, eller skal vi starte med områdene?";
  }
  if (/hage|dyrk|frukt|egg|honer|høner|selvforsyn|oliven/.test(lower)) {
    return "En stor tomt kan gi plass til kjøkkenhage, frukttrær og kanskje høner, men vann, frost, jord, stell og lokale regler avgjør hva som er realistisk. Ønsker du en liten hage som er lett å holde, eller vil du bruke mye av hverdagen på tomten?";
  }
  if (/vin|druer|vingard|vingård/.test(lower)) {
    return "Pinoso, Monóvar og Jumilla er interessante å utforske for vinlandskap og dyrking. Egne druer kan være et hobbyprosjekt, men vann, arealbruk og eventuelle regler for vinproduksjon må avklares. Hva betyr mest: nærheten til en by eller mest mulig plass og ro?";
  }
  if (/sykkel|fjell|tur|natur/.test(lower)) {
    return "Biar, Villena og Sax kan være aktuelle hvis turer, sykling og fjellandskap er sentralt. Se også på høyde, årstider og avstand til daglige tjenester. Vil du bo nær en landsby eller på en mer tilbaketrukket tomt?";
  }
  if (/flyplass|alicante|elche|reisevei|service|logistikk/.test(lower)) {
    return "Aspe, Novelda og Monforte del Cid er naturlige å sammenligne hvis hverdagsservice og forbindelse mot Alicante og Elche er viktig. Reisetid varierer med konkret adresse og trafikk. Hvor ofte vil du bruke flyplassen eller større bytilbud?";
  }
  if (/landsby|sosial|lokalmiljo|lokalmiljø/.test(lower)) {
    return "Pinoso, La Romana, Monóvar og Hondón de las Nieves gir ulike kombinasjoner av landsbyliv, landlige eiendommer og lokale tjenester. Prøv området på en vanlig ukedag før du bestemmer deg. Er gangavstand til kafé og butikk viktig?";
  }
  if (/invest|utleie|leieinntekt/.test(lower)) {
    return "Vurder først hvor mye boligen skal brukes privat. Muligheter for utleie og eventuelle tillatelser må kontrolleres konkret for eiendommen og kommunen; jeg vil ikke love inntekter uten dokumentasjon. Er dette først og fremst en bolig for deg selv?";
  }
  if (profile.area) {
    return "Fint, " + profile.area + " er et konkret sted å utforske. Se hverdagsservice, klima, omgivelser og tilgjengelige tomter/boliger før du velger modell. Hva vil du helst bruke uteområdet til, og hvor viktig er reiseveien?";
  }
  if (turns === 1) return "Fortell gjerne hva som betyr mest: privatliv og ro, hage og dyrking, fjell og sykling, landsbyliv eller enkel reisevei. Da kan vi sammenligne noen få aktuelle innlandsområder.";
  if (!profile.budget) return "Det hjelper. Hva er omtrent ditt samlede budsjett for bolig eller tomt og bygging? Et intervall holder.";
  return "Nå kan vi snevre inn område og tomt eller bolig. Du kan fortsette å spørre her, lese områdeguidene eller be Freddy om konkrete forslag ut fra behovene dine.";
}

function summary(profile: Profile, messages: Message[]) {
  const details = [
    profile.area ? "Ønsket område: " + profile.area : "",
    profile.propertyType ? "Boligtype/prosjekt: " + profile.propertyType : "",
    profile.goal ? "Bruk: " + profile.goal : "",
    profile.budget ? "Totalbudsjett: " + profile.budget : "",
    profile.bedrooms ? "Soverom: " + profile.bedrooms : "",
    profile.timeline ? "Tidslinje: " + profile.timeline : "",
    profile.priorities.length ? "Livsstilsønsker: " + profile.priorities.join(", ") : "",
    "Samtale: " + messages.filter(m => m.role === "user").map(m => m.text).join(" | ").slice(0, 2000),
  ];
  return details.filter(Boolean).join("\n");
}

export function PinosoChatbot() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hei! Fortell meg hva slags liv du ser for deg i innlandet. Du kan spørre om områder, stor tomt, hage, nybygg og kjøpsprosessen uten å oppgi kontaktinformasjon." },
  ]);
  const [profile, setProfile] = useState<Profile>({ priorities: [] });
  const [lead, setLead] = useState<Lead>({ name: "", phone: "" });
  const [userTurns, setUserTurns] = useState(0);
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [needsWhatsApp, setNeedsWhatsApp] = useState(false);

  const conversationSummary = useMemo(() => summary(profile, messages), [profile, messages]);
  const whatsappUrl = useMemo(() =>
    "https://wa.me/4796009965?text=" + encodeURIComponent(
      ["Hei Freddy, jeg har brukt Pinoso Eco Life-rådgiveren.",
       lead.name ? "Navn: " + lead.name : "",
       lead.phone ? "Telefon: " + lead.phone : "",
       conversationSummary,
       "Side: pinosoecolife.com"].filter(Boolean).join("\n\n")
    ), [lead.name, lead.phone, conversationSummary]);

  function appendUser(text: string) {
    const next = parseProfile(text, profile);
    const turns = userTurns + 1;
    setProfile(next);
    setUserTurns(turns);
    if (/kontakt|snakk med freddy|ringe meg|ring meg|ta kontakt|folges opp|følges opp/.test(normalize(text))) {
      setStage("name");
      setMessages(prev => [...prev, { role: "user", text },
        { role: "assistant", text: "Gjerne. Hva heter du, så Freddy kan følge opp med konkrete forslag?" }]);
      return;
    }
    setMessages(prev => [...prev,
      { role: "user", text },
      { role: "assistant", text: answer(text, next, turns) },
    ]);
  }

  async function saveLead(email: string) {
    setSending(true);
    const finalMessages = [...messages, { role: "user" as const, text: email }];
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone,
          email,
          preferred_area: profile.area || "Åpen for forslag",
          property_type: profile.propertyType,
          purchase_goal: profile.goal,
          budget: profile.budget,
          bedrooms: profile.bedrooms,
          timeline: profile.timeline,
          lifestyle_interest: profile.priorities.join(", "),
          next_step: "Personlig oppfølging fra Freddy",
          request_type: "Eco Life-rådgiver – behovsavklart samtale",
          source: "pinosoecolife-advisor-conversation",
          page_url: window.location.href,
          message: summary(profile, finalMessages),
        }),
      });
      if (!response.ok) throw new Error("Kunne ikke lagre forespørselen.");
      setLead(prev => ({ ...prev, email }));
      setSaved(true);
      setMessages(prev => [...prev, { role: "user", text: email },
        { role: "assistant", text: "Takk! Forespørselen din er mottatt. Freddy kan følge opp med forslag. Du kan også sende sammendraget på WhatsApp eller fortsette å spørre." }]);
    } catch {
      setNeedsWhatsApp(true);
      setMessages(prev => [...prev,
        { role: "assistant", text: "Forespørselen ble ikke lagret automatisk. Du kan sende sammendraget direkte til Freddy på WhatsApp; meldingen sendes først når du selv trykker Send der." }]);
    } finally {
      setStage("done");
      setSending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    if (stage === "name") {
      setLead(prev => ({ ...prev, name: text }));
      setMessages(prev => [...prev, { role: "user", text },
        { role: "assistant", text: "Takk, " + text + ". Hvilket telefonnummer er best å nå deg på?" }]);
      setStage("phone");
      return;
    }
    if (stage === "phone") {
      const phone = text.replace(/[^\d+]/g, "").slice(0, 24);
      if (phone.replace(/\D/g, "").length < 6) {
        setMessages(prev => [...prev, { role: "assistant", text: "Telefonnummeret virker kort. Ta gjerne med landskode, for eksempel +47 eller +34." }]);
        return;
      }
      setLead(prev => ({ ...prev, phone }));
      setMessages(prev => [...prev, { role: "user", text: phone },
        { role: "assistant", text: "Vil du oppgi e-post, så Freddy kan følge opp med lenker og forslag? Hvis du heller vil bruke bare telefon, kan du sende sammendraget på WhatsApp." }]);
      setStage("email");
      return;
    }
    if (stage === "email") {
      if (!/^\S+@\S+\.\S+$/.test(text)) {
        setMessages(prev => [...prev, { role: "assistant", text: "Skriv en gyldig e-post, eller velg «Bare telefon via WhatsApp»." }]);
        return;
      }
      void saveLead(text);
      return;
    }
    appendUser(text);
  }

  function startHandoff() {
    setStage("name");
    setMessages(prev => [...prev, { role: "assistant", text: "Vil du at Freddy skal følge opp med konkrete forslag? Hva heter du?" }]);
  }

  function phoneOnly() {
    setNeedsWhatsApp(true);
    setStage("done");
    setMessages(prev => [...prev, { role: "assistant", text: "Klikk «Send til Freddy på WhatsApp» for å sende sammendraget. Ingenting er sendt automatisk." }]);
  }

  function continueChat() {
    setStage("chat");
    setNeedsWhatsApp(false);
    setMessages(prev => [...prev, { role: "assistant", text: "Selvsagt. Hva vil du undersøke videre?" }]);
  }

  return (
    <div className="chatbot-shell chatbot-2027">
      {open && (
        <section className="chatbot-panel" aria-label="Eco Life-rådgiver">
          <header className="chatbot-header-2027">
            <div className="chatbot-brandmark" aria-hidden="true"><Sprout size={18} /></div>
            <div><strong>Eco Life-rådgiver</strong><span>Spør først · kontakt senere</span></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Lukk rådgiveren"><X size={18} /></button>
          </header>
          <div className="chatbot-messages" aria-live="polite" role="log">
            {messages.map((message, index) => (
              <p className={message.role} key={index}>{message.text}</p>
            ))}
          </div>
          {profile.areaSlug && stage === "chat" && (
            <div className="chatbot-area-links">
              <Link href={"/livet-i-innlandet/" + profile.areaSlug} onClick={() => setOpen(false)}>
                Les om {profile.area} <ArrowRight size={14} />
              </Link>
              <Link href={"/eiendommer?area=" + encodeURIComponent(profile.area || "")} onClick={() => setOpen(false)}>
                Se boliger i området
              </Link>
            </div>
          )}
          {stage === "chat" && userTurns === 0 && (
            <div className="chatbot-quick-actions">
              {QUICK.map(item => (
                <button type="button" key={item.label} onClick={() => appendUser(item.text)}>{item.label}</button>
              ))}
            </div>
          )}
          {stage === "chat" && userTurns >= 2 && (
            <button className="chatbot-handoff" type="button" onClick={startHandoff}>
              Få konkrete forslag fra Freddy <ArrowRight size={16} />
            </button>
          )}
          {stage === "email" && (
            <button className="chatbot-phone-only" type="button" onClick={phoneOnly}>Bare telefon via WhatsApp</button>
          )}
          {stage === "done" && (
            <div className="chatbot-complete-actions">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} /> Send til Freddy på WhatsApp
              </a>
              <button type="button" onClick={continueChat}>Fortsett å spørre</button>
              {saved && <small>Forespørselen er mottatt.</small>}
              {needsWhatsApp && <small>Åpne WhatsApp og trykk Send for å kontakte Freddy.</small>}
            </div>
          )}
          {stage !== "done" && (
            <form className="chatbot-input chatbot-input-2027" onSubmit={submit}>
              <input
                value={input}
                onChange={event => setInput(event.target.value)}
                placeholder={stage === "name" ? "Navnet ditt" : stage === "phone" ? "Telefonnummer med landskode" : stage === "email" ? "E-post" : "Spør om innlandet, tomt eller bolig"}
                aria-label={stage === "name" ? "Navn" : stage === "phone" ? "Telefonnummer" : stage === "email" ? "E-post" : "Din melding til rådgiveren"}
                inputMode={stage === "phone" ? "tel" : stage === "email" ? "email" : "text"}
                autoComplete={stage === "name" ? "name" : stage === "phone" ? "tel" : stage === "email" ? "email" : "off"}
                disabled={sending}
              />
              <button type="submit" disabled={sending} aria-label="Send"><Send size={16} /></button>
            </form>
          )}
          <p className="chatbot-privacy-note">Du kan spørre uten å oppgi kontaktinformasjon. Dette er en digital veileder; priser, tilgjengelighet og byggbarhet må kontrolleres konkret.</p>
        </section>
      )}
      <button className="chatbot-toggle" type="button" onClick={() => setOpen(v => !v)}
        aria-expanded={open} aria-label={open ? "Lukk Eco Life-rådgiveren" : "Åpne Eco Life-rådgiveren"}>
        <MessageCircle size={22} /><span>Spør rådgiveren</span>
      </button>
    </div>
  );
}
