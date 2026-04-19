"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { dismissInterstitial } from "@/lib/trial";
import { tap } from "@/lib/haptics";
import { track } from "@/lib/analytics";
import { X } from "lucide-react";

type Props = {
  totalAttempts: number;
  accuracy: number; // 0-1
  onDismiss: () => void;
};

export default function ConversionInterstitial({ totalAttempts, accuracy, onDismiss }: Props) {
  const router = useRouter();
  const pct = Math.round(accuracy * 100);

  // Describe improvement direction — if no prior data we just say overall
  const accuracyLine = pct >= 70
    ? `Your accuracy is ${pct}% — you're getting sharp.`
    : `You've caught ${Math.round(accuracy * totalAttempts)} out of ${totalAttempts} drills so far.`;

  function handleUpgrade() {
    tap();
    track("conversion_interstitial_upgrade", { totalAttempts, accuracy });
    dismissInterstitial();
    router.push("/upgrade");
  }

  function handleDismiss() {
    tap();
    track("conversion_interstitial_dismissed", { totalAttempts, accuracy });
    dismissInterstitial();
    onDismiss();
  }

  // Escape key dismisses
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);

  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade to Pro"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={handleDismiss}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl px-6 py-8 space-y-4"
        style={{ background: "var(--background)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss button */}
        <div className="flex justify-end">
          <button onClick={handleDismiss} aria-label="Close" style={{ color: "var(--text-muted)" }}>
            <X size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        {/* Headline */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>
            You&apos;re getting better
          </p>
          <h2 className="text-2xl font-bold leading-tight" style={{ color: "var(--text)" }}>
            {accuracyLine}
          </h2>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            You&apos;ve completed {totalAttempts} drills. Pro shows you exactly where you&apos;re still
            vulnerable — and automatically trains those blind spots.
          </p>
        </div>

        {/* Feature bullets */}
        <ul className="space-y-2">
          {[
            "Accuracy trend chart — see if you're actually improving",
            "Weakness autopilot — trains your worst categories automatically",
            "Unlimited drill breakdowns — no daily limit",
            "Full attempt history — review every drill you've done",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2 text-sm" style={{ color: "var(--text)" }}>
              <span style={{ color: "var(--accent)" }}>✓</span>
              {line}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          Unlock Pro — $9.99
        </button>
        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
          One-time · No subscription · No account needed
        </p>
      </div>
    </div>
  );
}
