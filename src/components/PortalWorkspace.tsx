"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Building2,
  Calculator,
  CheckCircle2,
  FileText,
  Heart,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  MessageSquareText,
  Search,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { supabase } from "@/lib/supabase-browser";

const buyerSteps = [
  { label: "Livsstil og budsjett", status: "Klar" },
  { label: "Områdevalg", status: "Pågår" },
  { label: "Tomt eller bolig", status: "Neste" },
  { label: "Kontroll og gjennomføring", status: "Ikke startet" },
];

type SavedProperty = {
  ref: string;
  title: string;
  location: string;
  price: string;
  href: string;
};

const savedProperties: SavedProperty[] = [];

type PortalProperty = {
  id?: string;
  ref?: string;
  external_id?: string;
  title?: string;
  title_no?: string;
  location?: string;
  town?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  built_area?: number;
  area?: number;
  property_type?: string;
  type?: string;
  pool?: boolean;
};

type PortalPlot = {
  id?: string;
  plot_number?: string;
  location?: string;
  municipality?: string;
  area?: number;
  price?: number;
  zoning?: string;
};

type PortalDocument = {
  id: string;
  type: string;
  title: string;
  summary?: string;
  content?: string;
  publishedAt?: string;
  source?: string;
};

type PortalMessage = {
  id: string;
  sender_type: "customer" | "admin" | "system";
  sender_name?: string;
  body: string;
  attachments?: { name?: string; url?: string }[];
  created_at: string;
};

type FinanceRates = {
  eurNok: number;
  updatedAt: string;
  exchangeSource: string;
  purchaseCostRate?: number | null;
  purchaseCostNote?: string;
  loanAssumptions: {
    spainRate: number;
    norwayRate: number;
    sourceNote: string;
  };
};

type Preferences = {
  budgetMin: string;
  budgetMax: string;
  region: string;
  area: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  lifestyle: string;
  timeline: string;
  wantsPlots: boolean;
  minPlotArea: string;
  maxPlotPrice: string;
  notes: string;
};

const initialPreferences: Preferences = {
  budgetMin: "",
  budgetMax: "",
  region: "",
  area: "",
  propertyType: "",
  bedrooms: "",
  bathrooms: "",
  lifestyle: "",
  timeline: "",
  wantsPlots: false,
  minPlotArea: "",
  maxPlotPrice: "",
  notes: "",
};

