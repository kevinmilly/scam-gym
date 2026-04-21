"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { allDrills } from "@/lib/DrillContext";
import { getDailyQuizDrills, getPercentileTier } from "@/lib/quiz";
import MessageCard from "@/components/MessageCard";
import type { Drill } from "@/lib/types";
import { tap } from "@/lib/haptics";
import { track } from "@/lib/analytics";
import { Share2, ArrowRight, CheckCircle, XCircle } from "lucide-react";

type QuizState = "intro" | "question" | "reveal" | "results";

export default function QuizPage() {
  const router = useRouter();
  const [quizDrills, setQuizDrills] = useState<Drill[]>([]);
  const [state, setState] = useState<QuizState>("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]); // true = correct
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    const drills = getDailyQuizDrills(allDrills);
    setQuizDrills(drills);
    track("quiz_started");
  }, []);

  function handleAnswer(verdict: "scam" | "legit") {
    tap();
    const drill = quizDrills[current];
    const correct = verdict === drill.ground_truth;
    setLastCorrect(correct);
    setAnswers((prev) => [...prev, correct]);
    setState("reveal");
    track("quiz_answered", { drillId: drill.id, correct, questionIndex: current });
  }

  function handleNext() {
    tap();
    if (current + 1 >= quizDrills.length) {
      setState("results");
      track("quiz_completed", { score: answers.filter(Boolean).length + (lastCorrect ? 1 : 0), total: quizDrills.length });
    } else {
      setCurrent((c) => c + 1);
      setLastCorrect(null);
      setState("question");
    }
  }

  const score = answers.filter(Boolean).length;
  const finalScore = state === "results" ? score : score; // captured at results

  async function handleShare() {
    tap();
    const pct = Math.round((finalScore / quizDrills.length) * 100);
    const tier = getPercentileTier(finalScore, quizDrills.length);
    const text = `I scored ${finalScore}/${quizDrills.length} on the Scam IQ quiz (${tier.description}). Can you beat me?\n\nTry it free: https://scamgym.com/quiz`;

    track("quiz_shared", { score: finalScore });

    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch { /* user cancelled */ }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2500);
    } catch { /* ignore */ }
  }

  if (quizDrills.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p style={{ color: "var(--text-muted)" }}>Loading quiz…</p>
      </div>
    );
  }

  const drill = quizDrills[current];
  const tier = getPercentileTier(finalScore, quizDrills.length);

  // ── Intro ──────────────────────────────────────────────────────
  if (state === "intro") {
    return (
      <div className="flex flex-col min-h-dvh px-5 py-8">
        <button
          onClick={() => router.back()}
          className="text-sm mb-8 min-h-[44px] flex items-center self-start px-2"
          style={{ color: "var(--text-muted)" }}
        >
          ← Back
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
            Daily · Resets at midnight
          </p>
          <h1 className="text-[32px] font-bold leading-tight tracking-tight mb-4" style={{ color: "var(--text)" }}>
            Scam IQ Quiz
          </h1>
          <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
            10 real messages. Scam or legit? Takes about 3 minutes. No account needed.
          </p>

          <div className="space-y-3 mb-8">
            {[
              "One message at a time — just like real life",
              "See your score + how you rank",
              "Share your result with family or friends",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle size={18} strokeWidth={1.75} style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => { tap(); setState("question"); }}
          className="w-full py-4 rounded-full font-bold text-lg transition-all active:scale-95"
          style={{ background: "var(--signature)", color: "#fff", boxShadow: "0 6px 20px rgba(247,122,15,0.35)" }}
        >
          Start Quiz →
        </button>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────
  if (state === "results") {
    const ogUrl = `https://scamgym.com/api/og/result?score=${finalScore}&total=${quizDrills.length}&type=quiz`;

    return (
      <div className="flex flex-col min-h-dvh px-5 py-8">
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          {/* Score ring */}
          <div
            className="w-36 h-36 rounded-full flex flex-col items-center justify-center mb-6 border-4"
            style={{
              borderColor: tier.color,
              background: "var(--surface)",
            }}
          >
            <span className="text-4xl font-extrabold" style={{ color: tier.color, letterSpacing: "-0.03em" }}>
              {finalScore}/{quizDrills.length}
            </span>
            <span className="text-xs font-semibold mt-1" style={{ color: "var(--text-muted)" }}>
              {Math.round((finalScore / quizDrills.length) * 100)}%
            </span>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: tier.color }}>
            {tier.label}
          </p>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>
            {tier.description}
          </h2>
          <p className="text-sm leading-relaxed mb-8 max-w-sm" style={{ color: "var(--text-muted)" }}>
            {finalScore >= 8
              ? "You're sharper than most. Scammers are getting better too — keep practicing."
              : finalScore >= 5
              ? "You caught the obvious ones. A few sneaky patterns still slipped through."
              : "These messages fooled you — they fool most people. A bit of practice fixes that fast."}
          </p>

          {/* Answer review row */}
          <div className="flex gap-2 mb-8" aria-label="Answer summary">
            {answers.map((correct, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: correct ? "var(--success-bg)" : "var(--danger-bg)" }}
                aria-label={`Question ${i + 1}: ${correct ? "correct" : "incorrect"}`}
              >
                {correct
                  ? <CheckCircle size={16} strokeWidth={2} style={{ color: "var(--success)" }} />
                  : <XCircle size={16} strokeWidth={2} style={{ color: "var(--danger)" }} />
                }
              </div>
            ))}
          </div>

          {/* Share card preview */}
          <div
            className="w-full rounded-2xl border px-5 py-4 mb-6 text-left"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
              Share your result
            </p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text)" }}>
              &ldquo;I scored {finalScore}/{quizDrills.length} on the Scam IQ quiz. Can you beat me?&rdquo;
            </p>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold min-h-[44px] transition-all active:scale-95"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <Share2 size={16} strokeWidth={1.75} />
              {shareStatus === "copied" ? "Link copied!" : "Share result"}
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <button
            onClick={() => { tap(); router.push("/?src=quiz"); }}
            className="w-full py-4 rounded-full font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ background: "var(--signature)", color: "#fff", boxShadow: "0 6px 20px rgba(247,122,15,0.30)" }}
          >
            {finalScore < 10 ? "Want to get to 10/10? Practice free" : "Keep practicing — stay sharp"}
            <ArrowRight size={18} strokeWidth={2} />
          </button>
          <button
            onClick={() => { tap(); setState("intro"); setCurrent(0); setAnswers([]); setLastCorrect(null); }}
            className="w-full py-3 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Retake today&apos;s quiz
          </button>
        </div>
      </div>
    );
  }

  // ── Question / Reveal ──────────────────────────────────────────
  const progress = (current / quizDrills.length) * 100;

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={() => { tap(); router.back(); }}
          className="min-h-[44px] px-3 flex items-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          ← Quit
        </button>
        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          {current + 1} / {quizDrills.length}
        </span>
        <div className="w-14" />
      </div>

      {/* Progress bar */}
      <div className="h-1.5" style={{ background: "var(--surface-2)" }}>
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, background: "var(--accent)" }}
        />
      </div>

      <div className="flex-1 px-4 py-5 space-y-4 overflow-y-auto">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          Scam or legit?
        </p>

        <MessageCard drill={drill} />

        {state === "question" && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleAnswer("scam")}
              className="flex-1 py-4 min-h-[56px] rounded-2xl font-bold text-base transition-all active:scale-95 border-2"
              style={{ borderColor: "var(--danger)", color: "var(--danger)", background: "var(--danger-bg)" }}
            >
              Scam
            </button>
            <button
              onClick={() => handleAnswer("legit")}
              className="flex-1 py-4 min-h-[56px] rounded-2xl font-bold text-base transition-all active:scale-95 border-2"
              style={{ borderColor: "var(--success)", color: "var(--success)", background: "var(--success-bg)" }}
            >
              Legit
            </button>
          </div>
        )}

        {state === "reveal" && lastCorrect !== null && (
          <div className="space-y-4 animate-revealIn">
            {/* Result banner */}
            <div
              className="rounded-2xl px-4 py-4 border"
              style={{
                background: lastCorrect ? "var(--success-bg)" : "var(--danger-bg)",
                borderColor: lastCorrect ? "var(--success)" + "44" : "var(--danger)" + "44",
              }}
            >
              <div className="flex items-center gap-2">
                {lastCorrect
                  ? <CheckCircle size={22} strokeWidth={1.75} style={{ color: "var(--success)" }} />
                  : <XCircle size={22} strokeWidth={1.75} style={{ color: "var(--danger)" }} />
                }
                <span className="text-lg font-bold" style={{ color: lastCorrect ? "var(--success)" : "var(--danger)" }}>
                  {lastCorrect ? "Correct!" : "Missed it"}
                </span>
                <span className="ml-auto text-sm font-semibold capitalize px-2 py-0.5 rounded-full"
                  style={{
                    background: drill.ground_truth === "scam" ? "var(--danger-bg)" : "var(--success-bg)",
                    color: drill.ground_truth === "scam" ? "var(--danger)" : "var(--success)",
                  }}
                >
                  {drill.ground_truth}
                </span>
              </div>
            </div>

            {/* Short explanation */}
            <div
              className="rounded-2xl px-4 py-4 border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                Why
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                {drill.explanation.short}
              </p>
              {drill.explanation.tells.length > 0 && (
                <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  Key tell: {drill.explanation.tells[0]}
                </p>
              )}
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              className="w-full py-4 rounded-full font-bold text-base transition-all active:scale-95"
              style={{ background: "var(--signature)", color: "#fff", boxShadow: "0 6px 20px rgba(247,122,15,0.30)" }}
            >
              {current + 1 >= quizDrills.length ? "See my score →" : "Next →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
