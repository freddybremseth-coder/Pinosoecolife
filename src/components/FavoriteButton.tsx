"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

type Favorite = {
  ref: string;
  title: string;
  location: string;
  price: string;
  href: string;
};

export function FavoriteButton({ favorite }: { favorite: Favorite }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("pinosoecolife:favorites") || "[]") as Favorite[];
    setSaved(favorites.some((item) => item.ref === favorite.ref));
  }, [favorite.ref]);

  function toggleFavorite() {
    const favorites = JSON.parse(localStorage.getItem("pinosoecolife:favorites") || "[]") as Favorite[];
    const next = saved
      ? favorites.filter((item) => item.ref !== favorite.ref)
      : [favorite, ...favorites.filter((item) => item.ref !== favorite.ref)].slice(0, 20);
    localStorage.setItem("pinosoecolife:favorites", JSON.stringify(next));
    setSaved(!saved);
    window.dispatchEvent(new Event("pinosoecolife:favorites-updated"));
  }

  return (
    <button className={`favorite-button${saved ? " active" : ""}`} type="button" onClick={toggleFavorite}>
      <Heart size={17} /> {saved ? "Lagret" : "Lagre favoritt"}
    </button>
  );
}
