import type { Attempt, Drill } from "./types";
import { computeXpForAttempt, computeTotalXp, getLevelInfo } from "./xp";
import type { XpBreakdown, LevelInfo } from "./xp";
import { evaluateAllMedals, ALL_MEDALS } from "./medals";
import type { EarnedMedal, MedalDef } from "./medals";

export type ProgressionState = {
  totalXp: number;
  levelInfo: LevelInfo;
  earnedMedals: EarnedMedal[];
  allMedals: MedalDef[];
};

export type PostDrillReward = {
  xpBreakdown: XpBreakdown;
  totalXp: number;
  levelInfo: LevelInfo;
  newMedals: EarnedMedal[];
  leveledUp: boolean;
  previousLevel: number;
};

/** Full progression state for the stats page. */
export function computeProgression(
  attempts: Attempt[],
  drills: Drill[]
): ProgressionState {
  const drillMap = new Map(drills.map((d) => [d.id, d]));
  const totalXp = computeTotalXp(attempts, drillMap);
  const levelInfo = getLevelInfo(totalXp);
  const earnedMedals = evaluateAllMedals({ attempts, drillMap });

  return { totalXp, levelInfo, earnedMedals, allMedals: ALL_MEDALS };
}

/** Compute rewards after a drill submission. Compares before/after state. */
export function computePostDrillReward(
  allAttempts: Attempt[],
  drills: Drill[]
): PostDrillReward {
  const drillMap = new Map(drills.map((d) => [d.id, d]));

  // Previous state (all attempts except the last)
  const previousAttempts = allAttempts.slice(0, -1);
  const previousXp = computeTotalXp(previousAttempts, drillMap);
  const previousLevel = getLevelInfo(previousXp);
  const previousMedals = new Set(
    evaluateAllMedals({ attempts: previousAttempts, drillMap }).map((m) => m.id)
  );

  // Current state (all attempts)
  const currentAttempt = allAttempts[allAttempts.length - 1];
  const currentDrill = drillMap.get(currentAttempt.drillId);
  const xpBreakdown = currentDrill
    ? computeXpForAttempt(currentAttempt, currentDrill)
    : { base: 10, correct: 0, calibration: 0, redFlags: 0, safeBehavior: 0, total: 10 };

  const totalXp = previousXp + xpBreakdown.total;
  const levelInfo = getLevelInfo(totalXp);

  const currentMedals = evaluateAllMedals({ attempts: allAttempts, drillMap });
  const newMedals = currentMedals.filter((m) => !previousMedals.has(m.id));

  return {
    xpBreakdown,
    totalXp,
    levelInfo,
    newMedals,
    leveledUp: levelInfo.level > previousLevel.level,
    previousLevel: previousLevel.level,
  };
}
