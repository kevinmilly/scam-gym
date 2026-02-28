"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllAttempts } from "@/lib/db";
import { computeStats, familyLabel } from "@/lib/stats";
import type { StatsResult } from "@/lib/stats";
import type { Attempt } from "@/lib/types";
import { drills } from "@/lib/DrillContext";

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsResult | null>(null);
  const [recent, setRecent] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllAttempts().then((attempts) => {
      setStats(computeStats(attempts, drills));
      setRecent(attempts.slice(-10).reverse());
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
          Complete a few drills to start building your profile.
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

  const overallPct = Math.round(stats.overallAccuracy * 100);

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button onClick={() => router.push("/drill")} className="text-sm" style={{ color: "var(--text-muted)" }}>
          ← Drill
        </button>
        <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
          My Profile
        </span>
        <button onClick={() => router.push("/settings")} className="text-sm" style={{ color: "var(--text-muted)" }}>
          Settings
        </button>
      </div>

      <div className="px-4 py-5 space-y-6 overflow-y-auto flex-1">
        {/* Overview */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Drills", value: stats.totalAttempts },
            { label: "Correct", value: `${overallPct}%` },
            { label: "Right", value: stats.totalCorrect },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl p-4 text-center border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>{value}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Vulnerabilities */}
        {stats.topVulnerabilities.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Where you&apos;re most vulnerable
            </p>
            <div className="space-y-2">
              {stats.topVulnerabilities.map((f) => (
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
                      {f.totalAttempts} attempts
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: "#ef4444" }}>
                      {Math.round(f.accuracy * 100)}%
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>accuracy</div>
                  </div>
                </div>
              ))}
            </div>
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

        {/* Confidence bins */}
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
                  <div
                    className="mt-0.5 text-xs text-right"
                    style={{ color: "var(--text-muted)" }}
                  >
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
                    <p
                      className="text-sm truncate"
                      style={{ color: "var(--text)" }}
                    >
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
      </div>

      {/* CTA */}
      <div
        className="sticky bottom-0 px-4 py-4 border-t"
        style={{ background: "var(--background)", borderColor: "var(--border)" }}
      >
        <button
          onClick={() => router.push("/drill")}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          Keep Training
        </button>
      </div>
    </div>
  );
}
