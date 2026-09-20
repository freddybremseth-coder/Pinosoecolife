import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import Script from "next/script";
import { CompareProvider } from "@/components/CompareProperties";
import { PinosoChatbot } from "@/components/PinosoChatbot";
import { SearchDiscoveryTracker } from "@/components/SearchDiscoveryTracker";
import { ecoLifeAreas } from "@/lib/ecolife-areas";
import "./globals.css";
import "./design-system.css";
import "./ecolife-advisor.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const BASE = "https://www.pinosoecolife.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Pinoso Eco Life | Bolig, tomt og nybygg i Alicante-innlandet",
    template: "%s | Pinoso Eco Life",
  },
  description:
    "Norsk rådgivning for bolig, tomt, finca og moderne nybygg i Pinoso og innlandet i Alicante og Murcia. Sammenlign områder og kjøpsmuligheter før du bestemmer deg.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pinoso Eco Life | Bolig, tomt og nybygg i Alicante-innlandet",
    description:
      "Utforsk Pinoso og innlandet i Alicante og Murcia med områdeguider, tomter, villaer, fincaer, nybygg og norsk kjøpsrådgivning.",
    url: BASE,
    siteName: "Pinoso Eco Life",
    locale: "nb_NO",
    type: "website",
    images: [
      {
        url: "/assets/hero-pinoso-dream.jpg",
        alt: "Pinoso Eco Life – innlandet i Alicante og Murcia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinoso Eco Life | Bolig, tomt og nybygg i Alicante-innlandet",
    description:
      "Områdeguider, tomter, villaer, fincaer og moderne nybygg i Pinoso og innlandet i Alicante og Murcia.",
    images: ["/assets/hero-pinoso-dream.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const entityGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE}/#website`,
        url: BASE,
        name: "Pinoso Eco Life",
        description:
          "Norsk rådgivning for bolig, tomt og moderne nybygg i Pinoso og innlandet i Alicante og Murcia.",
        inLanguage: "nb-NO",
        publisher: { "@id": `${BASE}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${BASE}/eiendommer?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": ["Organization", "RealEstateAgent"],
        "@id": `${BASE}/#organization`,
        name: "Pinoso Eco Life",
        url: BASE,
        logo: `${BASE}/assets/ecolife-mark.svg`,
        description:
          "Eiendomsrådgivning med fokus på Pinoso og innlandet i Alicante og Murcia: områdevalg, tomter, fincaer, villaer og moderne nybygg.",
        areaServed: [...ecoLifeAreas.map((area) => area.name), "Alicante", "Murcia", "Spain"],
        knowsAbout: [
          "Bolig i Pinoso",
          "Tomt i Pinoso",
          "Nybygg i Pinoso",
          "Bygge hus i Pinoso",
          "Finca i Alicante",
          "Villa med stor tomt i Spania",
          "Boligkjøp i Spania",
          "Områdevalg i Alicante og Murcia",
          "Tomtevurdering og kjøpsprosess",
        ],
        founder: {
          "@type": "Person",
          "@id": `${BASE}/om-freddy#person`,
          name: "Freddy Bremseth",
          url: `${BASE}/om-freddy`,
        },
        sameAs: ["https://www.freddybremseth.com"],
      },
    ],
  };

  return (
    <html lang="no" className={`${manrope.variable} ${newsreader.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entityGraph) }}
        />
        <CompareProvider>{children}</CompareProvider>
        <Script
          src="https://appointment.chatgenius.pro/embed.js"
          strategy="lazyOnload"
          data-brand="pinoso"
          data-config-url="https://realtyflow.chatgenius.pro/api/public/booking-config?brand_id=pinosoecolife"
        />
        <PinosoChatbot />
        <SearchDiscoveryTracker />
      </body>
    </html>
  );
}
