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

const drills = drillsData as Drill[];

type DrillContextValue = {
  currentDrill: Drill | null;
  nextDrill: Drill | null;
  attempts: Attempt[];
  poolExhausted: boolean;
  advance: () => void;          // move next → current, prefetch new next
  recordAttempt: (a: Attempt) => void;
  refreshAttempts: () => Promise<void>;
};

const DrillContext = createContext<DrillContextValue | null>(null);

export function DrillProvider({ children }: { children: React.ReactNode }) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [currentDrill, setCurrentDrill] = useState<Drill | null>(null);
  const [nextDrill, setNextDrill] = useState<Drill | null>(null);
  const attemptsRef = useRef<Attempt[]>([]);

  const refreshAttempts = useCallback(async () => {
    const all = await getAllAttempts();
    setAttempts(all);
    attemptsRef.current = all;
  }, []);

  // Initial load
  useEffect(() => {
    refreshAttempts().then(() => {
      const current = selectNextDrill(drills, attemptsRef.current);
      const next = selectNextDrill(drills, attemptsRef.current, current.id);
      setCurrentDrill(current);
      setNextDrill(next);
    });
  }, [refreshAttempts]);

  const advance = useCallback(() => {
    setCurrentDrill(nextDrill);
    // Prefetch the drill after next using current attempts
    const upcoming = selectNextDrill(
      drills,
      attemptsRef.current,
      nextDrill?.id
    );
    setNextDrill(upcoming);
  }, [nextDrill]);

  const recordAttempt = useCallback((attempt: Attempt) => {
    const updated = [...attemptsRef.current, attempt];
    attemptsRef.current = updated;
    setAttempts(updated);
  }, []);

  const poolExhausted = isPoolExhausted(drills, attempts);

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

export { drills };
