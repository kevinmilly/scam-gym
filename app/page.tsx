"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDrillContext, allDrills } from "@/lib/DrillContext";
import { computeStats } from "@/lib/stats";
import { getCurrentTier } from "@/lib/drillEngine";
import { tap } from "@/lib/haptics";
import { unlockPremiumWithToken, isPremium } from "@/lib/premium";
import { syncPremiumToFirestore } from "@/lib/auth";
import { track } from "@/lib/analytics";
import { getStreak, hasTrainedToday } from "@/lib/streak";
import { getDailyChallengeDrill, getDailyChallengeState, secondsUntilMidnight, formatCountdown } from "@/lib/dailyChallenge";
import PremiumGate from "@/components/PremiumGate";
import SignInPromo from "@/components/SignInPromo";
import { Target, Brain, BarChart3, ShieldAlert, Flame, ChevronRight, Zap } from "lucide-react";

const ONBOARDED_KEY = "scamgym_onboarded";

const VALUE_PROPS = [
  {
    icon: <Target size={24} strokeWidth={1.75} />,
    title: "Real-world drills",
    desc: "Practice spotting real scam messages: phishing emails, fake invoices, job offers, and more.",
  },
  {
    icon: <Brain size={24} strokeWidth={1.75} />,
    title: "Confidence tracking",
    desc: "See when you're guessing vs when you're truly certain. Overconfidence is the real danger.",
  },
  {
    icon: <BarChart3 size={24} strokeWidth={1.75} />,
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
  const { attempts, setFocusFamilies, setFocusLabel } = useDrillContext();
  const [checked, setChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [premiumJustActivated, setPremiumJustActivated] = useState(false);
  const [demoAnswer, setDemoAnswer] = useState<null | "scam" | "legit">(null);
  const [autopilotMsg, setAutopilotMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");

  // Handle premium activation via Stripe redirect (session_id param)
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId && sessionId.startsWith("cs_") && !isPremium()) {
      // Clean the URL immediately so refreshing doesn't re-trigger
      window.history.replaceState({}, "", "/");
      fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.token) {
            unlockPremiumWithToken(data.token);
            setPremiumJustActivated(true);
            track("purchase_success");
            // If signed in, persist to Firestore so other devices see the unlock
            syncPremiumToFirestore(sessionId).catch(() => {
              // Non-critical — local unlock still works
            });
          } else {
            // Verification failed — don't unlock
            console.warn("Premium verification failed:", data.error);
          }
        })
        .catch(() => {
          // Network error — don't unlock silently
        });
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const onboarded = localStorage.getItem(ONBOARDED_KEY);
      const fromDrill = searchParams.get("from") === "drill";
      if (onboarded && !fromDrill && !searchParams.get("session_id")) {
        router.replace("/drill");
      } else {
        setChecked(true);
        if (!onboarded) {
          setShowOnboarding(true);
          track("landing_viewed", { isOnboarded: false });
        } else {
          track("landing_viewed", { isOnboarded: true });
        }
      }
    }
  }, [router, searchParams]);

  // Countdown timer for daily challenge
  useEffect(() => {
    const tick = () => setCountdown(formatCountdown(secondsUntilMidnight()));
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, []);

  function handleStart() {
    localStorage.setItem(ONBOARDED_KEY, "1");
    router.push("/drill");
  }

  if (!checked) return (
    <div className="flex flex-col min-h-dvh px-6 py-10">
      <div className="mb-12 flex items-center gap-2">
        <svg width="26" height="26" viewBox="0 0 512 512" aria-hidden="true">
          <defs>
            <linearGradient id="sg-s" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c6af7"/>
              <stop offset="100%" stopColor="#5b4bd6"/>
            </linearGradient>
          </defs>
          <path d="M256 28 L460 120 C460 120 468 320 256 484 C44 320 52 120 52 120 Z" fill="url(#sg-s)"/>
          <path d="M192 260 L232 310 L328 200" fill="none" stroke="#fff" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-bold text-xl tracking-tight" style={{ color: "var(--text)" }}>Scam Gym</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-dvh px-6 py-10">
      {showOnboarding ? (
        /* ── Welcome / Onboarding Screen ── */
        <>
          <div className="flex-1 flex flex-col">
            {/* Hero illustration */}
            <div className="flex items-center justify-center mb-6">
              <img
                src="/home_hero_scam_gym.png"
                alt="Shield protecting a phone from scams"
                width={400}
                height={180}
                className="rounded-2xl object-cover"
                style={{ height: 180, width: "100%" }}
              />
            </div>

            {/* Hero */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
                Free · No account needed
              </p>
              <h1 className="text-[28px] font-bold leading-tight tracking-tight mb-6" style={{ color: "var(--text)" }}>
                Practice spotting scams before they hit you.
              </h1>
              <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Most people only learn about scams after they get fooled. Scam Gym lets you practice safely first.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <div className="flex -space-x-2">
                  {["🧑", "👩", "👴", "👩‍💼", "🧓"].map((emoji, i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm border-2"
                      style={{ background: "var(--surface-2)", borderColor: "var(--background)" }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  Thousands training to protect themselves
                </p>
              </div>
            </div>

            {/* Mini-drill demo */}
            <div
              className="card-base p-5 mb-6"
            >
              <p className="font-bold text-base text-center mb-4" style={{ color: "var(--text)" }}>
                Would you catch this?
              </p>

              {/* SMS-style bubble */}
              <div
                className="rounded-xl px-4 py-3 mb-4"
                style={{ background: "var(--surface-2)" }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>From: MegaShop</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                  &quot;Your account has been locked. Verify immediately: megash0p-secure-login.com&quot;
                </p>
              </div>

              {demoAnswer === null ? (
                /* Verdict buttons */
                <div className="flex gap-3">
                  <button
                    onClick={() => setDemoAnswer("scam")}
                    className="flex-1 py-3 min-h-[48px] rounded-xl font-semibold text-sm transition-all active:scale-95 border"
                    style={{ borderColor: "var(--danger)", color: "var(--danger)", background: "var(--danger-bg)" }}
                  >
                    Scam
                  </button>
                  <button
                    onClick={() => setDemoAnswer("legit")}
                    className="flex-1 py-3 min-h-[48px] rounded-xl font-semibold text-sm transition-all active:scale-95 border"
                    style={{ borderColor: "var(--success)", color: "var(--success)", background: "var(--success-bg)" }}
                  >
                    Legit
                  </button>
                </div>
              ) : (
                /* Reveal */
                <div className="animate-fadeIn">
                  <div
                    className="rounded-xl px-4 py-2.5 mb-3 text-center font-bold text-sm"
                    style={{
                      background: demoAnswer === "scam" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                      color: demoAnswer === "scam" ? "var(--success)" : "var(--danger)",
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
                    onClick={() => { tap(); handleStart(); }}
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
              {VALUE_PROPS.map((v, i) => (
                <div
                  key={v.title}
                  className="flex items-start gap-4 card-base p-6 animate-stagger"
                  style={{ animationDelay: `${i * 80}ms` } as React.CSSProperties}
                >
                  <span className="mt-0.5" style={{ color: "var(--accent)" }}>{v.icon}</span>
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
                <p className="text-sm font-bold mb-1" style={{ color: "var(--success)" }}>
                  ✨ Premium Unlocked!
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  All premium features are now active. Thank you for supporting Scam Gym!
                </p>
              </div>
            )}

            {/* Header row: title + streak */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-display text-[32px] font-extrabold leading-none" style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>
                Scam Gym
              </h1>
              {(() => {
                const streak = getStreak();
                if (streak.current === 0) return null;
                const trained = hasTrainedToday();
                const atRisk = streak.current >= 2 && !trained;
                // Scale flame size with streak: 16px base, up to 24px at 30+ days
                const flameSize = Math.min(16 + Math.floor(streak.current / 5) * 2, 24);
                return (
                  <div className="flex flex-col items-end gap-1">
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                      style={{
                        background: atRisk ? "rgba(239,68,68,0.12)" : "var(--warning-bg)",
                        color: atRisk ? "var(--danger)" : "var(--warning)",
                      }}
                    >
                      <Flame size={flameSize} strokeWidth={1.75} />
                      <span>{streak.current}</span>
                    </div>
                    {atRisk && (
                      <p className="text-xs font-semibold" style={{ color: "var(--danger)" }}>
                        Streak at risk!
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Tier chip — shows once user is past warmup */}
            {attempts.length >= 5 && (() => {
              const tier = getCurrentTier(attempts);
              const pct = tier.tier / 5;
              return (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                      Tier {tier.tier} / 5 · {tier.title}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {tier.tier < 5 ? "Accuracy climbs the ladder" : "Max tier — keep it up"}
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--surface-2)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct * 100}%`, background: "var(--accent)" }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Panic card — top priority, high intent users */}
            <Link
              href="/help"
              className="flex items-center gap-3 rounded-2xl border px-4 py-4 mb-6 transition-all active:scale-[0.98]"
              style={{ background: "var(--danger-bg)", borderColor: "var(--danger-border)" }}
            >
              <ShieldAlert size={24} strokeWidth={1.75} style={{ color: "var(--danger)", flexShrink: 0 }} />
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: "var(--danger)" }}>
                  Got a suspicious message right now?
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Tell me what type — get instant guidance
                </p>
              </div>
              <ChevronRight size={16} strokeWidth={1.75} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            </Link>

            {/* Daily Challenge */}
            {(() => {
              const challengeDrill = getDailyChallengeDrill(allDrills);
              const challengeState = getDailyChallengeState();
              const isCompleted = challengeState?.completed ?? false;
              return (
                <div
                  className="card-base p-4 mb-6"
                  style={{
                    border: `1.5px solid ${isCompleted ? "var(--success)" : "var(--accent)"}`,
                    background: isCompleted ? "rgba(34,197,94,0.06)" : "rgba(13,31,60,0.06)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap size={16} strokeWidth={1.75} style={{ color: isCompleted ? "var(--success)" : "var(--accent)" }} />
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: isCompleted ? "var(--success)" : "var(--accent)" }}>
                        Daily Challenge
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {isCompleted ? "Done ✓" : `Resets in ${countdown}`}
                    </span>
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>
                    {challengeDrill.pattern_family.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                  <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                    {isCompleted ? "You completed today's challenge. Come back tomorrow!" : "2× XP bonus for completing this drill."}
                  </p>
                  {!isCompleted && (
                    <button
                      onClick={() => {
                        tap();
                        sessionStorage.setItem("dailyChallengeId", challengeDrill.id);
                        router.push("/drill");
                      }}
                      className="w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
                      style={{ background: "var(--accent)", color: "#fff" }}
                    >
                      Start Challenge →
                    </button>
                  )}
                </div>
              );
            })()}

            {/* Recommended Focus (Adaptive) */}
            {attempts.length >= 5 && (() => {
              const stats = computeStats(attempts, allDrills);
              const weakest = stats.topVulnerabilities[0];
              if (!weakest) return null;
              
              const label = weakest.family.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              
              return (
                <div
                  className="card-elevated p-5 mb-8"
                  style={{ background: "var(--accent-subtle)", border: "2px solid var(--accent)" }}
                >
                  <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--accent)" }}>
                    Recommended Focus
                  </p>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
                    {label} Blind Spot
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
                    You&apos;re missing {Math.round((1 - weakest.accuracy) * 100)}% of these drills. Train this category specifically to build your instinct.
                  </p>
                  <button
                    onClick={() => {
                      tap();
                      setFocusFamilies([weakest.family]);
                      setFocusLabel(`Focus: ${label}`);
                      router.push("/drill");
                    }}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    Train this weakness
                  </button>
                </div>
              );
            })()}

            {attempts.length >= 3 && <SignInPromo />}

          </div>

          {/* Sticky CTA */}
          <div
            className="sticky bottom-[57px] -mx-6 px-6 pt-6 pb-4 space-y-3"
            style={{ background: "var(--background)", boxShadow: "0 -8px 24px rgba(0,0,0,0.12)" }}
          >
            {autopilotMsg && (
              <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>{autopilotMsg}</p>
            )}
            <button
              onClick={() => { tap(); handleStart(); }}
              className="w-full py-4 rounded-full font-bold text-lg transition-all active:scale-95"
              style={{ background: "var(--signature)", color: "#fff", boxShadow: "0 6px 20px rgba(247,122,15,0.35)" }}
            >
              Start Drill →
            </button>

            <div className="flex justify-center gap-6 pt-1">
              {isPremium() && (
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
                      setAutopilotMsg("Do a few more drills first — we need more data.");
                      handleStart();
                    }
                  }}
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Weak Spots
                </button>
              )}
              {isPremium() && (
                <button
                  onClick={() => { tap(); router.push("/session"); }}
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  10-Drill Session
                </button>
              )}
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
