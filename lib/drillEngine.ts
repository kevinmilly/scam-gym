import type { Drill, Attempt } from "./types";

const REPEAT_GAP = 10; // min attempts before a drill can repeat
const WRONG_WEIGHT = 3;
const OVERCONFIDENT_WEIGHT = 2;

/**
 * Pattern families where the user is "overconfident":
 * avg brier score on incorrect attempts > threshold
 */
function overconfidentFamilies(attempts: Attempt[]): Set<string> {
  // group by drillId — caller must pass drills to get family; simplified here
  // this is resolved in selectNextDrill which has both
  return new Set();
}

/**
 * Select the next drill using weighted repetition.
 *
 * First pass: show every drill once in random order.
 * After exhaustion: apply weights —
 *   - drills answered incorrectly: 3× weight
 *   - drills in overconfident families: 2× weight
 *   - min gap of REPEAT_GAP attempts before repeating a drill
 */
export function selectNextDrill(
  drills: Drill[],
  attempts: Attempt[],
  excludeId?: string
): Drill {
  const attemptedIds = new Set(attempts.map((a) => a.drillId));
  const unseen = drills.filter(
    (d) => !attemptedIds.has(d.id) && d.id !== excludeId
  );

  if (unseen.length > 0) {
    // First 2 drills: serve high-difficulty scam drills to create the "aha" moment.
    // Users who get surprised by a convincing fake are more likely to continue.
    if (attempts.length < 2) {
      const highDeception = unseen.filter(
        (d) => d.difficulty >= 4 && d.ground_truth === "scam"
      );
      const pool = highDeception.length > 0 ? highDeception : unseen;
      return pool[Math.floor(Math.random() * pool.length)];
    }
    // subsequent first-pass: pick random unseen drill
    return unseen[Math.floor(Math.random() * unseen.length)];
  }

  // Pool exhausted — weighted repetition
  // Compute recently seen drill ids (within gap window)
  const recentIds = new Set(
    attempts
      .slice(-REPEAT_GAP)
      .map((a) => a.drillId)
  );

  // Compute wrong drills
  const wrongDrillIds = new Set(
    attempts.filter((a) => !a.isCorrect).map((a) => a.drillId)
  );

  // Compute overconfident families (avg brier on wrong attempts per family)
  const familyBrier: Record<string, number[]> = {};
  for (const attempt of attempts) {
    if (!attempt.isCorrect) {
      const drill = drills.find((d) => d.id === attempt.drillId);
      if (drill) {
        if (!familyBrier[drill.pattern_family]) {
          familyBrier[drill.pattern_family] = [];
        }
        familyBrier[drill.pattern_family].push(attempt.brierScore);
      }
    }
  }
  const overconfidentFamilySet = new Set(
    Object.entries(familyBrier)
      .filter(([, scores]) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return avg > 0.3; // threshold for "overconfident"
      })
      .map(([family]) => family)
  );

  // Build weighted pool (exclude recent and currentDrill)
  const candidates = drills.filter(
    (d) => !recentIds.has(d.id) && d.id !== excludeId
  );

  if (candidates.length === 0) {
    // fallback: just pick anything except current
    const fallback = drills.filter((d) => d.id !== excludeId);
    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  const weighted: Drill[] = [];
  for (const drill of candidates) {
    let weight = 1;
    if (wrongDrillIds.has(drill.id)) weight *= WRONG_WEIGHT;
    if (overconfidentFamilySet.has(drill.pattern_family))
      weight *= OVERCONFIDENT_WEIGHT;
    for (let i = 0; i < weight; i++) weighted.push(drill);
  }

  const pick = weighted[Math.floor(Math.random() * weighted.length)];

  // Format diversity: if last 3 drills used the same drill_type, try to pick a different one
  if (attempts.length >= 3) {
    const recentTypes = attempts.slice(-3).map((a) => a.drill_type ?? "standard");
    const allSame = recentTypes.every((t) => t === recentTypes[0]);
    if (allSame && (pick.drill_type ?? "standard") === recentTypes[0]) {
      const alt = weighted.filter((d) => (d.drill_type ?? "standard") !== recentTypes[0]);
      if (alt.length > 0) {
        return alt[Math.floor(Math.random() * alt.length)];
      }
    }
  }

  return pick;
}

/**
 * Resolve the paired drill for a comparison drill.
 */
export function resolveComparisonPair(
  drill: Drill,
  allDrills: Drill[]
): Drill | null {
  if (!drill.paired_drill_id) return null;
  return allDrills.find((d) => d.id === drill.paired_drill_id) ?? null;
}

/**
 * Has the user seen all drills at least once?
 */
export function isPoolExhausted(
  drills: Drill[],
  attempts: Attempt[]
): boolean {
  const seen = new Set(attempts.map((a) => a.drillId));
  return drills.every((d) => seen.has(d.id));
}
