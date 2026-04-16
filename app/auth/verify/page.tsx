"use client";

import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="px-5 py-12 text-center">
      <div
        className="rounded-2xl border px-6 py-8 max-w-sm mx-auto"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="text-4xl mb-4">📧</div>
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>
          Check your email
        </h1>
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          We sent you a secure login link. Click it to sign in — no password needed.
        </p>
        <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
          The email comes from <strong>noreply@scamgym.com</strong>. If you don&apos;t see it, check your spam folder.
        </p>
        <Link
          href="/settings"
          className="text-sm font-semibold"
          style={{ color: "var(--accent)" }}
        >
          ← Back to Settings
        </Link>
      </div>
    </div>
  );
}
