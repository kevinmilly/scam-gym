"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ONBOARDED_KEY = "scamgym_onboarded";

export default function HomePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem(ONBOARDED_KEY)) {
        router.replace("/drill");
      } else {
        setChecked(true);
      }
    }
  }, [router]);

  function handleStart() {
    localStorage.setItem(ONBOARDED_KEY, "1");
    router.push("/drill");
  }

  if (!checked) return null;

  return (
    <div className="flex flex-col min-h-dvh px-6 py-10">
      {/* Logo */}
      <div className="inline-flex items-center gap-2 mb-12">
        <span className="text-2xl">🏋️</span>
        <span className="font-bold text-xl tracking-tight" style={{ color: "var(--text)" }}>
          Scam Gym
        </span>
      </div>

      {/* Hero */}
      <h1 className="text-3xl font-bold leading-tight mb-4" style={{ color: "var(--text)" }}>
        Train your scam detection.
      </h1>
      <p className="text-lg mb-10" style={{ color: "var(--text-muted)" }}>
        Real message drills. Instant feedback. Track where you&apos;re vulnerable.
      </p>

      {/* Calibration explainer */}
      <div
        className="rounded-2xl p-5 mb-8 border"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
          How this works
        </p>
        <p className="font-semibold mb-2" style={{ color: "var(--text)" }}>
          Being wrong isn&apos;t the only danger. Being confident and wrong is.
        </p>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
          Scam Gym tracks not just whether you got it right — it tracks how sure you were.
          Clicking a phishing link while 95% confident is far more dangerous than pausing and saying &quot;I&apos;m not sure.&quot;
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Overconfident", color: "#ef4444", desc: "Wrong + sure = danger zone" },
            { label: "Well-calibrated", color: "#22c55e", desc: "Confidence matches reality" },
            { label: "Underconfident", color: "#3b82f6", desc: "Right but uncertain" },
          ].map((v) => (
            <div key={v.label} className="rounded-xl p-3" style={{ background: "var(--surface-2)" }}>
              <div className="text-xs font-bold mb-1" style={{ color: v.color }}>{v.label}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{v.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pattern families */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
          What you&apos;ll train on
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "Bank Fraud Alerts", "Delivery Scams", "Account Verification",
            "Tech Support", "Job Scams", "Fake Invoices", "Romance / Social", "QR Code Traps",
          ].map((f) => (
            <span
              key={f}
              className="text-xs px-3 py-1 rounded-full border"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto space-y-3">
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-95"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          Start Training
        </button>
        <div className="flex justify-center gap-6 pt-1">
          <Link href="/stats" className="text-sm" style={{ color: "var(--text-muted)" }}>
            My Stats
          </Link>
          <Link href="/settings" className="text-sm" style={{ color: "var(--text-muted)" }}>
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
