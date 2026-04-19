"use client";

import type { LevelInfo } from "@/lib/xp";
import XpBar from "./XpBar";

type Props = {
  levelInfo: LevelInfo;
};

export default function LevelBadge({ levelInfo }: Props) {
  return (
    <div
      className="rounded-2xl p-4 border"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-4 mb-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shrink-0"
          style={{
            background: "rgba(13,31,60,0.15)",
            color: "var(--accent)",
            border: "2px solid var(--accent)",
          }}
        >
          {levelInfo.level}
        </div>
        <div>
          <div className="text-lg font-bold" style={{ color: "var(--text)" }}>
            {levelInfo.title}
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            Level {levelInfo.level} · {levelInfo.currentXp} XP
          </div>
        </div>
      </div>
      <XpBar levelInfo={levelInfo} />
    </div>
  );
}
