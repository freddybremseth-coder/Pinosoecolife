import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Footer } from "@/components/Footer";
import { PortalWorkspace } from "@/components/PortalWorkspace";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Min side",
  description: "Din kundeportal for boligønsker, tomter, favoritter, dokumenter, meldinger og oppfølging hos Pinoso Eco Life.",
  alternates: {
    canonical: "/min-side",
  },
};

export default function PortalPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-hero compact-hero">
        <p className="eyebrow">Min side</p>
        <h1>Din Eco Life-kjøpsreise samlet på ett sted</h1>
        <p>
          Logg inn for å samle boligønsker, aktuelle tomter og boliger, dokumenter, meldinger og neste steg. Målet er at
          område, livsstil og det praktiske rundt kjøpet skal henge sammen gjennom hele prosessen.
        </p>
        <div className="portal-actions">
          <Link className="contact-button" href="#portal">
            <LockKeyhole size={19} /> Gå til innlogging
          </Link>
        </div>
      </section>
      <section id="portal">
        <PortalWorkspace />
      </section>
      <Footer />
    </main>
  );
}
