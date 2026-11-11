"use client";

import { useState } from "react";
import { growingCalendar } from "@/lib/growing-calendar";
import styles from "./GrowingCalendar.module.css";

export function GrowingCalendar() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [climate, setClimate] = useState<"inland" | "sheltered">("inland");
  const selected = growingCalendar[selectedMonth];

  return (
    <section className={styles.calendar} aria-labelledby="growing-calendar-title">
      <p className={styles.kicker}>Dyrkingskalender · Alicante-innlandet</p>
      <h2 id="growing-calendar-title">Hva bør du tenke på denne måneden?</h2>
      <p className={styles.intro}>En veiledende årshjul for planlegging, ikke en fast såkalender. Høyde over havet, frost, jord og vann avgjør hva som passer på akkurat din finca.</p>
      <div className={styles.months} aria-label="Velg måned">
        {growingCalendar.map((item, index) => (
          <button key={item.month} type="button" className={selectedMonth === index ? styles.selected : ""} aria-pressed={selectedMonth === index} onClick={() => setSelectedMonth(index)}>{item.month.slice(0, 3)}</button>
        ))}
      </div>
      <div className={styles.panel}>
        <p className={styles.kicker}>{selected.month}</p>
        <h3>{selected.phase}</h3>
        <ul>{selected.work.map((task) => <li key={task}>{task}</li>)}</ul>
        <p><strong>Aktuelle vekster:</strong> {selected.crops}</p>
      </div>
      <fieldset className={styles.climate}>
        <legend>Hvor ligger hagen?</legend>
        <label><input type="radio" checked={climate === "inland"} onChange={() => setClimate("inland")} /> Åpent eller høyereliggende innland</label>
        <label><input type="radio" checked={climate === "sheltered"} onChange={() => setClimate("sheltered")} /> Lun, beskyttet beliggenhet</label>
      </fieldset>
      <p className={styles.advice}>{climate === "inland" ? "Vær særlig oppmerksom på lokale frostnetter og temperatursvingninger. Kontroller nattetemperatur og jordtemperatur før utplanting." : "En lun hage kan gi andre forhold enn åpne områder, men frostfrihet kan ikke forutsettes. Følg lokale målinger før du sår eller planter."}</p>
      <p className={styles.source}>Sjekk lokale observasjoner hos <a href="https://www.aemet.es/es/eltiempo/prediccion/municipios/pinos-el-pinoso-id03105" target="_blank" rel="noopener noreferrer">AEMET Pinoso</a> og vanningsdata hos <a href="https://servicio.mapa.gob.es/siarweb/home" target="_blank" rel="noopener noreferrer">SiAR</a>.</p>
    </section>
  );
}
