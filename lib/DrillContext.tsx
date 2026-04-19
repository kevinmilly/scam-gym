"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { Drill, Attempt } from "./types";
import { selectNextDrill, isPoolExhausted } from "./drillEngine";
import { getAllAttempts } from "./db";
import drillsData from "@/data/drills.json";

const allDrills = drillsData as Drill[];

const FOCUS_KEY = "scamgym_focus_families";

type DrillContextValue = {
  currentDrill: Drill | null;
  nextDrill: Drill | null;
  attempts: Attempt[];
  poolExhausted: boolean;
  advance: () => void;
  recordAttempt: (a: Attempt) => void;
  refreshAttempts: () => Promise<void>;
  focusFamilies: string[];
  setFocusFamilies: (families: string[]) => void;
  focusLabel: string | null; // e.g. "Autopilot: Weak Spots" or "Focus: Bank Fraud"
  setFocusLabel: (label: string | null) => void;
};

const DrillContext = createContext<DrillContextValue | null>(null);

export function DrillProvider({ children }: { children: React.ReactNode }) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [currentDrill, setCurrentDrill] = useState<Drill | null>(null);
  const [nextDrill, setNextDrill] = useState<Drill | null>(null);
  const [focusFamilies, setFocusFamiliesState] = useState<string[]>([]);
  const [focusLabel, setFocusLabel] = useState<string | null>(null);
  const attemptsRef = useRef<Attempt[]>([]);

  // Load persisted focus on mount. Deferred to an effect (not lazy init) so
  // SSR and first client render match before hydration.
  useEffect(() => {
    try {
      const focus = localStorage.getItem(FOCUS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (focus) setFocusFamiliesState(JSON.parse(focus));
    } catch { /* ignore */ }
  }, []);

  const setFocusFamilies = useCallback((families: string[]) => {
    setFocusFamiliesState(families);
    if (families.length > 0) {
      localStorage.setItem(FOCUS_KEY, JSON.stringify(families));
    } else {
      localStorage.removeItem(FOCUS_KEY);
    }
  }, []);

  const refreshAttempts = useCallback(async () => {
    const all = await getAllAttempts();
    setAttempts(all);
    attemptsRef.current = all;
  }, []);

  /** Build the drill pool applying focus filters (all drills available) */
  const buildPool = useCallback((focus: string[]) => {
    let pool = allDrills.filter((d) => {
      // Exclude comparison "legit" role drills — they're only used as pairs
      if (d.comparison_role === "legit") return false;
      // Exclude orphan comparison drills that lack a paired_drill_id — they
      // cannot render in ComparisonLayout and would leave the user stuck.
      if (d.drill_type === "comparison") {
        if (!d.paired_drill_id) return false;
        const pair = allDrills.find((p) => p.id === d.paired_drill_id);
        if (!pair) return false;
      }
      return true;
    });
    if (focus.length > 0) {
      const focused = pool.filter((d) => focus.includes(d.pattern_family));
      if (focused.length > 0) pool = focused;
    }
    return pool;
  }, []);

  // Initialize drill queue on mount and whenever focus changes. setState lives
  // inside an async callback after the IndexedDB fetch resolves — required for
  // data loading and runs once per focus change, not on every render.
  useEffect(() => {
    const pool = buildPool(focusFamilies);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshAttempts().then(() => {
      const current = selectNextDrill(pool, attemptsRef.current);
      const next = selectNextDrill(pool, attemptsRef.current, current.id);
      setCurrentDrill(current);
      setNextDrill(next);
    });
  }, [focusFamilies, refreshAttempts, buildPool]);

  const advance = useCallback(() => {
    setCurrentDrill(nextDrill);
    const pool = buildPool(focusFamilies);
    const upcoming = selectNextDrill(pool, attemptsRef.current, nextDrill?.id);
    setNextDrill(upcoming);
  }, [nextDrill, focusFamilies, buildPool]);

  const recordAttempt = useCallback((attempt: Attempt) => {
    const updated = [...attemptsRef.current, attempt];
    attemptsRef.current = updated;
    setAttempts(updated);
  }, []);

  const filteredDrills = buildPool(focusFamilies);
  const poolExhausted = isPoolExhausted(filteredDrills, attempts);

  return (
    <DrillContext.Provider
      value={{
        currentDrill,
        nextDrill,
        attempts,
        poolExhausted,
        advance,
        recordAttempt,
        refreshAttempts,
        focusFamilies,
        setFocusFamilies,
        focusLabel,
        setFocusLabel,
      }}
    >
      {children}
    </DrillContext.Provider>
  );
}

export function useDrillContext(): DrillContextValue {
  const ctx = useContext(DrillContext);
  if (!ctx) throw new Error("useDrillContext must be used within DrillProvider");
  return ctx;
}

export { allDrills };
