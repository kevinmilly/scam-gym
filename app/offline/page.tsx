"use client";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
      <div className="text-5xl mb-6">📡</div>
      <h1
        className="text-2xl font-bold mb-3"
        style={{ color: "var(--text)" }}
      >
        You&apos;re offline
      </h1>
      <p
        className="text-base mb-8 max-w-xs leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        Scam Gym needs an internet connection to load drills. Please reconnect and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        Retry
      </button>
    </div>
  );
}
