"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Attempt, Drill, CalibrationVerdict } from "@/lib/types";
import { accuracyScore } from "@/lib/scoring";
import { saveContentFlag } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

type VerdictConfig = {
  label: string;
  color: string;
  bg: string;
  icon: string;
  description: string;
};

const VERDICT_CONFIG: Record<CalibrationVerdict, VerdictConfig> = {
  overconfident: {
    label: "Overconfident",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    icon: "⚠️",
    description: "You were confident — but wrong. This is the danger zone.",
  },
  underconfident: {
    label: "Underconfident",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    icon: "💡",
    description: "You got it right, but didn't trust yourself. Build that instinct.",
  },
  "well-calibrated": {
    label: "Well-calibrated",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    icon: "🎯",
    description: "Your confidence matched your accuracy. That's the goal.",
  },
};

export default function ResultPage() {
  const router = useRouter();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [drill, setDrill] = useState<Drill | null>(null);
  const [calVerdict, setCalVerdict] = useState<CalibrationVerdict | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ContentFlag["reason"] | null>(null);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  type ContentFlag = {
    reason: "answer_wrong" | "question_unclear" | "red_flags_wrong" | "other";
  };

  useEffect(() => {
    const a = sessionStorage.getItem("lastAttempt");
    const d = sessionStorage.getItem("lastDrill");
    const cv = sessionStorage.getItem("calVerdict");
    if (!a || !d || !cv) {
      router.replace("/drill");
      return;
    }
    setAttempt(JSON.parse(a));
    setDrill(JSON.parse(d));
    setCalVerdict(cv as CalibrationVerdict);
  }, [router]);

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

  if (!attempt || !drill || !calVerdict) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p style={{ color: "var(--text-muted)" }}>Loading result…</p>
      </div>
    );
  }

  const vc = VERDICT_CONFIG[calVerdict];
  const score = accuracyScore(attempt.brierScore);
  const correctIds = new Set(drill.correct_red_flag_ids);

  return (
    <div className="flex flex-col min-h-dvh pb-8">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={() => router.push("/drill")}
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          ← Drill
        </button>
        <button
          onClick={() => router.push("/stats")}
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Stats
        </button>
      </div>

      <div className="px-4 py-5 space-y-5 overflow-y-auto flex-1">
        {/* Calibration verdict — primary */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: vc.bg, borderColor: vc.color + "44" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{vc.icon}</span>
            <span className="text-2xl font-bold" style={{ color: vc.color }}>
              {vc.label}
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {vc.description}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>Accuracy Score</div>
              <div className="text-xl font-bold" style={{ color: vc.color }}>{score}/100</div>
            </div>
            <div className="h-8 w-px" style={{ background: "var(--border)" }} />
            <div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>You said</div>
              <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                {attempt.userVerdict.toUpperCase()} at {attempt.confidence}%
              </div>
            </div>
            <div className="h-8 w-px" style={{ background: "var(--border)" }} />
            <div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>Result</div>
              <div
                className="text-sm font-bold"
                style={{ color: attempt.isCorrect ? "#22c55e" : "#ef4444" }}
              >
                {attempt.isCorrect ? "Correct ✓" : "Incorrect ✗"}
              </div>
            </div>
          </div>
        </div>

        {/* Underconfidence intervention */}
        {calVerdict === "underconfident" && attempt.isCorrect && (
          <div
            className="rounded-2xl p-4 border"
            style={{ background: "rgba(59,130,246,0.08)", borderColor: "rgba(59,130,246,0.3)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#3b82f6" }}>
              You hesitated — but were right
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
              In real life, hesitation often leads to replying, clicking, or calling back anyway. Your instinct was correct — trust it faster. The right move was: <em>{drill.explanation.safe_move}</em>
            </p>
          </div>
        )}

        {/* Consequence */}
        <div
          className="rounded-2xl p-4 border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#f59e0b" }}>
            {drill.ground_truth === "scam" && !attempt.isCorrect
              ? "⚡ If this were real…"
              : drill.ground_truth === "scam"
              ? "🛡️ You were right to be suspicious"
              : attempt.isCorrect
              ? "✅ This was safe to engage with"
              : "⚡ You flagged a safe message"}
          </p>
          <p className="text-sm leading-relaxed italic" style={{ color: "var(--text-muted)" }}>
            {drill.explanation.consequence}
          </p>
        </div>

        {/* Pattern family */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-3 py-1 rounded-full border font-medium"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            {drill.pattern_family.replace(/_/g, " ")}
          </span>
          <span
            className="text-xs px-3 py-1 rounded-full border font-medium"
            style={{
              borderColor: drill.ground_truth === "scam" ? "#ef444444" : "#22c55e44",
              color: drill.ground_truth === "scam" ? "#ef4444" : "#22c55e",
            }}
          >
            {drill.ground_truth.toUpperCase()}
          </span>
        </div>

        {/* Short explanation */}
        <div
          className="rounded-2xl p-4 border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text)" }}>
            {drill.explanation.short}
          </p>
        </div>

        {/* AI-Amplified banner */}
        {(drill.ai_amplified ?? false) && (
          <div
            className="rounded-2xl p-4 border"
            style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.3)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#ef4444" }}>
              AI-Polished Message
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
              Polished language is no longer a safety signal. AI generates grammatically perfect, emotionally convincing scams at scale. Fluency means nothing.
            </p>
          </div>
        )}

        {/* Tells */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            The Tells
          </p>
          <ul className="space-y-2">
            {drill.explanation.tells.map((tell, i) => (
              <li key={i} className="flex gap-3 text-sm" style={{ color: "var(--text)" }}>
                <span style={{ color: "var(--accent)" }}>→</span>
                <span>{tell}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Red flags review */}
        {drill.red_flags.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Red Flags Review
            </p>
            <div className="flex flex-wrap gap-2">
              {drill.red_flags.map((flag) => {
                const isCorrect = correctIds.has(flag.id);
                const wasSelected = attempt.selectedRedFlagIds.includes(flag.id);
                let borderColor = "var(--border)";
                let color = "var(--text-muted)";
                let suffix = "";
                if (isCorrect && wasSelected) {
                  borderColor = "#22c55e";
                  color = "#22c55e";
                  suffix = " ✓";
                } else if (isCorrect && !wasSelected) {
                  borderColor = "#f59e0b";
                  color = "#f59e0b";
                  suffix = " (missed)";
                } else if (!isCorrect && wasSelected) {
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

        {/* Safe move */}
        <div
          className="rounded-2xl p-4 border"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
            Safe Move
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
            {drill.explanation.safe_move}
          </p>
        </div>

        {/* Behavioral reinforcement — The Rule */}
        <div
          className="rounded-2xl p-4 border"
          style={{ background: "var(--surface)", borderColor: "var(--accent)" + "33" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
            The Rule
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
            {drill.explanation.behavioral_reinforcement ?? drill.explanation.safe_move}
          </p>
        </div>

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
      </div>

      {/* Next button */}
      <div
        className="sticky bottom-0 px-4 py-4 border-t"
        style={{ background: "var(--background)", borderColor: "var(--border)" }}
      >
        <button
          onClick={() => router.push("/drill")}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          Next Drill →
        </button>
      </div>
    </div>
  );
}
