"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllAttempts } from "@/lib/db";
import { computeStats, familyLabel } from "@/lib/stats";
import type { StatsResult } from "@/lib/stats";
import type { Attempt } from "@/lib/types";
import { allDrills as drills } from "@/lib/DrillContext";
import { tap } from "@/lib/haptics";
import { accuracyScore, calibrationVerdict } from "@/lib/scoring";
import { computeProgression } from "@/lib/progression";
import type { ProgressionState } from "@/lib/progression";
import LevelBadge from "@/components/LevelBadge";
import MedalGallery from "@/components/MedalGallery";
import PremiumGate from "@/components/PremiumGate";
import { isPremium } from "@/lib/premium";
import { getStreak } from "@/lib/streak";
import { getBookmarks } from "@/lib/bookmarks";
import TrendChart from "@/components/TrendChart";
import AttemptHistory from "@/components/AttemptHistory";

type StatsTab = "overview" | "medals" | "history";

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsResult | null>(null);
  const [allAttempts, setAllAttempts] = useState<Attempt[]>([]);
  const [recent, setRecent] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [progression, setProgression] = useState<ProgressionState | null>(null);
  const [expandedFamily, setExpandedFamily] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StatsTab>("overview");

  async function shareText(text: string) {
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareToast("Copied!");
      setTimeout(() => setShareToast(null), 2000);
    } catch {
      // Clipboard not available
    }
  }

  function shareStats() {
    if (!stats) return;
    tap();
    const accuracy = Math.round(stats.overallAccuracy * 100);
    const levelText = progression ? `Level ${progression.levelInfo.level} ${progression.levelInfo.title} · ` : "";
    const medalCount = progression ? ` · ${progression.earnedMedals.length} medals` : "";
    const insights = stats.insightSummary.length > 0
      ? "\n" + stats.insightSummary.map((l) => `→ ${l}`).join("\n") + "\n"
      : "";
    const text = `I'm training my scam detection on Scam Gym!\n${levelText}${stats.totalAttempts} drills · ${accuracy}% accuracy${medalCount}${insights}\nTry it yourself: ${window.location.origin}`;
    shareText(text);
  }

  function shareLastResult() {
    if (!recent[0]) return;
    tap();
    const a = recent[0];
    const drill = drills.find((d) => d.id === a.drillId);
    const score = accuracyScore(a.brierScore);
    const calVerdict = calibrationVerdict(a.confidence, a.isCorrect);
    const verdictLabel = calVerdict === "well-calibrated" ? "Well-calibrated" : calVerdict === "overconfident" ? "Overconfident" : "Underconfident";
    const text = `I just completed a scam drill on Scam Gym!\nResult: ${a.isCorrect ? "Correct" : "Incorrect"} · ${a.confidence}% confidence · Score: ${score}/100\n${verdictLabel}${drill ? `\nPattern: ${drill.pattern_family.replace(/_/g, " ")}` : ""}\n\nTry it yourself: ${window.location.origin}`;
    shareText(text);
  }

  useEffect(() => {
    getAllAttempts().then((attempts) => {
      setAllAttempts(attempts);
      setStats(computeStats(attempts, drills));
      setRecent(attempts.slice(-10).reverse());
      setProgression(computeProgression(attempts, drills));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p style={{ color: "var(--text-muted)" }}>Loading stats…</p>
      </div>
    );
  }

  if (!stats || stats.totalAttempts === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
          No data yet
        </h2>
        <p className="mb-6" style={{ color: "var(--text-muted)" }}>
          Complete a few drills to start building your vulnerability profile.
        </p>
        <button
          onClick={() => router.push("/drill")}
          className="px-6 py-3 rounded-2xl font-bold"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          Start Drilling
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button onClick={() => router.push("/drill")} className="min-h-[44px] px-3 flex items-center text-sm" style={{ color: "var(--text-muted)" }}>
          ← Drill
        </button>
        <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
          My Progress
        </span>
        <button onClick={() => router.push("/settings")} className="min-h-[44px] px-3 flex items-center text-sm" style={{ color: "var(--text-muted)" }}>
          Settings
        </button>
      </div>

      {/* Tab navigation */}
      <div
        className="flex gap-1.5 px-4 py-2 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        {(["overview", "medals", "history"] as StatsTab[]).map((tab) => {
          const active = activeTab === tab;
          const labels: Record<StatsTab, string> = { overview: "Overview", medals: "Medals", history: "History" };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150"
              style={{
                background: active ? "var(--accent)" : "var(--surface-2)",
                color: active ? "#fff" : "var(--text-muted)",
              }}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      <div className="px-4 py-5 space-y-6 overflow-y-auto flex-1">

        {activeTab === "overview" && <>

        {/* Level Badge */}
        {progression && <LevelBadge levelInfo={progression.levelInfo} />}

        {/* Streak badge (free for all) */}
        {(() => {
          const streak = getStreak();
          if (streak.current === 0) return null;
          return (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}
            >
              <span>🔥</span>
              <span>{streak.current} day streak</span>
            </div>
          );
        })()}

        {/* Total drills */}
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {stats.totalAttempts} drills completed · {Math.round(stats.overallAccuracy * 100)}% overall accuracy
        </p>

        {/* Share section */}
        <div className="flex gap-2 items-center">
          <button
            onClick={shareStats}
            className="px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-muted)" }}
          >
            📤 Share My Progress
          </button>
          {recent.length > 0 && (
            <button
              onClick={shareLastResult}
              className="px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-muted)" }}
            >
              📤 Share Last Result
            </button>
          )}
        </div>

        {/* Accuracy Trend (premium) */}
        <PremiumGate label="Your Progress" pitch="See if you're actually getting better — or just getting lucky.">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Your Progress
            </p>
            <div
              className="rounded-2xl p-3 border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <TrendChart attempts={allAttempts} />
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              How your accuracy has shifted over your recent drills
            </p>
          </div>
        </PremiumGate>

        {/* Insight summary */}
        {stats.insightSummary.length > 0 && (
          <div
            className="rounded-2xl p-4 border space-y-2"
            style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.25)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#ef4444" }}>
              Your vulnerability profile
            </p>
            {stats.insightSummary.map((line, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                → {line}
              </p>
            ))}
          </div>
        )}

        </>}{/* end first overview block */}

        {activeTab === "medals" && (
          progression && (
            <MedalGallery
              earnedMedals={progression.earnedMedals}
              allMedals={progression.allMedals}
            />
          )
        )}

        {activeTab === "overview" && <>

        {/* Vulnerabilities */}
        {stats.topVulnerabilities.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Where you&apos;re most vulnerable
            </p>
            <div className="space-y-2">
              {stats.topVulnerabilities.map((f) => {
                const isExpanded = expandedFamily === f.family;
                const familyAttempts = allAttempts.filter((a) => {
                  const drill = drills.find((d) => d.id === a.drillId);
                  return drill?.pattern_family === f.family;
                });
                const wrongAttempts = familyAttempts.filter((a) => !a.isCorrect);
                const avgConfOnWrong = wrongAttempts.length > 0
                  ? Math.round(wrongAttempts.reduce((sum, a) => sum + a.confidence, 0) / wrongAttempts.length)
                  : 0;

                return (
                  <div key={f.family}>
                    <button
                      onClick={() => {
                        if (isPremium()) {
                          setExpandedFamily(isExpanded ? null : f.family);
                        }
                      }}
                      className="w-full flex items-center justify-between rounded-xl px-4 py-3 border transition-all"
                      style={{ background: "var(--surface)", borderColor: isExpanded ? "var(--accent)" : "var(--border)" }}
                    >
                      <div className="text-left">
                        <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                          {familyLabel(f.family)}
                        </div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {f.totalAttempts} attempts
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold" style={{ color: "#ef4444" }}>
                          {Math.round(f.accuracy * 100)}%
                        </div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>accuracy</div>
                      </div>
                    </button>

                    {/* Tap-to-expand hint for free users */}
                    {!isPremium() && (
                      <p className="text-xs mt-1 px-1" style={{ color: "var(--text-muted)" }}>
                        🔒 Tap to see your deep-dive breakdown — upgrade to unlock
                      </p>
                    )}

                    {/* Per-family deep dive (premium) */}
                    {isExpanded && isPremium() && (
                      <div
                        className="mt-1 rounded-xl px-4 py-3 border space-y-3"
                        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                      >
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-lg font-bold" style={{ color: "var(--text)" }}>
                              {familyAttempts.length}
                            </div>
                            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Total</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold" style={{ color: "#ef4444" }}>
                              {wrongAttempts.length}
                            </div>
                            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Wrong</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold" style={{ color: "#f59e0b" }}>
                              {avgConfOnWrong}%
                            </div>
                            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Avg conf when wrong</div>
                          </div>
                        </div>

                        {/* Mini trend for this family */}
                        <TrendChart attempts={familyAttempts} windowSize={3} />

                        {/* Drills that tripped you up */}
                        {wrongAttempts.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                              Drills that tripped you up
                            </p>
                            <div className="space-y-1.5">
                              {wrongAttempts.slice(-5).reverse().map((a) => {
                                const drill = drills.find((d) => d.id === a.drillId);
                                if (!drill) return null;
                                return (
                                  <div key={a.id} className="text-xs" style={{ color: "var(--text)" }}>
                                    <span style={{ color: "#ef4444" }}>✗</span>{" "}
                                    {drill.message.body.slice(0, 60)}… ({a.confidence}% conf)
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Locked full vulnerability profile — shown to free users with 3+ attempts */}
            {!isPremium() && allAttempts.length >= 3 && (
              <div
                className="relative mt-3 rounded-xl border overflow-hidden"
                style={{ borderColor: "var(--accent)", background: "var(--surface)" }}
              >
                {/* Blurred preview rows */}
                <div style={{ filter: "blur(4px)", pointerEvents: "none", opacity: 0.6 }} aria-hidden>
                  <div className="px-4 py-3 border-b flex justify-between" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>Phishing — Authority</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>8 attempts</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: "#ef4444" }}>38%</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>accuracy</div>
                    </div>
                  </div>
                  <div className="px-4 py-3 flex justify-between">
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>Fake Invoice</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>5 attempts</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: "#f59e0b" }}>60%</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>accuracy</div>
                    </div>
                  </div>
                </div>
                {/* Overlay CTA */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                >
                  <p className="text-sm font-bold" style={{ color: "#fff" }}>
                    🔍 Your full vulnerability profile is ready
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                    See exactly which scam types you&apos;re most at risk for — and train those weak spots.
                  </p>
                  <button
                    onClick={() => router.push("/upgrade")}
                    className="mt-1 px-5 py-2 rounded-full font-bold text-sm transition-all active:scale-95"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    Unlock Full Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Overconfidence hotspots */}
        {stats.overconfidenceHotspots.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Where you&apos;re overconfident when wrong
            </p>
            <div className="space-y-2">
              {stats.overconfidenceHotspots.map((f) => (
                <div
                  key={f.family}
                  className="flex items-center justify-between rounded-xl px-4 py-3 border"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {familyLabel(f.family)}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      When you&apos;re wrong here, you&apos;re very confident
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: "#f59e0b" }}>
                      ⚠️ {Math.round(f.avgBrierOnWrong * 100)}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>risk score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI-amplified comparison */}
        {stats.aiSplit && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              AI-polished vs standard messages
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-xl p-4 border text-center"
                style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.25)" }}
              >
                <div className="text-xs font-semibold mb-1" style={{ color: "#ef4444" }}>AI-Polished</div>
                <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                  {Math.round(stats.aiSplit.aiAccuracy * 100)}%
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {stats.aiSplit.aiCount} drills
                </div>
              </div>
              <div
                className="rounded-xl p-4 border text-center"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Standard</div>
                <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                  {Math.round(stats.aiSplit.nonAiAccuracy * 100)}%
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {stats.aiSplit.nonAiCount} drills
                </div>
              </div>
            </div>
            {stats.aiSplit.aiAccuracy < stats.aiSplit.nonAiAccuracy && (
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                You&apos;re less accurate on AI-polished messages — polished language makes scams harder to spot.
              </p>
            )}
          </div>
        )}

        {/* Confidence calibration */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Calibration by confidence level
          </p>
          <div className="space-y-2">
            {stats.confidenceBins.map((bin) => {
              if (bin.count === 0) return null;
              const acc = bin.accuracy ?? 0;
              const mid = bin.midpoint / 100;
              const diff = acc - mid;
              const isOver = diff < -0.1;
              const isUnder = diff > 0.1;
              const barColor = isOver ? "#ef4444" : isUnder ? "#3b82f6" : "#22c55e";

              return (
                <div key={bin.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {bin.label} confidence
                    </span>
                    <span className="text-xs font-semibold" style={{ color: barColor }}>
                      {Math.round(acc * 100)}% accurate ({bin.count})
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${acc * 100}%`, background: barColor }}
                    />
                  </div>
                  <div className="mt-0.5 text-xs text-right" style={{ color: "var(--text-muted)" }}>
                    Expected: {bin.midpoint}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent mistakes */}
        {recent.filter((a) => !a.isCorrect).length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Recent mistakes
            </p>
            <div className="space-y-2">
              {recent.filter((a) => !a.isCorrect).slice(0, 5).map((a) => {
                const drill = drills.find((d) => d.id === a.drillId);
                if (!drill) return null;
                return (
                  <div
                    key={a.id}
                    className="rounded-xl px-4 py-3 border"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                      >
                        {drill.channel.toUpperCase()}
                      </span>
                      <span className="text-xs" style={{ color: "#ef4444" }}>
                        Said {a.userVerdict} at {a.confidence}% · Was {drill.ground_truth}
                      </span>
                    </div>
                    <p className="text-sm truncate" style={{ color: "var(--text)" }}>
                      {drill.message.body.slice(0, 80)}…
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {drill.pattern_family.replace(/_/g, " ")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        </>}{/* end second overview block */}

        {activeTab === "history" && <>

        {/* Attempt History (premium) */}
        <PremiumGate label="Attempt History" pitch="Browse and filter every drill you've attempted with full details.">
          <AttemptHistory attempts={allAttempts} drills={drills} />
        </PremiumGate>

        {/* Saved Drills (premium) */}
        <PremiumGate label="Saved Drills" pitch="Bookmark drills on the result page to save them here for later review.">
          {(() => {
            const bookmarkIds = getBookmarks();
            if (bookmarkIds.length === 0) {
              return (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                    Saved Drills
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    No bookmarks yet. Tap the bookmark icon on any result page to save a drill.
                  </p>
                </div>
              );
            }
            const bookmarkedDrills = bookmarkIds
              .map((id) => drills.find((d) => d.id === id))
              .filter(Boolean);
            return (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                  Saved Drills ({bookmarkedDrills.length})
                </p>
                <div className="space-y-2">
                  {bookmarkedDrills.map((drill) => {
                    if (!drill) return null;
                    return (
                      <div
                        key={drill.id}
                        className="rounded-xl px-4 py-3 border"
                        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                          >
                            {drill.channel.toUpperCase()}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              color: drill.ground_truth === "scam" ? "#ef4444" : "#22c55e",
                            }}
                          >
                            {drill.ground_truth.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm truncate" style={{ color: "var(--text)" }}>
                          {drill.message.body.slice(0, 80)}…
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                          {drill.pattern_family.replace(/_/g, " ")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </PremiumGate>

        </>}
      </div>

      {/* Share snackbar */}
      {shareToast && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none" style={{ zIndex: 50 }}>
          <div
            className="animate-slideUp px-5 py-3 rounded-2xl text-sm font-semibold"
            style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
          >
            ✓ Copied to clipboard
          </div>
        </div>
      )}

      {/* CTA */}
      <div
        className="sticky bottom-0 px-4 py-4 border-t"
        style={{ background: "var(--background)", borderColor: "var(--border)" }}
      >
        <button
          onClick={() => { tap(); router.push("/drill"); }}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          Keep Training
        </button>
      </div>
    </div>
  );
}
