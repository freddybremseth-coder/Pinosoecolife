import Link from "next/link";
import { ArrowRight, Building2, Check, Leaf, MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import { BuyerMatchQuiz } from "@/components/BuyerMatchQuiz";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { SiteHeader } from "@/components/SiteHeader";
import { getProperties } from "@/lib/realtyflow";

export default async function Home() {
  const properties = await getProperties(6);

  return (
    <main>
      <SiteHeader />

      <section id="top" className="hero">
        <div className="hero-video hero-image" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">Norsk trygghet · Pinoso-regionen · Store tomter</p>
          <h1>Din drømmevilla på store tomter i innlandet</h1>
          <p className="hero-copy">
            Vi realiserer drømmen om et moderne hjem med privatliv, sol og plass i Pinoso-området. Systemet bak siden
            håndterer boligsøk, tomter, boligmatch, booking, portal og oppfølging via RealtyFlow.
          </p>
          <form className="search-card" action="/tomter">
            <input name="q" placeholder="Søk tomt, kommune eller område..." />
            <select name="type" defaultValue="">
              <option value="">Hva ser du etter?</option>
              <option>Tomt</option>
              <option>Villa</option>
              <option>Nybygg</option>
            </select>
            <button type="submit">
              Se tomter <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>

      <section className="trust-band">
        <div>
          <strong>Uavhengig rådgivning</strong>
          <span>Vi hjelper deg å sammenligne boliger, områder og utbyggere</span>
        </div>
        <div>
          <strong>Norsk oppfølging</strong>
          <span>Én trygg prosess med dialog, dokumenter og shortlist</span>
        </div>
        <div>
          <strong>Tomter først</strong>
          <span>Tomtelisten hentes direkte fra RealtyFlow med kart, areal og regulering</span>
        </div>
      </section>

      <section className="section proof-section">
        <div className="section-heading">
          <p className="eyebrow">Pinoso er annerledes</p>
          <h2>Her handler kjøpet like mye om tomten som boligen</h2>
          <p>
            Store tomter, vann, strøm, regulering, adkomst og mikrobeliggenhet avgjør om prosjektet blir riktig.
            Pinoso Eco Life hjelper deg å vurdere helheten før du binder deg.
          </p>
        </div>
        <div className="proof-grid">
          <article>
            <strong>01</strong>
            <h3>Først livsstil, så tomt</h3>
            <p>Vi starter med bruk, budsjett, ønsket privatliv, reisevei og hva du faktisk vil bygge.</p>
          </article>
          <article>
            <strong>02</strong>
            <h3>Lokal områdekunnskap</h3>
            <p>Vi sammenligner Pinoso, Aspe, Hondon-dalen, Monforte del Cid og nærliggende landsbyer.</p>
          </article>
          <article>
            <strong>03</strong>
            <h3>Trygg prosess</h3>
            <p>Du får hjelp med tomtesjekk, prospekt, visning, kostnader, advokat og neste steg.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Eiendommer</p>
          <h2>Aktuelle boliger fra din egen import</h2>
          <p>Boligene hentes fra RealtyFlow-importen din, mens Pinoso-siden legger ekstra vekt på tomter og områdevalg.</p>
        </div>
        <div className="property-grid">
          {properties.map((property, index) => (
            <PropertyCard key={property.id || property.ref || index} property={property} priority={index < 3} />
          ))}
        </div>
        <div className="center-action">
          <Link className="text-button" href="/eiendommer">
            Se alle boliger <ArrowRight size={18} />
          </Link>
          <Link className="text-button" href="/tomter">
            Se tomter <MapPinned size={18} />
          </Link>
        </div>
      </section>

      <BuyerMatchQuiz />

      <section className="section split">
        <div>
          <p className="eyebrow">Trygg kjøpsreise</p>
          <h2>Bygget for nordmenn som vil ha plass, ro og kontroll i Spania</h2>
          <p>
            Siden kombinerer et stilrent førsteinntrykk med en praktisk kundereise: boligsøk, match, kundeportal og
            oppfølging via RealtyFlow.
          </p>
          <div className="check-list">
            {["Tomter med kart og filter", "Dokumenter og meldinger på Min Side", "Automatisert leadflyt til CRM"].map(
              (item) => (
                <span key={item}>
                  <Check size={18} /> {item}
                </span>
              ),
            )}
          </div>
        </div>
        <div className="feature-panel">
          <div>
            <ShieldCheck /> Norsk trygghet
          </div>
          <div>
            <Leaf /> Energieffektive boliger
          </div>
          <div>
            <Sparkles /> AI-støttet boligmatch
          </div>
          <div>
            <Building2 /> Villaer, tomter og prosjekter
          </div>
        </div>
      </section>

      <section className="section proof-section">
        <div className="section-heading">
          <p className="eyebrow">Hvorfor Pinoso Eco Life</p>
          <h2>En roligere vei til villa, tomt og hverdagsliv i Spania</h2>
          <p>
            Mange kjøpere møter flotte bilder, men mangler struktur på tomt, regulering, område og neste steg.
            Pinoso Eco Life samler vurdering, dialog og oppfølging i én ryddig prosess.
          </p>
        </div>
        <div className="proof-grid">
          <article>
            <strong>01</strong>
            <h3>Område først</h3>
            <p>Vi hjelper deg å sortere Pinoso, Aspe, Hondon og nærliggende områder før du forelsker deg i feil tomt.</p>
          </article>
          <article>
            <strong>02</strong>
            <h3>Moderne hjem med plass</h3>
            <p>Fokus på nybygg, energieffektive løsninger, privatliv, basseng og store uteområder.</p>
          </article>
          <article>
            <strong>03</strong>
            <h3>Digital oppfølging</h3>
            <p>RealtyFlow holder orden på leads, favoritter, områder og neste steg, slik at du slipper å starte på nytt hver gang.</p>
          </article>
        </div>
      </section>

      <section className="contact-section" id="kontakt">
        <div>
          <p className="eyebrow">Klar for en prat?</p>
          <h2>Fortell oss hva du ser etter</h2>
          <p>Vi hjelper deg med område, budsjett, prosjekter og neste steg i kjøpsprosessen.</p>
        </div>
        <ContactForm source="pinosoecolife-home" />
      </section>

      <Footer />
    </main>
  );
}
