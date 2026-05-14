"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/eiendommer", label: "Boliger" },
  { href: "/tomter", label: "Tomter" },
  { href: "/omrader", label: "Områder" },
  { href: "/kjopsprosessen", label: "Kjøpsprosess" },
  { href: "/magasin", label: "Magasin" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Pinoso Eco Life">
        <img src="/assets/logo.png" alt="" />
        <span>Pinoso Eco Life</span>
      </Link>
      <button
        className="mobile-menu-button"
        type="button"
        aria-label={menuOpen ? "Lukk meny" : "Åpne meny"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <nav className={`nav ${menuOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <Link href={link.href} key={link.href} onClick={closeMenu}>
            {link.label}
          </Link>
        ))}
        <Link className="nav-cta" href="/min-side" onClick={closeMenu}>
          Min side
        </Link>
      </nav>
    </header>
  );
}
