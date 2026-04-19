"use client";

import { useEffect, useState } from "react";
import { type User } from "firebase/auth";
import { CloudUpload, X } from "lucide-react";
import { signInWithGoogle, onAuthChange, checkFirestorePremium, syncPremiumToFirestore } from "@/lib/auth";
import { isFirebaseConfigured } from "@/lib/firebase";
import { isPremium } from "@/lib/premium";
import { track } from "@/lib/analytics";

const DISMISSED_KEY = "scamgym_signin_promo_dismissed";

type Props = {
  variant?: "card" | "inline";
};

export default function SignInPromo({ variant = "card" }: Props) {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDismissed(typeof window !== "undefined" && localStorage.getItem(DISMISSED_KEY) === "1");
    const unsub = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        await checkFirestorePremium();
        if (isPremium()) {
          const token = localStorage.getItem("scamgym_premium_token");
          if (token) {
            const payload = atob(token.split(".")[0]);
            const sid = payload.replace("premium:", "");
            try {
              await syncPremiumToFirestore(sid);
            } catch {
              // Non-critical
            }
          }
        }
      }
    });
    return () => {
      unsub?.();
    };
  }, []);

  async function handleSignIn() {
    setLoading(true);
    track("signin_promo_signin_clicked", { variant });
    try {
      await signInWithGoogle();
      track("signin_completed", { source: "promo", variant });
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
        // Silent — settings has the full error surface
      }
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
    track("signin_promo_dismissed", { variant });
  }

  const visible = mounted && isFirebaseConfigured() && !user && !dismissed;

  useEffect(() => {
    if (visible) track("signin_promo_shown", { variant });
  }, [visible, variant]);

  if (!visible) return null;

  if (variant === "inline") {
    return (
      <div
        className="rounded-xl px-3 py-2.5 flex items-center gap-2.5 text-xs"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      >
        <CloudUpload size={16} strokeWidth={1.75} style={{ color: "var(--text-muted)" }} aria-hidden="true" />
        <div className="flex-1 min-w-0" style={{ color: "var(--text-muted)" }}>
          Back up your progress across devices.
        </div>
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {loading ? "…" : "Sign in"}
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="p-1 rounded-md"
          style={{ color: "var(--text-subtle)" }}
        >
          <X size={14} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-2xl px-4 py-4"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
    >
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="absolute top-2 right-2 p-1.5 rounded-md"
        style={{ color: "var(--text-subtle)" }}
      >
        <X size={16} strokeWidth={2} aria-hidden="true" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div
          className="icon-chip"
          style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
        >
          <CloudUpload size={20} strokeWidth={1.75} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--text)" }}>
            Back up your progress
          </p>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            Sign in with Google to keep your training synced across devices.
          </p>
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2"
            style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--surface)" }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
              <path d="M5.84 14.09A6.68 6.68 0 0 1 5.5 12c0-.72.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.84Z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
            </svg>
            {loading ? "Signing in…" : "Sign in with Google"}
          </button>
        </div>
      </div>
    </div>
  );
}
