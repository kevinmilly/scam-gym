"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "scamgym_install_dismissed";

// Module-level state so other components (e.g. Settings) can query & trigger the
// same deferred prompt. The `beforeinstallprompt` event only fires once per page
// load, so we capture it here and share it.
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    notify();
  });
}

export function hasInstallPrompt(): boolean {
  return deferredPrompt !== null;
}

export async function triggerInstallPrompt(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferredPrompt) return "unavailable";
  await deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === "accepted") {
    deferredPrompt = null;
    notify();
  }
  return outcome;
}

export function subscribeToInstallPrompt(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [hasPrompt, setHasPrompt] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (isStandalone()) return;

    setHasPrompt(hasInstallPrompt());
    const unsub = subscribeToInstallPrompt(() => setHasPrompt(hasInstallPrompt()));
    return unsub;
  }, []);

  useEffect(() => {
    if (!hasPrompt) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, [hasPrompt]);

  if (!visible || !hasPrompt) return null;

  async function handleInstall() {
    const outcome = await triggerInstallPrompt();
    if (outcome === "accepted") setVisible(false);
  }

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto rounded-2xl border p-4 z-50 animate-fadeIn"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl mt-0.5">📲</div>
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
            Add Scam Gym to your home screen
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Install for quick access — works like a regular app. No app store needed.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-lg leading-none p-1"
          style={{ color: "var(--text-muted)" }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div className="flex gap-3 mt-3">
        <button
          onClick={handleDismiss}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm border transition-all active:scale-95"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          Install
        </button>
      </div>
    </div>
  );
}
