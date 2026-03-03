"use client";

import type { EarnedMedal, MedalDef, MedalCategory } from "@/lib/medals";

type Props = {
  earnedMedals: EarnedMedal[];
  allMedals: MedalDef[];
};

const CATEGORY_ORDER: { key: MedalCategory; label: string }[] = [
  { key: "core", label: "Core Skill" },
  { key: "calibration", label: "Calibration" },
  { key: "volume", label: "Volume" },
  { key: "pattern", label: "Pattern Mastery" },
  { key: "special", label: "Special" },
];

export default function MedalGallery({ earnedMedals, allMedals }: Props) {
  const earnedIds = new Set(earnedMedals.map((m) => m.id));
  const total = allMedals.length;
  const earned = earnedMedals.length;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
        Medals · {earned} / {total}
      </p>
      <div className="space-y-4">
        {CATEGORY_ORDER.map(({ key, label }) => {
          const medals = allMedals.filter((m) => m.category === key);
          if (medals.length === 0) return null;
          return (
            <div key={key}>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                {label}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {medals.map((medal) => {
                  const isEarned = earnedIds.has(medal.id);
                  return (
                    <div
                      key={medal.id}
                      className="flex flex-col items-center text-center p-2 rounded-xl"
                      style={{
                        background: "var(--surface)",
                        border: isEarned ? "1px solid var(--accent)" : "1px solid var(--border)",
                      }}
                    >
                      <span
                        className="text-2xl mb-1"
                        style={{
                          filter: isEarned ? "none" : "grayscale(1)",
                          opacity: isEarned ? 1 : 0.3,
                        }}
                      >
                        {medal.emoji}
                      </span>
                      <span
                        className="text-xs leading-tight"
                        style={{
                          color: isEarned ? "var(--text)" : "var(--text-muted)",
                          opacity: isEarned ? 1 : 0.5,
                        }}
                      >
                        {medal.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
