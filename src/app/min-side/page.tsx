import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Footer } from "@/components/Footer";
import { PortalWorkspace } from "@/components/PortalWorkspace";
import { SiteHeader } from "@/components/SiteHeader";
import styles from "./min-side.module.css";

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

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroGrid}>
            <div>
              <p className={styles.eyebrow}>Min side · Pinoso Eco Life</p>
              <h1 className={styles.title}>Din kjøpsreise. Samlet, personlig og oversiktlig.</h1>
            </div>
            <div>
              <p className={styles.lead}>
                Samle områdevalg, aktuelle tomter og boliger, favoritter, dokumenter, meldinger og neste steg på ett sted. Her skal det være enkelt å se hva du vurderer – og hva som faktisk bør skje videre.
              </p>
              <Link className={styles.heroAction} href="#portal">
                <LockKeyhole size={18} /> Gå til kundeportalen
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.portalTheme} id="portal">
        <PortalWorkspace />
      </section>

      <Footer />
    </main>
  );
}
