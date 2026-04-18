import type { Drill, Attempt, Verdict } from "./types";

const REPEAT_GAP = 10;
const WRONG_WEIGHT = 3;
const OVERCONFIDENT_WEIGHT = 2;

const TIER_WINDOW = 20;        // rolling accuracy window
const RATIO_WINDOW = 10;       // recent scam:legit window
const RATIO_BOOST = 3;         // weight multiplier for underrepresented side
const RATIO_TOLERANCE = 0.12;  // dead-band around target before biasing
const STRETCH_CHANCE = 0.1;    // occasional drill one tier above cap

export type Tier = 1 | 2 | 3 | 4 | 5;

export type ProgressionTier = {
  tier: Tier;
  title: string;
  maxDifficulty: number;
  allowAi: boolean;
  targetScamRatio: number; // fraction of drills that should be scams
};

const TIERS: ProgressionTier[] = [
  { tier: 1, title: "Warmup",     maxDifficulty: 2, allowAi: false, targetScamRatio: 0.7 },
  { tier: 2, title: "Observer",   maxDifficulty: 2, allowAi: false, targetScamRatio: 0.7 },
  { tier: 3, title: "Analyst",    maxDifficulty: 3, allowAi: false, targetScamRatio: 0.6 },
  { tier: 4, title: "Sentinel",   maxDifficulty: 4, allowAi: true,  targetScamRatio: 0.5 },
  { tier: 5, title: "Scam Proof", maxDifficulty: 5, allowAi: true,  targetScamRatio: 0.4 },
];

/**
 * Current tier based on rolling accuracy over the last TIER_WINDOW attempts.
 * Under 5 attempts → warmup. Tier falls back down if accuracy slips.
 */
export function getCurrentTier(attempts: Attempt[]): ProgressionTier {
  const recent = attempts.slice(-TIER_WINDOW);
  if (recent.length < 5) return TIERS[0];
  const acc = recent.filter((a) => a.isCorrect).length / recent.length;
  if (acc >= 0.85) return TIERS[4];
  if (acc >= 0.80) return TIERS[3];
  if (acc >= 0.70) return TIERS[2];
  return TIERS[1];
}

/** Whether the user has climbed past the warmup — used to gate variety rules. */
function tierOrdinal(tier: ProgressionTier): number {
  return tier.tier;
}

/**
 * Which verdict is currently underrepresented vs the tier's target ratio?
 * Returns null inside the tolerance band.
 */
function preferredSide(
  recentDrills: Drill[],
  targetScamRatio: number
): Verdict | null {
  if (recentDrills.length < 4) return null;
  const scamCount = recentDrills.filter((d) => d.ground_truth === "scam").length;
  const actual = scamCount / recentDrills.length;
  if (actual > targetScamRatio + RATIO_TOLERANCE) return "legit";
  if (actual < targetScamRatio - RATIO_TOLERANCE) return "scam";
  return null;
}

/**
 * Enforce tier-scaled variety:
 * tier ≤ 2 — no constraint (clustering helps pattern recognition)
 * tier 3  — no same pattern_family back-to-back
 * tier 4  — last 5 span ≥3 families, ≥2 channels
 * tier 5  — last 5 span ≥4 families, ≥3 channels, ≥3 tricks, no same drill_type back-to-back
 */
function violatesVariety(
  candidate: Drill,
  recentDrills: Drill[],
  tier: ProgressionTier,
  familyDiversityAvailable: boolean
): boolean {
  const t = tierOrdinal(tier);
  if (t <= 2) return false;

  const last = recentDrills[recentDrills.length - 1];

  if (t >= 3 && familyDiversityAvailable && last?.pattern_family === candidate.pattern_family) {
    return true;
  }

  if (t >= 4 && recentDrills.length >= 4) {
    const window = [...recentDrills.slice(-4), candidate];
    const families = new Set(window.map((d) => d.pattern_family));
    const channels = new Set(window.map((d) => d.channel));
    if (familyDiversityAvailable && families.size < 3) return true;
    if (channels.size < 2) return true;
  }

  if (t === 5 && recentDrills.length >= 4) {
    const window = [...recentDrills.slice(-4), candidate];
    const families = new Set(window.map((d) => d.pattern_family));
    const channels = new Set(window.map((d) => d.channel));
    const tricks = new Set<string>();
    for (const d of window) for (const tr of d.tricks ?? []) tricks.add(tr);
    if (familyDiversityAvailable && families.size < 4) return true;
    if (channels.size < 3) return true;
    if (tricks.size < 3) return true;
    if (last && (last.drill_type ?? "standard") === (candidate.drill_type ?? "standard")) {
      return true;
    }
  }

  return false;
}

/** Effective difficulty cap — small chance of a stretch drill one tier higher. */
function effectiveCap(tier: ProgressionTier): number {
  if (Math.random() < STRETCH_CHANCE && tier.maxDifficulty < 5) {
    return tier.maxDifficulty + 1;
  }
  return tier.maxDifficulty;
}

