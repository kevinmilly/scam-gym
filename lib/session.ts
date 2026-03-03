import type { Drill, Attempt } from "./types";
import { computeStats } from "./stats";
import { selectNextDrill } from "./drillEngine";

const SESSION_KEY = "scamgym_session";

export type SessionState = {
  drillIds: string[];
  currentIndex: number;
  attempts: string[]; // attempt IDs
  startedAt: number;
};

export type SessionSummary = {
  totalDrills: number;
  correct: number;
  accuracy: number;
  totalXp: number;
  familiesCovered: string[];
  calibrationBreakdown: { overconfident: number; underconfident: number; wellCalibrated: number };
};

/** Pick 10 drills: 5 from weakest families, 5 random */
export function buildSessionDrills(
  allDrills: Drill[],
  attempts: Attempt[],
  contextDrills: Drill[]
): Drill[] {
  const pool = contextDrills.length > 0 ? contextDrills : allDrills;
  const stats = computeStats(attempts, allDrills);
  const weakFamilies = stats.topVulnerabilities
    .filter((f) => f.totalAttempts >= 2)
    .slice(0, 3)
    .map((f) => f.family);

  const weakPool = pool.filter((d) => weakFamilies.includes(d.pattern_family));
  const selected: Drill[] = [];
  const usedIds = new Set<string>();

  // Pick up to 5 from weak families
  for (let i = 0; i < 5 && weakPool.length > 0; i++) {
    const pick = selectNextDrill(
      weakPool.filter((d) => !usedIds.has(d.id)),
      attempts,
      undefined
    );
    if (usedIds.has(pick.id)) break;
    selected.push(pick);
    usedIds.add(pick.id);
  }

  // Fill remaining from full pool
  const remaining = 10 - selected.length;
  for (let i = 0; i < remaining; i++) {
    const available = pool.filter((d) => !usedIds.has(d.id));
    if (available.length === 0) break;
    const pick = selectNextDrill(available, attempts, undefined);
    selected.push(pick);
    usedIds.add(pick.id);
  }

  return selected;
}

export function saveSession(session: SessionState) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): SessionState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
