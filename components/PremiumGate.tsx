"use client";

import { useState, useEffect } from "react";
import { isPremium, PREMIUM_PRICE, STRIPE_PAYMENT_URL } from "@/lib/premium";

type PremiumGateProps = {
  children: React.ReactNode;
  /** Title shown above the locked state */
  label?: string;
  /** Short pitch for why this feature is worth unlocking */
  pitch?: string;
  /** If true, renders nothing when locked instead of the upsell card */
  hideWhenLocked?: boolean;
};

export default function PremiumGate({
  children,
  label,
  pitch,
  hideWhenLocked = false,
}: PremiumGateProps) {
  const [premium, setPremium] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setPremium(isPremium());
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (premium) return <>{children}</>;
  if (hideWhenLocked) return null;

  return (
    <div
      className="rounded-2xl border px-4 py-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">🔒</span>
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
      <a
        href={STRIPE_PAYMENT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        Unlock for {PREMIUM_PRICE}
      </a>
    </div>
  );
}
