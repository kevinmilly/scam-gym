"use client";

import { useEffect, useState } from "react";
import type { EarnedMedal } from "@/lib/medals";
import { medalVibrate } from "@/lib/haptics";

type Props = {
  medals: EarnedMedal[];
  onDone: () => void;
};

export default function MedalToast({ medals, onDone }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (currentIndex >= medals.length) {
      onDone();
      return;
    }

    medalVibrate();
    // Slide in
    const showTimer = setTimeout(() => setVisible(true), 50);
    // Slide out after 2s
    const hideTimer = setTimeout(() => setVisible(false), 2000);
    // Advance to next after 2.5s
    const nextTimer = setTimeout(() => {
      setCurrentIndex((i) => i + 1);
    }, 2500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex, medals.length, onDone]);

  if (currentIndex >= medals.length) return null;

  const medal = medals[currentIndex];

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{ padding: "env(safe-area-inset-top, 12px) 16px 0" }}
    >
      <div
        className="px-5 py-3 rounded-2xl border flex items-center gap-3 max-w-sm"
        style={{
          background: "var(--surface)",
          borderColor: "var(--accent)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          transform: visible ? "translateY(12px)" : "translateY(-80px)",
          opacity: visible ? 1 : 0,
          transition: "transform 300ms ease-out, opacity 300ms ease-out",
        }}
      >
        <span className="text-2xl">{medal.emoji}</span>
        <div>
          <div className="text-sm font-bold" style={{ color: "var(--text)" }}>
            {medal.name}
          </div>
          <div className="text-xs" style={{ color: "var(--accent)" }}>
            Unlocked!
          </div>
        </div>
      </div>
    </div>
  );
}
