"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDrillContext } from "@/lib/DrillContext";
import { CONTEXT_LABELS, CONTEXT_DESCRIPTIONS } from "@/lib/contextFraming";
import type { UserContext } from "@/lib/types";

const ONBOARDED_KEY = "scamgym_onboarded";

const CONTEXT_ICONS: Record<UserContext, string> = {
  personal:       "📱",
  small_business: "🏪",
  job_seeker:     "💼",
  family_safety:  "👨‍👩‍👧",
};

export default function HomePage() {
  const router = useRouter();
  const { selectedContext, setSelectedContext } = useDrillContext();
  const [checked, setChecked] = useState(false);
  const [showContextPicker, setShowContextPicker] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const onboarded = localStorage.getItem(ONBOARDED_KEY);
      if (onboarded && selectedContext) {
        router.replace("/drill");
      } else {
        setChecked(true);
        if (!selectedContext) setShowContextPicker(true);
      }
    }
  }, [router, selectedContext]);

  function handleContextSelect(ctx: UserContext) {
    setSelectedContext(ctx);
    setShowContextPicker(false);
  }

  function handleStart() {
    if (!selectedContext) {
      setShowContextPicker(true);
      return;
    }
    localStorage.setItem(ONBOARDED_KEY, "1");
    router.push("/drill");
  }

  if (!checked) return null;

  return (
    <div className="flex flex-col min-h-dvh px-6 py-10">
      {/* Logo */}
      <div className="inline-flex items-center gap-2 mb-12">
        <span className="text-2xl">🏋️</span>
        <span className="font-bold text-xl tracking-tight" style={{ color: "var(--text)" }}>
          Scam Gym
        </span>
      </div>

      {showContextPicker ? (
        /* ── Context Selection Screen ── */
        <>
          <h1 className="text-2xl font-bold leading-tight mb-2" style={{ color: "var(--text)" }}>
            Choose your training mode
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
            This sets the mental frame for every drill. All 140 drills are available in every mode — this just changes how you approach them.
          </p>

          <div className="space-y-3 flex-1">
            {(Object.keys(CONTEXT_LABELS) as UserContext[]).map((ctx) => {
              const selected = selectedContext === ctx;
              return (
                <button
                  key={ctx}
                  onClick={() => handleContextSelect(ctx)}
                  className="w-full text-left rounded-2xl border-2 px-4 py-4 transition-all active:scale-95"
                  style={{
                    borderColor: selected ? "var(--accent)" : "var(--border)",
                    background: selected ? "rgba(124,106,247,0.10)" : "var(--surface)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{CONTEXT_ICONS[ctx]}</span>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: selected ? "var(--accent)" : "var(--text)" }}>
                        {CONTEXT_LABELS[ctx]}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {CONTEXT_DESCRIPTIONS[ctx]}
                      </p>
                    </div>
                    {selected && (
                      <span className="ml-auto text-xs font-bold" style={{ color: "var(--accent)" }}>✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8">
            <button
              onClick={handleStart}
              disabled={!selectedContext}
              className="w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95"
              style={{
                background: selectedContext ? "var(--accent)" : "var(--surface-2)",
                color: selectedContext ? "#fff" : "var(--text-muted)",
                cursor: selectedContext ? "pointer" : "not-allowed",
              }}
            >
              Start Training
            </button>
          </div>
        </>
      ) : (
        /* ── Returning User Screen ── */
        <>
          <h1 className="text-3xl font-bold leading-tight mb-4" style={{ color: "var(--text)" }}>
            Train your scam detection.
          </h1>
          <p className="text-lg mb-10" style={{ color: "var(--text-muted)" }}>
            Real message drills. Instant feedback. Track where you&apos;re vulnerable.
          </p>

          {/* Calibration explainer */}
          <div
            className="rounded-2xl p-5 mb-8 border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
              How this works
            </p>
            <p className="font-semibold mb-2" style={{ color: "var(--text)" }}>
              Being wrong isn&apos;t the only danger. Being confident and wrong is.
            </p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
              Scam Gym tracks not just whether you got it right — it tracks how sure you were.
              Clicking a phishing link while 95% confident is far more dangerous than pausing and saying &quot;I&apos;m not sure.&quot;
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Overconfident", color: "#ef4444", desc: "Wrong + sure = danger zone" },
                { label: "Well-calibrated", color: "#22c55e", desc: "Confidence matches reality" },
                { label: "Underconfident", color: "#3b82f6", desc: "Right but uncertain" },
              ].map((v) => (
                <div key={v.label} className="rounded-xl p-3" style={{ background: "var(--surface-2)" }}>
                  <div className="text-xs font-bold mb-1" style={{ color: v.color }}>{v.label}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Current context badge */}
          {selectedContext && (
            <button
              onClick={() => setShowContextPicker(true)}
              className="flex items-center gap-2 mb-6 px-4 py-2 rounded-xl border text-sm"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              <span>{CONTEXT_ICONS[selectedContext]}</span>
              <span>Mode: <strong style={{ color: "var(--text)" }}>{CONTEXT_LABELS[selectedContext]}</strong></span>
              <span className="ml-auto text-xs">Change</span>
            </button>
          )}

          {/* CTA */}
          <div className="mt-auto space-y-3">
            <button
              onClick={handleStart}
              className="w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Continue Training
            </button>
            <div className="flex justify-center gap-6 pt-1">
              <Link href="/stats" className="text-sm" style={{ color: "var(--text-muted)" }}>
                My Stats
              </Link>
              <Link href="/settings" className="text-sm" style={{ color: "var(--text-muted)" }}>
                Settings
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
