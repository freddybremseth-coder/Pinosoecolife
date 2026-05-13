import Link from "next/link";
import { ExternalLink, LockKeyhole, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/Footer";
import { PortalWorkspace } from "@/components/PortalWorkspace";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Min side",
  description: "Kundeportal for boligmatch, dokumenter, meldinger og oppfølging hos Pinoso Eco Life.",
  alternates: {
    canonical: "/min-side",
  },
};

export default function PortalPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-hero compact-hero">
        <p className="eyebrow">Min Side</p>
        <h1>Kundeportal for kjøpere</h1>
        <p>
          En ryddig portal for boligmatch, dokumenter og meldinger. Admin, leads og samtaler håndteres i RealtyFlow,
          slik at alt ligger samlet i huben din.
        </p>
        <div className="portal-actions">
          <Link className="contact-button" href="#portal">
            <LockKeyhole size={19} /> Logg inn på Min side
          </Link>
          <Link className="text-button light" href="https://realtyflow.chatgenius.pro">
            <ShieldCheck size={18} /> RealtyFlow admin <ExternalLink size={18} />
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
