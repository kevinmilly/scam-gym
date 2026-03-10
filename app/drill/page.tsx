"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useDrillContext } from "@/lib/DrillContext";
import MessageCard from "@/components/MessageCard";
import { brierScore, redFlagRecall, calibrationVerdict } from "@/lib/scoring";
import { saveAttempt } from "@/lib/db";
import type { Verdict, BehaviorChoice } from "@/lib/types";
import { tap } from "@/lib/haptics";
import { playCorrect, playIncorrect } from "@/lib/audio";
import { track } from "@/lib/analytics";
import { computePostDrillReward } from "@/lib/progression";
import { allDrills } from "@/lib/DrillContext";

const CONFIDENCE_OPTIONS = [50, 60, 70, 85, 95];

const BEHAVIOR_OPTIONS: { value: BehaviorChoice; label: string }[] = [
  { value: "ignore",  label: "Ignore it" },
  { value: "verify",  label: "Verify first" },
  { value: "respond", label: "Respond" },
  { value: "click",   label: "Click the link" },
  { value: "call",    label: "Call the number" },
];

export default function DrillPage() {
  const router = useRouter();
  const { currentDrill, advance, recordAttempt, poolExhausted, attempts: contextAttempts, focusLabel, focusFamilies, setFocusFamilies, setFocusLabel } = useDrillContext();

  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [behaviorChoice, setBehaviorChoice] = useState<BehaviorChoice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const bannerHidden = contextAttempts.length >= 5;

  // Reset state when drill changes
  useEffect(() => {
    setVerdict(null);
    setConfidence(null);
    setBehaviorChoice(null);
    setSubmitting(false);
    if (currentDrill) {
      track("drill_started", { drillId: currentDrill.id, patternFamily: currentDrill.pattern_family });
    }
  }, [currentDrill?.id]);

  if (!currentDrill) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p style={{ color: "var(--text-muted)" }}>Loading your first drill…</p>
      </div>
    );
  }

  const canSubmit = verdict !== null && confidence !== null;

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    const isCorrect = verdict === currentDrill!.ground_truth;
    const brier = brierScore(confidence!, isCorrect);
    const flagRecall = redFlagRecall([], currentDrill!.correct_red_flag_ids);
    const calVerdict = calibrationVerdict(confidence!, isCorrect);

    const attempt = {
      id: uuidv4(),
      drillId: currentDrill!.id,
      timestamp: Date.now(),
      userVerdict: verdict!,
      confidence: confidence!,
      selectedRedFlagIds: [],
      isCorrect,
      brierScore: brier,
      redFlagRecall: flagRecall,
      syncedAt: null,
      behaviorChoice: behaviorChoice ?? undefined,
    };

    // Track + sound feedback
    track("drill_completed", {
      drillId: currentDrill!.id,
      patternFamily: currentDrill!.pattern_family,
      isCorrect,
      confidence: confidence!,
      calVerdict,
    });
    if (isCorrect) playCorrect();
    else playIncorrect();

    // Persist
    try {
      await saveAttempt(attempt);
      recordAttempt(attempt);

      // Compute post-drill reward (before/after comparison)
      const allAttempts = [...contextAttempts, attempt];
      const reward = computePostDrillReward(allAttempts, allDrills);

      // Store in sessionStorage for result page (clear streakUpdated so it fires once for this drill)
      sessionStorage.removeItem("streakUpdated");
      sessionStorage.setItem("lastAttempt", JSON.stringify(attempt));
      sessionStorage.setItem("lastDrill", JSON.stringify(currentDrill));
      sessionStorage.setItem("calVerdict", calVerdict);
      sessionStorage.setItem("lastReward", JSON.stringify(reward));

      // Advance drill queue (prefetch next)
      advance();

      router.push("/result");
    } catch (err) {
      console.error("Failed to save attempt:", err);
      setSubmitting(false);
    }
  }

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
          onClick={() => router.push("/?from=drill")}
          className="min-h-[44px] px-3 flex items-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          ← Home
        </button>
        <div className="flex items-center gap-2">
          {focusLabel && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(124,106,247,0.15)", color: "var(--accent)" }}>
              {focusLabel}
            </span>
          )}
          {poolExhausted && !focusLabel && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
              Retention mode
            </span>
          )}
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "var(--surface-2)", color: channelColors[channelLabel] ?? "var(--text-muted)" }}
          >
            {channelLabel}
          </span>
        </div>
        <div className="flex items-center">
          {focusFamilies.length > 0 && (
            <button
              onClick={() => { setFocusFamilies([]); setFocusLabel(null); }}
              className="text-xs px-2 py-1"
              style={{ color: "var(--text-muted)" }}
            >
              Normal
            </button>
          )}
          <div className="w-4" />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-36 space-y-6">
        {/* Training banner */}
        {!bannerHidden && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            <span>🔒</span>
            <span>Simulated training message — never use any links or numbers shown</span>
          </div>
        )}

        {/* Scenario framing */}
        <div
          className="px-3 py-2 rounded-xl text-sm"
          style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
        >
          📱 <span>Imagine this just arrived on your phone. How do you call it?</span>
        </div>

        {/* Message */}
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
                    borderColor: selected
                      ? isScam ? "#ef4444" : "#22c55e"
                      : "var(--border)",
                    background: selected
                      ? isScam ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)"
                      : "var(--surface)",
                    color: selected
                      ? isScam ? "#ef4444" : "#22c55e"
                      : "var(--text)",
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
          <div className="flex justify-between mt-1 px-1">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Coin flip</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Dead certain</span>
          </div>
        </div>

        {/* Behavior question */}
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
        style={{
          background: "var(--background)",
          borderColor: "var(--border)",
        }}
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
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>
    </div>
  );
}
