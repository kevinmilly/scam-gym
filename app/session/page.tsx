"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useDrillContext, allDrills } from "@/lib/DrillContext";
import MessageCard from "@/components/MessageCard";
import { brierScore, redFlagRecall, calibrationVerdict } from "@/lib/scoring";
import { saveAttempt } from "@/lib/db";
import { computeXpForAttempt } from "@/lib/xp";
import { updateStreak } from "@/lib/streak";
import { buildSessionDrills, saveSession, getSession, clearSession } from "@/lib/session";
import type { SessionState } from "@/lib/session";
import type { Drill, Verdict, BehaviorChoice, Attempt } from "@/lib/types";
import { tap } from "@/lib/haptics";
import { playCorrect, playIncorrect } from "@/lib/audio";
import { track } from "@/lib/analytics";
import { isPremium } from "@/lib/premium";
import { familyLabel } from "@/lib/stats";

const CONFIDENCE_OPTIONS = [50, 60, 70, 85, 95];
const BEHAVIOR_OPTIONS: { value: BehaviorChoice; label: string }[] = [
  { value: "ignore", label: "Ignore it" },
  { value: "verify", label: "Verify first" },
  { value: "respond", label: "Respond" },
  { value: "click", label: "Click the link" },
  { value: "call", label: "Call the number" },
];

type SessionSummaryData = {
  total: number;
  correct: number;
  accuracy: number;
  xpEarned: number;
  families: string[];
  overconfident: number;
  underconfident: number;
  wellCalibrated: number;
};

