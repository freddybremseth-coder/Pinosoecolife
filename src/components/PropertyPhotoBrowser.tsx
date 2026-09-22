"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import styles from "./PropertyPhotoBrowser.module.css";

export type BrowseHome = {
  ref: string;
  title: string;
  image: string;
  price: string;
  location: string;
};

type Props = {
  homes: BrowseHome[];
  currentRef: string;
  currentImages: string[];
  variant: "hero" | "gallery";
};

export function PropertyPhotoBrowser({ homes, currentRef, currentImages, variant }: Props) {
  const [open, setOpen] = useState(false);
  const [activeRef, setActiveRef] = useState(currentRef);
  const [photoIndex, setPhotoIndex] = useState(0);
  const homeIndex = Math.max(0, homes.findIndex((home) => home.ref === activeRef));
  const home = homes[homeIndex];
  const photos = activeRef === currentRef && currentImages.length
    ? currentImages : home?.image ? [home.image] : [];
  const selected = photos[photoIndex] || photos[0];

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight" && homes.length > 1) {
        setActiveRef((ref) => {
          const index = homes.findIndex((item) => item.ref === ref);
          return homes[(index + 1 + homes.length) % homes.length].ref;
        });
        setPhotoIndex(0);
      }
      if (event.key === "ArrowLeft" && homes.length > 1) {
        setActiveRef((ref) => {
          const index = homes.findIndex((item) => item.ref === ref);
          return homes[(index - 1 + homes.length) % homes.length].ref;
        });
        setPhotoIndex(0);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, homes]);

  function show(startAt = 0) {
    setActiveRef(currentRef);
    setPhotoIndex(startAt);
    setOpen(true);
  }

  function changeHome(direction: number) {
    if (!homes.length) return;
    setActiveRef(homes[(homeIndex + direction + homes.length) % homes.length].ref);
    setPhotoIndex(0);
  }

  return (
    <>
      {variant === "hero" ? (
        <button type="button" className={styles.heroTrigger} onClick={() => show()}
          aria-label="Åpne boligbildet og bla mellom boliger">
          <span>Se bilder og bla mellom boliger ↔</span>
        </button>
      ) : (
        <div className={styles.thumbnails}>
          {currentImages.map((image, index) => (
            <button type="button" onClick={() => show(index)} key={image}
              aria-label={"Åpne bilde " + (index + 1) + " og bla mellom boliger"}>
              <img src={image} alt={homes.find((item) => item.ref === currentRef)?.title || "Boligbilde"}
                loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
      {open && home && selected && createPortal(
        <div className={styles.backdrop} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className={styles.dialog} role="dialog" aria-modal="true"
            aria-label="Bilder og neste bolig">
            <div className={styles.top}>
              <div><span className={styles.counter}>Bolig {homeIndex + 1} av {homes.length} · {home.ref}</span>
                <strong>{home.title}</strong><span>{home.location} · {home.price}</span></div>
              <button type="button" className={styles.close} onClick={() => setOpen(false)}
                aria-label="Lukk bildevisning"><X size={24} /></button>
            </div>
            <div className={styles.photo}>
              <img src={selected} alt={home.title + " – bilde " + (photoIndex + 1)} />
            </div>
            <nav className={styles.actions} aria-label="Bla mellom boliger">
              <button type="button" onClick={() => changeHome(-1)} disabled={homes.length < 2}>
                <ArrowLeft size={18} /> Forrige bolig
              </button>
              <span>{photos.length > 1 ? "Bilde " + (photoIndex + 1) + " av " + photos.length : ""}</span>
              <button type="button" onClick={() => changeHome(1)} disabled={homes.length < 2}>
                Neste bolig <ArrowRight size={18} />
              </button>
            </nav>
            {photos.length > 1 && (
              <div className={styles.photoActions}>
                <button type="button" onClick={() => setPhotoIndex((photoIndex - 1 + photos.length) % photos.length)}>
                  Forrige bilde
                </button>
                <button type="button" onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}>
                  Neste bilde
                </button>
              </div>
            )}
            <Link className={styles.details} href={"/eiendommer/" + encodeURIComponent(home.ref)}
              onClick={() => setOpen(false)}>Se alle detaljer for denne boligen →</Link>
          </section>
        </div>, document.body
      )}
    </>
  );
}
