"use client";

import type { LevelInfo } from "@/lib/xp";

type Props = {
  levelInfo: LevelInfo;
  animate?: boolean;
};

export default function XpBar({ levelInfo, animate }: Props) {
  const { level, title, currentXp, xpForCurrentLevel, xpForNextLevel, progress } = levelInfo;
  const xpIntoLevel = currentXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel ? xpForNextLevel - xpForCurrentLevel : 0;
  const isMaxLevel = xpForNextLevel === null;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>
          {title}
        </span>
        {!isMaxLevel && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Level {level + 1}
          </span>
        )}
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: "var(--surface-2)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.round(progress * 100)}%`,
            background: "var(--accent)",
            transition: animate ? "width 600ms ease-out" : "none",
          }}
        />
      </div>
      <div className="text-center mt-1">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {isMaxLevel ? "MAX LEVEL" : `${xpIntoLevel} / ${xpNeeded} XP`}
        </span>
      </div>
    </div>
  );
}
