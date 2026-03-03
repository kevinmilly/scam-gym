import type { Attempt, Drill } from "./types";
import { calibrationVerdict } from "./scoring";

export type XpBreakdown = {
  base: number;
  correct: number;
  calibration: number;
  redFlags: number;
  safeBehavior: number;
  total: number;
};

export type LevelInfo = {
  level: number;
  title: string;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number | null; // null at max level
  progress: number; // 0–1 within current level
};

export const LEVELS: { level: number; title: string; xpThreshold: number }[] = [
  { level: 1, title: "Newcomer", xpThreshold: 0 },
  { level: 2, title: "Observer", xpThreshold: 50 },
  { level: 3, title: "Skeptic", xpThreshold: 150 },
  { level: 4, title: "Investigator", xpThreshold: 350 },
  { level: 5, title: "Analyst", xpThreshold: 650 },
  { level: 6, title: "Sentinel", xpThreshold: 1100 },
  { level: 7, title: "Guardian", xpThreshold: 1800 },
  { level: 8, title: "Defender", xpThreshold: 2800 },
  { level: 9, title: "Watchdog", xpThreshold: 4200 },
  { level: 10, title: "Scam Proof", xpThreshold: 6000 },
];

/** Compute XP earned for a single attempt (max 33). */
export function computeXpForAttempt(attempt: Attempt, drill: Drill): XpBreakdown {
  const base = 10;
  const correct = attempt.isCorrect ? 10 : 0;

  const calVerdict = calibrationVerdict(attempt.confidence, attempt.isCorrect);
  const calibration = calVerdict === "well-calibrated" ? 5 : 0;

  // +5 for perfect red flag recall on scam drills that have flags
  const hasFlags = drill.ground_truth === "scam" && drill.correct_red_flag_ids.length > 0;
  const redFlags = hasFlags && attempt.redFlagRecall === 1 ? 5 : 0;

  // +3 for safe behavior on scam drills (ignore or verify)
  const isSafeBehavior =
    drill.ground_truth === "scam" &&
    (attempt.behaviorChoice === "ignore" || attempt.behaviorChoice === "verify");
  const safeBehavior = isSafeBehavior ? 3 : 0;

  return {
    base,
    correct,
    calibration,
    redFlags,
    safeBehavior,
    total: base + correct + calibration + redFlags + safeBehavior,
  };
}

/** Compute total XP across all attempts. */
export function computeTotalXp(attempts: Attempt[], drillMap: Map<string, Drill>): number {
  let total = 0;
  for (const attempt of attempts) {
    const drill = drillMap.get(attempt.drillId);
    if (!drill) continue;
    total += computeXpForAttempt(attempt, drill).total;
  }
  return total;
}

/** Get level info for a given total XP. */
export function getLevelInfo(totalXp: number): LevelInfo {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (totalXp >= level.xpThreshold) {
      currentLevel = level;
    } else {
      break;
    }
  }

  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1) ?? null;
  const xpIntoLevel = totalXp - currentLevel.xpThreshold;
  const xpSpan = nextLevel ? nextLevel.xpThreshold - currentLevel.xpThreshold : 1;
  const progress = nextLevel ? Math.min(xpIntoLevel / xpSpan, 1) : 1;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    currentXp: totalXp,
    xpForCurrentLevel: currentLevel.xpThreshold,
    xpForNextLevel: nextLevel?.xpThreshold ?? null,
    progress,
  };
}
