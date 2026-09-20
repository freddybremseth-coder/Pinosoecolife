"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./SiteHeader.module.css";

const navLinks = [
  { href: "/livet-i-innlandet", label: "Livet i innlandet" },
  { href: "/omrader", label: "Områder" },
  { href: "/eiendommer", label: "Boliger" },
  { href: "/tomter", label: "Tomter" },
  { href: "/kjopsprosessen", label: "Kjøpsprosess" },
  { href: "/magasin", label: "Magasin" },
];

function isActivePath(pathname: string, href: string) {
  // Individual area guides live under /livet-i-innlandet/[slug], but belong
  // to the Områder navigation item rather than the lifestyle overview.
  if (href === "/livet-i-innlandet") return pathname === href;
  if (href === "/omrader") return pathname === href || pathname.startsWith("/livet-i-innlandet/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" aria-label="Pinoso Eco Life – forside">
          <img className={styles.logo} src="/assets/logo.png" alt="" />
          <span className={styles.brandCopy}>
            <span className={styles.wordmark}>Pinoso Eco Life</span>
            <span className={styles.brandLine}>Innlandet i Alicante &amp; Murcia</span>
          </span>
        </Link>

        <button
          className={styles.menuButton}
          type="button"
          aria-label={menuOpen ? "Lukk meny" : "Åpne meny"}
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <nav id="site-navigation" className={`${styles.nav} ${menuOpen ? styles.open : ""}`} aria-label="Hovedmeny">
          <p className={styles.mobileIntro}>Finn stedet og hverdagen du vil bygge livet rundt.</p>
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                className={`${styles.navLink} ${active ? styles.active : ""}`}
                href={link.href}
                key={link.href}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            className={`${styles.cta} ${isActivePath(pathname, "/min-side") ? styles.ctaActive : ""}`}
            href="/min-side"
            aria-current={isActivePath(pathname, "/min-side") ? "page" : undefined}
          >
            Min side
          </Link>
        </nav>
      </div>
    </header>
  );
}
