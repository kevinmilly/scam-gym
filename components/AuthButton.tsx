"use client";

import { useState, useEffect } from "react";
import { type User } from "firebase/auth";
import {
  signInWithGoogle,
  signOutUser,
  onAuthChange,
  checkFirestorePremium,
  syncPremiumToFirestore,
} from "@/lib/auth";
import { isPremium } from "@/lib/premium";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      setUser(u);
      if (u) {
        // Restore premium from Firestore if available
        await checkFirestorePremium();
        // If user has local premium, sync it up to Firestore
        if (isPremium()) {
          const token = localStorage.getItem("scamgym_premium_token");
          if (token) {
            const payload = atob(token.split(".")[0]);
            const sid = payload.replace("premium:", "");
            await syncPremiumToFirestore(sid);
          }
        }
      }
    });
    return () => { unsub?.(); };
  }, []);

  async function handleSignIn() {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      // User closed popup or Firebase not configured
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setLoading(true);
    try {
      await signOutUser();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (user) {
    return (
      <div
        className="rounded-2xl border px-4 py-4 flex items-center justify-between"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt=""
              className="w-8 h-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          )}
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              {user.displayName || "Signed in"}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold border"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border px-4 py-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
        Sync across devices
      </p>
      <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
        Sign in with Google to keep your Pro purchase synced across devices.
      </p>
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="px-4 py-2 rounded-xl text-sm font-semibold border flex items-center gap-2"
        style={{ borderColor: "var(--border)", color: "var(--text)" }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
          <path d="M5.84 14.09A6.68 6.68 0 0 1 5.5 12c0-.72.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.84Z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335"/>
        </svg>
        {loading ? "Signing in..." : "Sign in with Google"}
      </button>
    </div>
  );
}
