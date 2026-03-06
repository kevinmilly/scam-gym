"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDrillContext, allDrills } from "@/lib/DrillContext";
import { computeStats } from "@/lib/stats";
import { CONTEXT_LABELS, CONTEXT_DESCRIPTIONS } from "@/lib/contextFraming";
import type { UserContext } from "@/lib/types";
import { tap } from "@/lib/haptics";
import { unlockPremium, isPremium } from "@/lib/premium";
import { getStreak } from "@/lib/streak";
import PremiumGate from "@/components/PremiumGate";

const ONBOARDED_KEY = "scamgym_onboarded";

const CONTEXT_ICONS: Record<UserContext, string> = {
  personal:       "📱",
  small_business: "🏪",
  job_seeker:     "💼",
  family_safety:  "👨‍👩‍👧",
};

const VALUE_PROPS = [
  {
    icon: "🎯",
    title: "Real-world drills",
    desc: "Practice spotting real scam messages: phishing emails, fake invoices, job offers, and more.",
  },
  {
    icon: "🧠",
    title: "Confidence tracking",
    desc: "See when you're guessing vs when you're truly certain. Overconfidence is the real danger.",
  },
  {
    icon: "📊",
    title: "Personal risk profile",
    desc: "Discover which scam types you're most likely to fall for — and train those weak spots.",
  },
];

export default function HomePage() {
  return (
    <Suspense>
      <HomePageInner />
    </Suspense>
  );
}

function HomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedContext, setSelectedContext, attempts, setFocusFamilies, setFocusLabel } = useDrillContext();
  const [checked, setChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showContextPicker, setShowContextPicker] = useState(false);
  const [premiumJustActivated, setPremiumJustActivated] = useState(false);
  const [demoAnswer, setDemoAnswer] = useState<null | "scam" | "legit">(null);

  // Handle premium activation via URL param (Stripe redirect)
  useEffect(() => {
    if (searchParams.get("premium") === "1" && !isPremium()) {
      unlockPremium();
      setPremiumJustActivated(true);
      // Clean URL
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const onboarded = localStorage.getItem(ONBOARDED_KEY);
      const fromDrill = searchParams.get("from") === "drill";
      if (onboarded && selectedContext && !fromDrill) {
        router.replace("/drill");
      } else {
        setChecked(true);
        if (!selectedContext) {
          // Show welcome onboarding before context picker for brand-new users
          setShowOnboarding(true);
        }
      }
    }
  }, [router, selectedContext, searchParams]);

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
      <div className="mb-12">
        <span className="font-bold text-xl tracking-tight" style={{ color: "var(--text)" }}>
          Scam Gym
        </span>
      </div>

      {showOnboarding ? (
        /* ── Welcome / Onboarding Screen ── */
        <>
          <div className="flex-1 flex flex-col">
            {/* Hero */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
                Free · No account needed
              </p>
              <h1 className="text-3xl font-bold leading-tight mb-4" style={{ color: "var(--text)" }}>
                Practice spotting scams before they hit you.
              </h1>
              <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Most people only learn about scams after they get fooled. Scam Gym lets you practice safely first.
              </p>
            </div>

            {/* Proof stat (moved up) */}
            <div
              className="rounded-2xl px-4 py-3 mb-6 flex items-center gap-3"
              style={{ background: "var(--surface-2)" }}
            >
              <span className="text-lg">📬</span>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                <strong style={{ color: "var(--text)" }}>140+ real-style drills</strong> across phishing, fake invoices, job scams, romance fraud, and more.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => { tap(); setShowOnboarding(false); setShowContextPicker(true); }}
              className="w-full py-4 min-h-[48px] rounded-2xl font-bold text-lg transition-all active:scale-95 mb-8"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Try Your First Drill — It&apos;s Free
            </button>

            {/* Mini-drill demo */}
            <div
              className="rounded-2xl border p-5 mb-6"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <p className="font-bold text-base text-center mb-4" style={{ color: "var(--text)" }}>
                Would you catch this?
              </p>

              {/* SMS-style bubble */}
              <div
                className="rounded-xl px-4 py-3 mb-4"
                style={{ background: "var(--surface-2)" }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>From: Amazon</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                  &quot;Your account has been locked. Verify immediately: amaz0n-secure-login.com&quot;
                </p>
              </div>

              {demoAnswer === null ? (
                /* Verdict buttons */
                <div className="flex gap-3">
                  <button
                    onClick={() => setDemoAnswer("scam")}
                    className="flex-1 py-3 min-h-[48px] rounded-xl font-semibold text-sm transition-all active:scale-95 border"
                    style={{ borderColor: "#ef4444", color: "#ef4444", background: "rgba(239,68,68,0.08)" }}
                  >
                    🚫 Scam
                  </button>
                  <button
                    onClick={() => setDemoAnswer("legit")}
                    className="flex-1 py-3 min-h-[48px] rounded-xl font-semibold text-sm transition-all active:scale-95 border"
                    style={{ borderColor: "#22c55e", color: "#22c55e", background: "rgba(34,197,94,0.08)" }}
                  >
                    ✅ Legit
                  </button>
                </div>
              ) : (
                /* Reveal */
                <div className="animate-fadeIn">
                  <div
                    className="rounded-xl px-4 py-2.5 mb-3 text-center font-bold text-sm"
                    style={{
                      background: demoAnswer === "scam" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                      color: demoAnswer === "scam" ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {demoAnswer === "scam" ? "✓ Correct! This is a scam." : "✗ Not quite — this is a scam."}
                  </div>
                  <p className="text-xs font-semibold mb-2" style={{ color: "var(--text)" }}>Red flags:</p>
                  <ul className="text-xs leading-relaxed mb-4 space-y-1" style={{ color: "var(--text-muted)" }}>
                    <li>• Domain mismatch (amaz<strong style={{ color: "var(--text)" }}>0</strong>n vs amazon)</li>
                    <li>• Urgent language (&quot;immediately&quot;)</li>
                    <li>• No personalization (no name used)</li>
                  </ul>
                  <button
                    onClick={() => { tap(); setShowOnboarding(false); setShowContextPicker(true); }}
                    className="w-full py-3 min-h-[48px] rounded-xl font-semibold text-sm transition-all active:scale-95"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    Practice more drills →
                  </button>
                </div>
              )}
            </div>

            {/* Psychology cue */}
            <p className="text-sm italic text-center my-4" style={{ color: "var(--text-muted)" }}>
              Most people are overconfident about spotting scams.
            </p>

            {/* Value props */}
            <div className="space-y-4 mb-10">
              {VALUE_PROPS.map((v) => (
                <div
                  key={v.title}
                  className="flex items-start gap-4 rounded-2xl px-4 py-5 border"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <span className="text-2xl mt-0.5">{v.icon}</span>
                  <div>
                    <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--text)" }}>{v.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-center mt-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            For educational use only. Scenarios use fictional companies and cover common scam patterns — not every scam type. When in doubt, verify directly through official channels.
          </p>
        </>
      ) : showContextPicker ? (
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
              onClick={() => { tap(); handleStart(); }}
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
          <div className="pb-40">
            {/* Premium activation confirmation */}
            {premiumJustActivated && (
              <div
                className="rounded-2xl p-4 mb-6 border"
                style={{ background: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.3)" }}
              >
                <p className="text-sm font-bold mb-1" style={{ color: "#22c55e" }}>
                  ✨ Premium Unlocked!
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  All premium features are now active. Thank you for supporting Scam Gym!
                </p>
              </div>
            )}

            <h1 className="text-3xl font-bold leading-tight mb-4" style={{ color: "var(--text)" }}>
              Train your scam detection.
            </h1>

            {/* Streak badge (premium) */}
            <PremiumGate hideWhenLocked>
              {(() => {
                const streak = getStreak();
                if (streak.current === 0) return null;
                return (
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4 text-sm font-semibold"
                    style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}
                  >
                    <span>🔥</span>
                    <span>{streak.current} day streak</span>
                  </div>
                );
              })()}
            </PremiumGate>

            <p className="text-lg mb-10" style={{ color: "var(--text-muted)" }}>
              Real message drills. Instant feedback. Track where you&apos;re vulnerable.
            </p>

            {/* Calibration explainer — collapsed for returning users */}
            <details
              className="rounded-2xl mb-8 border group"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <summary
                className="px-5 py-4 cursor-pointer list-none flex items-center justify-between"
                style={{ color: "var(--accent)" }}
              >
                <span className="text-sm font-semibold uppercase tracking-widest">How scoring works</span>
                <span className="text-xs transition-transform group-open:rotate-180" style={{ color: "var(--text-muted)" }}>▼</span>
              </summary>
              <div className="px-5 pb-5">
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
            </details>

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

            {/* Panic button — Help Me Right Now */}
            <Link
              href="/help"
              className="flex items-center gap-3 rounded-2xl border px-4 py-4 transition-all active:scale-[0.98]"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <span className="text-2xl">🚨</span>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                  I got a suspicious message
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Get instant guidance — what to do right now
                </p>
              </div>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>→</span>
            </Link>
          </div>

          {/* Sticky CTA */}
          <div
            className="sticky bottom-0 -mx-6 px-6 pt-6 pb-6 space-y-3"
            style={{ background: "linear-gradient(to bottom, transparent 0%, var(--bg) 25%)" }}
          >
            <button
              onClick={() => { tap(); handleStart(); }}
              className="w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Continue Training
            </button>

            {/* Premium buttons */}
            <PremiumGate hideWhenLocked>
              <div className="space-y-2">
                {/* Weakness Autopilot */}
                <button
                  onClick={() => {
                    tap();
                    const stats = computeStats(attempts, allDrills);
                    const weakFamilies = stats.topVulnerabilities
                      .filter((f) => f.totalAttempts >= 2)
                      .slice(0, 3)
                      .map((f) => f.family);
                    if (weakFamilies.length > 0) {
                      setFocusFamilies(weakFamilies);
                      setFocusLabel("Autopilot: Weak Spots");
                      localStorage.setItem("scamgym_onboarded", "1");
                      router.push("/drill");
                    } else {
                      handleStart();
                    }
                  }}
                  className="w-full py-3 rounded-2xl font-semibold text-sm border transition-all active:scale-95"
                  style={{ borderColor: "var(--accent)", background: "rgba(124,106,247,0.1)", color: "var(--accent)" }}
                >
                  🤖 Train My Weak Spots
                </button>

                {/* Session Mode */}
                <button
                  onClick={() => { tap(); router.push("/session"); }}
                  className="w-full py-3 rounded-2xl font-semibold text-sm border transition-all active:scale-95"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
                >
                  🏃 Start 10-Drill Session
                </button>
              </div>
            </PremiumGate>

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
