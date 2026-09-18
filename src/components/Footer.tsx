import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <section className={styles.brandBlock}>
            <Link className={styles.brand} href="/" aria-label="Pinoso Eco Life – forside">
              <img className={styles.logo} src="/assets/logo.png" alt="" />
              <span className={styles.wordmark}>
                <strong>Pinoso Eco Life</strong>
                <span>Innlandet i Alicante &amp; Murcia</span>
              </span>
            </Link>
            <p className={styles.statement}>Start med livet du vil leve. Finn området, tomten og boligen etterpå.</p>
            <p className={styles.copy}>
              Norsk rådgivning for deg som vurderer et roligere liv i innlandet – fra områdevalg og tomtesøk til bolig,
              kontroll og gjennomføring.
            </p>
          </section>

          <nav className={styles.column} aria-label="Utforsk Pinoso Eco Life">
            <span className={styles.columnTitle}>Utforsk</span>
            <Link href="/livet-i-innlandet">Livet i innlandet</Link>
            <Link href="/eiendommer">Boliger</Link>
            <Link href="/tomter">Tomter</Link>
            <Link href="/magasin">Magasin</Link>
            <Link href="/bolig-i-alicante-innland">Bolig i Alicante innland</Link>
          </nav>

          <nav className={styles.column} aria-label="Pinoso kjøpsguider">
            <span className={styles.columnTitle}>Pinoso-guider</span>
            <Link href="/bolig-i-pinoso">Bolig i Pinoso</Link>
            <Link href="/nybygg-i-pinoso">Nybygg i Pinoso</Link>
            <Link href="/tomt-i-pinoso">Tomt i Pinoso</Link>
            <Link href="/bygge-hus-i-pinoso">Bygge hus i Pinoso</Link>
            <Link href="/villa-med-stor-tomt-i-spania">Villa med stor tomt</Link>
          </nav>

          <nav className={styles.column} aria-label="Rådgivning og neste steg">
            <span className={styles.columnTitle}>Neste steg</span>
            <Link href="/livet-i-innlandet">Finn riktig område</Link>
            <Link href="/kjopsprosessen">Kjøpsprosessen</Link>
            <Link href="/min-side">Min side</Link>
            <Link href="/#kontakt">Kontakt oss</Link>
          </nav>
        </div>

        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} Pinoso Eco Life</span>
          <span>Område først · riktig tomt · bolig tilpasset stedet</span>
        </div>
      </div>
    </footer>
  );
}
