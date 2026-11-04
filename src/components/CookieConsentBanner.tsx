"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "pinoso:cookie-consent:v1";
export const CONSENT_CHANGED = "pinoso:cookie-consent-changed";
type Consent = { analytics: boolean; marketing: boolean; savedAt: string };
export function analyticsAllowed(): boolean {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")?.analytics === true; }
  catch { return false; }
}
export function CookieConsentBanner() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  useEffect(() => {
    let existing: Consent | null = null;
    try { existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch {}
    setOpen(!existing);
    setAnalytics(existing?.analytics === true);
    setMarketing(existing?.marketing === true);
    const reopen = () => {
      let current: Consent | null = null;
      try { current = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch {}
      setAnalytics(current?.analytics === true);
      setMarketing(current?.marketing === true);
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener("pinoso:open-cookie-settings", reopen);
    return () => window.removeEventListener("pinoso:open-cookie-settings", reopen);
  }, []);
  function save(nextAnalytics: boolean, nextMarketing: boolean) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: nextAnalytics, marketing: nextMarketing, savedAt: new Date().toISOString() })); } catch {}
    window.dispatchEvent(new Event(CONSENT_CHANGED));
    setOpen(false);
    setDetails(false);
  }
  if (!open) return <button type="button" onClick={() => window.dispatchEvent(new Event("pinoso:open-cookie-settings"))} aria-label="Endre informasjonskapsler" title="Endre informasjonskapsler" style={{ position: "fixed", bottom: 12, left: 12, zIndex: 9990, padding: "8px 11px", border: "1px solid #aacbbd", borderRadius: 999, background: "#fff", color: "#286e52", fontSize: 12, boxShadow: "0 2px 9px #0002" }}>Kapselvalg</button>;
  return <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.52)", zIndex: 99999, display: "flex", alignItems: "end", justifyContent: "center", padding: 16 }}>
    <section role="dialog" aria-modal="true" aria-label="Valg av informasjonskapsler" style={{ width: "min(100%,720px)", background: "#fff", color: "#172c26", padding: 24, borderRadius: 18, boxShadow: "0 14px 50px #0004", fontFamily: "inherit" }}>
      <h2 style={{ fontSize: 23, fontWeight: 700, marginBottom: 10 }}>Vi respekterer personvernet ditt</h2>
      <p style={{ lineHeight: 1.55, marginBottom: 12 }}>Nødvendige informasjonskapsler sørger for at nettstedet fungerer. Med ditt samtykke kan vi også måle besøk og forbedre innholdet. Analyse og markedsføring er valgfrie.</p>
      {details && <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
        <label style={{ display: "flex", justifyContent: "space-between", gap: 15 }}><span><strong>Nødvendige</strong><br/><small>Grunnleggende funksjoner. Alltid aktive.</small></span><input type="checkbox" checked disabled /></label>
        <label style={{ display: "flex", justifyContent: "space-between", gap: 15 }}><span><strong>Analyse</strong><br/><small>Statistikk og kildehenvisninger, bare etter samtykke.</small></span><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /></label>
        <label style={{ display: "flex", justifyContent: "space-between", gap: 15 }}><span><strong>Markedsføring</strong><br/><small>Eventuelle fremtidige annonseverktøy; ingen aktiveres her nå.</small></span><input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} /></label>
      </div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button type="button" onClick={() => save(false, false)} style={{ padding: "11px 17px", border: "1px solid #94a3b8", borderRadius: 9 }}>Avvis</button>
        <button type="button" onClick={() => details ? save(analytics, marketing) : setDetails(true)} style={{ padding: "11px 17px", border: "1px solid #94a3b8", borderRadius: 9 }}>{details ? "Lagre valg" : "Innstillinger"}</button>
        <button type="button" onClick={() => save(true, true)} style={{ padding: "11px 17px", border: 0, borderRadius: 9, background: "#286e52", color: "white", fontWeight: 700 }}>Godta alle</button>
      </div>
    </section>
  </div>;
}
