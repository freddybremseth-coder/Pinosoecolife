"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import styles from "./EcoLifePlanner.module.css";

type Energy = "grid" | "hybrid" | "independent";
type Goal = "garden" | "orchard" | "animals" | "natural";

const goalLabels: Record<Goal, string> = {
  garden: "Kjøkkenhage og grønnsaker",
  orchard: "Frukttrær, oliven eller mandler",
  animals: "Høner eller annet mindre dyrehold",
  natural: "Mest mulig naturlig tomt og privatliv",
};

const energyLabels: Record<Energy, string> = {
  grid: "Vanlig strømtilkobling",
  hybrid: "Solceller og batteri som supplement",
  independent: "Høy grad av energiuavhengighet",
};

export function EcoLifePlanner() {
  const [area, setArea] = useState("10000");
  const [energy, setEnergy] = useState<Energy>("hybrid");
  const [goals, setGoals] = useState<Goal[]>(["garden", "natural"]);
  const [water, setWater] = useState(true);
  const [budget, setBudget] = useState("");
  const [copied, setCopied] = useState(false);

  const minArea = Number(area);
  const selectedGoals = goals.map((goal) => goalLabels[goal]);
  const checklist = [
    "Bekreftet planstatus og tillatt bruk for den konkrete tomten",
    "Dokumentert vannforsyning, rettigheter og kapasitet",
    "Adkomst, terreng, naturrestriksjoner og lovlig avløpsløsning",
    ...(energy !== "grid" ? ["Teknisk vurdering av solenergi, batteri og strømnett"] : ["Dokumentert nettilkobling og tilgjengelig strømkapasitet"]),
    ...(goals.includes("garden") || goals.includes("orchard") ? ["Jord, frost, soleksponering og lovlig vann til dyrking"] : []),
    ...(goals.includes("animals") ? ["Lokale regler, registrering og helårs tilsyn for dyrehold"] : []),
    ...(water ? ["Mulighet, tillatelser og økonomi for vannlagring og effektiv vanning"] : []),
  ];
  const summary = [
    "Min Eco Life-plan",
    `Ønsket tomt: minst ${minArea.toLocaleString("nb-NO")} m²`,
    `Energi: ${energyLabels[energy]}`,
    `Bruk av tomten: ${selectedGoals.join(", ") || "Ikke valgt"}`,
    `Vannlagring / effektiv vanning: ${water ? "Prioritert" : "Ikke prioritert"}`,
    budget ? `Maksimal tomtepris: ${Number(budget).toLocaleString("nb-NO")} €` : "Tomtebudsjett: Ikke angitt",
    "Forutsetter juridisk og teknisk kontroll. Ingen bygge- eller bruksrett er bekreftet.",
  ].join("\n");
  const plotParams = new URLSearchParams({ minArea: String(minArea), source: "ecolife" });
  if (budget && Number(budget) > 0) plotParams.set("maxPrice", budget);

  function toggleGoal(goal: Goal) {
    setGoals((current) => current.includes(goal) ? current.filter((entry) => entry !== goal) : [...current, goal]);
    setCopied(false);
  }

  async function copyPlan() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.planner}>
      <section className={styles.inputs} aria-label="Dine Eco Life-ønsker">
        <div className={styles.field}>
          <h2>1. Hvor mye plass ser du for deg?</h2>
          <label htmlFor="ecolife-area">Ønsket minimumsareal</label>
          <select id="ecolife-area" value={area} onChange={(event) => setArea(event.target.value)}>
            <option value="5000">5 000 m²</option>
            <option value="10000">10 000 m²</option>
            <option value="15000">15 000 m²</option>
            <option value="20000">20 000 m²</option>
            <option value="30000">30 000 m²</option>
          </select>
          <p className={styles.hint}>Arealet er et søkekriterium – ingen garanti for at tomten er byggbar eller egnet til ønsket bruk.</p>
        </div>
        <fieldset className={styles.field}>
          <legend>2. Hvordan vil du bruke tomten?</legend>
          {(Object.keys(goalLabels) as Goal[]).map((goal) => (
            <label className={styles.check} key={goal}>
              <input type="checkbox" checked={goals.includes(goal)} onChange={() => toggleGoal(goal)} />
              <span>{goalLabels[goal]}</span>
            </label>
          ))}
        </fieldset>
        <fieldset className={styles.field}>
          <legend>3. Hvilken energiløsning ønsker du?</legend>
          {(Object.keys(energyLabels) as Energy[]).map((choice) => (
            <label className={styles.check} key={choice}>
              <input type="radio" name="ecolife-energy" checked={energy === choice} onChange={() => setEnergy(choice)} />
              <span>{energyLabels[choice]}</span>
            </label>
          ))}
        </fieldset>
        <div className={styles.field}>
          <h2>4. Vann og økonomi</h2>
          <label className={styles.check}><input type="checkbox" checked={water} onChange={(event) => setWater(event.target.checked)} /><span>Jeg ønsker å undersøke vannlagring og effektiv vanning</span></label>
          <label htmlFor="ecolife-budget">Maksimal tomtepris i euro (valgfritt)</label>
          <input id="ecolife-budget" type="number" inputMode="numeric" min="0" step="1000" placeholder="For eksempel 80000" value={budget} onChange={(event) => setBudget(event.target.value)} />
          <p className={styles.hint}>Tomtepris er ikke totalbudsjett for hus, infrastruktur, avgifter og tillatelser.</p>
        </div>
      </section>
      <aside className={styles.result} aria-live="polite">
        <p className={styles.eyebrow}>Din foreløpige Eco Life-profil</p>
        <h2>Fra idé til konkrete krav</h2>
        <dl>
          <div><dt>Minste tomtestørrelse</dt><dd>{minArea.toLocaleString("nb-NO")} m²</dd></div>
          <div><dt>Energi</dt><dd>{energyLabels[energy]}</dd></div>
          <div><dt>Bruksønsker</dt><dd>{selectedGoals.join(", ") || "Ingen valgt ennå"}</dd></div>
        </dl>
        <h3>Dette bør kontrolleres før du går videre</h3>
        <ul>{checklist.map((item) => <li key={item}>{item}</li>)}</ul>
        <p className={styles.warning}>Vi kan foreløpig filtrere tomter etter areal og oppgitt pris. Energi, vann, dyrehold og byggbarhet er ikke verifiserte filtre og må undersøkes separat.</p>
        <Link className={styles.primary} href={`/tomter?${plotParams.toString()}`}>Se tomter etter areal og pris <ArrowRight size={18} /></Link>
        <button type="button" className={styles.secondary} onClick={copyPlan}>{copied ? "Planen er kopiert" : "Kopier min Eco Life-plan"}</button>
        <Link className={styles.contact} href="/#kontakt">Kontakt oss for vurdering av tomt og prosjekt</Link>
        <p className={styles.privacy}>Valgene dine lagres ikke eller sendes automatisk til oss. Kopier planen hvis du vil dele den i en henvendelse.</p>
      </aside>
    </div>
  );
}
