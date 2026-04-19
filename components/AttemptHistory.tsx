"use client";

import { useState } from "react";
import type { Attempt, Drill } from "@/lib/types";
import { familyLabel } from "@/lib/stats";

type AttemptHistoryProps = {
  attempts: Attempt[];
  drills: Drill[];
};

type Filter = {
  family: string | null;
  correct: boolean | null;
  channel: string | null;
};

export default function AttemptHistory({ attempts, drills }: AttemptHistoryProps) {
  const [filter, setFilter] = useState<Filter>({ family: null, correct: null, channel: null });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const drillMap = new Map(drills.map((d) => [d.id, d]));

  // Get unique families and channels for filters
  const families = [...new Set(attempts.map((a) => drillMap.get(a.drillId)?.pattern_family).filter(Boolean))] as string[];
  const channels = [...new Set(attempts.map((a) => drillMap.get(a.drillId)?.channel).filter(Boolean))] as string[];

  // Apply filters
  const filtered = attempts.filter((a) => {
    const drill = drillMap.get(a.drillId);
    if (!drill) return false;
    if (filter.family && drill.pattern_family !== filter.family) return false;
    if (filter.correct !== null && a.isCorrect !== filter.correct) return false;
    if (filter.channel && drill.channel !== filter.channel) return false;
    return true;
  });

  // Sort newest first
  const sorted = [...filtered].sort((a, b) => b.timestamp - a.timestamp);

  function toggleFilter<K extends keyof Filter>(key: K, value: Filter[K]) {
    setFilter((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
        Attempt History ({sorted.length})
      </p>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {/* Correct / Incorrect */}
        <button
          onClick={() => toggleFilter("correct", true)}
          className="px-2.5 py-1 rounded-full text-xs border transition-all"
          style={{
            borderColor: filter.correct === true ? "#22c55e" : "var(--border)",
            background: filter.correct === true ? "rgba(34,197,94,0.15)" : "transparent",
            color: filter.correct === true ? "#22c55e" : "var(--text-muted)",
          }}
        >
          Correct
        </button>
        <button
          onClick={() => toggleFilter("correct", false)}
          className="px-2.5 py-1 rounded-full text-xs border transition-all"
          style={{
            borderColor: filter.correct === false ? "#ef4444" : "var(--border)",
            background: filter.correct === false ? "rgba(239,68,68,0.15)" : "transparent",
            color: filter.correct === false ? "#ef4444" : "var(--text-muted)",
          }}
        >
          Incorrect
        </button>

        {/* Channels */}
        {channels.map((ch) => (
          <button
            key={ch}
            onClick={() => toggleFilter("channel", ch)}
            className="px-2.5 py-1 rounded-full text-xs border transition-all"
            style={{
              borderColor: filter.channel === ch ? "var(--accent)" : "var(--border)",
              background: filter.channel === ch ? "rgba(13,31,60,0.15)" : "transparent",
              color: filter.channel === ch ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            {ch.toUpperCase()}
          </button>
        ))}

        {/* Families */}
        {families.map((fam) => (
          <button
            key={fam}
            onClick={() => toggleFilter("family", fam)}
            className="px-2.5 py-1 rounded-full text-xs border transition-all"
            style={{
              borderColor: filter.family === fam ? "var(--accent)" : "var(--border)",
              background: filter.family === fam ? "rgba(13,31,60,0.15)" : "transparent",
              color: filter.family === fam ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            {familyLabel(fam)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {sorted.slice(0, 50).map((a) => {
          const drill = drillMap.get(a.drillId);
          if (!drill) return null;
          const expanded = expandedId === a.id;

          return (
            <button
              key={a.id}
              onClick={() => setExpandedId(expanded ? null : a.id)}
              className="w-full text-left rounded-xl px-4 py-3 border transition-all"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                  >
                    {drill.channel.toUpperCase()}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {familyLabel(drill.pattern_family)}
                  </span>
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: a.isCorrect ? "#22c55e" : "#ef4444" }}
                >
                  {a.isCorrect ? "✓" : "✗"} {a.confidence}%
                </span>
              </div>
              <p className="text-sm truncate" style={{ color: "var(--text)" }}>
                {drill.message.body.slice(0, 80)}…
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {new Date(a.timestamp).toLocaleDateString()}
              </p>

              {/* Expanded detail */}
              {expanded && (
                <div className="mt-3 pt-3 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Your verdict: <strong style={{ color: "var(--text)" }}>{a.userVerdict.toUpperCase()}</strong> at {a.confidence}% confidence
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Actual: <strong style={{ color: drill.ground_truth === "scam" ? "#ef4444" : "#22c55e" }}>{drill.ground_truth.toUpperCase()}</strong>
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    {drill.explanation.short}
                  </p>
                  {drill.explanation.tells.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Tells:</p>
                      <ul className="space-y-1">
                        {drill.explanation.tells.map((t, i) => (
                          <li key={i} className="text-xs flex gap-2" style={{ color: "var(--text)" }}>
                            <span style={{ color: "var(--accent)" }}>→</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          No attempts match your filters.
        </p>
      )}
    </div>
  );
}
