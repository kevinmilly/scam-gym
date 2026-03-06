"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isPremium, unlockPremium, PREMIUM_PRICE, STRIPE_PAYMENT_URL } from "@/lib/premium";
import { track } from "@/lib/analytics";

const PREMIUM_FEATURES = [
  { icon: "📈", label: "Accuracy trend chart" },
  { icon: "🔍", label: "Per-family deep dive" },
  { icon: "🎯", label: "Custom drill focus" },
  { icon: "🤖", label: "Weakness autopilot" },
  { icon: "📋", label: "Full attempt history" },
  { icon: "🏃", label: "10-drill sessions" },
  { icon: "🔖", label: "Drill bookmarks" },
  { icon: "🔥", label: "Streak tracking" },
  { icon: "💬", label: "50+ reply scripts" },
  { icon: "📇", label: "Unlimited contacts" },
];

export default function UpgradePage() {
  const router = useRouter();
  const [premium, setPremium] = useState(false);
  const [restoreEmail, setRestoreEmail] = useState("");
  const [restoreStatus, setRestoreStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [restoreMessage, setRestoreMessage] = useState("");
  const [showRestore, setShowRestore] = useState(false);

  useEffect(() => {
    setPremium(isPremium());
    track("upgrade_screen_viewed");
  }, []);

  async function handleRestore() {
    if (!restoreEmail.trim()) return;
    setRestoreStatus("loading");
    setRestoreMessage("");
    try {
      const res = await fetch("/api/verify-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: restoreEmail.trim() }),
      });
      const data = await res.json();
      if (data.verified) {
        unlockPremium();
        setPremium(true);
        setRestoreStatus("success");
        setRestoreMessage("Premium restored! All features are now unlocked.");
      } else {
        setRestoreStatus("error");
        setRestoreMessage(data.message || data.error || "No purchase found for this email.");
      }
    } catch {
      setRestoreStatus("error");
      setRestoreMessage("Could not connect. Check your internet and try again.");
    }
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={() => router.back()}
          className="min-h-[44px] px-3 flex items-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          ← Back
        </button>
        <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
          Upgrade
        </span>
        <div className="w-12" />
      </div>

      <div className="px-4 py-6 space-y-6">
        {premium ? (
          <div
            className="rounded-2xl border px-5 py-6 text-center"
            style={{ background: "rgba(124,106,247,0.06)", borderColor: "var(--accent)" }}
          >
            <span className="text-3xl block mb-3">✨</span>
            <p className="font-bold text-lg mb-1" style={{ color: "var(--accent)" }}>
              Pro Unlocked
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              All features are active. Thank you for supporting Scam Gym!
            </p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>
                Upgrade to Pro
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                All training drills stay free — Pro adds power-user tools.
              </p>
            </div>

            <div
              className="rounded-2xl border px-4 py-5"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                {PREMIUM_FEATURES.map((f) => (
                  <div key={f.label} className="flex items-center gap-2">
                    <span className="text-base">{f.icon}</span>
                    <span className="text-sm" style={{ color: "var(--text)" }}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={STRIPE_PAYMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("purchase_started")}
                className="block w-full text-center py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Unlock All for {PREMIUM_PRICE}
              </a>
              <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                One-time purchase · No subscription
              </p>
            </div>

            {/* Restore purchase */}
            <div
              className="rounded-2xl border px-4 py-4"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              {!showRestore ? (
                <button
                  onClick={() => setShowRestore(true)}
                  className="text-sm w-full text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  Already purchased? Restore here
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    Restore your purchase
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    Enter the email you used when you paid. We&apos;ll verify your purchase with Stripe and re-activate Pro on this device.
                  </p>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={restoreEmail}
                    onChange={(e) => setRestoreEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm border"
                    style={{
                      background: "var(--surface-2)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  />
                  <button
                    onClick={handleRestore}
                    disabled={restoreStatus === "loading" || !restoreEmail.trim()}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                    style={{
                      background: restoreEmail.trim() ? "var(--accent)" : "var(--surface-2)",
                      color: restoreEmail.trim() ? "#fff" : "var(--text-muted)",
                    }}
                  >
                    {restoreStatus === "loading" ? "Checking..." : "Restore"}
                  </button>
                  {restoreMessage && (
                    <p
                      className="text-xs"
                      style={{ color: restoreStatus === "success" ? "#22c55e" : "#ef4444" }}
                    >
                      {restoreMessage}
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
