import Link from "next/link";
import { ArrowRight, Building2, Check, Grape, Leaf, MapPinned, ShieldCheck, Sparkles, Sprout, SunMedium } from "lucide-react";
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
          <p className="eyebrow">Pinoso Eco Life · Innlandet · Store tomter</p>
          <h1>Ikke bare et nytt hjem. En annen måte å leve på.</h1>
          <p className="hero-copy">
            Mer plass. Mer ro. Mer av livet ute. Vi hjelper deg å velge område, finne riktig tomt og vurdere boligen
            som passer livet du faktisk ønsker å skape i innlandet.
          </p>
          <div className="hero-primary-actions">
            <Link className="hero-primary-button" href="/tomter">
              Se tomter <MapPinned size={18} />
            </Link>
            <Link className="hero-secondary-button" href="/magasin">
              Oppdag Eco Life <Leaf size={18} />
            </Link>
          </div>
          <form className="search-card hero-search" action="/tomter">
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

      <section className="trust-band home-trust">
        <div>
          <strong>Livsstil først</strong>
          <span>Vi starter med hvordan du vil leve før vi begynner å velge tomt og bolig</span>
        </div>
        <div>
          <strong>Norsk oppfølging</strong>
          <span>Én trygg prosess med dialog, dokumenter og shortlist</span>
        </div>
        <div>
          <strong>Tomten er en del av hjemmet</strong>
          <span>Vi vurderer areal, adkomst, vann, strøm, regulering og hva du faktisk vil bruke plassen til</span>
        </div>
      </section>

      <section className="section proof-section">
        <div className="section-heading">
          <p className="eyebrow">Hva ville du gjort med 10 000 m²?</p>
          <h2>Plassen rundt huset kan forandre hele hverdagen</h2>
          <p>
            En stor tomt er ikke bare avstand til naboen. Den kan gi rom for kjøkkenhage, frukttrær, vinranker,
            dyr der reglene tillater det, lange måltider ute, sykler, familie på besøk – eller bare stillhet og utsikt.
          </p>
        </div>
        <div className="proof-grid">
          <article>
            <strong><SunMedium size={24} /></strong>
            <h3>Et annet tempo</h3>
            <p>Mindre hastverk, mer tid ute og en hverdag der landsbyen, naturen og hjemmet får større plass.</p>
          </article>
          <article>
            <strong><Sprout size={24} /></strong>
            <h3>Plass til å skape</h3>
            <p>Hage, trær, uteområder, hobbyer og små prosjekter kan vokse frem over tid sammen med livet ditt.</p>
          </article>
          <article>
            <strong><Grape size={24} /></strong>
            <h3>Mer selvberget</h3>
            <p>Ikke nødvendigvis selvforsynt – men kanskje egne tomater, frukt, urter, egg eller noen druer fra egen jord.</p>
          </article>
        </div>
        <div className="center-action">
          <Link className="text-button" href="/magasin/10000-m2-hva-gjor-du-med-plassen">
            Hva kan du gjøre med 10 000 m²? <ArrowRight size={18} />
          </Link>
          <Link className="text-button" href="/magasin">
            Les Eco Life-artiklene <Leaf size={18} />
          </Link>
        </div>
      </section>

      <section className="section sales-section">
        <div className="section-heading">
          <p className="eyebrow">Eiendommer</p>
          <h2>Aktuelle innlandsboliger og villaer</h2>
          <p>Et spisset utvalg fra RealtyFlow for Pinoso, Aspe, Monforte og Hondon-dalen.</p>
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

      <section className="section proof-section">
        <div className="section-heading">
          <p className="eyebrow">Fra drøm til gjennomførbar tomt</p>
          <h2>Livsstilen kommer først. Deretter må tomten faktisk fungere.</h2>
          <p>
            Store tomter, vann, strøm, regulering, adkomst og mikrobeliggenhet avgjør om prosjektet blir riktig.
            Pinoso Eco Life hjelper deg å skille det inspirerende fra det som faktisk lar seg gjennomføre.
          </p>
        </div>
        <div className="proof-grid">
          <article>
            <strong>01</strong>
            <h3>Først livsstil</h3>
            <p>Privatliv, uteområder, hage, dyr, aktivitet, reisevei og bruk gjennom året er en del av behovsavklaringen.</p>
          </article>
          <article>
            <strong>02</strong>
            <h3>Så riktig område og tomt</h3>
            <p>Vi sammenligner Pinoso, Aspe, Hondon-dalen, Monforte del Cid og nærliggende landsbyer.</p>
          </article>
          <article>
            <strong>03</strong>
            <h3>Deretter trygg prosess</h3>
            <p>Tomtesjekk, prospekt, visning, kostnader, advokat og neste steg må henge sammen før du binder deg.</p>
          </article>
        </div>
      </section>

      <BuyerMatchQuiz />

      <section className="section split">
        <div>
          <p className="eyebrow">Trygg kjøpsreise</p>
          <h2>Drømmen skal være stor. Beslutningen skal være konkret.</h2>
          <p>
            Bak livsstilen ligger en praktisk kjøpsreise med boligsøk, tomtekontroll, boligmatch, kundeportal og
            oppfølging via RealtyFlow. Teknologien skal gjøre prosessen enklere – ikke være selve salgsargumentet.
          </p>
          <div className="check-list">
            {["Tomter med kart og filter", "Dokumenter og meldinger på Min Side", "Strukturert lead- og shortlistoppfølging"].map(
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
            <Leaf /> Livsstil og plass først
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
          <h2>Tomten er ikke bare noe huset står på</h2>
          <p>
            Den kan være kjøkkenhage, utsikt, privatliv, trening, frukttrær, familieplass eller ganske enkelt luft mellom deg og neste nabo.
            Vi vil forstå hva du ønsker å gjøre med stedet før vi begynner å anbefale det.
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
            <h3>Et sted som kan utvikle seg</h3>
            <p>Du trenger ikke gjøre alt første året. Hage, trær, uteområder og små prosjekter kan vokse frem over tid.</p>
          </article>
        </div>
      </section>

      <section className="contact-section" id="kontakt">
        <div>
          <p className="eyebrow">Klar for en prat?</p>
          <h2>Fortell oss hvordan du ønsker å leve</h2>
          <p>Ikke bare antall soverom. Fortell oss om plass, privatliv, hage, aktivitet, familie og hva du vil bruke tomten til.</p>
        </div>
        <ContactForm source="pinosoecolife-home" />
      </section>

      <Footer />
    </main>
  );
}
