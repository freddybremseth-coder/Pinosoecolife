"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import styles from "./CompareProperties.module.css";

const STORAGE_KEY = "pinosoecolife-comparison-v1";
const MAX_PROPERTIES = 4;

type CompareContextValue = {
  selected: string[];
  toggle: (refId: string) => void;
  remove: (refId: string) => void;
};
const CompareContext = createContext<CompareContextValue | null>(null);

function validRefs(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const unique = new Set<string>();
  for (const value of values) {
    if (typeof value !== "string" || !value.trim() || value.length > 120) continue;
    unique.add(value.trim());
    if (unique.size >= MAX_PROPERTIES) break;
  }
  return [...unique];
}

export function compareUrl(refs: string[]): string {
  const query = new URLSearchParams();
  refs.forEach((ref) => query.append("ref", ref));
  return `/sammenlign?${query.toString()}`;
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setSelected(validRefs(JSON.parse(saved)));
    } catch {
      // Storage may be blocked in private mode; comparison works for this tab.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    } catch {
      // Keep temporary selection in component state.
    }
  }, [selected, hydrated]);

  const toggle = useCallback((refId: string) => {
    if (!refId || refId.length > 120) return;
    setSelected((current) => current.includes(refId)
      ? current.filter((ref) => ref !== refId)
      : current.length < MAX_PROPERTIES ? [...current, refId] : current);
  }, []);

  const remove = useCallback((refId: string) => {
    setSelected((current) => current.filter((ref) => ref !== refId));
  }, []);

  const value = useMemo(() => ({ selected, toggle, remove }), [selected, toggle, remove]);
  return (
    <CompareContext.Provider value={value}>
      {children}
      {hydrated && selected.length > 0 && (
        <aside className={styles.tray} aria-label="Valgte boliger til sammenligning">
          <div className={styles.trayInner}>
            <div className={styles.trayInfo}>
              <strong>Sammenlign boliger ({selected.length}/4)</strong>
              <span>{selected.length < 2 ? "Velg minst én bolig til." : "Se pris, tomt og boligens nøkkeltall side om side."}</span>
            </div>
            <div className={styles.refs}>
              {selected.map((ref) => (
                <button key={ref} type="button" onClick={() => remove(ref)} className={styles.refButton} title={`Fjern ${ref}`} aria-label={`Fjern bolig ${ref} fra sammenligning`}>
                  {ref} <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
            {selected.length >= 2 ? (
              <Link href={compareUrl(selected)} className={styles.compareLink}>Sammenlign nå →</Link>
            ) : (
              <span className={styles.disabledLink}>Velg 2–4 boliger</span>
            )}
          </div>
        </aside>
      )}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) throw new Error("Compare components must be rendered inside CompareProvider");
  return context;
}

export function CompareButton({ refId, className }: { refId: string; className?: string }) {
  const { selected, toggle } = useCompare();
  const active = selected.includes(refId);
  const disabled = !active && selected.length >= MAX_PROPERTIES;
  return (
    <button
      className={className || styles.addButton}
      type="button"
      aria-pressed={active}
      onClick={() => toggle(refId)}
      disabled={disabled || !refId}
      title={disabled ? "Du kan sammenligne opptil fire boliger" : undefined}
    >
      <span aria-hidden="true">{active ? "✓" : "+"}</span> {active ? "Valgt til sammenligning" : "Legg til sammenligning"}
    </button>
  );
}

export function CompareRemoveLink({ refId, href }: { refId: string; href: string }) {
  const { remove } = useCompare();
  return <Link className={styles.removeLink} href={href} onClick={() => remove(refId)}>Fjern fra sammenligning ×</Link>;
}
