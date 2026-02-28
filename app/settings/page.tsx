"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { exportData, importData, resetAllData } from "@/lib/db";
import { useDrillContext } from "@/lib/DrillContext";
import { CONTEXT_LABELS, CONTEXT_DESCRIPTIONS } from "@/lib/contextFraming";
import type { UserContext } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const { selectedContext, setSelectedContext } = useDrillContext();
  const [status, setStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

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
        <button onClick={() => router.back()} className="text-sm" style={{ color: "var(--text-muted)" }}>
          ← Back
        </button>
        <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
          Settings
        </span>
        <div className="w-12" />
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Context mode */}
        <div
          className="rounded-2xl border px-4 py-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
            Training Mode
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Sets the mental frame for every drill. All drills are available in every mode.
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

        {/* About */}
        <div
          className="rounded-2xl border px-4 py-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <p className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>
            About Scam Gym
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            All data stays on your device. Nothing is sent to a server.
            Scam Gym is a personal training tool — not a security product.
            It won&apos;t stop real scams, but it will sharpen your instincts.
          </p>
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
