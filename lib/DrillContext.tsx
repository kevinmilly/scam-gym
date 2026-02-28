"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { Drill, Attempt, UserContext } from "./types";
import { selectNextDrill, isPoolExhausted } from "./drillEngine";
import { getAllAttempts } from "./db";
import drillsData from "@/data/drills.json";

const allDrills = drillsData as Drill[];

const CONTEXT_KEY = "scamgym_context";

type DrillContextValue = {
  currentDrill: Drill | null;
  nextDrill: Drill | null;
  attempts: Attempt[];
  poolExhausted: boolean;
  selectedContext: UserContext | null;
  setSelectedContext: (ctx: UserContext) => void;
  advance: () => void;          // move next → current, prefetch new next
  recordAttempt: (a: Attempt) => void;
  refreshAttempts: () => Promise<void>;
};

const DrillContext = createContext<DrillContextValue | null>(null);

export function DrillProvider({ children }: { children: React.ReactNode }) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [currentDrill, setCurrentDrill] = useState<Drill | null>(null);
  const [nextDrill, setNextDrill] = useState<Drill | null>(null);
  const [selectedContext, setSelectedContextState] = useState<UserContext | null>(null);
  const attemptsRef = useRef<Attempt[]>([]);

  // Load persisted context on mount
  useEffect(() => {
    const stored = localStorage.getItem(CONTEXT_KEY) as UserContext | null;
    if (stored) setSelectedContextState(stored);
  }, []);

  const setSelectedContext = useCallback((ctx: UserContext) => {
    localStorage.setItem(CONTEXT_KEY, ctx);
    setSelectedContextState(ctx);
  }, []);

  const refreshAttempts = useCallback(async () => {
    const all = await getAllAttempts();
    setAttempts(all);
    attemptsRef.current = all;
  }, []);

  // Re-initialize drill queue whenever context changes
  useEffect(() => {
    if (!selectedContext) return;
    const pool = allDrills.filter((d) => d.context === selectedContext);
    refreshAttempts().then(() => {
      const current = selectNextDrill(pool, attemptsRef.current);
      const next = selectNextDrill(pool, attemptsRef.current, current.id);
      setCurrentDrill(current);
      setNextDrill(next);
    });
  }, [selectedContext, refreshAttempts]);

  const advance = useCallback(() => {
    setCurrentDrill(nextDrill);
    const pool = selectedContext
      ? allDrills.filter((d) => d.context === selectedContext)
      : allDrills;
    const upcoming = selectNextDrill(pool, attemptsRef.current, nextDrill?.id);
    setNextDrill(upcoming);
  }, [nextDrill, selectedContext]);

  const recordAttempt = useCallback((attempt: Attempt) => {
    const updated = [...attemptsRef.current, attempt];
    attemptsRef.current = updated;
    setAttempts(updated);
  }, []);

  const filteredDrills = selectedContext
    ? allDrills.filter((d) => d.context === selectedContext)
    : allDrills;
  const poolExhausted = isPoolExhausted(filteredDrills, attempts);

  return (
    <DrillContext.Provider
      value={{
        currentDrill,
        nextDrill,
        attempts,
        poolExhausted,
        selectedContext,
        setSelectedContext,
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

export { allDrills };
