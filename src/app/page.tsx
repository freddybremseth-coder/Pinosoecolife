import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Grape, Leaf, MapPinned, Sprout, SunMedium } from "lucide-react";
import { BuyerMatchQuiz } from "@/components/BuyerMatchQuiz";
import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { SiteHeader } from "@/components/SiteHeader";
import { getProperties } from "@/lib/realtyflow";
import styles from "./home.module.css";

export default async function Home() {
  const properties = await getProperties(6);

  const journey = [
    {
      number: "01",
      title: "Start med livet",
      text: "Privatliv, hage, natur, landsbyliv, familie og hvor mye du faktisk vil bruke tomten til kommer før antall soverom.",
    },
    {
      number: "02",
      title: "Finn riktig område",
      text: "Pinoso, Monóvar, Hondón, Biar, Jumilla og de andre innlandsområdene gir forskjellige hverdager. Vi sammenligner stedet før objektet.",
    },
    {
      number: "03",
      title: "Finn tomten eller boligen",
      text: "Når området er riktig, snevrer vi inn søket mot en eksisterende bolig eller en tomt som faktisk passer prosjektet og budsjettet.",
    },
    {
      number: "04",
      title: "Kontroller før du binder deg",
      text: "Planstatus, byggbarhet, adkomst, vann, strøm, avløp, kostnader og dokumentasjon må henge sammen før drømmen blir en beslutning.",
    },
  ];

  return (
    <main>
      <SiteHeader />

      <section className={styles.hero} id="top">
        <Image
          className={styles.heroMedia}
          src="/assets/hero-pinoso-dream.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 48%", backgroundImage: "none" }}
        />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Pinoso Eco Life · Alicante & Murcia</p>
          <h1 className={styles.heroTitle}>Ikke bare et nytt hjem. En annen måte å leve på.</h1>
          <p className={styles.heroLead}>
            Mer plass. Mer ro. Mer av livet ute. Vi starter med hverdagen du ønsker, finner området som passer og går
            derfra videre til riktig tomt eller bolig.
          </p>

          <div className={styles.heroBottom}>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="/livet-i-innlandet">
                Oppdag livet i innlandet <Leaf size={18} />
              </Link>
              <Link className={styles.secondaryAction} href="/tomter">
                Se aktuelle tomter <MapPinned size={18} />
              </Link>
            </div>
            <form className={styles.heroSearch} action="/tomter">
              <input name="q" aria-label="Søk område eller tomt" placeholder="Pinoso, Biar, Jumilla, referanse..." />
              <button type="submit">
                Søk <ArrowRight size={17} />
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className={styles.intro}>
        <div className={styles.introTop}>
          <h2 className={styles.statement}>
            10 000 m² er ikke bare tomt. Det er <em>10 000 m² med muligheter.</em>
          </h2>
          <div className={styles.introCopy}>
            <p>
              En stor tomt kan bli kjøkkenhage, frukttrær, noen vinranker, uteplasser, plass til familie og hobbyer –
              eller ganske enkelt mer luft mellom deg og neste nabo.
            </p>
            <p>
              <strong>Du trenger ikke bruke all plassen.</strong> Poenget er at du får valget. Hva som faktisk kan bygges
              eller gjøres på en konkret tomt må alltid kontrolleres separat.
            </p>
            <Link className={styles.editorialLink} href="/magasin/10000-m2-hva-gjor-du-med-plassen">
              Les historien om 10 000 m² <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        <div className={styles.pillars}>
          <article className={styles.pillar}>
            <div className={styles.pillarIcon}><SunMedium size={22} /></div>
            <div>
              <h2>Et annet tempo</h2>
              <p>
                Ikke fordi klokken går saktere, men fordi hverdagen kan fylles av mindre hastverk, mer utetid og mer av
                det som skjer rett rundt hjemmet.
              </p>
              <Link className={styles.editorialLink} href="/magasin/et-annet-tempo-vanlig-tirsdag-innlandet">
                En vanlig tirsdag i innlandet <ArrowRight size={17} />
              </Link>
            </div>
          </article>

          <article className={styles.pillar}>
            <div className={styles.pillarIcon}><Sprout size={22} /></div>
            <div>
              <h2>Plass til å skape</h2>
              <p>La hagen, trærne, uteområdene og de små prosjektene utvikle seg sammen med måten du faktisk lever på.</p>
              <Link className={styles.editorialLink} href="/magasin/fra-blank-tomt-til-eget-landskap">
                Fra tomt til eget landskap <ArrowRight size={17} />
              </Link>
            </div>
          </article>

          <article className={styles.pillar}>
            <div className={styles.pillarIcon}><Grape size={22} /></div>
            <div>
              <h2>Mer selvberget</h2>
              <p>Ikke et løfte om selvforsyning – men kanskje egne tomater, frukt, urter, egg eller druer fra egen jord.</p>
              <Link className={styles.editorialLink} href="/magasin/fra-supermarked-til-egen-hage">
                Start med egen hage <ArrowRight size={17} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.propertyStage}>
        <div className={styles.stageInner}>
          <div className={styles.stageHeading}>
            <h2>Boligen kommer etter området.</h2>
            <p>
              Her er et utvalg publiserte innlandsboliger fra RealtyFlow. Se dem som konkrete muligheter – ikke som
              erstatning for å finne ut hvor og hvordan du faktisk ønsker å bo.
            </p>
          </div>
          <div className="property-grid">
            {properties.map((property, index) => (
              <PropertyCard key={property.id || property.ref || index} property={property} priority={index < 3} />
            ))}
          </div>
          <div className={styles.stageActions}>
            <Link className="text-button" href="/eiendommer">
              Se alle boliger <ArrowRight size={18} />
            </Link>
            <Link className="text-button" href="/tomter">
              Se tomter <MapPinned size={18} />
            </Link>
            <Link className="text-button" href="/livet-i-innlandet">
              Sammenlign områdene <Leaf size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.journey}>
        <div className={styles.journeyHeader}>
          <p className="eyebrow">Fra idé til gjennomførbart prosjekt</p>
          <h2>En roligere måte å ta en stor beslutning på.</h2>
          <p>
            Det er lett å forelske seg i en boligannonse. Vi snur rekkefølgen og bygger beslutningen fra livet og stedet
            og inn mot den konkrete eiendommen.
          </p>
        </div>
        <div className={styles.steps}>
          {journey.map((step) => (
            <article className={styles.step} key={step.number}>
              <span className={styles.stepNumber}>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <BuyerMatchQuiz />

      <section className={styles.story}>
        <div className={styles.storyImage} aria-hidden="true" />
        <div className={styles.storyCopy}>
          <p className={styles.kicker}>Tomten som en del av hjemmet</p>
          <h2>Du kjøper også rommet rundt huset.</h2>
          <p>
            Utsikt er én ting. Hverdagen handler også om hva du hører, hvor nært naboen er, hvor du går en kveldstur,
            hvor barna leker og om du faktisk får brukt uteområdet slik du forestilte deg.
          </p>
          <div className={styles.storyPoints}>
            <span className={styles.storyPoint}><Check size={17} /> Privatliv og plassering</span>
            <span className={styles.storyPoint}><Check size={17} /> Hage, dyrking og vann</span>
            <span className={styles.storyPoint}><Check size={17} /> Natur, aktivitet og lokalmiljø</span>
            <span className={styles.storyPoint}><Check size={17} /> Vedlikehold du faktisk ønsker</span>
          </div>
          <Link className={styles.storyLink} href="/magasin/du-kjoper-rommet-rundt-huset">
            Les om rommet rundt huset <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="contact-section" id="kontakt">
        <div>
          <p className="eyebrow">Klar for en prat?</p>
          <h2>Fortell oss hvordan du ønsker å leve</h2>
          <p>
            Ikke bare antall soverom. Fortell om plass, privatliv, hage, aktivitet, familie, logistikk og hva du ser for
            deg å bruke tomten til.
          </p>
        </div>
        <ContactForm source="pinosoecolife-home" />
      </section>

      <Footer />
    </main>
  );
}
