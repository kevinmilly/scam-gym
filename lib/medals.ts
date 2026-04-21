import type { Attempt, Drill } from "./types";
import { calibrationVerdict } from "./scoring";
import { familyLabel } from "./stats";
import { getStreak } from "./streak";

export type MedalCategory = "core" | "calibration" | "volume" | "pattern" | "special";

export type MedalDef = {
  id: string;
  name: string;
  emoji: string;
  category: MedalCategory;
  description: string;
  evaluate: (ctx: MedalContext) => boolean;
};

export type EarnedMedal = {
  id: string;
  name: string;
  emoji: string;
  category: MedalCategory;
};

export type MedalContext = {
  attempts: Attempt[];
  drillMap: Map<string, Drill>;
};

// ── Helpers ───────────────────────────────────────────────────────

/** Longest consecutive streak where predicate is true (chronological order). */
export function longestStreak(
  attempts: Attempt[],
  predicate: (a: Attempt) => boolean
): number {
  let max = 0;
  let current = 0;
  for (const a of attempts) {
    if (predicate(a)) {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

// ── Family emoji map ──────────────────────────────────────────────

const FAMILY_EMOJI: Record<string, string> = {
  delivery_toll: "📦",
  bank_fraud_alert: "🏦",
  account_verification: "🔑",
  tech_support: "🖥️",
  job_seeker: "💼",
  invoice_vendor: "🧾",
  romance_social: "💕",
  qr_code: "📱",
  marketplace: "🛒",
  oauth_consent: "🔐",
  crypto_wallet: "🪙",
  government_impersonation: "🏛️",
  subscription_renewal: "🔄",
  otp_sim_swap: "📲",
  credential_phishing: "🎣",
  charity_fraud: "💝",
  malware_attachment: "📎",
};

// ── Core Skill medals ────────────────────────────────────────────

const CORE_MEDALS: MedalDef[] = [
  {
    id: "first_instinct",
    name: "First Instinct",
    emoji: "🧠",
    category: "core",
    description: "Complete your first practice round",
    evaluate: (ctx) => ctx.attempts.length >= 1,
  },
  {
    id: "sharp_eye",
    name: "Sharp Eye",
    emoji: "👁️",
    category: "core",
    description: "Get 5 correct in a row",
    evaluate: (ctx) => longestStreak(ctx.attempts, (a) => a.isCorrect) >= 5,
  },
  {
    id: "scam_radar",
    name: "Scam Radar",
    emoji: "📡",
    category: "core",
    description: "Get 10 correct in a row",
    evaluate: (ctx) => longestStreak(ctx.attempts, (a) => a.isCorrect) >= 10,
  },
  {
    id: "untouchable",
    name: "Untouchable",
    emoji: "🛡️",
    category: "core",
    description: "Get 25 correct in a row",
    evaluate: (ctx) => longestStreak(ctx.attempts, (a) => a.isCorrect) >= 25,
  },
];

// ── Calibration medals ───────────────────────────────────────────

const CALIBRATION_MEDALS: MedalDef[] = [
  {
    id: "honest_call",
    name: "Honest Call",
    emoji: "🎯",
    category: "calibration",
    description: "First well-calibrated response",
    evaluate: (ctx) =>
      ctx.attempts.some(
        (a) => calibrationVerdict(a.confidence, a.isCorrect) === "well-calibrated"
      ),
  },
  {
    id: "tuned_in",
    name: "Tuned In",
    emoji: "📻",
    category: "calibration",
    description: "5 well-calibrated responses in a row",
    evaluate: (ctx) =>
      longestStreak(
        ctx.attempts,
        (a) => calibrationVerdict(a.confidence, a.isCorrect) === "well-calibrated"
      ) >= 5,
  },
  {
    id: "reality_check",
    name: "Reality Check",
    emoji: "🪞",
    category: "calibration",
    description: "Reduce overconfidence rate by 20% (first half vs second half, 10+ attempts)",
    evaluate: (ctx) => {
      if (ctx.attempts.length < 10) return false;
      const mid = Math.floor(ctx.attempts.length / 2);
      const firstHalf = ctx.attempts.slice(0, mid);
      const secondHalf = ctx.attempts.slice(mid);
      const overRate = (arr: Attempt[]) => {
        const over = arr.filter(
          (a) => calibrationVerdict(a.confidence, a.isCorrect) === "overconfident-miss"
        ).length;
        return arr.length > 0 ? over / arr.length : 0;
      };
      const first = overRate(firstHalf);
      const second = overRate(secondHalf);
      return first > 0 && second <= first * 0.8;
    },
  },
  {
    id: "gut_check",
    name: "Gut Check",
    emoji: "🤔",
    category: "calibration",
    description: "3 underconfident then well-calibrated",
    evaluate: (ctx) => {
      const sorted = ctx.attempts;
      for (let i = 3; i < sorted.length; i++) {
        const prev3 = sorted.slice(i - 3, i);
        const curr = sorted[i];
        if (
          prev3.every(
            (a) => calibrationVerdict(a.confidence, a.isCorrect) === "cautious-win"
          ) &&
          calibrationVerdict(curr.confidence, curr.isCorrect) === "well-calibrated"
        ) {
          return true;
        }
      }
      return false;
    },
  },
];

// ── Volume medals ────────────────────────────────────────────────

const VOLUME_MEDALS: MedalDef[] = [
  {
    id: "warming_up",
    name: "Warming Up",
    emoji: "🔥",
    category: "volume",
    description: "Complete 10 practice rounds",
    evaluate: (ctx) => ctx.attempts.length >= 10,
  },
  {
    id: "in_training",
    name: "In Training",
    emoji: "💪",
    category: "volume",
    description: "Complete 25 practice rounds",
    evaluate: (ctx) => ctx.attempts.length >= 25,
  },
  {
    id: "battle_tested",
    name: "Battle Tested",
    emoji: "⚔️",
    category: "volume",
    description: "Complete 50 practice rounds",
    evaluate: (ctx) => ctx.attempts.length >= 50,
  },
  {
    id: "scam_gym_regular",
    name: "Scam Gym Regular",
    emoji: "🏋️",
    category: "volume",
    description: "Complete 100 practice rounds",
    evaluate: (ctx) => ctx.attempts.length >= 100,
  },
];

// ── Pattern Mastery medals (auto-generated per family) ───────────

function buildPatternMedals(): MedalDef[] {
  return Object.entries(FAMILY_EMOJI).map(([family, emoji]) => ({
    id: `pattern_${family}`,
    name: `${familyLabel(family)} Master`,
    emoji,
    category: "pattern" as MedalCategory,
    description: `80%+ accuracy on 5+ ${familyLabel(family)} practice rounds`,
    evaluate: (ctx: MedalContext) => {
      const familyAttempts = ctx.attempts.filter((a) => {
        const drill = ctx.drillMap.get(a.drillId);
        return drill?.pattern_family === family;
      });
      if (familyAttempts.length < 5) return false;
      const correct = familyAttempts.filter((a) => a.isCorrect).length;
      return correct / familyAttempts.length >= 0.8;
    },
  }));
}

export const FAMILY_MEDALS = buildPatternMedals();

// ── Special medals ───────────────────────────────────────────────

const SPECIAL_MEDALS: MedalDef[] = [
  {
    id: "skeptics_eye",
    name: "Skeptic's Eye",
    emoji: "🔍",
    category: "special",
    description: "3 AI-polished scams correct in a row",
    evaluate: (ctx) => {
      // Filter to only AI-polished scam attempts
      const aiScamAttempts = ctx.attempts.filter((a) => {
        const drill = ctx.drillMap.get(a.drillId);
        return drill?.ai_amplified && drill?.ground_truth === "scam";
      });
      return longestStreak(aiScamAttempts, (a) => a.isCorrect) >= 3;
    },
  },
  {
    id: "red_flag_hunter",
    name: "Red Flag Hunter",
    emoji: "🚩",
    category: "special",
    description: "5 practice rounds with perfect red flag recall",
    evaluate: (ctx) => {
      const perfectRecalls = ctx.attempts.filter((a) => {
        const drill = ctx.drillMap.get(a.drillId);
        return (
          drill?.ground_truth === "scam" &&
          drill.correct_red_flag_ids.length > 0 &&
          a.redFlagRecall === 1
        );
      });
      return perfectRecalls.length >= 5;
    },
  },
  {
    id: "safety_first",
    name: "Safety First",
    emoji: "🦺",
    category: "special",
    description: "10 consecutive scam rounds with safe behavior",
    evaluate: (ctx) => {
      const scamAttempts = ctx.attempts.filter((a) => {
        const drill = ctx.drillMap.get(a.drillId);
        return drill?.ground_truth === "scam";
      });
      return (
        longestStreak(
          scamAttempts,
          (a) => a.behaviorChoice === "ignore" || a.behaviorChoice === "verify"
        ) >= 10
      );
    },
  },
  {
    id: "perfect_read",
    name: "Perfect Read",
    emoji: "💎",
    category: "special",
    description: "95%+ confidence, correct, and all flags spotted",
    evaluate: (ctx) =>
      ctx.attempts.some((a) => {
        const drill = ctx.drillMap.get(a.drillId);
        if (!drill) return false;
        const hasFlags = drill.ground_truth === "scam" && drill.correct_red_flag_ids.length > 0;
        return (
          a.confidence >= 95 &&
          a.isCorrect &&
          (!hasFlags || a.redFlagRecall === 1)
        );
      }),
  },
];

// ── Streak milestone medals ──────────────────────────────────────

const STREAK_MEDALS: MedalDef[] = [
  {
    id: "streak_3",
    name: "3-Day Habit",
    emoji: "🔥",
    category: "special",
    description: "Practice 3 days in a row",
    evaluate: () => getStreak().current >= 3,
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    emoji: "🗓️",
    category: "special",
    description: "Practice 7 days in a row",
    evaluate: () => getStreak().current >= 7,
  },
  {
    id: "streak_14",
    name: "Two-Week Vigilante",
    emoji: "⚡",
    category: "special",
    description: "Practice 14 days in a row",
    evaluate: () => getStreak().current >= 14,
  },
  {
    id: "streak_30",
    name: "Iron Habit",
    emoji: "🏆",
    category: "special",
    description: "Practice 30 days in a row",
    evaluate: () => getStreak().current >= 30,
  },
];

// ── All medals ───────────────────────────────────────────────────

export const ALL_MEDALS: MedalDef[] = [
  ...CORE_MEDALS,
  ...CALIBRATION_MEDALS,
  ...VOLUME_MEDALS,
  ...FAMILY_MEDALS,
  ...SPECIAL_MEDALS,
  ...STREAK_MEDALS,
];

/** Evaluate all medals and return earned ones. */
export function evaluateAllMedals(ctx: MedalContext): EarnedMedal[] {
  return ALL_MEDALS.filter((m) => m.evaluate(ctx)).map((m) => ({
    id: m.id,
    name: m.name,
    emoji: m.emoji,
    category: m.category,
  }));
}
