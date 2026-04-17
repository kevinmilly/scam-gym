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
import { isAlertsEnabled, setAlertsEnabled } from "@/lib/alerts";
import { isAnalyticsEnabled, setAnalyticsEnabled, track } from "@/lib/analytics";
import { Sparkles, Check, Sun, Moon, Share, Plus, Smartphone } from "lucide-react";
import dynamic from "next/dynamic";
import {
  hasInstallPrompt,
  triggerInstallPrompt,
  subscribeToInstallPrompt,
  isIOS,
  isStandalone,
} from "@/components/InstallPrompt";
const AuthButton = dynamic(() => import("@/components/AuthButton"), { ssr: false });

export default function SettingsPage() {
  const router = useRouter();
  const { selectedContext, setSelectedContext, focusFamilies, setFocusFamilies, setFocusLabel } = useDrillContext();
  const [status, setStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [slowMode, setSlowMode] = useState(false);
  const [premium, setPremium] = useState(false);
  const [theme, setThemeState] = useState<"dark" | "light">("dark");
  const [audio, setAudio] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [installState, setInstallState] = useState<{
    standalone: boolean;
    canPrompt: boolean;
    ios: boolean;
  }>({ standalone: false, canPrompt: false, ios: false });
  const [showIOSInstall, setShowIOSInstall] = useState(false);

  useEffect(() => {
    setSlowMode(localStorage.getItem("scamgym_slowmode") === "1");
    setPremium(isPremium());
    setThemeState(getTheme());
    setAudio(isAudioEnabled());
    setAlerts(isAlertsEnabled());
    setAnalytics(isAnalyticsEnabled());

    // When Stripe completes in another tab, localStorage updates there.
    // The storage event fires in THIS tab so we can reflect the unlock immediately.
    function onStorage(e: StorageEvent) {
      if (e.key === "scamgym_premium_token") {
        setPremium(isPremium());
      }
    }
    window.addEventListener("storage", onStorage);

    // Install state — updates when the browser fires beforeinstallprompt later.
    setInstallState({ standalone: isStandalone(), canPrompt: hasInstallPrompt(), ios: isIOS() });
    const unsubInstall = subscribeToInstallPrompt(() => {
      setInstallState({ standalone: isStandalone(), canPrompt: hasInstallPrompt(), ios: isIOS() });
    });

    return () => {
      window.removeEventListener("storage", onStorage);
      unsubInstall();
    };
  }, []);

  async function handleInstallClick() {
    if (installState.ios) {
      setShowIOSInstall(true);
      return;
    }
    if (installState.canPrompt) {
      const outcome = await triggerInstallPrompt();
      if (outcome === "accepted") {
        setInstallState((s) => ({ ...s, standalone: true, canPrompt: false }));
        setStatus("App installed.");
      }
      return;
    }
    setStatus("Installation isn't available in this browser yet. Try Chrome, Edge, or open this site in Safari on iOS.");
  }

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
    [
      "scamgym_onboarded",
      "scamgym_context",
      "scamgym_streak",
      "scamgym_bookmarks",
      "scamgym_focus_families",
      "scamgym_slowmode",
      "scamgym_theme",
      "scamgym_sound_default",
      "scamgym_analytics_enabled",
      "scamgym_alerts",
    ].forEach((k) => localStorage.removeItem(k));
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
          onClick={() => router.push("/")}
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

      <div className="px-4 py-5 space-y-6 pb-24">
        {/* ── ACCOUNT ── */}
        {premium ? (
          <div
            className="rounded-2xl border px-4 py-4"
            style={{ background: "rgba(124,106,247,0.06)", borderColor: "var(--accent)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} strokeWidth={1.75} style={{ color: "var(--accent)" }} />
              <span className="font-bold text-sm" style={{ color: "var(--accent)" }}>
                Pro Unlocked
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              All features are active. Thank you for supporting Scam Gym!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/upgrade"
              className="block rounded-2xl border px-4 py-4 transition-all active:scale-[0.98]"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <p className="font-bold text-sm mb-1" style={{ color: "var(--text)" }}>
                Upgrade to Pro
              </p>
              <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                Unlock trend charts, focus training, reply scripts, and more.
              </p>
              <span
                className="inline-block px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Upgrade to unlock
              </span>
            </Link>
            <Link
              href="/upgrade"
              className="block text-center text-xs py-2"
              style={{ color: "var(--text-muted)" }}
            >
              Already purchased? Restore access →
            </Link>
          </div>
        )}

        {/* ── SIGN IN ── */}
        <AuthButton />

        {/* ── INSTALL APP ── */}
        {!installState.standalone && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-1" style={{ color: "var(--text-muted)" }}>
              App
            </p>
            <div className="rounded-2xl border px-4 py-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-start gap-3 mb-3">
                <Smartphone size={20} strokeWidth={1.75} style={{ color: "var(--accent)" }} />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
                    Install Scam Gym
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    Add to your home screen for quick access. Works offline, feels like a regular app, no app store needed.
                  </p>
                </div>
              </div>
              <button
                onClick={() => { tap(); handleInstallClick(); }}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                {installState.ios ? "Show install steps" : installState.canPrompt ? "Install app" : "How to install"}
              </button>

              {showIOSInstall && installState.ios && (
                <div
                  className="mt-4 rounded-xl border px-3 py-3 text-xs leading-relaxed"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-muted)" }}
                >
                  <p className="font-semibold mb-2" style={{ color: "var(--text)" }}>On iPhone / iPad (Safari):</p>
                  <ol className="space-y-2 list-decimal pl-4">
                    <li>
                      Tap the <Share size={12} strokeWidth={2} className="inline mx-0.5" /> <strong>Share</strong> button at the bottom of Safari.
                    </li>
                    <li>
                      Scroll down and tap <Plus size={12} strokeWidth={2} className="inline mx-0.5" /> <strong>Add to Home Screen</strong>.
                    </li>
                    <li>Tap <strong>Add</strong> in the top right.</li>
                  </ol>
                  <p className="mt-3" style={{ color: "var(--text-muted)" }}>
                    If you&apos;re not in Safari, open <strong>scam-gym.vercel.app</strong> in Safari first — other iOS browsers don&apos;t support installing.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TRAINING ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-1" style={{ color: "var(--text-muted)" }}>
            Training
          </p>
          <div className="space-y-3">
            {/* Context mode */}
            <div className="rounded-2xl border px-4 py-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>Training Mode</p>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Only drills matching your selected mode are shown.</p>
              <div className="space-y-2">
                {(Object.keys(CONTEXT_LABELS) as UserContext[]).map((ctx) => {
                  const selected = selectedContext === ctx;
                  return (
                    <button key={ctx} onClick={() => setSelectedContext(ctx)}
                      className="w-full text-left rounded-xl border px-3 py-3 transition-all"
                      style={{ borderColor: selected ? "var(--accent)" : "var(--border)", background: selected ? "rgba(124,106,247,0.08)" : "var(--surface-2)" }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-semibold" style={{ color: selected ? "var(--accent)" : "var(--text)" }}>{CONTEXT_LABELS[ctx]}</span>
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{CONTEXT_DESCRIPTIONS[ctx]}</p>
                        </div>
                        {selected && <Check size={16} strokeWidth={2.5} className="ml-2" style={{ color: "var(--accent)" }} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Focus Training (premium) */}
            <PremiumGate label="Focus Training" pitch="Pick specific scam families to drill until you master them.">
              <div className="rounded-2xl border px-4 py-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>Focus Training</p>
                <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Select pattern families to focus on. Only drills from selected families will appear.</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {[...new Set(allDrills.map((d) => d.pattern_family))].sort().map((fam) => {
                    const active = focusFamilies.includes(fam);
                    return (
                      <button key={fam}
                        onClick={() => {
                          tap();
                          const next = active ? focusFamilies.filter((f) => f !== fam) : [...focusFamilies, fam];
                          setFocusFamilies(next);
                          if (next.length > 0) { setFocusLabel(`Focus: ${next.map(familyLabel).join(", ")}`); track("focus_training_set", { families: next }); }
                          else { setFocusLabel(null); }
                        }}
                        className="px-2.5 py-1.5 rounded-full text-xs border transition-all"
                        style={{ borderColor: active ? "var(--accent)" : "var(--border)", background: active ? "rgba(124,106,247,0.15)" : "transparent", color: active ? "var(--accent)" : "var(--text-muted)" }}>
                        {familyLabel(fam)}
                      </button>
                    );
                  })}
                </div>
                {focusFamilies.length > 0 && (
                  <button onClick={() => { setFocusFamilies([]); setFocusLabel(null); }} className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Clear focus filter
                  </button>
                )}
              </div>
            </PremiumGate>
          </div>
        </div>

        {/* ── ACCESSIBILITY ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-1" style={{ color: "var(--text-muted)" }}>
            Accessibility
          </p>
          <div className="space-y-3">
            {/* Larger text */}
            <div className="rounded-2xl border px-4 py-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>Larger text &amp; spacing</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Increases font size and line spacing</p>
                </div>
                <button onClick={() => { tap(); toggleSlowMode(); }} role="switch" aria-checked={slowMode}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border transition-colors duration-150"
                  style={{ borderColor: slowMode ? "var(--accent)" : "var(--border)", background: slowMode ? "rgba(124,106,247,0.15)" : "var(--surface-2)", color: slowMode ? "var(--accent)" : "var(--text-muted)" }}>
                  {slowMode ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            {/* Sound */}
            <div className="rounded-2xl border px-4 py-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>Sound effects</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Play a tone on correct or incorrect answers</p>
                </div>
                <button onClick={() => { tap(); const next = !audio; setAudio(next); setAudioEnabled(next); }} role="switch" aria-checked={audio}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border transition-colors duration-150"
                  style={{ borderColor: audio ? "var(--accent)" : "var(--border)", background: audio ? "rgba(124,106,247,0.15)" : "var(--surface-2)", color: audio ? "var(--accent)" : "var(--text-muted)" }}>
                  {audio ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            {/* Realistic alerts */}
            <div className="rounded-2xl border px-4 py-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <div className="pr-3">
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>Realistic alerts</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Chime, vibration, and banner animation when each drill arrives — matches the channel (SMS, email, DM).</p>
                </div>
                <button onClick={() => { tap(); const next = !alerts; setAlerts(next); setAlertsEnabled(next); }} role="switch" aria-checked={alerts}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border transition-colors duration-150 shrink-0"
                  style={{ borderColor: alerts ? "var(--accent)" : "var(--border)", background: alerts ? "rgba(124,106,247,0.15)" : "var(--surface-2)", color: alerts ? "var(--accent)" : "var(--text-muted)" }}>
                  {alerts ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            {/* Theme */}
            <div className="rounded-2xl border px-4 py-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>Theme</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{theme === "dark" ? "Dark mode (default)" : "Light mode"}</p>
                </div>
                <button onClick={() => { tap(); const next = theme === "dark" ? "light" : "dark"; setThemeState(next); setTheme(next); }} role="switch" aria-checked={theme === "light"}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border transition-colors duration-150"
                  style={{ borderColor: theme === "light" ? "var(--accent)" : "var(--border)", background: theme === "light" ? "rgba(124,106,247,0.15)" : "var(--surface-2)", color: theme === "light" ? "var(--accent)" : "var(--text-muted)" }}>
                  {theme === "dark" ? <><Sun size={14} strokeWidth={1.75} className="inline mr-1" /> Light</> : <><Moon size={14} strokeWidth={1.75} className="inline mr-1" /> Dark</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── DATA ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-1" style={{ color: "var(--text-muted)" }}>
            Data
          </p>
          <div className="rounded-2xl border divide-y" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="px-4 py-4">
              <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>Export Data</p>
              <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Download all your attempts and flags as a JSON backup.</p>
              <button onClick={handleExport} className="px-4 py-2 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                Download backup
              </button>
            </div>
            <div className="px-4 py-4">
              <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>Import Data</p>
              <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>Restore from a previous backup file.</p>
              <label className="inline-block px-4 py-2 rounded-xl text-sm font-semibold border cursor-pointer" style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                Choose file
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
            <div className="px-4 py-4">
              <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-muted)" }}>Analytics</p>
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Help improve Scam Gym with anonymous usage data</p>
                <button onClick={() => { tap(); const next = !analytics; setAnalytics(next); setAnalyticsEnabled(next); }} role="switch" aria-checked={analytics}
                  className="ml-4 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors duration-150 shrink-0"
                  style={{ borderColor: analytics ? "var(--accent)" : "var(--border)", background: analytics ? "rgba(124,106,247,0.15)" : "var(--surface-2)", color: analytics ? "var(--accent)" : "var(--text-muted)" }}>
                  {analytics ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── DANGER ZONE ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-1" style={{ color: "var(--danger)" }}>
            Danger Zone
          </p>
          <div className="rounded-2xl border px-4 py-4" style={{ background: "var(--danger-bg)", borderColor: "var(--danger-border)" }}>
            <p className="font-semibold text-sm mb-1" style={{ color: "var(--danger)" }}>Reset All Data</p>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Permanently deletes all your attempts and flags. This cannot be undone.</p>
            {confirmReset ? (
              <div className="flex gap-2">
                <button onClick={handleReset} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: "var(--danger)", color: "#fff" }}>
                  Yes, delete everything
                </button>
                <button onClick={() => setConfirmReset(false)} className="px-4 py-2 rounded-xl text-sm" style={{ color: "var(--text-muted)" }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={handleReset} className="px-4 py-2 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--danger-border)", color: "var(--danger)" }}>
                Reset all data
              </button>
            )}
          </div>
        </div>

        {/* ── ABOUT ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-1" style={{ color: "var(--text-muted)" }}>
            About
          </p>
          <div className="rounded-2xl border px-4 py-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <p className="font-semibold text-sm mb-2" style={{ color: "var(--text)" }}>About Scam Gym</p>
            <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
              Your drill data stays on your device. We collect anonymous usage analytics to improve the app — no personal information is stored on our servers. You can opt out in the Data section above.
              Scam Gym is a personal training tool — not a security product. It won&apos;t stop real scams, but it will sharpen your instincts.
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text)" }}>Disclaimer:</strong> For educational purposes only. All scenarios use fictional companies and brands. Drills cover common scam patterns — always verify suspicious messages through official channels.
            </p>
            <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>MVP v0.1</p>
          </div>
        </div>

      </div>

      {/* Snackbar for status messages */}
      {status && (
        <div
          className="fixed bottom-[72px] left-0 right-0 flex justify-center pointer-events-none"
          style={{ zIndex: 50 }}
        >
          <div
            className="animate-slideUp px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg"
            style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}
          >
            {status}
          </div>
        </div>
      )}
    </div>
  );
}
