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
import { Loader2, ShieldAlert, ShieldCheck, Lock, Inbox, Check, X as XIcon } from "lucide-react";

const CONFIDENCE_OPTIONS = [50, 60, 70, 85, 95];

const BEHAVIOR_OPTIONS: { value: BehaviorChoice; label: string; desc: string }[] = [
  { value: "ignore",  label: "Ignore it",      desc: "Delete and move on" },
  { value: "verify",  label: "Verify first",   desc: "Check through official channels" },
  { value: "respond", label: "Respond",         desc: "Reply to the message" },
  { value: "click",   label: "Click the link", desc: "Follow a link in the message" },
  { value: "call",    label: "Call the number", desc: "Call a number in the message" },
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
        <Loader2 size={32} strokeWidth={1.75} className="mb-4 animate-spin" style={{ color: "var(--text-muted)" }} />
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
    SMS: "var(--success)",
    EMAIL: "var(--warning)",
    DM: "var(--info)",
  };

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div
        className="flex items-center justify-center px-4 py-3 border-b relative"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          {focusLabel && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(124,106,247,0.15)", color: "var(--accent)" }}>
              {focusLabel}
            </span>
          )}
          {focusFamilies.length > 0 && (
            <button
              onClick={() => { setFocusFamilies([]); setFocusLabel(null); }}
              aria-label="Clear focus filter"
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
            >
              ✕ Clear focus
            </button>
          )}
          {!focusLabel && (
            <span className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
              Scam Gym
            </span>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-48 space-y-8">
        {/* Training banner */}
        {!bannerHidden && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            <Lock size={14} strokeWidth={1.75} />
            <span>Simulated training message — never use any links or numbers shown</span>
          </div>
        )}

        {/* Scenario framing */}
        <div
          className="px-3 py-2 rounded-xl text-sm"
          style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
        >
          <Inbox size={16} strokeWidth={1.75} className="inline mr-1.5" /> <span>This just hit your inbox. Scam or legit?</span>
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
                  aria-pressed={selected}
                  className="py-4 rounded-2xl font-bold text-lg border-2 transition-colors duration-150 active:scale-95"
                  style={{
                    borderColor: selected
                      ? isScam ? "var(--danger)" : "var(--success)"
                      : "var(--border)",
                    background: selected
                      ? isScam ? "var(--danger-bg)" : "var(--success-bg)"
                      : "var(--surface)",
                    color: selected
                      ? isScam ? "var(--danger)" : "var(--success)"
                      : "var(--text)",
                  }}
                >
                  {isScam ? <><ShieldAlert size={20} strokeWidth={1.75} className="inline mr-1" /> Scam</> : <><ShieldCheck size={20} strokeWidth={1.75} className="inline mr-1" /> Legit</>}
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
          <div className="flex gap-2">
            {CONFIDENCE_OPTIONS.map((c) => {
              const selected = confidence === c;
              const labels: Record<number, string> = { 50: "Just guessing", 60: "Leaning", 70: "Pretty sure", 85: "Very sure", 95: "Certain" };
              return (
                <button
                  key={c}
                  onClick={() => { tap(); setConfidence(c); }}
                  aria-pressed={selected}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-sm border-2 btn-press flex flex-col items-center gap-0.5"
                  style={{
                    borderColor: selected ? "var(--accent)" : "var(--border)",
                    background: selected ? "rgba(124,106,247,0.15)" : "var(--surface)",
                    color: selected ? "var(--accent)" : "var(--text-muted)",
                    minHeight: "52px",
                    boxShadow: selected ? "0 0 0 3px var(--accent-subtle)" : "none",
                    transition: "border-color 200ms, background 200ms, color 200ms, box-shadow 200ms",
                  }}
                >
                  <span className="font-bold">{c}%</span>
                  {selected && <span className="text-[9px] font-medium tracking-wide text-center leading-tight opacity-80">{labels[c]}</span>}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between mt-1.5 px-0.5">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Just guessing</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Dead certain</span>
          </div>
        </div>

        {/* Behavior question */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            What would you actually do?
          </p>
          <div className="space-y-2">
            {BEHAVIOR_OPTIONS.map(({ value, label, desc }) => {
              const selected = behaviorChoice === value;
              return (
                <button
                  key={value}
                  onClick={() => { tap(); setBehaviorChoice(selected ? null : value); }}
                  aria-pressed={selected}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors duration-150 active:scale-[0.98]"
                  style={{
                    borderColor: selected ? "var(--accent)" : "var(--border)",
                    background: selected ? "rgba(124,106,247,0.12)" : "var(--surface)",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center"
                    style={{
                      borderColor: selected ? "var(--accent)" : "var(--border)",
                      background: selected ? "var(--accent)" : "transparent",
                    }}
                  >
                    {selected && <Check size={12} strokeWidth={3} className="text-white" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: selected ? "var(--accent)" : "var(--text)" }}>
                      {label}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky submit */}
      <div className="fixed bottom-[57px] left-0 right-0" style={{ background: "var(--background)" }}>
        <div
          className="max-w-lg mx-auto px-4 py-3 border-t"
          style={{ borderColor: "var(--border)" }}
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
    </div>
  );
}
