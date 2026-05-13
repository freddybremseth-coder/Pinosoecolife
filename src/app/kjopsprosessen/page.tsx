import { CheckCircle2 } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { processSteps } from "@/lib/content";

export const metadata = {
  title: "Kjøpsprosessen | Pinoso Eco Life",
};

export default function BuyingProcessPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-hero compact-hero">
        <p className="eyebrow">Kjøpsprosessen</p>
        <h1>Trygt kjøp av nybygg i Spania</h1>
        <p>Vi følger deg gjennom behov, utvalg, dokumenter, visning, kontrakt og overtakelse.</p>
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
            <CheckCircle2 /> Strukturert prosess
          </div>
          <div>
            <CheckCircle2 /> Dokumenter samlet
          </div>
          <div>
            <CheckCircle2 /> Rådgivning på norsk
          </div>
          <div>
            <CheckCircle2 /> RealtyFlow-oppfølging
          </div>
        </div>
      </section>
      <section className="contact-section">
        <div>
          <p className="eyebrow">Neste steg</p>
          <h2>Start med en kort behovsavklaring</h2>
          <p>Fortell oss hva du ser etter, så kan vi foreslå områder og prosjekter.</p>
        </div>
        <ContactForm source="buying-process" />
      </section>
      <Footer />
    </main>
  );
}
