import { CheckCircle2 } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { processSteps } from "@/lib/content";

export const metadata = {
  title: "Kjøpsprosessen | Pinoso Eco Life",
  description: "Fra livsstil og områdevalg til egnet tomt, bolig, dokumentkontroll og overtakelse i innlandet i Spania.",
};

export default function BuyingProcessPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-hero compact-hero">
        <p className="eyebrow">Kjøpsprosessen</p>
        <h1>Fra riktig område til trygg gjennomføring</h1>
        <p>
          Vi starter med hvordan du vil leve, snevrer inn område og eiendom, og følger prosessen videre gjennom
          dokumentkontroll, visning, kontrakt og overtakelse.
        </p>
      </section>
      <section className="section split">
        <div className="timeline">
          {processSteps.map((step, index) => (
            <div className="timeline-item" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
        <div className="feature-panel">
          <div>
            <CheckCircle2 /> Livsstil og område først
          </div>
          <div>
            <CheckCircle2 /> Tomt og dokumenter kontrolleres
          </div>
          <div>
            <CheckCircle2 /> Rådgivning på norsk
          </div>
          <div>
            <CheckCircle2 /> Strukturert RealtyFlow-oppfølging
          </div>
        </div>
      </section>
      <section className="contact-section">
        <div>
          <p className="eyebrow">Neste steg</p>
          <h2>Start med en kort behovsavklaring</h2>
          <p>Fortell oss hvordan du vil leve, så kan vi begynne med område og deretter se på tomt eller bolig.</p>
        </div>
        <ContactForm source="buying-process" requestType="Kjøpsprosess – område, tomt og bolig" />
      </section>
      <Footer />
    </main>
  );
}
