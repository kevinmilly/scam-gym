import type { Attempt, Drill } from "./types";

export type FamilyStat = {
  family: string;
  totalAttempts: number;
  accuracy: number; // 0–1
  avgBrierOnWrong: number; // 0–1, higher = more overconfident
};

export type ConfidenceBin = {
  label: string;
  min: number;
  max: number;
  midpoint: number;
  accuracy: number | null; // null if no attempts in bin
  count: number;
};

export type AiSplit = {
  aiAccuracy: number;
  nonAiAccuracy: number;
  aiCount: number;
  nonAiCount: number;
};

export type StatsResult = {
  totalAttempts: number;
  totalCorrect: number;
  overallAccuracy: number;
  topVulnerabilities: FamilyStat[]; // lowest accuracy
  overconfidenceHotspots: FamilyStat[]; // highest avgBrierOnWrong
  confidenceBins: ConfidenceBin[];
  aiSplit: AiSplit | null; // null if < 3 attempts in either bucket
  insightSummary: string[]; // max 3 natural-language vulnerability sentences
};

const BINS: Omit<ConfidenceBin, "accuracy" | "count">[] = [
  { label: "50–59%", min: 50, max: 59, midpoint: 55 },
  { label: "60–69%", min: 60, max: 69, midpoint: 65 },
  { label: "70–79%", min: 70, max: 79, midpoint: 75 },
  { label: "80–89%", min: 80, max: 89, midpoint: 85 },
  { label: "90–95%", min: 90, max: 95, midpoint: 93 },
];

export function computeStats(
  attempts: Attempt[],
  drills: Drill[]
): StatsResult {
  const drillMap = new Map(drills.map((d) => [d.id, d]));

  // ── Per-family aggregation ─────────────────────────────────────
  const familyData: Record<
    string,
    { total: number; correct: number; brierOnWrong: number[] }
  > = {};

  for (const attempt of attempts) {
    const drill = drillMap.get(attempt.drillId);
    if (!drill) continue;
    const f = drill.pattern_family;
    if (!familyData[f]) familyData[f] = { total: 0, correct: 0, brierOnWrong: [] };
    familyData[f].total++;
    if (attempt.isCorrect) familyData[f].correct++;
    else familyData[f].brierOnWrong.push(attempt.brierScore);
  }

  const familyStats: FamilyStat[] = Object.entries(familyData).map(
    ([family, data]) => ({
      family,
      totalAttempts: data.total,
      accuracy: data.total > 0 ? data.correct / data.total : 0,
      avgBrierOnWrong:
        data.brierOnWrong.length > 0
          ? data.brierOnWrong.reduce((a, b) => a + b, 0) /
            data.brierOnWrong.length
          : 0,
    })
  );

  // Only include families with at least 2 attempts for stats
  const qualified = familyStats.filter((f) => f.totalAttempts >= 2);

  const topVulnerabilities = [...qualified]
    .filter((f) => f.accuracy < 1.0)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  const overconfidenceHotspots = [...qualified]
    .filter((f) => f.avgBrierOnWrong > 0)
    .sort((a, b) => b.avgBrierOnWrong - a.avgBrierOnWrong)
    .slice(0, 3);

  // ── Confidence bins ────────────────────────────────────────────
  const confidenceBins: ConfidenceBin[] = BINS.map((bin) => {
    const inBin = attempts.filter(
      (a) => a.confidence >= bin.min && a.confidence <= bin.max
    );
    const count = inBin.length;
    const accuracy =
      count > 0 ? inBin.filter((a) => a.isCorrect).length / count : null;
    return { ...bin, accuracy, count };
  });

  // ── AI-amplified split ────────────────────────────────────────
  const aiAttempts = attempts.filter((a) => drillMap.get(a.drillId)?.ai_amplified === true);
  const nonAiAttempts = attempts.filter((a) => drillMap.get(a.drillId)?.ai_amplified === false);
  const MIN_BUCKET = 3;
  let aiSplit: AiSplit | null = null;
  if (aiAttempts.length >= MIN_BUCKET && nonAiAttempts.length >= MIN_BUCKET) {
    aiSplit = {
      aiCount: aiAttempts.length,
      nonAiCount: nonAiAttempts.length,
      aiAccuracy: aiAttempts.filter((a) => a.isCorrect).length / aiAttempts.length,
      nonAiAccuracy: nonAiAttempts.filter((a) => a.isCorrect).length / nonAiAttempts.length,
    };
  }

  // ── Insight summary (natural language, max 3) ─────────────────
  const insightSummary: string[] = [];
  for (const f of topVulnerabilities.slice(0, 2)) {
    const label = familyLabel(f.family);
    const pct = Math.round(f.accuracy * 100);
    if (pct < 50) {
      insightSummary.push(`You miss ${label} scams more than half the time.`);
    } else if (pct < 70) {
      insightSummary.push(`${label} is your weakest category (${pct}% accuracy).`);
    }
  }
  if (overconfidenceHotspots.length > 0) {
    const top = overconfidenceHotspots[0];
    insightSummary.push(
      `When wrong on ${familyLabel(top.family)} messages, you tend to be highly confident about it.`
    );
  }

  // ── Overall ────────────────────────────────────────────────────
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;

  return {
    totalAttempts: attempts.length,
    totalCorrect,
    overallAccuracy:
      attempts.length > 0 ? totalCorrect / attempts.length : 0,
    topVulnerabilities,
    overconfidenceHotspots,
    confidenceBins,
    aiSplit,
    insightSummary,
  };
}

/** Format TrickType slug to readable label */
export function trickLabel(slug: string): string {
  return slug
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Format pattern_family slug to readable label */
export function familyLabel(slug: string): string {
  return slug
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
