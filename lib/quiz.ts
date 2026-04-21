import type { Drill } from "./types";

const QUIZ_SIZE = 10;

/** Seeded pseudo-random — same seed gives same sequence. */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/** Day-of-year seed so the quiz rotates daily but is consistent within a day. */
function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

export function getDailyQuizDrills(allDrills: Drill[]): Drill[] {
  // Eligible pool: difficulty 2–4, not ai_amplified, both scam + legit
  const pool = allDrills.filter(
    (d) => d.difficulty >= 2 && d.difficulty <= 4 && !d.ai_amplified
  );

  // Group by pattern family
  const byFamily: Record<string, Drill[]> = {};
  for (const d of pool) {
    (byFamily[d.pattern_family] ??= []).push(d);
  }
  const families = Object.keys(byFamily);

  const rand = seededRandom(dayOfYear() * 7919); // prime multiplier for variety

  // Pick one drill per family (cycling through families) until we have QUIZ_SIZE
  const selected: Drill[] = [];
  const shuffledFamilies = [...families].sort(() => rand() - 0.5);

  let i = 0;
  while (selected.length < QUIZ_SIZE && i < shuffledFamilies.length * 3) {
    const family = shuffledFamilies[i % shuffledFamilies.length];
    const candidates = byFamily[family] ?? [];
    if (candidates.length === 0) { i++; continue; }
    const pick = candidates[Math.floor(rand() * candidates.length)];
    if (!selected.find((d) => d.id === pick.id)) {
      selected.push(pick);
    }
    i++;
  }

  // Shuffle final selection
  return selected.sort(() => rand() - 0.5).slice(0, QUIZ_SIZE);
}

export type QuizPercentileTier = {
  label: string;
  description: string;
  color: string;
};

export function getPercentileTier(score: number, total: number): QuizPercentileTier {
  const pct = score / total;
  if (pct >= 0.9) return { label: "Top 5%", description: "Expert Scam Spotter", color: "var(--success)" };
  if (pct >= 0.8) return { label: "Top 15%", description: "Sharp Eye", color: "var(--success)" };
  if (pct >= 0.7) return { label: "Top 30%", description: "Getting Sharp", color: "var(--info)" };
  if (pct >= 0.5) return { label: "Top 55%", description: "Building Awareness", color: "var(--warning)" };
  return { label: "Bottom 45%", description: "Room to Grow", color: "var(--danger)" };
}
