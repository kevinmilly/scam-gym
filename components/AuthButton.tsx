"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { isPremium, unlockPremiumWithToken } from "@/lib/premium";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    setPremium(isPremium());
  }, []);

  // When session arrives with premium, restore it locally
  useEffect(() => {
    if (session && (session as unknown as Record<string, unknown>).isPremium) {
      const sid = (session as unknown as Record<string, unknown>).premiumSessionId as string;
      if (sid && !isPremium()) {
        // Build signed token — call verify-purchase to get a proper server-signed token
        fetch("/api/verify-purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user?.email }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.verified && data.token) {
              unlockPremiumWithToken(data.token);
              setPremium(true);
            }
          })
          .catch(() => {});
      }
    }
  }, [session]);

  async function handleSendLink() {
    if (!email.trim()) return;
    setSending(true);
    try {
      await signIn("resend", { email: email.trim(), redirect: true, callbackUrl: "/settings" });
    } catch {
      setSending(false);
    }
  }

  if (status === "loading") {
    return (
      <div
        className="rounded-2xl border px-4 py-4 animate-pulse"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="h-4 rounded w-1/2 mb-2" style={{ background: "var(--border)" }} />
        <div className="h-3 rounded w-3/4" style={{ background: "var(--border)" }} />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div
        className="rounded-2xl border px-4 py-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              Signed in
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {session.user.email}
            </p>
            {premium && (
              <p className="text-xs mt-1 font-semibold" style={{ color: "var(--accent)" }}>
                Pro synced across devices
              </p>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/settings" })}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            Sign out
          </button>
        </div>
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
        Sign in with your email to keep your Pro purchase synced. We&apos;ll send a secure login link — no password needed.
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendLink()}
          placeholder="you@email.com"
          className="flex-1 px-3 py-2 rounded-xl text-sm border outline-none"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface-2)",
            color: "var(--text)",
          }}
        />
        <button
          onClick={handleSendLink}
          disabled={sending || !email.trim()}
          className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap"
          style={{
            background: "var(--accent)",
            color: "white",
            opacity: sending || !email.trim() ? 0.5 : 1,
          }}
        >
          {sending ? "Sending..." : "Send link"}
        </button>
      </div>
      <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
        You&apos;ll receive an email from noreply@scamgym.com — a safe, password-free way to sign in.
      </p>
    </div>
  );
}