/** Filter a drill list by tier cap (difficulty + ai_amplified gate). */
function applyTierFilter(drills: Drill[], tier: ProgressionTier): Drill[] {
  const cap = effectiveCap(tier);
  return drills.filter(
    (d) => d.difficulty <= cap && (tier.allowAi || !d.ai_amplified)
  );
}

/**
 * Select the next drill using weighted repetition + tier gating.
 *
 * Progression levers (applied when attempts ≥ 5):
 *   - difficulty cap from rolling accuracy
 *   - scam:legit ratio bias toward underrepresented side
 *   - pattern_family / channel / trick / drill_type variety (tier-scaled)
 *
 * First pass (before pool exhausted) still serves unseen drills first, but within
 * the tier cap. After exhaustion, weighted repetition applies.
 */
export function selectNextDrill(
  drills: Drill[],
  attempts: Attempt[],
  excludeId?: string
): Drill {
  const tier = getCurrentTier(attempts);
  const drillMap = new Map(drills.map((d) => [d.id, d]));

  // Recent drill objects for variety + ratio checks
  const recentAttempts = attempts.slice(-RATIO_WINDOW);
  const recentDrills = recentAttempts
    .map((a) => drillMap.get(a.drillId))
    .filter((d): d is Drill => Boolean(d));

  const preferred = preferredSide(recentDrills, tier.targetScamRatio);

  const attemptedIds = new Set(attempts.map((a) => a.drillId));
  const unseenAll = drills.filter(
    (d) => !attemptedIds.has(d.id) && d.id !== excludeId
  );

  // First two drills: high-difficulty scam seed (creates the "aha" moment).
  if (attempts.length < 2 && unseenAll.length > 0) {
    const highDeception = unseenAll.filter(
      (d) => d.difficulty >= 4 && d.ground_truth === "scam"
    );
    const pool = highDeception.length > 0 ? highDeception : unseenAll;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // First pass: show every drill once before repeating.
  if (unseenAll.length > 0) {
    const tierCapped = applyTierFilter(unseenAll, tier);
    const pool = tierCapped.length > 0 ? tierCapped : unseenAll;
    const familyDiversityAvailable = new Set(pool.map((d) => d.pattern_family)).size > 1;

    const varietyOk = pool.filter(
      (d) => !violatesVariety(d, recentDrills, tier, familyDiversityAvailable)
    );
    const passable = varietyOk.length > 0 ? varietyOk : pool;

    const sideFiltered =
      preferred
        ? passable.filter((d) => d.ground_truth === preferred)
        : [];
    const sidePool = sideFiltered.length > 0 ? sideFiltered : passable;

    return sidePool[Math.floor(Math.random() * sidePool.length)];
  }

  // Pool exhausted — weighted repetition with tier gating.
  const recentIds = new Set(attempts.slice(-REPEAT_GAP).map((a) => a.drillId));
  const wrongDrillIds = new Set(
    attempts.filter((a) => !a.isCorrect).map((a) => a.drillId)
  );

  const familyBrier: Record<string, number[]> = {};
  for (const attempt of attempts) {
    if (!attempt.isCorrect) {
      const drill = drillMap.get(attempt.drillId);
      if (drill) {
        (familyBrier[drill.pattern_family] ??= []).push(attempt.brierScore);
      }
    }
  }
  const overconfidentFamilySet = new Set(
    Object.entries(familyBrier)
      .filter(([, scores]) => scores.reduce((a, b) => a + b, 0) / scores.length > 0.3)
      .map(([family]) => family)
  );

  const baseCandidates = drills.filter(
    (d) => !recentIds.has(d.id) && d.id !== excludeId
  );
  if (baseCandidates.length === 0) {
    const fallback = drills.filter((d) => d.id !== excludeId);
    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  const tierCapped = applyTierFilter(baseCandidates, tier);
  const afterTier = tierCapped.length > 0 ? tierCapped : baseCandidates;

  const familyDiversityAvailable = new Set(afterTier.map((d) => d.pattern_family)).size > 1;
  const varietyOk = afterTier.filter(
    (d) => !violatesVariety(d, recentDrills, tier, familyDiversityAvailable)
  );
  const candidates = varietyOk.length > 0 ? varietyOk : afterTier;

  const weighted: Drill[] = [];
  for (const drill of candidates) {
    let weight = 1;
    if (wrongDrillIds.has(drill.id)) weight *= WRONG_WEIGHT;
    if (overconfidentFamilySet.has(drill.pattern_family)) weight *= OVERCONFIDENT_WEIGHT;
    if (preferred && drill.ground_truth === preferred) weight *= RATIO_BOOST;
    for (let i = 0; i < weight; i++) weighted.push(drill);
  }

  return weighted[Math.floor(Math.random() * weighted.length)];
}

export function resolveComparisonPair(
  drill: Drill,
  allDrills: Drill[]
): Drill | null {
  if (!drill.paired_drill_id) return null;
  return allDrills.find((d) => d.id === drill.paired_drill_id) ?? null;
}

export function isPoolExhausted(
  drills: Drill[],
  attempts: Attempt[]
): boolean {
  const seen = new Set(attempts.map((a) => a.drillId));
  return drills.every((d) => seen.has(d.id));
}
