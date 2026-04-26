"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isPremium, unlockPremiumWithToken, PREMIUM_PRICE, PREMIUM_TAGLINE, PREMIUM_SUBTEXT, STRIPE_PAYMENT_URL } from "@/lib/premium";
import { isNativeAndroid } from "@/lib/platform";
import { purchasePremium, restorePurchases } from "@/lib/playBilling";
import { apiUrl } from "@/lib/apiBase";
import { track } from "@/lib/analytics";
import { Search, TrendingUp, Cpu, Sparkles, ChevronRight, Check, Target, Zap, Bookmark, Flame } from "lucide-react";

const UPGRADE_OUTCOMES = [
  {
    icon: <Search size={24} strokeWidth={1.75} />,
    headline: "Find your 3 biggest blind spots",
    description: "Most people have a scam type they consistently miss — often while feeling confident. Pro shows you exactly which categories can still fool you, so you can fix them before it costs you.",
    features: ["See yourself getting safer week by week", "Know which scams are most likely to fool you", "Focused weak-spot practice"],
  },
  {
    icon: <TrendingUp size={24} strokeWidth={1.75} />,
    headline: "Know if you're actually getting safer",
    description: "Free practice builds your instincts. Pro shows whether those instincts are actually improving — with a trend chart and full history so you can see real progress, not just feelings.",
    features: ["Accuracy trend chart — week over week", "Full attempt history — review every round", "10-minute check-up session mode"],
  },
  {
    icon: <Cpu size={24} strokeWidth={1.75} />,
    headline: "\"I'll train your weak spots for you\"",
    description: "One tap and the app focuses entirely on the scam types that can still catch you. No guessing what to practice — the engine routes you straight to your vulnerabilities.",
    features: ["Weakness autopilot — one tap, instant focus", "Train the scams that can still fool you", "Save rounds you want to show your family"],
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const [premium, setPremium] = useState(false);
  const [onAndroid, setOnAndroid] = useState(false);

  // Web-only restore (Stripe email lookup)
  const [restoreEmail, setRestoreEmail] = useState("");
  const [restoreStatus, setRestoreStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [restoreMessage, setRestoreMessage] = useState("");
  const [showRestore, setShowRestore] = useState(false);

  // Android-only purchase / restore state
  const [playStatus, setPlayStatus] = useState<"idle" | "purchasing" | "restoring">("idle");
  const [playMessage, setPlayMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setPremium(isPremium());
    setOnAndroid(isNativeAndroid());
    track("upgrade_screen_viewed");

    // When Stripe completes in another tab (web only), localStorage updates there.
    function onStorage(e: StorageEvent) {
      if (e.key === "scamgym_premium_token") {
        setPremium(isPremium());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function handleRestore() {
    if (!restoreEmail.trim()) return;
    setRestoreStatus("loading");
    setRestoreMessage("");
    try {
      const res = await fetch(apiUrl("/api/verify-purchase"), {
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

  async function handlePlayPurchase() {
    setPlayStatus("purchasing");
    setPlayMessage(null);
    track("purchase_started", { platform: "android" });
    const result = await purchasePremium();
    if (result.ok) {
      unlockPremiumWithToken(result.token);
      setPremium(true);
      setPlayMessage({ kind: "success", text: "Pro unlocked. Thanks for supporting Scam Gym!" });
    } else if (result.reason !== "cancelled") {
      setPlayMessage({ kind: "error", text: result.message || "Could not complete purchase. Please try again." });
    }
    setPlayStatus("idle");
  }

  async function handlePlayRestore() {
    setPlayStatus("restoring");
    setPlayMessage(null);
    const result = await restorePurchases();
    if (result.found) {
      unlockPremiumWithToken(result.token);
      setPremium(true);
      setPlayMessage({ kind: "success", text: "Pro restored. All features are now unlocked." });
    } else {
      setPlayMessage({ kind: "error", text: result.reason || "No previous purchase found on this account." });
    }
    setPlayStatus("idle");
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
              style={{ background: "rgba(13,31,60,0.06)", borderColor: "var(--accent)" }}
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
              { icon: <Target size={20} strokeWidth={1.75} />, label: "Custom practice focus", href: "/settings" },
              { icon: <Zap size={20} strokeWidth={1.75} />, label: "10-round check-up session", href: "/session" },
              { icon: <Bookmark size={20} strokeWidth={1.75} />, label: "Saved rounds", href: "/stats" },
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
              <h1 className="text-[28px] font-bold leading-tight tracking-tight mb-2" style={{ color: "var(--text)" }}>
                Know your blind spots.
              </h1>
              <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
                Free rounds build your instincts. Pro shows you where they&apos;re still failing.
              </p>
              <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                {PREMIUM_TAGLINE}
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

            {/* Purchase CTA — branches on platform */}
            {onAndroid ? (
              <div className="space-y-3">
                <button
                  onClick={handlePlayPurchase}
                  disabled={playStatus !== "idle"}
                  aria-label={`Unlock Pro for ${PREMIUM_PRICE}`}
                  className="block w-full text-center py-4 rounded-2xl font-bold text-base transition-all active:scale-95 disabled:opacity-60"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  {playStatus === "purchasing" ? "Opening Google Play…" : `Unlock Pro — ${PREMIUM_PRICE}`}
                </button>
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                  {PREMIUM_SUBTEXT}
                </p>
                {playMessage && (
                  <p
                    className="text-xs text-center"
                    style={{ color: playMessage.kind === "success" ? "var(--success)" : "var(--danger)" }}
                  >
                    {playMessage.text}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <a
                  href={STRIPE_PAYMENT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Unlock Pro for ${PREMIUM_PRICE} — opens checkout in a new tab`}
                  onClick={() => track("purchase_started", { platform: "web" })}
                  className="block w-full text-center py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  Unlock Pro — {PREMIUM_PRICE}
                </a>
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                  {PREMIUM_SUBTEXT}
                </p>
              </div>
            )}

            {/* Restore section — branches on platform */}
            {onAndroid ? (
              <div
                className="rounded-2xl border px-4 py-4 space-y-2"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  Already purchased?
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  If you bought Pro on this Google account before, tap restore and we&apos;ll re-activate it on this device.
                </p>
                <button
                  onClick={handlePlayRestore}
                  disabled={playStatus !== "idle"}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-60"
                  style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
                >
                  {playStatus === "restoring" ? "Checking…" : "Restore purchases"}
                </button>
              </div>
            ) : (
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
                      Enter the email you used when you paid. We&apos;ll verify your purchase and re-activate Pro on this device.
                    </p>
                    <input
                      type="email"
                      placeholder="your@email.com…"
                      autoComplete="email"
                      spellCheck={false}
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
