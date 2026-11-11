import styles from "./PlotEcoLifeStatus.module.css";

type Props = {
  hasArea: boolean;
  hasZoning: boolean;
  waterReported: boolean;
  electricityReported: boolean;
  roadReported: boolean;
  hasCatastro: boolean;
};

type Status = "reported" | "unknown" | "review";

function StatusRow({ label, status, explanation }: { label: string; status: Status; explanation: string }) {
  const statusLabels: Record<Status, string> = {
    reported: "Oppgitt – ikke verifisert",
    unknown: "Ikke dokumentert i oversikten",
    review: "Må undersøkes",
  };

  return (
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>
      <div>
        <span className={`${styles.badge} ${styles[status]}`}>{statusLabels[status]}</span>
        <p>{explanation}</p>
      </div>
    </div>
  );
}

export function PlotEcoLifeStatus({ hasArea, hasZoning, waterReported, electricityReported, roadReported, hasCatastro }: Props) {
  return (
    <details className={styles.details}>
      <summary>Eco Life-kontrollprofil – hva vet vi om tomten?</summary>
      <div className={styles.body}>
        <p className={styles.intro}>Dette er en oversikt over opplysninger i annonser og importerte data. «Oppgitt» betyr ikke at en fagperson har kontrollert forholdet. Ingen av punktene nedenfor er godkjennelser eller garantier.</p>
        <StatusRow label="Areal" status={hasArea ? "reported" : "unknown"} explanation="Sammenlign oppgitt areal med Catastro, registrering og faktisk avgrensning." />
        <StatusRow label="Regulering" status={hasZoning ? "reported" : "unknown"} explanation="Klassifisering fra tomtedata/annonsetekst. Gjeldende kommunal planstatus må bekreftes." />
        <StatusRow label="Vann" status={waterReported ? "reported" : "unknown"} explanation="Krev dokumentasjon på lovlig forsyning, rettigheter, vannkvalitet og kapasitet." />
        <StatusRow label="Strøm" status={electricityReported ? "reported" : "unknown"} explanation="Kontroller tilkoblingsmulighet, kapasitet og kostnader; solenergi krever egen teknisk vurdering." />
        <StatusRow label="Adkomst" status={roadReported ? "reported" : "unknown"} explanation="Lovlig adkomst og eventuell veirett må undersøkes." />
        <StatusRow label="Catastro" status={hasCatastro ? "reported" : "unknown"} explanation="Catastro kan identifisere tomten, men er ikke i seg selv bevis for byggerett." />
        <StatusRow label="Byggbarhet" status="review" explanation="Kommunal planstatus, byggegrenser, vern, vann og avløp krever individuell vurdering." />
        <StatusRow label="Dyrking og dyrehold" status="review" explanation="Jord, vann, klima, arealbruk og lokale tillatelser må avklares for ønsket aktivitet." />
      </div>
    </details>
  );
}
