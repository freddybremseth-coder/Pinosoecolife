import Link from "next/link";
import { ArrowRight, Leaf, MapPin, Mountain, Route, Sprout } from "lucide-react";

import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { ecoLifeAreaGroups, ecoLifeAreas } from "@/lib/ecolife-areas";

export const metadata = {
  title: "Livet i innlandet | Pinoso Eco Life",
  description:
    "Utforsk hvordan hverdagen kan se ut i Pinoso, Hondón, Aspe, La Romana, Biar, Villena, Jumilla og andre innlandsområder i Alicante og Murcia.",
  alternates: { canonical: "/livet-i-innlandet" },
};

const icons = {
  vinland: Leaf,
  landsby: Sprout,
  praktisk: Route,
  fjell: Mountain,
};

export default function InlandLifePage() {
  return (
    <main>
      <SiteHeader />

      <section className="page-hero compact-hero image-hero">
        <p className="eyebrow">Pinoso Eco Life</p>
        <h1>Livet i innlandet</h1>
        <p>
          Ikke alle innlandsområder gir den samme hverdagen. Noen handler om vinland og store tomter. Andre om
          landsbyliv, fjell, byservice eller enkel reise til flyplassen. Start med livet du ønsker – ikke bare med huset.
        </p>
      </section>

      <section className="section proof-section">
        <div className="section-heading">
          <p className="eyebrow">Hva passer deg?</p>
          <h2>Velg type hverdag før du velger område</h2>
          <p>
            Den riktige tomten i feil område er fortsatt feil. Derfor deler vi innlandet etter hvordan stedet faktisk
            kan brukes i hverdagen – og lar bolig og tomt komme etterpå.
          </p>
        </div>
        <div className="proof-grid">
          {ecoLifeAreaGroups.map((group) => {
            const Icon = icons[group.key];
            const count = ecoLifeAreas.filter((area) => area.zone === group.key).length;
            return (
              <article key={group.key}>
                <strong><Icon size={24} /></strong>
                <h3>{group.title}</h3>
                <p>{group.text}</p>
                <span>{count} områder</span>
              </article>
            );
          })}
        </div>
      </section>

      {ecoLifeAreaGroups.map((group) => {
        const groupAreas = ecoLifeAreas.filter((area) => area.zone === group.key);
        return (
          <section className="section area-profile-grid region-area-section" id={group.key} key={group.key}>
            <div className="section-heading region-heading">
              <div>
                <p className="eyebrow">Områder</p>
                <h2>{group.title}</h2>
                <p>{group.text}</p>
              </div>
            </div>
            {groupAreas.map((area) => (
              <article className="area-profile-card" key={area.slug}>
                <div style={{ backgroundImage: `url(${area.photo})` }} />
                <section>
                  <span>{area.region}</span>
                  <h2>{area.name}</h2>
                  <strong>{area.eyebrow}</strong>
                  <p>{area.summary}</p>
                  <ul>
                    {area.bestFor.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
                  </ul>
                  <Link className="text-button area-property-link" href={`/livet-i-innlandet/${area.slug}`}>
                    Hvordan er livet i {area.name}? <ArrowRight size={16} />
                  </Link>
                </section>
              </article>
            ))}
          </section>
        );
      })}

      <section className="section split">
        <div>
          <p className="eyebrow">Tomten kommer etter området</p>
          <h2>10 000 m² kan gi helt forskjellige liv</h2>
          <p>
            Den samme tomtestørrelsen kan bety vinland og åpne horisonter i Pinoso, en mer praktisk hverdag nær
            Alicante i Aspe eller fjell og tydeligere årstider rundt Biar. Derfor er områdevalget første store beslutning.
          </p>
          <div className="check-list">
            <span><MapPin size={18} /> Hvilket miljø vil du våkne i?</span>
            <span><Route size={18} /> Hvor viktig er flyplass, by og daglig service?</span>
            <span><Sprout size={18} /> Hva vil du faktisk gjøre med tomten?</span>
          </div>
        </div>
        <div className="feature-panel">
          <div><Leaf /> Vinland og dyrking</div>
          <div><Mountain /> Fjell og natur</div>
          <div><Route /> Enkel logistikk</div>
          <div><Sprout /> Landsby og finca-ro</div>
        </div>
      </section>

      <section className="section proof-section">
        <div className="section-heading">
          <p className="eyebrow">Neste steg</p>
          <h2>Se området først. Deretter finner vi tomten.</h2>
          <p>
            Når du vet hvilken type hverdag du ønsker, blir det lettere å vurdere tomt, boligmodell og totalbudsjett
            uten å forelske seg i feil prosjekt først.
          </p>
        </div>
        <div className="center-action">
          <Link className="text-button" href="/tomter">Se aktuelle tomter <ArrowRight size={18} /></Link>
          <Link className="text-button" href="/magasin">Les Eco Life-artikler <ArrowRight size={18} /></Link>
          <Link className="text-button" href="/#kontakt">Fortell oss hvordan du vil leve <ArrowRight size={18} /></Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
