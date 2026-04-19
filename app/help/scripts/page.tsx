"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tap } from "@/lib/haptics";
import { isPremium } from "@/lib/premium";
import PremiumGate from "@/components/PremiumGate";
import {
  REPLY_SCRIPTS,
  FREE_SCRIPT_COUNT,
  TOTAL_SCRIPT_COUNT,
  type ScriptChannel,
  type ScriptTone,
  type ReplyScript,
} from "@/lib/replyScripts";

const CHANNEL_FILTERS: { value: ScriptChannel | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "sms", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "dm", label: "DM" },
];

export default function ScriptsPage() {
  return (
    <Suspense>
      <ScriptsPageInner />
    </Suspense>
  );
}

function ScriptsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [premium, setPremium] = useState(false);
  const [channelFilter, setChannelFilter] = useState<ScriptChannel | "all">("all");
  const [toneFilter, setToneFilter] = useState<ScriptTone | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [readAloudId, setReadAloudId] = useState<string | null>(null);

  useEffect(() => {
    setPremium(isPremium());
    const ch = searchParams.get("channel");
    if (ch && ["sms", "email", "phone", "dm"].includes(ch)) {
      setChannelFilter(ch as ScriptChannel);
    }
  }, [searchParams]);

  function handleCopy(script: ReplyScript) {
    tap();
    navigator.clipboard.writeText(script.text).then(() => {
      setCopiedId(script.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  const filtered = REPLY_SCRIPTS.filter((s) => {
    if (channelFilter !== "all" && s.channel !== channelFilter) return false;
    if (toneFilter !== "all" && s.tone !== toneFilter) return false;
    return true;
  });

  // Split into free and premium
  const freeScripts = filtered.filter((s) => s.isFree);
  const premiumScripts = filtered.filter((s) => !s.isFree);

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={() => router.back()}
          className="min-h-[44px] px-3 flex items-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          ← Back
        </button>
        <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
          Reply Scripts
        </span>
        <div className="w-12" />
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Counter */}
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {premium
            ? `${TOTAL_SCRIPT_COUNT} scripts available`
            : `${FREE_SCRIPT_COUNT} of ${TOTAL_SCRIPT_COUNT} scripts free`}
        </p>

        {/* Channel filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CHANNEL_FILTERS.map((f) => {
            const active = channelFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => { tap(); setChannelFilter(f.value); }}
                className="px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all"
                style={{
                  borderColor: active ? "var(--accent)" : "var(--border)",
                  background: active ? "rgba(13,31,60,0.15)" : "var(--surface)",
                  color: active ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Tone filter — premium gated */}
        {premium ? (
          <div className="flex gap-2">
            {(["all", "polite", "firm", "nuclear"] as const).map((t) => {
              const active = toneFilter === t;
              const label = t === "all" ? "All tones" : t === "polite" ? "Polite" : t === "firm" ? "Firm" : "Block";
              return (
                <button
                  key={t}
                  onClick={() => { tap(); setToneFilter(t); }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  style={{
                    borderColor: active ? "var(--accent)" : "var(--border)",
                    background: active ? "rgba(13,31,60,0.1)" : "transparent",
                    color: active ? "var(--accent)" : "var(--text-muted)",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <PremiumGate
            label="Tone Filters"
            pitch="Unlock firm and block-level scripts for every scenario."

          >
            <div />
          </PremiumGate>
        )}

        {/* Free scripts */}
        {freeScripts.map((script) => (
          <ScriptCard
            key={script.id}
            script={script}
            copiedId={copiedId}
            expandedId={expandedId}
            readAloudId={readAloudId}
            onCopy={handleCopy}
            onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
            onReadAloud={(id) => setReadAloudId(readAloudId === id ? null : id)}
          />
        ))}

        {/* Premium scripts */}
        {premiumScripts.length > 0 && (
          <>
            {premium ? (
              premiumScripts.map((script) => (
                <ScriptCard
                  key={script.id}
                  script={script}
                  copiedId={copiedId}
                  expandedId={expandedId}
                  readAloudId={readAloudId}
                  onCopy={handleCopy}
                  onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
                  onReadAloud={(id) => setReadAloudId(readAloudId === id ? null : id)}
                />
              ))
            ) : (
              /* Locked peek cards for non-premium */
              premiumScripts.slice(0, 3).map((script) => (
                <PremiumGate
                  key={script.id}
                  label={script.label}
                  pitch={`${script.channel.toUpperCase()} · ${script.tone} tone`}
                  peekContent={script.text}
      
                >
                  <div />
                </PremiumGate>
              ))
            )}
          </>
        )}

        {filtered.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
            No scripts match this filter. Try a different channel.
          </p>
        )}
      </div>

      {/* Read Aloud overlay */}
      {readAloudId && (() => {
        const script = REPLY_SCRIPTS.find((s) => s.id === readAloudId);
        if (!script) return null;
        return (
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8"
            style={{ background: "var(--background)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: "var(--accent)" }}>
              Read This Aloud
            </p>
            <p
              className="text-2xl leading-relaxed text-center font-medium mb-8"
              style={{ color: "var(--text)" }}
            >
              {script.text}
            </p>
            <button
              onClick={() => { tap(); setReadAloudId(null); }}
              className="px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Done
            </button>
          </div>
        );
      })()}
    </div>
  );
}

function ScriptCard({
  script,
  copiedId,
  expandedId,
  readAloudId,
  onCopy,
  onToggleExpand,
  onReadAloud,
}: {
  script: ReplyScript;
  copiedId: string | null;
  expandedId: string | null;
  readAloudId: string | null;
  onCopy: (s: ReplyScript) => void;
  onToggleExpand: (id: string) => void;
  onReadAloud: (id: string) => void;
}) {
  const isCopied = copiedId === script.id;
  const isExpanded = expandedId === script.id;

  return (
    <div
      className="rounded-2xl border px-4 py-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Label + channel badge */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "rgba(13,31,60,0.12)", color: "var(--accent)" }}
        >
          {script.channel.toUpperCase()}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
        >
          {script.tone}
        </span>
      </div>

      <p className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>
        {script.label}
      </p>

      {/* Script text */}
      <div
        className="rounded-xl px-3 py-3 mb-3 text-sm leading-relaxed"
        style={{ background: "var(--surface-2)", color: "var(--text)" }}
      >
        &ldquo;{script.text}&rdquo;
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onCopy(script)}
          className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95"
          style={{
            borderColor: isCopied ? "#22c55e" : "var(--accent)",
            background: isCopied ? "rgba(34,197,94,0.1)" : "rgba(13,31,60,0.1)",
            color: isCopied ? "#22c55e" : "var(--accent)",
          }}
        >
          {isCopied ? "Copied!" : "Copy"}
        </button>

        {script.channel === "phone" && (
          <button
            onClick={() => onReadAloud(script.id)}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            Read Aloud
          </button>
        )}

        <button
          onClick={() => onToggleExpand(script.id)}
          className="min-h-[44px] px-3 py-2 text-xs transition-all"
          style={{ color: "var(--text-muted)" }}
        >
          {isExpanded ? "Hide why ▲" : "Why this works ▼"}
        </button>
      </div>

      {/* Expanded "why" */}
      {isExpanded && (
        <div
          className="mt-3 pt-3 border-t text-xs leading-relaxed"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          {script.whyItWorks}
        </div>
      )}
    </div>
  );
}
