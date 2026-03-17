import type { CalibrationVerdict } from "./types";

/**
 * Brier score: (confidence/100 - outcome)²
 * Range: 0.0 (perfect) – 1.0 (worst)
 */
export function brierScore(confidence: number, isCorrect: boolean): number {
  const p = confidence / 100;
  const o = isCorrect ? 1 : 0;
  return Math.round((p - o) ** 2 * 1000) / 1000;
}

/**
 * User-facing accuracy score: (1 - brierScore) × 100
 * Range: 0–100, higher is better
 */
export function accuracyScore(brier: number): number {
  return Math.round((1 - brier) * 100);
}

/**
 * Calibration verdict based on correctness and confidence.
 * Provides four distinct outcome states for clearer feedback.
 */
export function calibrationVerdict(
  confidence: number,
  isCorrect: boolean
): CalibrationVerdict {
  if (isCorrect) {
    return confidence >= 85 ? "well-calibrated" : "cautious-win";
  } else {
    return confidence >= 70 ? "overconfident-miss" : "self-aware-miss";
  }
}

/**
 * Red flag recall: fraction of correct flags the user identified.
 * For legit drills (correctTotal = 0): score is 1.0 if no flags selected, else 0.0.
 */
export function redFlagRecall(
  selectedIds: string[],
  correctIds: string[]
): number {
  if (correctIds.length === 0) {
    return selectedIds.length === 0 ? 1 : 0;
  }
  const correctSet = new Set(correctIds);
  const hits = selectedIds.filter((id) => correctSet.has(id)).length;
  return Math.round((hits / correctIds.length) * 100) / 100;
}
