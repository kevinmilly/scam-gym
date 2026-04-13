"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isPremium, unlockPremiumWithToken, PREMIUM_PRICE, STRIPE_PAYMENT_URL } from "@/lib/premium";
import { track } from "@/lib/analytics";
import { Search, TrendingUp, Cpu, Sparkles, ChevronRight, Check, Target, Zap, Bookmark, Flame } from "lucide-react";

const UPGRADE_OUTCOMES = [
  {
    icon: <Search size={24} strokeWidth={1.75} />,
    headline: "Know exactly where you're vulnerable",
    description: "Most people have a blind spot — a scam type they consistently miss, often with high confidence. See your full vulnerability profile and know which scams could actually fool you.",
    features: ["Per-category accuracy breakdown", "Overconfidence hotspot analysis", "Focused weak-spot training"],
  },
  {
    icon: <TrendingUp size={24} strokeWidth={1.75} />,
    headline: "See if you're actually getting better",
    description: "Random drills don't tell you whether you're improving. Track your real progress over time with a trend chart that shows whether your accuracy and calibration are moving in the right direction.",
    features: ["Accuracy trend chart", "Full drill history", "Session mode — 10 drills, under 5 minutes"],
  },
  {
    icon: <Cpu size={24} strokeWidth={1.75} />,
    headline: "Train smarter, not more",
    description: "Instead of random drills, let the app automatically focus on your worst categories. One tap and the engine routes you straight to the patterns that catch you off guard.",
    features: ["Weakness autopilot", "Custom drill focus", "Bookmark tricky drills to revisit"],
  },
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
      if (data.verified && data.token) {
        unlockPremiumWithToken(data.token);
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
          <div className="space-y-5">
            <div
              className="rounded-2xl border px-5 py-6 text-center"
              style={{ background: "rgba(124,106,247,0.06)", borderColor: "var(--accent)" }}
            >
              <Sparkles size={32} strokeWidth={1.5} className="mb-3" style={{ color: "var(--accent)" }} />
              <p className="font-bold text-lg mb-1" style={{ color: "var(--accent)" }}>
                Pro Active
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                All features are unlocked. Thank you for supporting Scam Gym!
              </p>
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Your pro features
            </p>
            {[
              { icon: <TrendingUp size={20} strokeWidth={1.75} />, label: "Accuracy trend chart", href: "/stats" },
              { icon: <Search size={20} strokeWidth={1.75} />, label: "Full vulnerability profile", href: "/stats" },
              { icon: <Target size={20} strokeWidth={1.75} />, label: "Custom drill focus", href: "/settings" },
              { icon: <Zap size={20} strokeWidth={1.75} />, label: "10-drill session mode", href: "/session" },
              { icon: <Bookmark size={20} strokeWidth={1.75} />, label: "Drill bookmarks", href: "/stats" },
              { icon: <Flame size={20} strokeWidth={1.75} />, label: "Streak tracking", href: "/stats" },
            ].map(({ icon, label, href }) => (
              <button
                key={label}
                onClick={() => router.push(href)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all active:scale-[0.98]"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <span style={{ color: "var(--accent)" }}>{icon}</span>
                <span className="text-sm font-semibold flex-1" style={{ color: "var(--text)" }}>{label}</span>
                <ChevronRight size={16} strokeWidth={1.75} style={{ color: "var(--text-muted)" }} />
              </button>
            ))}
          </div>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-[28px] font-bold leading-tight tracking-tight mb-4" style={{ color: "var(--text)" }}>
                Know your blind spots.
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Free drills train your instincts. Pro shows you where those instincts are failing.
              </p>
            </div>

            <div className="space-y-4">
              {UPGRADE_OUTCOMES.map((outcome) => (
                <div
                  key={outcome.headline}
                  className="rounded-2xl px-5 py-5 border"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span style={{ color: "var(--accent)" }}>{outcome.icon}</span>
                    <p className="text-base font-bold leading-tight" style={{ color: "var(--text)" }}>
                      {outcome.headline}
                    </p>
                  </div>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
                    {outcome.description}
                  </p>
                  <ul className="space-y-1">
                    {outcome.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                        <Check size={14} strokeWidth={2} style={{ color: "var(--accent)" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
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
                Unlock Pro — {PREMIUM_PRICE}
              </a>
              <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                One-time · No subscription · No account needed
              </p>
              <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                Thousands of people are already training with Scam Gym. Pro helps you train smarter.
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
                      style={{ color: restoreStatus === "success" ? "var(--success)" : "var(--danger)" }}
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
