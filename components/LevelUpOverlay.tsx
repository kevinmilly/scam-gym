"use client";

import { useEffect, useState } from "react";
import { LEVELS } from "@/lib/xp";
import { levelUpVibrate } from "@/lib/haptics";

type Props = {
  previousLevel: number;
  newLevel: number;
  onDismiss: () => void;
};

export default function LevelUpOverlay({ previousLevel, newLevel, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  const prevTitle = LEVELS.find((l) => l.level === previousLevel)?.title ?? "Newcomer";
  const newTitle = LEVELS.find((l) => l.level === newLevel)?.title ?? "Newcomer";

  useEffect(() => {
    levelUpVibrate();
    const fadeIn = setTimeout(() => setVisible(true), 50);
    const autoDismiss = setTimeout(() => onDismiss(), 4000);
    return () => {
      clearTimeout(fadeIn);
      clearTimeout(autoDismiss);
    };
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onDismiss}
      style={{
        background: "rgba(0,0,0,0.75)",
        opacity: visible ? 1 : 0,
        transition: "opacity 300ms ease-out",
      }}
    >
      <div
        className="rounded-3xl p-8 text-center max-w-xs mx-4 border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--accent)",
          transform: visible ? "scale(1)" : "scale(0.85)",
          transition: "transform 300ms ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
          Level Up!
        </div>
        <div className="text-6xl font-black mb-2" style={{ color: "var(--accent)" }}>
          {newLevel}
        </div>
        <div className="text-xl font-bold mb-3" style={{ color: "var(--text)" }}>
          {newTitle}
        </div>
        <div className="text-sm" style={{ color: "var(--text-muted)" }}>
          {prevTitle} → {newTitle}
        </div>
        <button
          onClick={onDismiss}
          className="mt-5 px-6 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
