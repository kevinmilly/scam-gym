/**
 * Trial gating — "taste then gate" system for free users.
 *
 * Each feature has a free allowance. When exceeded, the feature gates.
 * We also track how many gates have been hit to trigger the conversion interstitial.
 */

import { isPremium } from "./premium";

const GATES_HIT_KEY = "scamgym_gates_hit";

// ── Per-feature limits ────────────────────────────────────────────

export const TRIAL_LIMITS = {
  session: 1,       // free sessions before gate
  bookmarks: 3,     // bookmarks before gate
  trendChart: 7,    // data points shown before blur
  history: 5,       // attempts shown in history before gate
} as const;

type GateFeature = keyof typeof TRIAL_LIMITS;

// ── Usage tracking keys ───────────────────────────────────────────

const USAGE_KEYS: Record<GateFeature, string> = {
  session: "scamgym_trial_sessions",
  bookmarks: "scamgym_bookmarks",       // reuse the real bookmarks key (it's already an array)
  trendChart: "",                       // derived from attempt count — no separate key needed
  history: "",                          // derived from attempt count — no separate key needed
};

// ── Core helpers ──────────────────────────────────────────────────

function getUsage(feature: "session"): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(USAGE_KEYS[feature]);
    return raw ? parseInt(raw, 10) : 0;
  } catch { return 0; }
}

export function incrementUsage(feature: "session"): void {
  if (typeof window === "undefined") return;
  const current = getUsage(feature);
  localStorage.setItem(USAGE_KEYS[feature], String(current + 1));
}

// ── Gate checks ───────────────────────────────────────────────────

/** Is this feature gated for the current user? */
export function isGated(feature: GateFeature, usage?: number): boolean {
  if (isPremium()) return false;
  switch (feature) {
    case "session":
      return getUsage("session") >= TRIAL_LIMITS.session;
    case "bookmarks":
      return (usage ?? 0) >= TRIAL_LIMITS.bookmarks;
    case "trendChart":
      return (usage ?? 0) > TRIAL_LIMITS.trendChart;
    case "history":
      return (usage ?? 0) > TRIAL_LIMITS.history;
  }
}

// ── Conversion interstitial tracking ─────────────────────────────

/** Record that a gate was encountered. Returns total distinct gates hit. */
export function recordGateHit(feature: GateFeature): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(GATES_HIT_KEY);
    const hits: string[] = raw ? JSON.parse(raw) : [];
    if (!hits.includes(feature)) hits.push(feature);
    localStorage.setItem(GATES_HIT_KEY, JSON.stringify(hits));
    return hits.length;
  } catch { return 0; }
}

export function getGatesHit(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(GATES_HIT_KEY);
    return raw ? (JSON.parse(raw) as string[]).length : 0;
  } catch { return 0; }
}

/**
 * Should we show the conversion interstitial?
 * Triggers when: 15+ drills AND 2+ distinct gates hit AND not yet dismissed.
 */
const INTERSTITIAL_KEY = "scamgym_interstitial_dismissed";

export function shouldShowInterstitial(totalAttempts: number): boolean {
  if (isPremium()) return false;
  if (typeof window === "undefined") return false;
  if (totalAttempts < 15) return false;
  if (getGatesHit() < 2) return false;
  return localStorage.getItem(INTERSTITIAL_KEY) !== "1";
}

export function dismissInterstitial(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(INTERSTITIAL_KEY, "1");
}
