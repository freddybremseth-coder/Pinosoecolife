import type { Metadata } from "next";
import Script from "next/script";
import { PinosoChatbot } from "@/components/PinosoChatbot";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pinosoecolife.com"),
  title: {
    default: "Pinoso Eco Life | Livet i innlandet, tomter og moderne boliger",
    template: "%s | Pinoso Eco Life",
  },
  description:
    "Norsk rådgivning for deg som vurderer et liv i innlandet i Alicante og Murcia – fra områdevalg og tomtesøk til moderne bolig, finca og trygg kjøpsprosess.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pinoso Eco Life | Livet i innlandet, tomter og moderne boliger",
    description:
      "Start med hvordan du vil leve. Utforsk innlandsområder, store tomter, fincaer og moderne boliger i Alicante og Murcia med norsk rådgivning.",
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
              areaServed: [
                "Pinoso",
                "Monóvar",
                "La Romana",
                "Hondón de las Nieves",
                "Aspe",
                "Novelda",
                "Monforte del Cid",
                "Biar",
                "Villena",
                "Sax",
                "Jumilla",
                "Alicante",
                "Murcia",
                "Spania",
              ],
              knowsAbout: [
                "Boligkjøp i Spania",
                "Tomter i innlandet",
                "Finca og landsted",
                "Moderne nybygg",
                "Områdevalg i Alicante og Murcia",
                "Tomtevurdering og kjøpsprosess",
              ],
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
