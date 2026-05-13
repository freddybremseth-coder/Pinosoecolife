import Link from "next/link";
import { AuthCallbackClient } from "@/components/AuthCallbackClient";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Logger inn | Pinoso Eco Life",
};

export default function AuthCallbackPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-hero compact-hero">
        <p className="eyebrow">Min side</p>
        <h1>Innlogging fullføres</h1>
        <p>Hvis du har åpnet lenken fra e-posten din, kan du gå videre til portalen.</p>
        <div className="portal-actions">
          <Link className="contact-button" href="/min-side">
            Gå til Min side
          </Link>
        </div>
        <AuthCallbackClient />
      </section>
      <Footer />
    </main>
  );
}
