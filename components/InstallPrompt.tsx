"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "scamgym_install_dismissed";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed, already installed, or in standalone mode
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Small delay so it doesn't flash immediately on load
      setTimeout(() => setVisible(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !deferredPrompt) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
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
