import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, Bath, BedDouble, Download, FileText, Home, MessageCircle, Ruler, Tag } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Footer } from "@/components/Footer";
import { ReadMoreText } from "@/components/ReadMoreText";
import { SiteHeader } from "@/components/SiteHeader";
import {
  formatPrice,
  getPrimaryImage,
  getProperties,
  getProperty,
  getPropertyArea,
  getPropertyDescription,
  getPropertyImages,
  getPropertyRef,
  getPropertyTitle,
  getPropertyType,
} from "@/lib/realtyflow";
import styles from "./property-detail.module.css";

export async function generateStaticParams() {
  const properties = await getProperties(0);
  return properties.map((property) => ({ id: encodeURIComponent(getPropertyRef(property)) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const property = await getProperty(decoded);

  if (!property) {
    return {
      title: "Bolig ikke funnet",
      robots: { index: false, follow: false },
    };
  }

  const ref = getPropertyRef(property);
  const title = getPropertyTitle(property);
  const location = property.location || property.town || "Alicante innland";
  const rawDescription = getPropertyDescription(property).replace(/\s+/g, " ").trim();
  const fallbackDescription = `${getPropertyType(property)} i ${location} · ${formatPrice(property.price)}. Se bilder, nøkkeldata og be Pinoso Eco Life om oppdatert tilgjengelighet og komplett prospekt.`;
  const description = rawDescription
    ? rawDescription.length > 158
      ? `${rawDescription.slice(0, 155).replace(/\s+\S*$/, "")}…`
      : rawDescription
    : fallbackDescription;
  const canonicalPath = `/eiendommer/${encodeURIComponent(ref)}`;
  const image = getPrimaryImage(property);

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: `https://www.pinosoecolife.com${canonicalPath}`,
      siteName: "Pinoso Eco Life",
      locale: "nb_NO",
      type: "website",
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getProperty(decodeURIComponent(id));

  if (!property) notFound();

  const images = getPropertyImages(property);
  const floorplans = Array.isArray(property.floorplans) ? property.floorplans.filter(Boolean) : [];
  const floorplanCanBeRequested =
    floorplans.length > 0 ||
    (Array.isArray(property.amenities_no) &&
      property.amenities_no.some((item) => /floorplan|plantegning/i.test(String(item))));
  const mainImage = getPrimaryImage(property);
  const description = getPropertyDescription(property);
  const location = property.location || property.town || "Spania";
  const detailFacts = [
    { icon: <Tag />, label: `Ref ${getPropertyRef(property)}` },
    { icon: <Home />, label: getPropertyType(property) },
    property.bedrooms ? { icon: <BedDouble />, label: `${property.bedrooms} soverom` } : null,
    property.bathrooms ? { icon: <Bath />, label: `${property.bathrooms} bad` } : null,
    getPropertyArea(property) ? { icon: <Ruler />, label: `${getPropertyArea(property)} m² bolig` } : null,
    property.plot_size ? { icon: <Ruler />, label: `${Number(property.plot_size).toLocaleString("nb-NO")} m² tomt` } : null,
    property.pool ? { icon: <Home />, label: "Basseng" } : null,
    property.garage ? { icon: <Home />, label: "Garasje" } : null,
    property.energy_rating ? { icon: <Tag />, label: `Energi ${property.energy_rating}` } : null,
    property.year_built ? { icon: <Tag />, label: `Byggeår ${property.year_built}` } : null,
    property.floor_label ? { icon: <Tag />, label: property.floor_label } : null,
  ].filter(Boolean) as Array<{ icon: ReactNode; label: string }>;

  return (
    <main>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Residence",
            "@id": `https://www.pinosoecolife.com/eiendommer/${encodeURIComponent(getPropertyRef(property))}#residence`,
            url: `https://www.pinosoecolife.com/eiendommer/${encodeURIComponent(getPropertyRef(property))}`,
            identifier: getPropertyRef(property),
            name: getPropertyTitle(property),
            description:
              description ||
              "Moderne bolig til salgs i Spania. Kontakt Pinoso Eco Life for prospekt, tilgjengelighet og visning.",
            image: images.length ? images : [mainImage],
            mainEntityOfPage: `https://www.pinosoecolife.com/eiendommer/${encodeURIComponent(getPropertyRef(property))}`,
            floorSize: getPropertyArea(property)
              ? {
                  "@type": "QuantitativeValue",
                  value: getPropertyArea(property),
                  unitCode: "MTK",
                }
              : undefined,
            address: {
              "@type": "PostalAddress",
              addressLocality: location,
              addressCountry: "ES",
            },
            offers: property.price
              ? {
                  "@type": "Offer",
                  price: property.price,
                  priceCurrency: "EUR",
                  availability: "https://schema.org/InStock",
                  url: `https://www.pinosoecolife.com/eiendommer/${encodeURIComponent(getPropertyRef(property))}`,
                  seller: { "@id": "https://www.pinosoecolife.com/#organization" },
                }
              : undefined,
          }),
        }}
      />

      <section className={styles.hero} style={{ backgroundImage: `url(${mainImage})` }}>
        <div className={styles.heroInner}>
          <Link className={styles.back} href="/eiendommer">
            <ArrowLeft size={17} /> Alle boliger
          </Link>
          <p className={styles.eyebrow}>{location}</p>
          <h1 className={styles.title}>{getPropertyTitle(property)}</h1>
          <strong className={styles.price}>{formatPrice(property.price)}</strong>
          <div className={styles.heroActions}>
            <FavoriteButton
              favorite={{
                ref: getPropertyRef(property),
                title: getPropertyTitle(property),
                location,
                price: formatPrice(property.price),
                href: `/eiendommer/${encodeURIComponent(getPropertyRef(property))}`,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                builtArea: getPropertyArea(property) || undefined,
                plotSize: property.plot_size,
                pool: property.pool,
              }}
            />
            <a className={styles.heroAction} href="#kontakt">
              <MessageCircle size={17} /> Be om prospekt eller visning
            </a>
            {images.length > 1 && (
              <a className={styles.heroAction} href="#bilder">Bilder ({images.length})</a>
            )}
            {floorplans.length > 0 ? (
              <a className={styles.heroAction} href="#plantegninger">Plantegninger ({floorplans.length})</a>
            ) : floorplanCanBeRequested ? (
              <a className={styles.heroAction} href="#kontakt"><FileText size={17} /> Be om plantegning</a>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.shell}>
        <div className={styles.main}>
          <div className={styles.factGrid}>
            {detailFacts.map((fact) => (
              <div className={styles.fact} key={fact.label}>
                {fact.icon}
                <span>{fact.label}</span>
              </div>
            ))}
          </div>

          <article className={styles.story}>
            <h2>Om boligen</h2>
            <ReadMoreText
              actionLabel="Be om komplett tilbud"
              text={
                description ||
                "Dette er et moderne nybygg/prosjekt i Spania. Kontakt oss for komplett prospekt, plantegninger og oppdatert tilgjengelighet."
              }
            />
          </article>

          <section className={styles.decisionGrid}>
            <article className={styles.decisionCard}>
              <h2>Dette bør sjekkes før reservasjon</h2>
              <ul>
                <li>Oppdatert tilgjengelighet, pris og hva som faktisk er inkludert.</li>
                <li>Betalingsplan, byggefase og forventet overtakelse.</li>
                <li>Utbygger, kvalitet, garantier og tidligere leveranser.</li>
                <li>Daglig service, helse, flyplass, adkomst og hvordan området fungerer gjennom året.</li>
              </ul>
            </article>
            <article className={styles.decisionCard}>
              <h2>Kjøpskostnader må beregnes konkret</h2>
              <p>
                Skatter og omkostninger varierer med blant annet boligtype, region, kjøpesum og hvilke tjenester som inngår.
                Vi lager derfor et konkret estimat i stedet for å bruke én fast prosentsats for alle kjøp.
              </p>
              <div className={styles.costBox}>
                <span>Oppgitt boligpris</span>
                <strong>{formatPrice(property.price)}</strong>
                <span>Skatter og omkostninger</span>
                <strong>Beregnes konkret</strong>
              </div>
            </article>
            <article className={styles.decisionCard}>
              <h2>Hvis utleie er relevant</h2>
              <p>
                Regler, tillatelser, etterspørsel, sesong, kostnader og faktisk bruk må vurderes for den konkrete boligen og kommunen.
              </p>
            </article>
            <article className={styles.decisionCard}>
              <h2>Hva er inkludert?</h2>
              <p>
                Be om komplett tilbud, så sjekker vi hvitevarer, belysning, basseng, hage, parkering, møbler, klima,
                solcellevalg og eventuelle tillegg.
              </p>
            </article>
          </section>

          <section className={styles.steps}>
            <h2>Neste steg</h2>
            <div className={styles.step}><span className={styles.stepNumber}>1</span><p>Vi sjekker oppdatert tilgjengelighet, pris og betalingsplan.</p></div>
            <div className={styles.step}><span className={styles.stepNumber}>2</span><p>Du får prospekt, områdevurdering og relevante alternativer.</p></div>
            <div className={styles.step}><span className={styles.stepNumber}>3</span><p>Vi planlegger digital eller fysisk visning og hjelper deg videre i kjøpsprosessen.</p></div>
          </section>

          {floorplans.length > 0 && (
            <section className={styles.gallery} id="plantegninger">
              <h2>Plantegninger</h2>
              <p className={styles.galleryIntro}>
                Se planløsningen som er registrert for boligen. Endelige mål og utførelse bekreftes alltid i det komplette prospektet.
              </p>
              <div className={styles.galleryGrid}>
                {floorplans.slice(0, 6).map((floorplan, index) => (
                  <img
                    className={styles.floorplanImage}
                    src={floorplan}
                    alt={`Plantegning ${index + 1} for ${getPropertyTitle(property)}`}
                    loading="lazy"
                    decoding="async"
                    key={floorplan}
                  />
                ))}
              </div>
            </section>
          )}

          {images.length > 1 && (
            <section className={styles.gallery} id="bilder">
              <h2>Bilder</h2>
              <p className={styles.galleryIntro}>Trykk på et bilde for å åpne originalen i full størrelse.</p>
              <div className={styles.galleryGrid}>
                {images.slice(1, 10).map((image, index) => (
                  <a href={image} target="_blank" rel="noreferrer" key={image} aria-label={`Åpne bilde ${index + 2} i full størrelse`}>
                    <img
                      className={styles.galleryImage}
                      src={image}
                      alt={`${getPropertyTitle(property)} – bilde ${index + 2}`}
                      loading="lazy"
                      decoding="async"
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className={styles.area}>
            <h2>Område og beliggenhet</h2>
            <p>
              Boligen ligger i {location}. Vi vurderer området sammen med deg ut fra hverdagsservice, helsetjenester,
              reisevei, natur og uteområder, samt hvordan stedet fungerer gjennom hele året.
            </p>
            <div className={styles.areaTags}>
              <span>Norsk vurdering av området</span>
              <span>Alternativer som passer samme behov</span>
              <span>Digital eller fysisk visning</span>
            </div>
          </section>

          <nav className={styles.breadcrumb} aria-label="Brødsmule">
            <Link href="/">Forside</Link><span>/</span><Link href="/eiendommer">Boliger</Link><span>/</span><span>{getPropertyTitle(property)}</span>
          </nav>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Forside", item: "https://www.pinosoecolife.com" },
                  { "@type": "ListItem", position: 2, name: "Boliger", item: "https://www.pinosoecolife.com/eiendommer" },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: getPropertyTitle(property),
                    item: `https://www.pinosoecolife.com/eiendommer/${encodeURIComponent(getPropertyRef(property))}`,
                  },
                ],
              }),
            }}
          />
        </div>

        <aside className={styles.aside}>
          <h2>Interessert?</h2>
          <p>Send forespørsel, så hjelper vi deg med prospekt, visning og neste steg.</p>
          <div className={styles.asideActions}>
            <a className={styles.asideAction} href="#kontakt"><MessageCircle size={16} /> Spør om boligen</a>
            <a className={styles.asideAction} href="#kontakt"><Download size={16} /> Be om komplett tilbud</a>
            {floorplanCanBeRequested && floorplans.length === 0 && (
              <a className={styles.asideAction} href="#kontakt"><FileText size={16} /> Be om plantegning</a>
            )}
          </div>
          <div id="kontakt" />
          <ContactForm
            propertyRef={getPropertyRef(property)}
            propertyTitle={getPropertyTitle(property)}
            preferredArea={location}
            requestType="Komplett tilbud/prospekt"
            source={`property-${getPropertyRef(property)}`}
          />
        </aside>
      </section>

      <Footer />
    </main>
  );
}
