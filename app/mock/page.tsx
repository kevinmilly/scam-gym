"use client";

/**
 * Preview page — compare a Fidelity-style (restrained navy + warm neutral)
 * palette against the current vibrant one. Nothing here touches globals or
 * the live app. Load at /mock.
 */

import { Crown, Smartphone, Target, ShieldCheck, Flame, Award, Check, X } from "lucide-react";

// ── Scoped palette (no globals.css touched) ──────────────────────────────
const P = {
  // Base
  bg: "#FAF7F2",          // warm off-white
  surface: "#FFFFFF",     // pure white cards
  surfaceMuted: "#F2EEE7",// secondary surface
  border: "#E4DED2",      // warm neutral border
  // Type
  text: "#0F2033",        // near-navy, high contrast on warm bg
  textMuted: "#5A6676",   // slate
  textSubtle: "#8A93A3",
  // Primary (trust/finance)
  primary: "#0F2B5C",     // deep navy
  primaryHover: "#1A3A70",
  primarySubtle: "rgba(15,43,92,0.06)",
  // Gamification accents — only show up on rewards/feedback
  gold: "#C8971A",        // medal — earthy, not toy-gold
  goldBg: "rgba(200,151,26,0.10)",
  flame: "#D9541F",       // streak — warm orange, not neon
  flameBg: "rgba(217,84,31,0.10)",
  success: "#2F7A4A",     // correct — forest green
  successBg: "rgba(47,122,74,0.10)",
  danger: "#B42318",      // incorrect — deep red
  dangerBg: "rgba(180,35,24,0.08)",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: P.textSubtle,
          marginBottom: 10,
          paddingLeft: 4,
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: P.surface,
        border: `1px solid ${P.border}`,
        borderRadius: 14,
        padding: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function MockPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: P.bg,
        color: P.text,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "24px 18px 80px" }}>
        {/* Header strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 18,
            marginBottom: 24,
            borderBottom: `1px solid ${P.border}`,
          }}
        >
          <span style={{ fontSize: 13, color: P.textMuted }}>Preview palette</span>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Scam Gym</span>
          <span style={{ width: 80 }} />
        </div>

        {/* ────────── HOME HERO ────────── */}
        <Section title="Home">
          <Card style={{ background: P.primary, border: "none", color: "#fff" }}>
            <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>Today&rsquo;s training</p>
            <p style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, marginBottom: 14 }}>
              Sharpen your scam instincts.
            </p>
            <p style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5, marginBottom: 18 }}>
              One drill takes under a minute. Build confidence the safe way.
            </p>
            <button
              style={{
                width: "100%",
                background: "#fff",
                color: P.primary,
                fontWeight: 700,
                fontSize: 15,
                padding: "14px 0",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
              }}
            >
              Start Drill →
            </button>
          </Card>

          {/* Streak + Tier row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <Card style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: P.flameBg,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Flame size={18} strokeWidth={2} color={P.flame} />
                </span>
                <div>
                  <p style={{ fontSize: 11, color: P.textMuted, margin: 0 }}>Streak</p>
                  <p style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>12 days</p>
                </div>
              </div>
            </Card>
            <Card style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: P.goldBg,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Award size={18} strokeWidth={2} color={P.gold} />
                </span>
                <div>
                  <p style={{ fontSize: 11, color: P.textMuted, margin: 0 }}>Tier</p>
                  <p style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Level 3</p>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        {/* ────────── DRILL RESULT ────────── */}
        <Section title="Drill result — correct">
          <Card
            style={{
              background: P.successBg,
              border: `1px solid ${P.success}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: P.success,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={16} strokeWidth={3} color="#fff" />
              </span>
              <p style={{ fontWeight: 700, fontSize: 15, color: P.success, margin: 0 }}>
                Correct
              </p>
            </div>
            <p style={{ fontSize: 13, color: P.text, margin: 0, lineHeight: 1.55 }}>
              This was a <strong>phishing attempt</strong> — the urgency cue and spoofed
              sender domain are classic signs. +12 XP
            </p>
          </Card>
        </Section>

        <Section title="Drill result — incorrect">
          <Card
            style={{
              background: P.dangerBg,
              border: `1px solid ${P.danger}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: P.danger,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} strokeWidth={3} color="#fff" />
              </span>
              <p style={{ fontWeight: 700, fontSize: 15, color: P.danger, margin: 0 }}>
                Missed it
              </p>
            </div>
            <p style={{ fontSize: 13, color: P.text, margin: 0, lineHeight: 1.55 }}>
              This was <strong>legitimate</strong>. The domain matches and the tone is
              consistent with real bank messages. No penalty — learning is the point.
            </p>
          </Card>
        </Section>

        {/* ────────── SETTINGS SECTIONS ────────── */}
        <Section title="Settings">
          {/* Upgrade — only place gold appears prominently */}
          <Card
            style={{
              padding: 18,
              marginBottom: 10,
              background: P.goldBg,
              border: `1px solid ${P.gold}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: P.gold,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Crown size={18} strokeWidth={2} color="#fff" />
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0, marginBottom: 2 }}>
                  Upgrade to Pro
                </p>
                <p style={{ fontSize: 12, color: P.textMuted, margin: 0, lineHeight: 1.5 }}>
                  Unlock trend charts, focus training, reply scripts, and more.
                </p>
              </div>
            </div>
            <button
              style={{
                background: P.primary,
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
              }}
            >
              Upgrade to unlock
            </button>
          </Card>

          {/* Install — plain card, no tint */}
          <Card style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: P.primarySubtle,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Smartphone size={18} strokeWidth={2} color={P.primary} />
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0, marginBottom: 2 }}>
                  Install Scam Gym
                </p>
                <p style={{ fontSize: 12, color: P.textMuted, margin: 0, lineHeight: 1.5 }}>
                  Add to your home screen for quick access.
                </p>
              </div>
            </div>
            <button
              style={{
                background: "transparent",
                color: P.primary,
                fontSize: 13,
                fontWeight: 700,
                padding: "10px 16px",
                borderRadius: 10,
                border: `1.5px solid ${P.primary}`,
                cursor: "pointer",
              }}
            >
              Install app
            </button>
          </Card>

          {/* Focus Training */}
          <Card style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: P.primarySubtle,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Target size={18} strokeWidth={2} color={P.primary} />
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0, marginBottom: 2 }}>
                  Focus Training
                </p>
                <p style={{ fontSize: 12, color: P.textMuted, margin: 0, lineHeight: 1.5 }}>
                  Pick specific scam families to drill until you master them.
                </p>
              </div>
            </div>
          </Card>

          {/* Trust signal */}
          <Card>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: P.primarySubtle,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={18} strokeWidth={2} color={P.primary} />
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0, marginBottom: 2 }}>
                  Your data stays on your device
                </p>
                <p style={{ fontSize: 12, color: P.textMuted, margin: 0, lineHeight: 1.5 }}>
                  Drill attempts never leave your phone. No account required.
                </p>
              </div>
            </div>
          </Card>
        </Section>

        {/* ────────── PALETTE REFERENCE ────────── */}
        <Section title="Palette">
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {[
                { label: "Primary", c: P.primary },
                { label: "Gold", c: P.gold },
                { label: "Flame", c: P.flame },
                { label: "Success", c: P.success },
                { label: "Danger", c: P.danger },
                { label: "Surface", c: P.surface, border: true },
                { label: "BG", c: P.bg, border: true },
                { label: "Text", c: P.text },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: 8,
                      background: s.c,
                      border: s.border ? `1px solid ${P.border}` : "none",
                      marginBottom: 4,
                    }}
                  />
                  <span style={{ fontSize: 10, color: P.textMuted }}>{s.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </Section>
      </div>
    </div>
  );
}