export default function SessionPage() {
  const router = useRouter();
  const { attempts: contextAttempts, selectedContext, recordAttempt } = useDrillContext();

  const [session, setSession] = useState<SessionState | null>(null);
  const [sessionDrills, setSessionDrills] = useState<Drill[]>([]);
  const [currentDrill, setCurrentDrill] = useState<Drill | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [behaviorChoice, setBehaviorChoice] = useState<BehaviorChoice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState<SessionSummaryData | null>(null);
  const [sessionAttempts, setSessionAttempts] = useState<Attempt[]>([]);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Initialize or restore session
  useEffect(() => {
    if (!isPremium()) {
      router.replace("/");
      return;
    }

    const existing = getSession();
    if (existing) {
      setSession(existing);
      // Restore drills from IDs
      const drills = existing.drillIds.map((id) => allDrills.find((d) => d.id === id)!).filter(Boolean);
      setSessionDrills(drills);
      setCurrentDrill(drills[existing.currentIndex] || null);
    } else {
      // Build new session
      const contextPool = selectedContext
        ? allDrills.filter((d) => d.context === selectedContext)
        : allDrills;
      const drills = buildSessionDrills(allDrills, contextAttempts, contextPool);
      const newSession: SessionState = {
        drillIds: drills.map((d) => d.id),
        currentIndex: 0,
        attempts: [],
        startedAt: Date.now(),
      };
      setSession(newSession);
      setSessionDrills(drills);
      setCurrentDrill(drills[0] || null);
      saveSession(newSession);
      track("session_started");
    }
  }, [router, selectedContext, contextAttempts]);

  // Reset form when drill changes
  useEffect(() => {
    setVerdict(null);
    setConfidence(null);
    setBehaviorChoice(null);
    setSubmitting(false);
  }, [currentDrill?.id]);

  async function handleSubmit() {
    if (!verdict || confidence === null || !currentDrill || !session || submitting) return;
    setSubmitting(true);

    const isCorrect = verdict === currentDrill.ground_truth;
    const brier = brierScore(confidence, isCorrect);
    const flagRecall = redFlagRecall([], currentDrill.correct_red_flag_ids);
    const calVerd = calibrationVerdict(confidence, isCorrect);

    const attempt: Attempt = {
      id: uuidv4(),
      drillId: currentDrill.id,
      timestamp: Date.now(),
      userVerdict: verdict,
      confidence,
      selectedRedFlagIds: [],
      isCorrect,
      brierScore: brier,
      redFlagRecall: flagRecall,
      syncedAt: null,
      behaviorChoice: behaviorChoice ?? undefined,
    };

    // Play sound feedback
    if (isCorrect) playCorrect();
    else playIncorrect();

    await saveAttempt(attempt);
    recordAttempt(attempt);
    updateStreak();

    const newSessionAttempts = [...sessionAttempts, attempt];
    setSessionAttempts(newSessionAttempts);

    const nextIndex = session.currentIndex + 1;
    const updatedSession: SessionState = {
      ...session,
      currentIndex: nextIndex,
      attempts: [...session.attempts, attempt.id],
    };

    if (nextIndex >= sessionDrills.length) {
      // Session complete — show summary
      clearSession();
      const correct = newSessionAttempts.filter((a) => a.isCorrect).length;
      const drillMap = new Map(allDrills.map((d) => [d.id, d]));
      let xpEarned = 0;
      let overconfident = 0;
      let underconfident = 0;
      let wellCalibrated = 0;
      const familySet = new Set<string>();

      for (const a of newSessionAttempts) {
        const drill = drillMap.get(a.drillId);
        if (drill) {
          xpEarned += computeXpForAttempt(a, drill).total;
          familySet.add(drill.pattern_family);
        }
        const cv = calibrationVerdict(a.confidence, a.isCorrect);
        if (cv === "overconfident") overconfident++;
        else if (cv === "underconfident") underconfident++;
        else wellCalibrated++;
      }

      setSummary({
        total: newSessionAttempts.length,
        correct,
        accuracy: correct / newSessionAttempts.length,
        xpEarned,
        families: [...familySet],
        overconfident,
        underconfident,
        wellCalibrated,
      });
      track("session_completed", {
        total: newSessionAttempts.length,
        correct,
        accuracy: correct / newSessionAttempts.length,
        xpEarned,
      });
    } else {
      setSession(updatedSession);
      saveSession(updatedSession);
      setCurrentDrill(sessionDrills[nextIndex]);
    }
  }

  async function shareSessionSummary() {
    if (!summary) return;
    tap();
    const text = `Just completed a 10-drill session on Scam Gym!\n${summary.correct}/${summary.total} correct (${Math.round(summary.accuracy * 100)}%)\n${summary.xpEarned} XP earned\nCalibration: ${summary.wellCalibrated} well-calibrated, ${summary.overconfident} overconfident, ${summary.underconfident} underconfident\n\nTry it yourself: ${window.location.origin}`;
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch { /* fall through */ }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareToast("Copied!");
      setTimeout(() => setShareToast(null), 2000);
    } catch { /* clipboard not available */ }
  }

  // Summary screen
  if (summary) {
    return (
      <div className="flex flex-col min-h-dvh px-4 py-6">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>
            Session Complete!
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Here&apos;s how you did across {summary.total} drills
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6">
            <div
              className="rounded-xl p-4 border text-center"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="text-2xl font-bold" style={{ color: summary.accuracy >= 0.7 ? "#22c55e" : "#ef4444" }}>
                {Math.round(summary.accuracy * 100)}%
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Accuracy</div>
            </div>
            <div
              className="rounded-xl p-4 border text-center"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                +{summary.xpEarned}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>XP Earned</div>
            </div>
          </div>

          {/* Calibration */}
          <div
            className="w-full max-w-sm rounded-xl p-4 border mb-6"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              Calibration
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold" style={{ color: "#22c55e" }}>{summary.wellCalibrated}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Well-calibrated</div>
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: "#ef4444" }}>{summary.overconfident}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Overconfident</div>
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: "#3b82f6" }}>{summary.underconfident}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Underconfident</div>
              </div>
            </div>
          </div>

          {/* Families covered */}
          <div className="flex flex-wrap gap-1.5 justify-center mb-6">
            {summary.families.map((fam) => (
              <span
                key={fam}
                className="px-2.5 py-1 rounded-full text-xs"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
              >
                {familyLabel(fam)}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="w-full max-w-sm space-y-2">
            <button
              onClick={shareSessionSummary}
              className="w-full py-3 rounded-2xl font-semibold text-sm border transition-all active:scale-95"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
            >
              📤 Share Results {shareToast && <span style={{ color: "var(--accent)" }}>· {shareToast}</span>}
            </button>
            <button
              onClick={() => router.push("/drill")}
              className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Keep Training
            </button>
            <button
              onClick={() => router.push("/?from=drill")}
              className="w-full py-3 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentDrill || !session) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p style={{ color: "var(--text-muted)" }}>Loading session…</p>
      </div>
    );
  }

  const canSubmit = verdict !== null && confidence !== null;
  const channelLabel = currentDrill.channel.toUpperCase();
  const channelColors: Record<string, string> = {
    SMS: "#22c55e",
    EMAIL: "#f59e0b",
    DM: "#3b82f6",
  };

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={() => setShowExitConfirm(true)}
          className="min-h-[44px] px-3 flex items-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          ← Exit
        </button>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: "rgba(124,106,247,0.15)", color: "var(--accent)" }}
          >
            {session.currentIndex + 1}/{sessionDrills.length}
          </span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "var(--surface-2)", color: channelColors[channelLabel] ?? "var(--text-muted)" }}
          >
            {channelLabel}
          </span>
        </div>
        <div className="w-16" />
      </div>

      {/* Exit confirm banner */}
      {showExitConfirm && (
        <div
          className="px-4 py-3 flex items-center justify-between gap-3"
          style={{ background: "rgba(239,68,68,0.1)", borderBottom: "1px solid rgba(239,68,68,0.3)" }}
        >
          <p className="text-sm" style={{ color: "var(--text)" }}>Leave session? Progress will be lost.</p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => { clearSession(); router.push("/?from=drill"); }}
              className="px-3 py-1.5 rounded-xl text-sm font-bold"
              style={{ background: "#ef4444", color: "#fff" }}
            >
              Leave
            </button>
            <button
              onClick={() => setShowExitConfirm(false)}
              className="px-3 py-1.5 rounded-xl text-sm"
              style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
            >
              Stay
            </button>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1" style={{ background: "var(--surface-2)" }}>
        <div
          className="h-full transition-all"
          style={{
            width: `${((session.currentIndex + 1) / sessionDrills.length) * 100}%`,
            background: "var(--accent)",
          }}
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-36 space-y-6">
        <MessageCard drill={currentDrill} />

        {/* Verdict */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Is this message…
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["scam", "legit"] as Verdict[]).map((v) => {
              const selected = verdict === v;
              const isScam = v === "scam";
              return (
                <button
                  key={v}
                  onClick={() => { tap(); setVerdict(v); }}
                  className="py-4 rounded-2xl font-bold text-lg border-2 transition-all active:scale-95"
                  style={{
                    borderColor: selected ? (isScam ? "#ef4444" : "#22c55e") : "var(--border)",
                    background: selected ? (isScam ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)") : "var(--surface)",
                    color: selected ? (isScam ? "#ef4444" : "#22c55e") : "var(--text)",
                  }}
                >
                  {isScam ? "🚨 Scam" : "✅ Legit"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Confidence */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            How confident are you?
          </p>
          <div className="flex gap-2 flex-wrap">
            {CONFIDENCE_OPTIONS.map((c) => {
              const selected = confidence === c;
              return (
                <button
                  key={c}
                  onClick={() => { tap(); setConfidence(c); }}
                  className="flex-1 min-w-[48px] py-3 rounded-xl font-semibold text-sm border-2 transition-all active:scale-95"
                  style={{
                    borderColor: selected ? "var(--accent)" : "var(--border)",
                    background: selected ? "rgba(124,106,247,0.15)" : "var(--surface)",
                    color: selected ? "var(--accent)" : "var(--text-muted)",
                  }}
                >
                  {c}%
                </button>
              );
            })}
          </div>
        </div>

        {/* Behavior */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            What would you actually do?
          </p>
          <div className="flex flex-wrap gap-2">
            {BEHAVIOR_OPTIONS.map(({ value, label }) => {
              const selected = behaviorChoice === value;
              return (
                <button
                  key={value}
                  onClick={() => { tap(); setBehaviorChoice(selected ? null : value); }}
                  className="py-2 px-3 rounded-xl text-sm border-2 transition-all active:scale-95"
                  style={{
                    borderColor: selected ? "var(--accent)" : "var(--border)",
                    background: selected ? "rgba(124,106,247,0.15)" : "var(--surface)",
                    color: selected ? "var(--accent)" : "var(--text-muted)",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky submit */}
      <div
        className="fixed bottom-0 left-0 right-0 px-4 py-4 border-t max-w-lg mx-auto"
        style={{ background: "var(--background)", borderColor: "var(--border)" }}
      >
        <button
          onClick={() => { tap(); handleSubmit(); }}
          disabled={!canSubmit || submitting}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
          style={{
            background: canSubmit ? "var(--accent)" : "var(--surface-2)",
            color: canSubmit ? "#fff" : "var(--text-muted)",
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? "Submitting…" : `Submit (${session.currentIndex + 1}/${sessionDrills.length})`}
        </button>
      </div>
    </div>
  );
}
