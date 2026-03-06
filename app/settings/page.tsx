"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { exportData, importData, resetAllData } from "@/lib/db";
import { useDrillContext, allDrills } from "@/lib/DrillContext";
import { familyLabel } from "@/lib/stats";
import { CONTEXT_LABELS, CONTEXT_DESCRIPTIONS } from "@/lib/contextFraming";
import type { UserContext } from "@/lib/types";
import { tap } from "@/lib/haptics";
import Link from "next/link";
import { isPremium } from "@/lib/premium";
import PremiumGate from "@/components/PremiumGate";
import { getTheme, setTheme } from "@/lib/ThemeInit";
import { isAudioEnabled, setAudioEnabled } from "@/lib/audio";
import { isAnalyticsEnabled, setAnalyticsEnabled, track } from "@/lib/analytics";

export default function SettingsPage() {
  const router = useRouter();
  const { selectedContext, setSelectedContext, focusFamilies, setFocusFamilies, setFocusLabel } = useDrillContext();
  const [status, setStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [slowMode, setSlowMode] = useState(false);
  const [premium, setPremium] = useState(false);
  const [theme, setThemeState] = useState<"dark" | "light">("dark");
  const [audio, setAudio] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    setSlowMode(localStorage.getItem("scamgym_slowmode") === "1");
    setPremium(isPremium());
    setThemeState(getTheme());
    setAudio(isAudioEnabled());
    setAnalytics(isAnalyticsEnabled());
  }, []);

  function toggleSlowMode() {
    const next = !slowMode;
    setSlowMode(next);
    localStorage.setItem("scamgym_slowmode", next ? "1" : "0");
    document.documentElement.dataset.slowMode = next ? "true" : "false";
  }

  async function handleExport() {
    try {
      const json = await exportData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scamgym-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus("Data exported.");
    } catch {
      setStatus("Export failed.");
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importData(text);
      setStatus("Data imported successfully.");
    } catch {
      setStatus("Import failed — check the file format.");
    }
    e.target.value = "";
  }

  async function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    await resetAllData();
    localStorage.removeItem("scamgym_onboarded");
    localStorage.removeItem("scamgym_context");
    setConfirmReset(false);
    setStatus("All data reset.");
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
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
            Settings
          </span>
          {premium && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(124,106,247,0.15)", color: "var(--accent)" }}>
              Pro
            </span>
          )}
        </div>
        <div className="w-12" />
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Premium section */}
        {premium ? (
          <div
            className="rounded-2xl border px-4 py-4"
            style={{ background: "rgba(124,106,247,0.06)", borderColor: "var(--accent)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">✨</span>
              <span className="font-bold text-sm" style={{ color: "var(--accent)" }}>
                Pro Unlocked
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              All features are active. Thank you for supporting Scam Gym!
            </p>
          </div>
        ) : (
          <Link
            href="/upgrade"
            className="block rounded-2xl border px-4 py-4 transition-all active:scale-[0.98]"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <p className="font-bold text-sm mb-1" style={{ color: "var(--text)" }}>
              Upgrade to Pro
            </p>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Unlock power-user tools — trend charts, focus training, reply scripts, and more.
            </p>
            <span
              className="inline-block px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Upgrade to unlock
            </span>
          </Link>
        )}

        {/* Context mode */}
        <div
          className="rounded-2xl border px-4 py-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
            Training Mode
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Only drills matching your selected mode are shown.
          </p>
          <div className="space-y-2">
            {(Object.keys(CONTEXT_LABELS) as UserContext[]).map((ctx) => {
              const selected = selectedContext === ctx;
              return (
                <button
                  key={ctx}
                  onClick={() => setSelectedContext(ctx)}
                  className="w-full text-left rounded-xl border px-3 py-3 transition-all"
                  style={{
                    borderColor: selected ? "var(--accent)" : "var(--border)",
                    background: selected ? "rgba(124,106,247,0.08)" : "var(--surface-2)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold" style={{ color: selected ? "var(--accent)" : "var(--text)" }}>
                        {CONTEXT_LABELS[ctx]}
                      </span>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {CONTEXT_DESCRIPTIONS[ctx]}
                      </p>
                    </div>
                    {selected && <span className="text-xs font-bold ml-2" style={{ color: "var(--accent)" }}>✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slow Mode */}
        <div
          className="rounded-2xl border px-4 py-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                Larger text &amp; spacing
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Increases font size and line spacing
              </p>
            </div>
            <button
              onClick={() => { tap(); toggleSlowMode(); }}
              className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
              style={{
                borderColor: slowMode ? "var(--accent)" : "var(--border)",
                background: slowMode ? "rgba(124,106,247,0.15)" : "var(--surface-2)",
                color: slowMode ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              {slowMode ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Sound effects */}
        <div
          className="rounded-2xl border px-4 py-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                Sound effects
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Play a tone on correct or incorrect answers
              </p>
            </div>
            <button
              onClick={() => {
                tap();
                const next = !audio;
                setAudio(next);
                setAudioEnabled(next);
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
              style={{
                borderColor: audio ? "var(--accent)" : "var(--border)",
                background: audio ? "rgba(124,106,247,0.15)" : "var(--surface-2)",
                color: audio ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              {audio ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Theme toggle (free for all users) */}
        <div
          className="rounded-2xl border px-4 py-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                Theme
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {theme === "dark" ? "Dark mode (default)" : "Light mode"}
              </p>
            </div>
            <button
              onClick={() => {
                tap();
                const next = theme === "dark" ? "light" : "dark";
                setThemeState(next);
                setTheme(next);
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
              style={{
                borderColor: theme === "light" ? "var(--accent)" : "var(--border)",
                background: theme === "light" ? "rgba(124,106,247,0.15)" : "var(--surface-2)",
                color: theme === "light" ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

        {/* Focus Training (premium) */}
        <PremiumGate label="Focus Training" pitch="Pick specific scam families to drill until you master them.">
          <div
            className="rounded-2xl border px-4 py-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
              Focus Training
            </p>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Select pattern families to focus on. Only drills from selected families will appear.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[...new Set(allDrills.map((d) => d.pattern_family))].sort().map((fam) => {
                const active = focusFamilies.includes(fam);
                return (
                  <button
                    key={fam}
                    onClick={() => {
                      tap();
                      const next = active
                        ? focusFamilies.filter((f) => f !== fam)
                        : [...focusFamilies, fam];
                      setFocusFamilies(next);
                      if (next.length > 0) {
                        setFocusLabel(`Focus: ${next.map(familyLabel).join(", ")}`);
                        track("focus_training_set", { families: next });
                      } else {
                        setFocusLabel(null);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-full text-xs border transition-all"
                    style={{
                      borderColor: active ? "var(--accent)" : "var(--border)",
                      background: active ? "rgba(124,106,247,0.15)" : "transparent",
                      color: active ? "var(--accent)" : "var(--text-muted)",
                    }}
                  >
                    {familyLabel(fam)}
                  </button>
                );
              })}
            </div>
            {focusFamilies.length > 0 && (
              <button
                onClick={() => { setFocusFamilies([]); setFocusLabel(null); }}
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                Clear focus filter
              </button>
            )}
          </div>
        </PremiumGate>

        {/* Data export */}
        <div
          className="rounded-2xl border divide-y"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="px-4 py-4">
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
              Export Data
            </p>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Download all your attempts and flags as a JSON backup.
            </p>
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl text-sm font-semibold border"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              Download backup
            </button>
          </div>

          <div className="px-4 py-4">
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
              Import Data
            </p>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Restore from a previous backup file.
            </p>
            <label
              className="inline-block px-4 py-2 rounded-xl text-sm font-semibold border cursor-pointer"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              Choose file
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          <div className="px-4 py-4">
            <p className="font-semibold text-sm mb-1" style={{ color: "#ef4444" }}>
              Reset All Data
            </p>
            <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Permanently deletes all your attempts and flags. Cannot be undone.
            </p>
            {confirmReset ? (
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: "#ef4444", color: "#fff" }}
                >
                  Yes, reset everything
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-4 py-2 rounded-xl text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-sm font-semibold border"
                style={{ borderColor: "#ef444466", color: "#ef4444" }}
              >
                Reset data
              </button>
            )}
          </div>
        </div>

        {/* Analytics toggle */}
        <div
          className="rounded-2xl border px-4 py-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                Usage analytics
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Help improve Scam Gym with anonymous usage data
              </p>
            </div>
            <button
              onClick={() => {
                tap();
                const next = !analytics;
                setAnalytics(next);
                setAnalyticsEnabled(next);
              }}
              className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
              style={{
                borderColor: analytics ? "var(--accent)" : "var(--border)",
                background: analytics ? "rgba(124,106,247,0.15)" : "var(--surface-2)",
                color: analytics ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              {analytics ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* About */}
        <div
          className="rounded-2xl border px-4 py-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
            About Scam Gym
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Your drill data stays on your device. We collect anonymous usage analytics to improve the app — no personal information is stored on our servers. You can opt out above.
            Scam Gym is a personal training tool — not a security product.
            It won&apos;t stop real scams, but it will sharpen your instincts.
          </p>
          <div
            className="mt-3 pt-3 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
              Disclaimer
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Scam Gym is for educational purposes only. All scenarios use fictional companies and brands — any resemblance to real organizations is coincidental. Drills cover common, high-frequency scam patterns and do not represent every type of fraud. Always verify suspicious messages directly through official channels.
            </p>
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            MVP v0.1
          </p>
        </div>

        {status && (
          <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
