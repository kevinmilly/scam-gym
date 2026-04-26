"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Attempt, Drill, CalibrationVerdict, DrillType } from "@/lib/types";
import MessageCard from "@/components/MessageCard";
import { accuracyScore, redFlagRecall } from "@/lib/scoring";
import { trickLabel } from "@/lib/stats";
import { saveAttempt, saveContentFlag, db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { tap, correctVibrate, wrongVibrate } from "@/lib/haptics";
import type { PostDrillReward } from "@/lib/progression";
import { computeXpForAttempt } from "@/lib/xp";
import type { XpBreakdown } from "@/lib/xp";
import XpBar from "@/components/XpBar";
import MedalToast from "@/components/MedalToast";
import LevelUpOverlay from "@/components/LevelUpOverlay";
import { updateStreak } from "@/lib/streak";
import { isBookmarked, toggleBookmark, getBookmarks } from "@/lib/bookmarks";
import { isPremium } from "@/lib/premium";
import { track } from "@/lib/analytics";
import { AlertTriangle, Eye, Lightbulb, Target, Zap, ShieldCheck, ShieldAlert, Check, X as XIcon, Bookmark, BookmarkCheck, ChevronDown, ChevronUp, ArrowRight, Sparkles, Share2 } from "lucide-react";
import { getLevelInfo } from "@/lib/xp";
import { shouldShowInterstitial, dismissInterstitial, isGated, recordGateHit, TRIAL_LIMITS } from "@/lib/trial";
import { maybeRequestReview } from "@/lib/nativeReview";
import ConversionInterstitial from "@/components/ConversionInterstitial";

// Plausible cohort miss rates by pattern family (seeded; replace with real stats post-launch)
const COHORT_MISS_RATES: Record<string, number> = {
  delivery_toll: 0.52,
  bank_fraud_alert: 0.48,
  account_verification: 0.61,
  tech_support: 0.44,
  job_seeker: 0.57,
  invoice_vendor: 0.63,
  romance_social: 0.71,
  qr_code: 0.68,
  marketplace: 0.55,
  oauth_consent: 0.74,
  crypto_wallet: 0.66,
  government_impersonation: 0.58,
  subscription_renewal: 0.53,
  otp_sim_swap: 0.72,
  credential_phishing: 0.64,
  charity_fraud: 0.69,
  malware_attachment: 0.59,
};

function getCohortMissRate(drill: Drill): number {
  const base = COHORT_MISS_RATES[drill.pattern_family] ?? 0.55;
  // Difficulty adjusts the rate slightly
  const diffAdj = (drill.difficulty - 3) * 0.04;
  const aiAdj = drill.ai_amplified ? 0.06 : 0;
  return Math.min(0.95, Math.max(0.15, base + diffAdj + aiAdj));
}

type VerdictConfig = {
  label: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
  description: string;
};

const VERDICT_CONFIG: Record<CalibrationVerdict, VerdictConfig> = {
  "overconfident-miss": {
    label: "Overconfident Miss",
    color: "var(--danger)",
    bg: "var(--danger-bg)",
    icon: <AlertTriangle size={22} strokeWidth={1.75} />,
    description: "You were certain, but wrong. This is the danger zone — slow down.",
  },
  "self-aware-miss": {
    label: "Self-Aware Miss",
    color: "var(--warning)",
    bg: "var(--warning-bg)",
    icon: <Eye size={22} strokeWidth={1.75} />,
    description: "You were wrong, but your caution would have protected you in real life.",
  },
  "cautious-win": {
    label: "Cautious Win",
    color: "var(--info)",
    bg: "var(--info-bg)",
    icon: <Lightbulb size={22} strokeWidth={1.75} />,
    description: "You got it right, but didn't trust your read. Build that instinct.",
  },
  "well-calibrated": {
    label: "Well-calibrated",
    color: "var(--success)",
    bg: "var(--success-bg)",
    icon: <Target size={22} strokeWidth={1.75} />,
    description: "Your confidence matched your accuracy. That's the goal.",
  },
};

const BEHAVIOR_LABELS: Record<string, string> = {
  ignore: "Ignore it",
  verify: "Verify first",
  respond: "Respond",
  click: "Click the link",
  call: "Call the number",
};

const BEHAVIOR_SAFETY: Record<string, Record<string, string>> = {
  scam:  { ignore: "safe", verify: "safe", respond: "risky", click: "risky", call: "risky" },
  legit: { ignore: "safe", verify: "safe", respond: "safe", click: "safe", call: "safe" },
};

export default function ResultPage() {
  const router = useRouter();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [drill, setDrill] = useState<Drill | null>(null);
  const [calVerdict, setCalVerdict] = useState<CalibrationVerdict | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [selectedFlags, setSelectedFlags] = useState<Set<string>>(new Set());
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ContentFlag["reason"] | null>(null);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reward, setReward] = useState<PostDrillReward | null>(null);
  const [xpBreakdown, setXpBreakdown] = useState<XpBreakdown | null>(null);
  const [showMedalToast, setShowMedalToast] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [isFirstDrill, setIsFirstDrill] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showFullBreakdown, setShowFullBreakdown] = useState(false);
  const [showAllTells, setShowAllTells] = useState(false);
  const [displayedXp, setDisplayedXp] = useState(0);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [overallAccuracy, setOverallAccuracy] = useState(0.5);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const revealedRef = useRef<HTMLDivElement>(null);

  type ContentFlag = {
    reason: "answer_wrong" | "question_unclear" | "red_flags_wrong" | "other";
  };

  // Intercept browser back gesture — re-push state so back does nothing
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const a = sessionStorage.getItem("lastAttempt");
    const d = sessionStorage.getItem("lastDrill");
    const cv = sessionStorage.getItem("calVerdict");
    if (!a || !d || !cv) {
      router.replace("/drill");
      return;
    }
    const parsedAttempt = JSON.parse(a);
    const parsedDrill = JSON.parse(d);
    setAttempt(parsedAttempt);
    setDrill(parsedDrill);
    if (parsedAttempt.isCorrect) correctVibrate(); else wrongVibrate();
    setCalVerdict(cv as CalibrationVerdict);
    setBookmarked(isBookmarked(parsedDrill.id));

    // Update streak once per drill (guard against refresh replaying the update)
    if (!sessionStorage.getItem("streakUpdated")) {
      updateStreak();
      sessionStorage.setItem("streakUpdated", "1");
    }

    track("result_viewed", {
      drillId: parsedDrill.id,
      isCorrect: JSON.parse(a).isCorrect,
      calVerdict: cv,
    });

    // Check attempt count for first-drill explainer and explanation gating
    db.attempts.toArray().then((all) => {
      const count = all.length;
      if (count <= 1) setIsFirstDrill(true);
      setAttemptCount(count);
      if (count > 0) {
        const correctCount = all.filter((a) => a.isCorrect).length;
        setOverallAccuracy(correctCount / count);
        maybeRequestReview(correctCount);
      }
      // Show conversion interstitial after 3s if conditions are met
      if (shouldShowInterstitial(count)) {
        setTimeout(() => setShowInterstitial(true), 3000);
      }
    });

    const r = sessionStorage.getItem("lastReward");
    if (r) {
      const parsed = JSON.parse(r) as PostDrillReward;
      setReward(parsed);
      setXpBreakdown(parsed.xpBreakdown);
      // Animate XP count-up
      const target = parsed.xpBreakdown.total;
      let current = 0;
      const step = Math.ceil(target / 12);
      const interval = setInterval(() => {
        current = Math.min(current + step, target);
        setDisplayedXp(current);
        if (current >= target) clearInterval(interval);
      }, 40);
      // Show medal toast after 500ms delay
      if (parsed.newMedals.length > 0) {
        setTimeout(() => setShowMedalToast(true), 500);
      }
    }
  }, [router]);

  function toggleFlag(id: string) {
    setSelectedFlags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleReveal() {
    if (!drill || !attempt) return;
    const flagIds = Array.from(selectedFlags);
    const recall = redFlagRecall(flagIds, drill.correct_red_flag_ids);
    const updated = { ...attempt, selectedRedFlagIds: flagIds, redFlagRecall: recall };
    await saveAttempt(updated);
    setAttempt(updated);
    setRevealed(true);

    // Increment daily explanation counter for free users
    if (!isPremium()) {
      const today = new Date().toISOString().slice(0, 10);
      const stored = localStorage.getItem("scamgym_daily_explains");
      const data = stored ? JSON.parse(stored) : { date: today, count: 0 };
      if (data.date !== today) {
        localStorage.setItem("scamgym_daily_explains", JSON.stringify({ date: today, count: 1 }));
      } else {
        localStorage.setItem("scamgym_daily_explains", JSON.stringify({ date: today, count: data.count + 1 }));
      }
    }

    setTimeout(() => revealedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);

    // Recompute XP breakdown now that redFlagRecall is populated
    const newBreakdown = computeXpForAttempt(updated, drill);
    setXpBreakdown(newBreakdown);
  }

  const handleReport = useCallback(async () => {
    if (!drill || !reportReason) return;
    await saveContentFlag({
      id: uuidv4(),
      drillId: drill.id,
      timestamp: Date.now(),
      reason: reportReason,
      detail: null,
      syncedAt: null,
    });
    setReportSubmitted(true);
    setReportOpen(false);
  }, [drill, reportReason]);

  async function handleShare() {
    if (!drill || !attempt) return;
    tap();
    const pct = Math.round(overallAccuracy * 100);
    const text = `I'm training to spot scams on Scam Gym — ${pct}% accuracy so far. Try it free: https://scamgym.com/?ref=share_result_v1`;
    track("result_shared", { drillId: drill.id, accuracy: overallAccuracy });
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2500);
    } catch { /* ignore */ }
  }

  if (!attempt || !drill || !calVerdict) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p style={{ color: "var(--text-muted)" }}>Loading result…</p>
      </div>
    );
  }

  const vc = VERDICT_CONFIG[calVerdict];
  const score = accuracyScore(attempt.brierScore);

  // Soft-gate explanation for free users: 3 free explanations per day,
  // then gated until the next calendar day.
  const explanationGated = (() => {
    if (isPremium()) return false;
    const FREE_DAILY_LIMIT = 3;
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    const stored = localStorage.getItem("scamgym_daily_explains");
    const data = stored ? JSON.parse(stored) : { date: today, count: 0 };
    if (data.date !== today) return false; // new day = fresh quota
    return data.count >= FREE_DAILY_LIMIT;
  })();
  const correctIds = new Set(drill.correct_red_flag_ids);

  // Personalized "just one more" nudge shown after reveal
  function getNextDrillNudge(): string | null {
    if (!reward) return null;
    const { levelInfo } = reward;

    // Nudge 1: close to leveling up
    if (levelInfo.xpForNextLevel !== null) {
      const xpNeeded = levelInfo.xpForNextLevel - levelInfo.currentXp;
      if (xpNeeded <= 33) {
        return `You need ${xpNeeded} more XP to reach ${
          getLevelInfo(levelInfo.xpForNextLevel).title
        } — one more drill could do it.`;
      }
    }

    // Nudge 2: correct streak
    const correctStreak = (() => {
      const recentAttempts = ((): Attempt[] => {
        try {
          const stored = sessionStorage.getItem("recentAttempts");
          return stored ? JSON.parse(stored) : [];
        } catch { return []; }
      })();
      if (recentAttempts.length === 0) return 0;
      let streak = 0;
      for (let i = recentAttempts.length - 1; i >= 0; i--) {
        if (recentAttempts[i].isCorrect) streak++;
        else break;
      }
      return attempt!.isCorrect ? streak + 1 : 0;
    })();
    if (correctStreak >= 3) {
      return `${correctStreak} correct in a row — can you make it ${correctStreak + 2}?`;
    }

    // Nudge 3: missed scam → train it
    if (!attempt!.isCorrect && drill!.ground_truth === "scam") {
      return "You missed that one. Train the same category to sharpen your instinct.";
    }

    // Nudge 4: early user encouragement
    if (attemptCount < 10) {
      return `${10 - attemptCount} more drills to unlock your Vulnerability Profile.`;
    }

    return null;
  }
  const nextDrillNudge = revealed ? getNextDrillNudge() : null;

  // SAFE/RISKY banner
  // "At risk" only when user missed a real scam (said legit on a scam).
  // Flagging a legit message as scam = overcautious, not dangerous.
  const missedScam = !attempt.isCorrect && drill.ground_truth === "scam";
  const wasSafe = attempt.isCorrect;
  const bannerBg = missedScam
    ? "rgba(239,68,68,0.15)"
    : wasSafe
    ? "rgba(34,197,94,0.15)"
    : "rgba(245,158,11,0.15)";
  const bannerBorder = missedScam ? "#ef444444" : wasSafe ? "#22c55e44" : "#f59e0b44";
  const bannerColor = missedScam ? "#ef4444" : wasSafe ? "#22c55e" : "#f59e0b";
  const bannerIcon = missedScam ? <Zap size={22} strokeWidth={1.75} /> : wasSafe ? <ShieldCheck size={22} strokeWidth={1.75} /> : <AlertTriangle size={22} strokeWidth={1.75} />;
  const bannerText = missedScam
    ? "You were at risk"
    : wasSafe
    ? "You were safe"
    : "You were overcautious";

  // Summary line
  const summaryText = `You said ${attempt.userVerdict.toUpperCase()} at ${attempt.confidence}% · ${attempt.isCorrect ? "Correct" : "Incorrect"}`;

  // Consequence framing
  const consequenceText =
    attempt.isCorrect && drill.ground_truth === "scam"
      ? `If you had engaged, ${drill.explanation.consequence.charAt(0).toLowerCase()}${drill.explanation.consequence.slice(1)}`
      : drill.explanation.consequence;

  // Consequence header label
  const consequenceLabel =
    drill.ground_truth === "scam" && !attempt.isCorrect
      ? "If this were real…"
      : drill.ground_truth === "scam"
      ? "You were right to be suspicious"
      : attempt.isCorrect
      ? "This was safe to engage with"
      : "You flagged a safe message";

  // Behavior feedback
  const behaviorSafety =
    attempt.behaviorChoice && drill.ground_truth
      ? BEHAVIOR_SAFETY[drill.ground_truth]?.[attempt.behaviorChoice]
      : null;

  return (
    <div className="flex flex-col min-h-dvh pb-8">
      {/* Medal Toast */}
      {showMedalToast && reward && reward.newMedals.length > 0 && (
        <MedalToast
          medals={reward.newMedals}
          onDone={() => {
            setShowMedalToast(false);
            if (reward.leveledUp) {
              setShowLevelUp(true);
            }
          }}
        />
      )}

      {/* Level Up Overlay */}
      {showLevelUp && reward && (
        <LevelUpOverlay
          previousLevel={reward.previousLevel}
          newLevel={reward.levelInfo.level}
          onDismiss={() => setShowLevelUp(false)}
        />
      )}

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={() => router.push("/?from=drill")}
          className="min-h-[44px] px-3 flex items-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          ← Home
        </button>
        <div className="flex items-center gap-1">
          {drill && (() => {
            const bookmarkCount = getBookmarks().length;
            const bookmarkGated = isGated("bookmarks", bookmarkCount) && !bookmarked;
            return (
              <button
                onClick={() => {
                  tap();
                  if (bookmarkGated) {
                    recordGateHit("bookmarks");
                    track("upgrade_prompt_shown", { label: "bookmark_limit" });
                    router.push("/upgrade");
                    return;
                  }
                  const result = toggleBookmark(drill.id);
                  if (result) track("bookmark_added", { drillId: drill.id });
                  setBookmarked(result);
                }}
                className="min-h-[44px] px-3 flex items-center text-lg"
                aria-label={bookmarked ? "Remove bookmark" : "Bookmark this drill"}
                title={bookmarkGated ? `Free limit: ${TRIAL_LIMITS.bookmarks} bookmarks` : undefined}
              >
                {bookmarked
                  ? <BookmarkCheck size={20} strokeWidth={1.75} style={{ color: "var(--accent)" }} />
                  : <Bookmark size={20} strokeWidth={1.75} style={{ color: bookmarkGated ? "var(--text-muted)" : undefined }} />
                }
              </button>
            );
          })()}
          <button
            onClick={() => router.push("/stats")}
            className="min-h-[44px] px-3 flex items-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Stats
          </button>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 overflow-y-auto flex-1">
        {/* SAFE / RISKY banner */}
        <div
          className="rounded-2xl py-4 px-4 border"
          style={{ background: bannerBg, borderColor: bannerBorder }}
        >
          <div className="font-display text-3xl font-extrabold flex items-center gap-2" style={{ color: bannerColor, lineHeight: 1.1 }}>
            {bannerIcon} {bannerText}
          </div>
        </div>

        {/* Summary line */}
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {summaryText}
        </p>

        {/* Consequence */}
        <div
          className="rounded-2xl p-3 border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--warning)" }}>
            {consequenceLabel}
          </p>
          <p className="text-sm leading-relaxed italic" style={{ color: "var(--text-muted)" }}>
            {consequenceText}
          </p>
          {drill.ground_truth === "scam" && (
            <p className="text-xs mt-3 leading-relaxed" style={{ color: "var(--text-muted)", opacity: 0.75 }}>
              Scammers send this to thousands of people — betting some actually use the service. That&apos;s the trap. Even if it sounds plausible, verify through an official source before acting.
            </p>
          )}
        </div>

        {/* Cohort feedback — normalizing / encouraging */}
        {(() => {
          const missRate = getCohortMissRate(drill);
          const pct = Math.round(missRate * 100);
          if (attempt.isCorrect) {
            return (
              <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
                Nice — this one fools <strong style={{ color: "var(--text)" }}>{pct}%</strong> of people on first try.
              </p>
            );
          } else {
            return (
              <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
                This one got you — and it gets <strong style={{ color: "var(--text)" }}>{pct}%</strong> of people. Here&apos;s the tell.
              </p>
            );
          }
        })()}

        {/* Contextual upgrade trigger — after miss on a hard pattern */}
        {!attempt.isCorrect && !isPremium() && getCohortMissRate(drill) >= 0.5 && (
          <div
            className="rounded-2xl p-4 border"
            style={{ background: "var(--accent-subtle)", borderColor: "var(--accent)" + "55" }}
          >
            <p className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>
              {Math.round(getCohortMissRate(drill) * 100)}% of people miss this type. You&apos;re not alone.
            </p>
            <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
              Pro finds your 3 biggest blind spots and trains them out. $9.99 once.
            </p>
            <Link
              href="/upgrade"
              onClick={() => track("upgrade_trigger_contextual_shown", { drillId: drill.id, missRate: getCohortMissRate(drill) })}
              className="inline-block px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              See what Pro finds →
            </Link>
          </div>
        )}

        {/* Behavior feedback — only warn when the user picked something dangerous */}
        {attempt.behaviorChoice && behaviorSafety === "risky" && (
          <div
            className="rounded-2xl p-3 border"
            style={{
              background: "var(--danger-bg)",
              borderColor: "var(--danger-border)",
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
              You said you&apos;d <strong>{BEHAVIOR_LABELS[attempt.behaviorChoice]}</strong>
              {" → "}<span style={{ color: "var(--danger)" }}>That would have been risky</span>
            </p>
          </div>
        )}

        {/* AI-Polished card */}
        {(drill.ai_amplified ?? false) && (
          <div
            className="rounded-2xl p-3 border"
            style={{ background: "var(--danger-bg)", borderColor: "var(--danger-border)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--danger)" }}>
              AI-Polished Message
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
              Polished language is no longer a safety signal. AI generates grammatically perfect, emotionally convincing scams at scale. Fluency means nothing.
            </p>
          </div>
        )}

        {/* Format-specific result sections */}
        {(drill.drill_type ?? "standard") === "preview" && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Full Message
            </p>
            <MessageCard drill={drill} />
          </div>
        )}

        {(drill.drill_type ?? "standard") === "spot_flag" && attempt.spot_flag_pick && (
          <div
            className="rounded-2xl p-3 border"
            style={{
              background: attempt.spot_flag_correct ? "var(--success-bg)" : "var(--warning-bg)",
              borderColor: attempt.spot_flag_correct ? "var(--success)" + "44" : "var(--warning)" + "44",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: attempt.spot_flag_correct ? "var(--success)" : "var(--warning)" }}>
              {attempt.spot_flag_correct ? "You spotted the right flag" : "Not quite the key flag"}
            </p>
            <p className="text-sm" style={{ color: "var(--text)" }}>
              You picked: <strong>{drill.spot_flag_options?.find(o => o.id === attempt.spot_flag_pick)?.label}</strong>
            </p>
            {!attempt.spot_flag_correct && drill.spot_flag_correct_id && (
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                Key flag: <strong style={{ color: "var(--text)" }}>{drill.spot_flag_options?.find(o => o.id === drill.spot_flag_correct_id)?.label}</strong>
              </p>
            )}
          </div>
        )}

        {(drill.drill_type ?? "standard") === "comparison" && (() => {
          const pairData = sessionStorage.getItem("comparisonPair");
          if (!pairData) return null;
          const pair = JSON.parse(pairData);
          return (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                The two messages
              </p>
              <div className="space-y-3">
                {[pair.drillA, pair.drillB].map((d: Drill, i: number) => {
                  const label = i === 0 ? "A" : "B";
                  const isScam = d.ground_truth === "scam";
                  return (
                    <div
                      key={d.id}
                      className="rounded-2xl border-2 p-1"
                      style={{
                        borderColor: isScam ? "var(--danger)" : "var(--success)",
                      }}
                    >
                      <div className="flex items-center gap-2 px-3 py-1.5">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: isScam ? "var(--danger)" : "var(--success)",
                            color: "#fff",
                          }}
                        >
                          {label}
                        </span>
                        <span className="text-xs font-bold" style={{ color: isScam ? "var(--danger)" : "var(--success)" }}>
                          {isScam ? "Scam" : "Legit"}
                        </span>
                      </div>
                      <MessageCard drill={d} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Legit drill tip — fills white space and encourages breakdown */}
        {!revealed && drill.ground_truth === "legit" && (
          <div
            className="rounded-2xl p-4 border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--success)" }}>
              Know what made this safe
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Scammers often mimic safe messages. Seeing what made this one legitimate helps you tell them apart.
            </p>
          </div>
        )}

        {/* Scroll hint — visible before reveal */}
        {!revealed && drill.ground_truth === "scam" && drill.red_flags.length > 0 && (
          <div className="flex flex-col items-center gap-1 py-1" style={{ color: "var(--text-muted)" }}>
            <span className="text-xs">scroll for more</span>
            <span
              className="text-base"
              style={{
                display: "inline-block",
                animation: "bounce 1.4s infinite",
              }}
            >
              ↓
            </span>
          </div>
        )}

        {/* Red flag selection (Phase 1) — only for scam drills */}
        {!revealed && drill.ground_truth === "scam" && drill.red_flags.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
              Which of these did you spot?
            </p>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Optional — select any you noticed.
            </p>
            <div className="flex flex-wrap gap-2">
              {drill.red_flags.map((flag) => {
                const selected = selectedFlags.has(flag.id);
                return (
                  <button
                    key={flag.id}
                    onClick={() => toggleFlag(flag.id)}
                    className="px-3 py-2 rounded-xl text-sm border-2 transition-all active:scale-95"
                    style={{
                      borderColor: selected ? "var(--accent)" : "var(--border)",
                      background: selected ? "rgba(13,31,60,0.15)" : "var(--surface)",
                      color: selected ? "var(--accent)" : "var(--text-muted)",
                    }}
                  >
                    {flag.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Phase 2 — revealed content */}
        {revealed && (
          <div ref={revealedRef} className="space-y-5 animate-revealIn">
            {/* Calibration verdict */}
            <div
              className="rounded-2xl p-3 border"
              style={{ background: vc.bg, borderColor: vc.color + "44" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span style={{ color: vc.color }}>{vc.icon}</span>
                  <span className="text-xl font-bold" style={{ color: vc.color }}>
                    {vc.label}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold" style={{ color: vc.color }}>{score}/100</div>
                </div>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {vc.description}
              </p>
            </div>

            {/* First-drill calibration explainer */}
            {isFirstDrill && (
              <div
                className="rounded-2xl p-3 border"
                style={{ background: "var(--surface)", borderColor: "var(--accent)" + "33" }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
                  How scoring works
                </p>
                <p className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>
                  Being wrong isn&apos;t the only danger. Being confident and wrong is.
                </p>
                <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
                  Scam Gym tracks not just whether you got it right — it tracks how sure you were.
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Overconfident", color: "var(--danger)", desc: "Wrong + sure" },
                    { label: "Well-calibrated", color: "var(--success)", desc: "Confidence matches" },
                    { label: "Underconfident", color: "var(--info)", desc: "Right but unsure" },
                  ].map((v) => (
                    <div key={v.label} className="rounded-xl p-2.5 flex flex-col items-center" style={{ background: "var(--surface-2)" }}>
                      <div className="text-xs font-bold mb-0.5 text-center leading-tight" style={{ color: v.color }}>{v.label}</div>
                      <div className="text-xs text-center leading-tight" style={{ color: "var(--text-muted)" }}>{v.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* First-drill wrong answer — vulnerability upsell nudge */}
            {isFirstDrill && !attempt.isCorrect && !isPremium() && (
              <div
                className="rounded-2xl p-4 border"
                style={{ background: "var(--accent-subtle)", borderColor: "var(--accent)" }}
              >
                <p className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>
                  That one caught you. You&apos;re not alone.
                </p>
                <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
                  After a few more drills, Scam Gym can show you exactly which scam types are most likely to fool you — and let you train those weak spots specifically.
                </p>
                <Link
                  href="/upgrade"
                  className="text-xs font-bold"
                  style={{ color: "var(--accent)" }}
                >
                  See what Pro unlocks →
                </Link>
              </div>
            )}

            {/* Underconfidence intervention */}
            {calVerdict === "cautious-win" && attempt.isCorrect && (
              <div
                className="rounded-2xl p-3 border"
                style={{ background: "var(--info-bg)", borderColor: "var(--info-border)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--info)" }}>
                  You hesitated — but were right
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                  You got it right — but in real life, uncertainty often leads to engaging anyway. Your instinct was correct: ignore or verify, don&apos;t engage.
                </p>
              </div>
            )}

            {/* Pattern family + short explanation */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-xs px-3 py-1 rounded-full border font-medium"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                {drill.pattern_family.replace(/_/g, " ")}
              </span>
              {drill.tricks?.map((trick) => (
                <span
                  key={trick}
                  className="text-xs px-3 py-1 rounded-full font-bold"
                  style={{ background: "rgba(13,31,60,0.1)", color: "var(--accent)" }}
                >
                  {trickLabel(trick)}
                </span>
              ))}
            </div>

            <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--text)" }}>
              {drill.explanation.short}
            </p>

            {/* Tells */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                The Tells
              </p>
              <ul className="space-y-2">
                {(showAllTells ? drill.explanation.tells : drill.explanation.tells.slice(0, 2)).map((tell, i) => (
                  <li key={i} className="flex gap-3 text-sm" style={{ color: "var(--text)" }}>
                    <span style={{ color: "var(--accent)" }}>→</span>
                    <span>{tell}</span>
                  </li>
                ))}
              </ul>
              {drill.explanation.tells.length > 2 && !showAllTells && (
                <button
                  onClick={() => setShowAllTells(true)}
                  className="text-xs mt-2 font-semibold"
                  style={{ color: "var(--accent)" }}
                >
                  +{drill.explanation.tells.length - 2} more tells
                </button>
              )}
            </div>

            {/* Secondary breakdown — collapsed by default */}
            <button
              onClick={() => setShowFullBreakdown((v) => !v)}
              className="w-full py-3 rounded-xl text-sm font-semibold border transition-colors duration-150 active:scale-95"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
                color: "var(--text-muted)",
              }}
            >
              {showFullBreakdown ? "Hide breakdown ↑" : "See full breakdown ↓"}
            </button>

            {showFullBreakdown && <div className="space-y-5">

            {/* Green flags — only for legit drills */}
            {drill.ground_truth === "legit" && drill.green_flags && drill.green_flags.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--success)" }}>
                  Green Flags
                </p>
                <div className="flex flex-wrap gap-2">
                  {drill.green_flags.map((flag) => (
                    <span
                      key={flag.id}
                      className="px-3 py-1.5 rounded-xl text-sm border"
                      style={{ borderColor: "#22c55e44", color: "var(--success)", background: "var(--success-bg)" }}
                    >
                      <Check size={14} strokeWidth={2} className="inline mr-1" /> {flag.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Red flags review — only for scam drills */}
            {drill.ground_truth === "scam" && drill.red_flags.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                  Red Flags Review
                </p>
                <div className="flex flex-wrap gap-2">
                  {drill.red_flags.map((flag) => {
                    const isCorrectFlag = correctIds.has(flag.id);
                    const wasSelected = selectedFlags.has(flag.id);
                    let borderColor = "var(--border)";
                    let color = "var(--text-muted)";
                    let suffix = "";
                    if (isCorrectFlag && wasSelected) {
                      borderColor = "#22c55e";
                      color = "#22c55e";
                      suffix = " ✓";
                    } else if (isCorrectFlag && !wasSelected) {
                      borderColor = "#f59e0b";
                      color = "#f59e0b";
                      suffix = " (missed)";
                    } else if (!isCorrectFlag && wasSelected) {
                      borderColor = "#ef4444";
                      color = "#ef4444";
                      suffix = " (not a tell)";
                    }
                    return (
                      <span
                        key={flag.id}
                        className="px-3 py-1.5 rounded-xl text-sm border"
                        style={{ borderColor, color }}
                      >
                        {flag.label}{suffix}
                      </span>
                    );
                  })}
                  {drill.correct_red_flag_ids.length === 0 && (
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                      No red flags — this is a legitimate message.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* What to do */}
            <div
              className="rounded-2xl p-3 border"
              style={{ background: "var(--surface)", borderColor: "var(--accent)" + "33" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
                What To Do
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                {drill.explanation.safe_move}
              </p>
              {drill.explanation.behavioral_reinforcement && drill.explanation.behavioral_reinforcement !== drill.explanation.safe_move && (
                <p className="text-sm leading-relaxed mt-2 pt-2 border-t" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
                  {drill.explanation.behavioral_reinforcement}
                </p>
              )}
            </div>

            {/* Contextual upsell for non-premium users */}
            {!isPremium() && (
              <Link
                href="/upgrade"
                className="flex items-center gap-2 text-xs py-2"
                style={{ color: "var(--accent)" }}
              >
                <Sparkles size={14} strokeWidth={1.75} />
                <span>Want reply scripts &amp; more? <strong>Upgrade to Pro</strong></span>
              </Link>
            )}

            {/* Report issue */}
            {!reportSubmitted && (
              <div>
                {!reportOpen ? (
                  <button
                    onClick={() => setReportOpen(true)}
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Report an issue with this drill
                  </button>
                ) : (
                  <div
                    className="rounded-2xl p-4 border space-y-3"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                      What&apos;s wrong with this drill?
                    </p>
                    {(
                      [
                        { value: "answer_wrong", label: "The answer is wrong" },
                        { value: "question_unclear", label: "Message is unclear or ambiguous" },
                        { value: "red_flags_wrong", label: "Red flags are incorrect" },
                        { value: "other", label: "Other" },
                      ] as { value: ContentFlag["reason"]; label: string }[]
                    ).map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setReportReason(value)}
                        className="flex items-center gap-2 text-sm w-full text-left"
                        style={{ color: reportReason === value ? "var(--accent)" : "var(--text-muted)" }}
                      >
                        <span>{reportReason === value ? "●" : "○"}</span>
                        {label}
                      </button>
                    ))}
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={handleReport}
                        disabled={!reportReason}
                        className="px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{
                          background: reportReason ? "var(--accent)" : "var(--border)",
                          color: reportReason ? "#fff" : "var(--text-muted)",
                        }}
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setReportOpen(false)}
                        className="px-4 py-2 rounded-xl text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {reportSubmitted && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Thanks for the report. We&apos;ll review it.
              </p>
            )}

            </div>}
          </div>
        )}
      </div>

      {/* XP summary — low noise, shown after the content */}
      {xpBreakdown && (
        <div className="px-4 pt-4 pb-3 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="font-display text-sm font-extrabold px-3 py-1 rounded-full"
              style={{
                background: "var(--signature-subtle)",
                color: "var(--signature)",
                border: "1px solid var(--signature-border)",
                letterSpacing: "-0.01em",
              }}
            >
              +{displayedXp} XP
            </span>
            {typeof window !== "undefined" && sessionStorage.getItem("isDailyChallenge") === "1" && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.15)", color: "var(--warning)" }}>
                ⚡ 2× Daily Challenge Bonus!
              </span>
            )}
          </div>
          {reward && <XpBar levelInfo={reward.levelInfo} animate />}
        </div>
      )}

      {/* Sticky footer */}
      <div
        className="sticky bottom-[57px] px-4 py-4 border-t"
        style={{ background: "var(--background)", borderColor: "var(--border)" }}
      >
        {revealed ? (
          <div className="space-y-2">
            {nextDrillNudge && (
              <p className="text-xs text-center font-medium px-2" style={{ color: "var(--text-muted)" }}>
                {nextDrillNudge}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => { tap(); router.push("/drill"); }}
                className="flex-1 py-4 rounded-full font-display font-extrabold text-lg transition-all active:scale-95"
                style={{
                  background: "var(--signature)",
                  color: "#fff",
                  boxShadow: "0 8px 24px rgba(247,122,15,0.38)",
                  letterSpacing: "-0.01em",
                }}
              >
                Next Round →
              </button>
              <button
                onClick={handleShare}
                aria-label="Share your result"
                className="py-4 px-4 rounded-full transition-all active:scale-95 flex items-center justify-center min-w-[56px]"
                style={{ background: "var(--surface-2)", color: shareStatus === "copied" ? "var(--success)" : "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                <Share2 size={20} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        ) : explanationGated ? (
            /* Soft gate — show upsell instead of explanation on gated drills */
            <div className="space-y-3">
              <div
                className="rounded-2xl px-4 py-4 border text-center"
                style={{ background: "var(--accent-subtle)", borderColor: "var(--accent)" }}
              >
                <p className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>
                  You&apos;ve used your 3 free breakdowns for today
                </p>
                <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
                  Pro unlocks unlimited breakdowns — see exactly which red flags appeared, which you caught, and which you missed. Plus your full vulnerability profile across all scam types.
                </p>
                <Link
                  href="/upgrade"
                  className="inline-block px-5 py-2 rounded-full font-bold text-sm"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  Unlock Full Breakdowns
                </Link>
              </div>
              <button
                onClick={() => { tap(); router.push("/drill"); }}
                className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
                style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)", cursor: "pointer" }}
              >
                Next Round →
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => { tap(); handleReveal(); }}
                className="flex-1 py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Show Full Picture
              </button>
              <button
                onClick={() => { tap(); router.push("/drill"); }}
                className="py-4 px-5 rounded-2xl text-sm transition-colors duration-150 active:scale-95"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                Skip
              </button>
            </div>
          )
        }
      </div>

      {/* Conversion interstitial — shown once after 15+ drills + 2 gates hit */}
      {showInterstitial && (
        <ConversionInterstitial
          totalAttempts={attemptCount}
          accuracy={overallAccuracy}
          onDismiss={() => { setShowInterstitial(false); }}
        />
      )}
    </div>
  );
}
