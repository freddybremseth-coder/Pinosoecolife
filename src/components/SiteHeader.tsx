import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Pinoso Eco Life">
        <img src="/assets/logo.png" alt="" />
        <span>Pinoso Eco Life</span>
      </Link>
      <nav className="nav">
        <Link href="/eiendommer">Boliger</Link>
        <Link href="/tomter">Tomter</Link>
        <Link href="/omrader">Områder</Link>
        <Link href="/kjopsprosessen">Kjøpsprosess</Link>
        <Link href="/magasin">Magasin</Link>
        <Link className="nav-cta" href="/min-side">
          Min side
        </Link>
      </nav>
    </header>
  );
}
