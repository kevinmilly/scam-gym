import type { Drill } from "./types";

const CHALLENGE_KEY = "scamgym_daily_challenge";

type ChallengeData = {
  date: string; // YYYY-MM-DD
  drillId: string;
  completed: boolean;
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Deterministic pseudo-random number from a seed string. */
function seededIndex(seed: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % max;
}

/** Get today's challenge drill from a pool of all drills. */
export function getDailyChallengeDrill(allDrills: Drill[]): Drill {
  const date = today();
  const idx = seededIndex(date, allDrills.length);
  return allDrills[idx];
}

/** Load the persisted challenge state for today. Returns null if no data or stale date. */
export function getDailyChallengeState(): ChallengeData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHALLENGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ChallengeData;
    if (data.date !== today()) return null;
    return data;
  } catch {
    return null;
  }
}

/** Mark today's challenge as completed. */
export function completeDailyChallenge(drillId: string): void {
  if (typeof window === "undefined") return;
  const data: ChallengeData = { date: today(), drillId, completed: true };
  localStorage.setItem(CHALLENGE_KEY, JSON.stringify(data));
}

/** How many seconds until midnight (when the next challenge unlocks). */
export function secondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

/** Format seconds as "Hh Mm" countdown string. */
export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
