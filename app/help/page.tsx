"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tap } from "@/lib/haptics";
import { isPremium } from "@/lib/premium";
import { track } from "@/lib/analytics";
import {
  resolveHelpOutput,
  CHANNEL_OPTIONS,
  ASK_OPTIONS,
  THEME_OPTIONS,
  URGENCY_OPTIONS,
  type HelpChannel,
  type HelpAsk,
  type HelpTheme,
  type HelpUrgency,
  type HelpOutput,
} from "@/lib/helpTemplates";

type Step = "channel" | "ask" | "theme" | "urgency" | "output";

export default function HelpPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("channel");
  const [channel, setChannel] = useState<HelpChannel | null>(null);
  const [ask, setAsk] = useState<HelpAsk | null>(null);
  const [theme, setTheme] = useState<HelpTheme | null>(null);
  const [urgency, setUrgency] = useState<HelpUrgency | null>(null);
  const [output, setOutput] = useState<HelpOutput | null>(null);

  function handleChannel(ch: HelpChannel) {
    tap();
    setChannel(ch);
    setStep("ask");
  }

  function handleAsk(a: HelpAsk) {
    tap();
    setAsk(a);
    setStep("theme");
  }

  function handleTheme(t: HelpTheme | null) {
    tap();
    setTheme(t);
    setStep("urgency");
  }

  function handleUrgency(u: HelpUrgency | null) {
    tap();
    setUrgency(u);
    generateOutput(u);
  }

  function generateOutput(urg: HelpUrgency | null) {
    if (!channel || !ask) return;
    const result = resolveHelpOutput(channel, ask, theme ?? undefined, urg ?? undefined);
    setOutput(result);
    setStep("output");
    track("panic_mode_used", { channel, ask, theme, urgency: urg });
  }

  function handleBack() {
    tap();
    if (step === "ask") setStep("channel");
    else if (step === "theme") setStep("ask");
    else if (step === "urgency") setStep("theme");
    else if (step === "output") setStep("urgency");
  }

  const premium = typeof window !== "undefined" ? isPremium() : false;

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        {step === "channel" ? (
          <button
            onClick={() => router.push("/?from=drill")}
            className="min-h-[44px] px-3 flex items-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            ← Home
          </button>
        ) : (
          <button
            onClick={handleBack}
            className="min-h-[44px] px-3 flex items-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            ← Back
          </button>
        )}
        <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
          Help Me Right Now
        </span>
        <div className="w-12" />
      </div>

      <div className="px-4 py-5 flex-1 overflow-y-auto">
        {/* Step 1: Channel */}
        {step === "channel" && (
          <div>
            {/* Reassuring banner */}
            <div
              className="flex items-start gap-3 rounded-xl px-4 py-3 mb-6"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
            >
              <span className="text-lg mt-0.5">🛡️</span>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                <strong>Don&apos;t respond yet.</strong> Let&apos;s figure this out together — step by step.
              </p>
            </div>

            <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
              How did they contact you?
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Pick the type of message you received.
            </p>
            <div className="space-y-3">
              {CHANNEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleChannel(opt.value)}
                  className="w-full text-left flex items-center gap-3 rounded-2xl border px-4 py-4 transition-all active:scale-[0.98]"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: What are they asking */}
        {step === "ask" && (
          <div>
            <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
              What are they asking you to do?
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Pick the closest match.
            </p>
            <div className="space-y-2">
              {ASK_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAsk(opt.value)}
                  className="w-full text-left flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all active:scale-[0.98]"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span className="text-sm" style={{ color: "var(--text)" }}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Theme (optional) */}
        {step === "theme" && (
          <div>
            <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
              Who are they claiming to be?
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Optional — helps us give more specific advice.
            </p>
            <div className="space-y-2 mb-4">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleTheme(opt.value)}
                  className="w-full text-left rounded-2xl border px-4 py-3 transition-all active:scale-[0.98]"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <span className="text-sm" style={{ color: "var(--text)" }}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => handleTheme(null)}
              className="text-sm font-semibold"
              style={{ color: "var(--accent)" }}
            >
              Skip →
            </button>
          </div>
        )}

        {/* Step 4: Urgency (optional) */}
        {step === "urgency" && (
          <div>
            <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
              How urgent is this?
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Optional — helps us prioritize advice.
            </p>
            <div className="space-y-2 mb-4">
              {URGENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleUrgency(opt.value)}
                  className="w-full text-left rounded-2xl border px-4 py-3 transition-all active:scale-[0.98]"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <span className="text-sm" style={{ color: "var(--text)" }}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => handleUrgency(null)}
              className="text-sm font-semibold"
              style={{ color: "var(--accent)" }}
            >
              Skip →
            </button>
          </div>
        )}

        {/* Step 5: Output */}
        {step === "output" && output && (
          <div className="space-y-5">
            {/* Safe move — primary card */}
            <div
              className="rounded-2xl p-5 border-2"
              style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.4)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#22c55e" }}>
                Your Safe Move
              </p>
              <p className="text-base leading-relaxed font-medium" style={{ color: "var(--text)" }}>
                {output.safeMove}
              </p>
            </div>

            {/* Verify steps */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                How to Verify
              </p>
              <div className="space-y-2">
                {output.verifySteps.map((step, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-xl px-3 py-3 border"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    <span className="text-sm font-bold shrink-0" style={{ color: "var(--accent)" }}>
                      {i + 1}.
                    </span>
                    <span className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Never do — danger card */}
            <div
              className="rounded-2xl p-4 border"
              style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.3)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#ef4444" }}>
                Never Do This
              </p>
              <ul className="space-y-2">
                {output.neverDo.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    <span style={{ color: "#ef4444" }}>✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <Link
                href={`/help/scripts${channel ? `?channel=${channel}` : ""}`}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                💬 Copy a Reply Script
              </Link>

              <Link
                href="/help/vault"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm border transition-all active:scale-95"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
              >
                📇 Open Verification Vault
              </Link>

              {output.suggestedFamilies.length > 0 && (
                <button
                  onClick={() => {
                    tap();
                    // Store focus families and navigate to drill
                    if (typeof window !== "undefined") {
                      localStorage.setItem("scamgym_focus_families", JSON.stringify(output.suggestedFamilies));
                      localStorage.setItem("scamgym_onboarded", "1");
                    }
                    router.push("/drill");
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm border transition-all active:scale-95"
                  style={{ borderColor: "var(--accent)", background: "rgba(124,106,247,0.1)", color: "var(--accent)" }}
                >
                  🎯 Practice Drills Like This
                </button>
              )}
            </div>

            {/* Post-panic upsell for non-premium */}
            {!premium && (
              <Link
                href="/upgrade"
                className="block rounded-2xl p-4 border mt-4 transition-all active:scale-[0.98]"
                style={{ background: "rgba(124,106,247,0.06)", borderColor: "rgba(124,106,247,0.2)" }}
              >
                <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
                  Know exactly what to say next time
                </p>
                <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-muted)" }}>
                  Get reply scripts, a verified contacts vault, and more with Pro.
                </p>
                <span
                  className="inline-block px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  Upgrade to unlock
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
