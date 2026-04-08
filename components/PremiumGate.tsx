"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { isPremium } from "@/lib/premium";
import { track } from "@/lib/analytics";
import { Lock } from "lucide-react";

type PremiumGateProps = {
  children: React.ReactNode;
  /** Title shown above the locked state */
  label?: string;
  /** Short pitch for why this feature is worth unlocking */
  pitch?: string;
  /** If true, renders nothing when locked instead of the upsell card */
  hideWhenLocked?: boolean;
  /** Shows "X of Y free used" with a progress bar */
  usedOf?: { used: number; total: number };
  /** Shows first ~80 chars of locked content as a blurred preview */
  peekContent?: string;
};

export default function PremiumGate({
  children,
  label,
  pitch,
  hideWhenLocked = false,
  usedOf,
  peekContent,
}: PremiumGateProps) {
  const [premium, setPremium] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const pro = isPremium();
    setPremium(pro);
    setChecked(true);
    if (!pro && !hideWhenLocked && label) {
      track("upgrade_prompt_shown", { label });
    }
  }, [hideWhenLocked, label]);

  if (!checked) return null;
  if (premium) return <>{children}</>;
  if (hideWhenLocked) return null;

  const atLimit = usedOf ? usedOf.used >= usedOf.total : false;

  return (
    <div
      className="rounded-2xl border px-4 py-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Blurred peek preview */}
      {peekContent && (
        <div
          className="rounded-xl px-3 py-2 mb-3 text-sm leading-relaxed overflow-hidden"
          style={{
            background: "var(--surface-2)",
            color: "var(--text-muted)",
            filter: "blur(3px)",
            WebkitFilter: "blur(3px)",
            userSelect: "none",
            maxHeight: 48,
          }}
        >
          {peekContent.slice(0, 80)}{peekContent.length > 80 ? "…" : ""}
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <Lock size={16} strokeWidth={1.75} style={{ color: "var(--text-muted)" }} />
        {label && (
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            {label}
          </span>
        )}
      </div>
      {pitch && (
        <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
          {pitch}
        </p>
      )}

      {/* Usage counter + progress bar */}
      {usedOf && (
        <div className="mb-3">
          <p className="text-xs font-semibold mb-1.5" style={{ color: atLimit ? "#ef4444" : "var(--text-muted)" }}>
            {usedOf.used} of {usedOf.total} free used
          </p>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((usedOf.used / usedOf.total) * 100, 100)}%`,
                background: atLimit ? "#ef4444" : "var(--accent)",
              }}
            />
          </div>
        </div>
      )}

      <Link
        href="/upgrade"
        onClick={() => track("upgrade_clicked", { label })}
        className="inline-block px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        Upgrade to unlock
      </Link>
    </div>
  );
}