function normalize(value?: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatEuro(value?: number) {
  if (!value) return "Pris på forespørsel";
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function formatNok(value?: number) {
  if (!value) return "NOK 0";
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(value);
}

function calculateMonthlyPayment(principal: number, annualRate: number, years: number) {
  if (!principal || !annualRate || !years) return 0;
  const months = years * 12;
  const monthlyRate = annualRate / 12;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

function propertyRef(property: PortalProperty) {
  return property.ref || property.external_id || property.id || "";
}

function propertyTitle(property: PortalProperty) {
  return property.title_no || property.title || "Bolig i innlandet";
}

function propertyArea(property: PortalProperty) {
  return property.built_area || property.area || 0;
}

function plotRef(plot: PortalPlot) {
  return plot.plot_number || plot.id || "Tomt";
}

function regionMatches(haystack: string, region: string) {
  if (!region) return true;
  const terms: Record<string, string[]> = {
    "vinland og pinoso": ["pinoso", "monovar", "monóvar", "jumilla", "ubeda", "úbeda", "canada del trigo", "cañada del trigo"],
    "landsby og finca": ["hondon", "hondón", "la romana", "barbarroja", "barba-roja", "canalosa"],
    "praktisk innland": ["aspe", "novelda", "monforte", "monforte del cid"],
    "fjell og natur": ["biar", "villena", "sax"],
  };
  const normalizedRegion = normalize(region);
  return (terms[normalizedRegion] || [region]).some((term) => haystack.includes(normalize(term)));
}

export function PortalWorkspace() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saved" | "error">("idle");
  const [loginStatus, setLoginStatus] = useState<"idle" | "sent" | "error" | "missing-config">("idle");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<SavedProperty[]>(savedProperties);
  const [properties, setProperties] = useState<PortalProperty[]>([]);
  const [plots, setPlots] = useState<PortalPlot[]>([]);
  const [documents, setDocuments] = useState<PortalDocument[]>([]);
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [messageStatus, setMessageStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null);
  const [financeRates, setFinanceRates] = useState<FinanceRates | null>(null);
  const [calculator, setCalculator] = useState({
    price: "450000",
    ownCapital: "150000",
    years: "25",
    spainRate: "",
    norwayRate: "",
  });
  const [preferences, setPreferences] = useState<Preferences>(initialPreferences);
  const [signalStatus, setSignalStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    function loadFavorites() {
      try {
        const stored = JSON.parse(localStorage.getItem("pinosoecolife:favorites") || "[]") as SavedProperty[];
        setFavorites(Array.isArray(stored) ? stored : []);
      } catch {
        setFavorites([]);
      }
    }

    loadFavorites();
    window.addEventListener("pinosoecolife:favorites-updated", loadFavorites);
    return () => window.removeEventListener("pinosoecolife:favorites-updated", loadFavorites);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setSessionEmail(data.user?.email || null);
      setMustChangePassword(Boolean(data.user?.user_metadata?.must_change_password));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user?.email || null);
      setMustChangePassword(Boolean(session?.user?.user_metadata?.must_change_password));
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sessionEmail) return;
    fetch("/api/portal/catalog")
      .then((res) => res.json())
      .then((data) => {
        setProperties(Array.isArray(data.properties) ? data.properties : []);
        setPlots(Array.isArray(data.plots) ? data.plots : []);
      })
      .catch(() => {});
  }, [sessionEmail]);

  useEffect(() => {
    if (!sessionEmail || !supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      fetch("/api/portal/documents", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => setDocuments(Array.isArray(data.documents) ? data.documents : []))
        .catch(() => setDocuments([]));
    });
  }, [sessionEmail]);

  useEffect(() => {
    if (!sessionEmail || !supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      fetch("/api/portal/messages", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => setMessages(Array.isArray(data.messages) ? data.messages : []))
        .catch(() => setMessages([]));
    });
  }, [sessionEmail, messageStatus]);

  useEffect(() => {
    fetch("/api/finance/rates")
      .then((res) => res.json())
      .then((data) => {
        setFinanceRates(data);
        setCalculator((prev) => ({
          ...prev,
          spainRate: prev.spainRate || String(Math.round(Number(data.loanAssumptions?.spainRate || 0.0425) * 10000) / 100),
          norwayRate: prev.norwayRate || String(Math.round(Number(data.loanAssumptions?.norwayRate || 0.055) * 10000) / 100),
        }));
      })
      .catch(() => {});
  }, []);

  const filteredProperties = properties
    .filter((property) => {
      const haystack = normalize(
        [propertyTitle(property), property.location, property.town, property.property_type, property.type, property.ref, property.external_id]
          .filter(Boolean)
          .join(" "),
      );
      const price = Number(property.price || 0);
      return (
        regionMatches(haystack, preferences.region) &&
        (!preferences.area || haystack.includes(normalize(preferences.area))) &&
        (!preferences.propertyType || haystack.includes(normalize(preferences.propertyType))) &&
        (!preferences.budgetMin || price >= Number(preferences.budgetMin)) &&
        (!preferences.budgetMax || price <= Number(preferences.budgetMax)) &&
        (!preferences.bedrooms || Number(property.bedrooms || 0) >= Number(preferences.bedrooms)) &&
        (!preferences.bathrooms || Number(property.bathrooms || 0) >= Number(preferences.bathrooms))
      );
    })
    .slice(0, 6);

  const filteredPlots = plots
    .filter((plot) => {
      const haystack = normalize([plotRef(plot), plot.location, plot.municipality, plot.zoning].filter(Boolean).join(" "));
      return (
        regionMatches(haystack, preferences.region) &&
        (!preferences.area || haystack.includes(normalize(preferences.area))) &&
        (!preferences.minPlotArea || Number(plot.area || 0) >= Number(preferences.minPlotArea)) &&
        (!preferences.maxPlotPrice || Number(plot.price || 0) <= Number(preferences.maxPlotPrice))
      );
    })
    .slice(0, 6);

  const purchasePrice = Number(calculator.price || 0);
  const purchaseCostRate = Number(financeRates?.purchaseCostRate || 0);
  const hasPurchaseCostEstimate = purchaseCostRate > 0;
  const purchaseCosts = hasPurchaseCostEstimate ? purchasePrice * purchaseCostRate : 0;
  const calculationBase = purchasePrice + purchaseCosts;
  const loanAmount = Math.max(0, calculationBase - Number(calculator.ownCapital || 0));
  const years = Number(calculator.years || 25);
  const spainMonthly = calculateMonthlyPayment(loanAmount, Number(calculator.spainRate || 0) / 100, years);
  const norwayMonthly = calculateMonthlyPayment(loanAmount, Number(calculator.norwayRate || 0) / 100, years);

  async function requestAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          source: "pinosoecolife-customer-access",
          request_type: "Kundeportal tilgang",
          message: `Ber om tilgang til kundeportal. ${data.message || ""}`,
        }),
      });
      if (!res.ok) throw new Error("Access request failed");
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  async function signInWithPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginStatus("idle");
    if (!supabase) {
      setLoginStatus("missing-config");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (!error) {
      setSessionEmail(data.user?.email || null);
      setMustChangePassword(Boolean(data.user?.user_metadata?.must_change_password));
      setLoginPassword("");
    }
    setLoginStatus(error ? "error" : "sent");
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordStatus("idle");
    if (!supabase || newPassword.length < 8) {
      setPasswordStatus("error");
      return;
    }
    const { data, error } = await supabase.auth.updateUser({ password: newPassword, data: { must_change_password: false } });
    if (error) {
      setPasswordStatus("error");
      return;
    }
    setNewPassword("");
    setMustChangePassword(Boolean(data.user?.user_metadata?.must_change_password));
    setPasswordStatus("saved");
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setSessionEmail(null);
    setMustChangePassword(false);
  }

  async function savePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setSignalStatus("saving");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setSignalStatus("error");
      return;
    }

    const res = await fetch("/api/portal/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ preferences }),
    });
    setSignalStatus(res.ok ? "saved" : "error");
  }

  async function sendPortalMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || (!messageText.trim() && !attachmentUrl.trim())) return;
    setMessageStatus("sending");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setMessageStatus("error");
      return;
    }

    const res = await fetch("/api/portal/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ body: messageText, attachmentUrl, attachmentName: attachmentUrl ? "Vedlegg" : "" }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setMessageText("");
      setAttachmentUrl("");
      setMessageStatus("sent");
    } else {
      setMessageStatus("error");
    }
  }

  return (
    <section className="portal-shell">
      <aside className="portal-sidebar">
        <div>
          <span className="portal-icon"><LockKeyhole size={22} /></span>
          <h2>Min side</h2>
          <p>Samle områdevalg, tomter, boliger, dokumenter, meldinger og neste steg i kjøpsreisen.</p>
        </div>
        <div className="portal-mode single">
          <span><UserRound size={17} /> Kundeportal</span>
        </div>
      </aside>

      <div className="portal-main">
        <div className="portal-topline">
          <div>
            <p className="eyebrow">{sessionEmail ? "Innlogget" : "Kundeportal"}</p>
            <h2>Din Eco Life-kjøpsreise</h2>
          </div>
          {sessionEmail ? (
            <button className="portal-session-button" onClick={signOut} type="button">
              <LogOut size={17} /> Logg ut {sessionEmail}
            </button>
          ) : (
            <span>Personlig oversikt når du logger inn</span>
          )}
        </div>

        <div className="portal-grid">
          {!sessionEmail && (
            <article className="portal-panel access-panel">
              <div className="panel-title"><Mail size={20} /><h3>Har du fått tilgang?</h3></div>
              <form onSubmit={signInWithPassword}>
                <label>E-post<input name="email" onChange={(event) => setLoginEmail(event.target.value)} placeholder="din@epost.no" required type="email" value={loginEmail} /></label>
                <label>Passord<input name="password" onChange={(event) => setLoginPassword(event.target.value)} placeholder="Midlertidig eller eget passord" required type="password" value={loginPassword} /></label>
                <button type="submit">Logg inn</button>
                {loginStatus === "sent" && <p className="form-success">Du er logget inn.</p>}
                {loginStatus === "error" && <p className="form-error">Kunne ikke logge inn. Kontroller e-post og passord.</p>}
                {loginStatus === "missing-config" && <p className="form-error">Innlogging er ikke konfigurert akkurat nå.</p>}
              </form>
            </article>
          )}

          {sessionEmail && mustChangePassword && (
            <article className="portal-panel access-panel wide-panel">
              <div className="panel-title"><KeyRound size={20} /><h3>Sett nytt passord</h3></div>
              <form onSubmit={changePassword}>
                <label>Ny passord<input minLength={8} onChange={(event) => setNewPassword(event.target.value)} placeholder="Minst 8 tegn" required type="password" value={newPassword} /></label>
                <button type="submit">Lagre nytt passord</button>
                {passwordStatus === "saved" && <p className="form-success">Passordet er oppdatert.</p>}
                {passwordStatus === "error" && <p className="form-error">Kunne ikke lagre passordet.</p>}
              </form>
            </article>
          )}

          {sessionEmail && (
            <article className="portal-panel wide-panel portal-search-panel">
              <div className="panel-title"><SlidersHorizontal size={20} /><h3>Mine ønsker</h3></div>
              <form className="portal-preferences" onSubmit={savePreferences}>
                <div className="form-grid">
                  <label>Budsjett fra<input inputMode="numeric" onChange={(event) => setPreferences((prev) => ({ ...prev, budgetMin: event.target.value }))} placeholder="250000" value={preferences.budgetMin} /></label>
                  <label>Budsjett til<input inputMode="numeric" onChange={(event) => setPreferences((prev) => ({ ...prev, budgetMax: event.target.value }))} placeholder="650000" value={preferences.budgetMax} /></label>
                </div>
                <div className="form-grid">
                  <label>
                    Livsstilsretning
                    <select onChange={(event) => setPreferences((prev) => ({ ...prev, region: event.target.value }))} value={preferences.region}>
                      <option value="">Åpen for alle Eco Life-områder</option>
                      <option>Vinland og Pinoso</option>
                      <option>Landsby og finca</option>
                      <option>Praktisk innland</option>
                      <option>Fjell og natur</option>
                    </select>
                  </label>
                  <label>Område/sted<input onChange={(event) => setPreferences((prev) => ({ ...prev, area: event.target.value }))} placeholder="Pinoso, Monóvar, Biar, Jumilla..." value={preferences.area} /></label>
                </div>
                <div className="form-grid">
                  <label>
                    Boligtype
                    <select onChange={(event) => setPreferences((prev) => ({ ...prev, propertyType: event.target.value }))} value={preferences.propertyType}>
                      <option value="">Alle typer</option>
                      <option>Villa</option>
                      <option>Finca</option>
                      <option>Landhus</option>
                      <option>Landsbyhus</option>
                      <option>Nybygg</option>
                    </select>
                  </label>
                  <label>
                    Hva betyr mest?
                    <select onChange={(event) => setPreferences((prev) => ({ ...prev, lifestyle: event.target.value }))} value={preferences.lifestyle}>
                      <option value="">Ikke valgt</option>
                      <option>Privatliv og ro</option>
                      <option>Hage og dyrking</option>
                      <option>Vinland</option>
                      <option>Natur og aktivitet</option>
                      <option>Landsbyliv</option>
                      <option>Enkel logistikk</option>
                      <option>Familie og gjester</option>
                    </select>
                  </label>
                </div>
                <div className="form-grid compact-fields">
                  <label>Soverom<input min="0" onChange={(event) => setPreferences((prev) => ({ ...prev, bedrooms: event.target.value }))} type="number" value={preferences.bedrooms} /></label>
                  <label>Bad<input min="0" onChange={(event) => setPreferences((prev) => ({ ...prev, bathrooms: event.target.value }))} type="number" value={preferences.bathrooms} /></label>
                  <label>
                    Tidslinje
                    <select onChange={(event) => setPreferences((prev) => ({ ...prev, timeline: event.target.value }))} value={preferences.timeline}>
                      <option value="">Ikke valgt</option><option>Klar nå</option><option>Innen 3 mnd</option><option>6-12 mnd</option><option>Senere</option>
                    </select>
                  </label>
                </div>
                <label className="portal-checkbox">
                  <input checked={preferences.wantsPlots} onChange={(event) => setPreferences((prev) => ({ ...prev, wantsPlots: event.target.checked }))} type="checkbox" />
                  Jeg vurderer også tomt / tomt + nybygg
                </label>
                {preferences.wantsPlots && (
                  <div className="form-grid">
                    <label>Tomteareal fra<input inputMode="numeric" onChange={(event) => setPreferences((prev) => ({ ...prev, minPlotArea: event.target.value }))} placeholder="10000" value={preferences.minPlotArea} /></label>
                    <label>Tomtepris til<input inputMode="numeric" onChange={(event) => setPreferences((prev) => ({ ...prev, maxPlotPrice: event.target.value }))} placeholder="75000" value={preferences.maxPlotPrice} /></label>
                  </div>
                )}
                <label>
                  Notat
                  <textarea onChange={(event) => setPreferences((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Fortell om privatliv, dyrking, natur, landsbyliv, familie, logistikk eller andre ønsker." value={preferences.notes} />
                </label>
                <button disabled={signalStatus === "saving"} type="submit">{signalStatus === "saving" ? "Lagrer..." : "Lagre ønsker"}</button>
                {signalStatus === "saved" && <p className="form-success">Ønskene er lagret for videre oppfølging.</p>}
                {signalStatus === "error" && <p className="form-error">Kunne ikke lagre ønskene akkurat nå.</p>}
              </form>

              <div className="portal-results">
                <div>
                  <div className="panel-title small-title"><Search size={18} /><h3>Boliger som matcher</h3></div>
                  <ul className="portal-match-list">
                    {filteredProperties.map((property) => (
                      <li key={propertyRef(property)}>
                        <Building2 size={17} />
                        <a href={`/eiendommer/${encodeURIComponent(propertyRef(property))}`}>
                          <span>{propertyTitle(property)}</span>
                          <small>{property.location || property.town || "Innlandet"} · {formatEuro(property.price)} · {property.bedrooms || 0} sov · {property.bathrooms || 0} bad · {propertyArea(property).toLocaleString("nb-NO")} m²</small>
                        </a>
                      </li>
                    ))}
                    {!filteredProperties.length && <li>Ingen boliger matcher filtrene akkurat nå.</li>}
                  </ul>
                </div>
                <div>
                  <div className="panel-title small-title"><MapPin size={18} /><h3>Tomter som matcher</h3></div>
                  <ul className="portal-match-list">
                    {filteredPlots.map((plot) => (
                      <li key={plotRef(plot)}><MapPin size={17} /><a href="/tomter"><span>{plotRef(plot)}</span><small>{plot.municipality || plot.location || "Innlandet"} · {formatEuro(plot.price)} · {Number(plot.area || 0).toLocaleString("nb-NO")} m²</small></a></li>
                    ))}
                    {!filteredPlots.length && <li>Ingen tomter matcher filtrene akkurat nå.</li>}
                  </ul>
                </div>
              </div>
            </article>
          )}

          {!sessionEmail && (
            <article className="portal-panel access-panel">
              <div className="panel-title"><KeyRound size={20} /><h3>Be om innlogging</h3></div>
              <form onSubmit={requestAccess}>
                <label>Navn<input name="name" required placeholder="Ditt navn" /></label>
                <label>E-post<input name="email" required type="email" placeholder="din@epost.no" /></label>
                <label>Telefon<input name="phone" placeholder="+47..." /></label>
                <label>Melding<textarea name="message" placeholder="Kort om hva du ønsker hjelp med" /></label>
                <button type="submit">Send innloggingsforespørsel</button>
                {status === "sent" && <p className="form-success">Forespørselen er sendt.</p>}
                {status === "error" && <p className="form-error">Kunne ikke sende akkurat nå. Prøv igjen.</p>}
              </form>
            </article>
          )}

          <article className="portal-panel">
            <div className="panel-title"><CheckCircle2 size={20} /><h3>Kjøperstatus</h3></div>
            <div className="buyer-steps">{buyerSteps.map((step) => <div key={step.label}><span>{step.label}</span><strong>{step.status}</strong></div>)}</div>
          </article>

          <article className="portal-panel">
            <div className="panel-title"><Heart size={20} /><h3>Favoritter</h3></div>
            <ul className="portal-list">
              {favorites.map((property) => (
                <li key={property.ref}><Building2 size={17} /><a href={property.href}><span>{property.title}</span><small>{property.location} · {property.price}</small></a></li>
              ))}
              {!favorites.length && <li>Du har ingen lagrede boliger eller tomter ennå.</li>}
            </ul>
          </article>

          <article className="portal-panel">
            <div className="panel-title"><FileText size={20} /><h3>Dokumenter</h3></div>
            <ul className="portal-list">
              {(sessionEmail && documents.length ? documents : [
                { id: "demo-guide", type: "guide", title: "Kjøpsguide og sjekkliste", summary: "Logg inn for personlige rapporter og dokumenter." },
                { id: "demo-costs", type: "guide", title: "Kostnader og finansiering", summary: "Kostnader må beregnes for den konkrete handelen." },
              ]).map((document) => (
                <li key={document.id} className="portal-document-item">
                  <FileText size={17} />
                  <div>
                    <span>{document.title}</span>
                    {document.summary && <small>{document.summary}</small>}
                    {document.content && expandedDocument === document.id && <p className="portal-document-content">{document.content}</p>}
                    {document.content && <button className="text-button" type="button" onClick={() => setExpandedDocument(expandedDocument === document.id ? null : document.id)}>{expandedDocument === document.id ? "Vis mindre" : "Les mer"}</button>}
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="portal-panel">
            <div className="panel-title"><Calculator size={20} /><h3>Finansieringskalkulator</h3></div>
            <div className="portal-calculator">
              <label>Boligpris EUR<input inputMode="numeric" onChange={(event) => setCalculator((prev) => ({ ...prev, price: event.target.value }))} value={calculator.price} /></label>
              <label>Egenkapital EUR<input inputMode="numeric" onChange={(event) => setCalculator((prev) => ({ ...prev, ownCapital: event.target.value }))} value={calculator.ownCapital} /></label>
              <div className="form-grid compact-fields">
                <label>År<input inputMode="numeric" onChange={(event) => setCalculator((prev) => ({ ...prev, years: event.target.value }))} value={calculator.years} /></label>
                <label>Spania %<input inputMode="decimal" onChange={(event) => setCalculator((prev) => ({ ...prev, spainRate: event.target.value }))} value={calculator.spainRate} /></label>
                <label>Norge %<input inputMode="decimal" onChange={(event) => setCalculator((prev) => ({ ...prev, norwayRate: event.target.value }))} value={calculator.norwayRate} /></label>
              </div>
              <div className="calculator-results">
                <div><small>Kjøpskostnader</small><strong>{hasPurchaseCostEstimate ? formatEuro(purchaseCosts) : "Beregnes konkret"}</strong></div>
                <div><small>Pris brukt i lånekalkylen</small><strong>{formatEuro(calculationBase)}</strong><span>{formatNok(calculationBase * (financeRates?.eurNok || 0))}</span></div>
                <div><small>Estimert lån</small><strong>{formatEuro(loanAmount)}</strong></div>
                <div><small>Mnd. Spania / Norge</small><strong>{formatEuro(spainMonthly)} / {formatEuro(norwayMonthly)}</strong></div>
              </div>
              <p className="calculator-note">
                Kurs {financeRates?.eurNok?.toFixed(4) || "--"} fra {financeRates?.exchangeSource || "valutakilde"}. {financeRates?.purchaseCostNote || "Skatt og kjøpskostnader er ikke inkludert uten en konkret beregning for handelen."} Renter er kun veiledende og faktiske lånebetingelser må bekreftes av bank.
              </p>
            </div>
          </article>

          <article className="portal-panel wide-panel">
            <div className="panel-title"><MessageSquareText size={20} /><h3>Meldinger og oppfølging</h3></div>
            {sessionEmail ? (
              <div className="portal-message-box">
                <div className="portal-message-thread">
                  {messages.length ? messages.map((message) => (
                    <div key={message.id} className={`portal-message ${message.sender_type === "customer" ? "from-customer" : "from-admin"}`}>
                      <small>{message.sender_type === "customer" ? "Du" : message.sender_name || "Pinoso Eco Life"} · {new Date(message.created_at).toLocaleString("nb-NO")}</small>
                      <p>{message.body}</p>
                      {message.attachments?.map((attachment, index) => attachment.url ? <a key={index} href={attachment.url} rel="noopener noreferrer" target="_blank">{attachment.name || attachment.url}</a> : null)}
                    </div>
                  )) : <p className="message-empty">Ingen meldinger ennå. Send spørsmål, dokumenter eller lenker direkte her.</p>}
                </div>
                <form className="portal-message-form" onSubmit={sendPortalMessage}>
                  <textarea onChange={(event) => setMessageText(event.target.value)} placeholder="Skriv en melding til Pinoso Eco Life..." value={messageText} />
                  <input onChange={(event) => setAttachmentUrl(event.target.value)} placeholder="Vedlegg/lenke, f.eks. PDF eller delt dokument" type="url" value={attachmentUrl} />
                  <button disabled={messageStatus === "sending"} type="submit">{messageStatus === "sending" ? "Sender..." : "Send melding"}</button>
                  {messageStatus === "sent" && <p className="form-success">Meldingen er sendt.</p>}
                  {messageStatus === "error" && <p className="form-error">Kunne ikke sende meldingen.</p>}
                </form>
              </div>
            ) : (
              <div className="message-preview"><Mail size={19} /><p>Logg inn for direkte meldinger, svar og vedlegg.</p></div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
