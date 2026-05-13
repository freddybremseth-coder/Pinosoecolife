import type { Metadata } from "next";
import Script from "next/script";
import { PinosoChatbot } from "@/components/PinosoChatbot";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pinosoecolife.com"),
  title: {
    default: "Pinoso Eco Life | Moderne boliger og store tomter i Spania",
    template: "%s | Pinoso Eco Life",
  },
  description:
    "Spesialist på moderne boliger, store tomter og trygg norsk oppfølging i Pinoso-området.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pinoso Eco Life | Moderne boliger og store tomter i Spania",
    description:
      "Finn moderne villaer, byggbare tomter og gode områder rundt Pinoso med norsk rådgivning og trygg kjøpsreise.",
    url: "https://www.pinosoecolife.com",
    siteName: "Pinoso Eco Life",
    locale: "nb_NO",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: "Pinoso Eco Life",
              url: "https://www.pinosoecolife.com",
              areaServed: ["Pinoso", "Aspe", "Hondon de las Nieves", "Alicante", "Spania"],
              knowsAbout: ["Tomter i Spania", "Nybygg i Pinoso", "Boligkjøp i Spania", "Store tomter"],
              sameAs: [],
            }),
          }}
        />
        {children}
        <Script
          src="https://appointment.chatgenius.pro/embed.js"
          strategy="afterInteractive"
          data-brand="pinoso"
          data-config-url="https://realtyflow.chatgenius.pro/api/public/booking-config?brand_id=pinosoecolife"
        />
        <PinosoChatbot />
      </body>
    </html>
  );
}
