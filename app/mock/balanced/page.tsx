"use client";

/**
 * Balanced palette — navy+warm-neutral chrome (Discover/BoA-style trust)
 * with ONE signature coral accent and decorative curved elements.
 * Gamification colors only on reward/feedback moments.
 * Load at /mock/balanced.
 */

import { Crown, Smartphone, Target, ShieldCheck, Flame, Award, Check, X } from "lucide-react";

const P = {
  // Base
  bg: "#FAF7F2",
  surface: "#FFFFFF",
  surfaceMuted: "#F2EEE7",
  border: "#E4DED2",
  // Type
  text: "#0D1F3C",
  textMuted: "#4A5878",
  textSubtle: "#8A93A8",
  // Primary — deep navy (trust)
  primary: "#0D1F3C",
  primaryHover: "#1A3058",
  primarySubtle: "rgba(13,31,60,0.06)",
  // SIGNATURE accent — coral, Discover-style
  accent: "#F77A0F",
  accentHover: "#E86A00",
  accentSubtle: "rgba(247,122,15,0.08)",
  // Decorative (the Discover arc feel)
  arc: "#5EEAD4",      // muted teal
  arcDeep: "#0F766E",
  // Gamification (reward-only)
  gold: "#C8971A",
  goldBg: "rgba(200,151,26,0.10)",
  flame: "#D9541F",
  flameBg: "rgba(217,84,31,0.10)",
  success: "#2F7A4A",
  successBg: "rgba(47,122,74,0.10)",
  danger: "#B42318",
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

export default function BalancedMockPage() {
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
          <span style={{ fontSize: 13, color: P.textMuted }}>Balanced preview</span>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>
            Scam Gym
          </span>
          <span style={{ width: 80 }} />
        </div>

        {/* ────────── HERO — Discover-style ────────── */}
        <Section title="Home">
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              background: P.primary,
              borderRadius: 16,
              padding: "28px 22px 24px",
              color: "#fff",
            }}
          >
            {/* Decorative arc — the Discover/warmth move */}
            <svg
              viewBox="0 0 400 240"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                right: -60,
                top: -20,
                width: 260,
                height: 260,
                opacity: 0.9,
                pointerEvents: "none",
              }}
            >
              <circle cx="200" cy="120" r="110" stroke={P.arc} strokeWidth="3" fill="none" />
              <circle cx="200" cy="120" r="80" stroke={P.accent} strokeWidth="3" fill="none" opacity="0.7" />
            </svg>

            <div style={{ position: "relative", zIndex: 1, maxWidth: "75%" }}>
              <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 8, letterSpacing: "0.05em" }}>
                TODAY&rsquo;S TRAINING
              </p>
              <p
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  marginBottom: 10,
                }}
              >
                Sharpen your <span style={{ color: P.accent }}>instincts</span>.
              </p>
              <p style={{ fontSize: 13, opacity: 0.78, lineHeight: 1.5, marginBottom: 20 }}>
                One drill takes under a minute.
              </p>
            </div>

            <button
              style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                background: P.accent,
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                padding: "14px 0",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(247,122,15,0.35)",
              }}
            >
              Start Drill →
            </button>
          </div>

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
                  <p style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>12 days</p>
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
                  <p style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>Level 3</p>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        {/* ────────── BoA-STYLE BIG HEADLINE CARD ────────── */}
        <Section title="Featured">
          <Card style={{ padding: 0, overflow: "hidden" }}>
            {/* Photo block — coral bg as stand-in */}
            <div
              style={{
                background: `linear-gradient(135deg, ${P.accent} 0%, #E86A00 100%)`,
                height: 110,
                position: "relative",
              }}
            >
              <svg
                viewBox="0 0 400 110"
                preserveAspectRatio="none"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.3 }}
              >
                <circle cx="340" cy="-20" r="100" stroke="#fff" strokeWidth="2" fill="none" />
                <circle cx="340" cy="-20" r="70" stroke="#fff" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <div style={{ padding: 18 }}>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                Weakness autopilot
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: P.textMuted,
                  lineHeight: 1.55,
                  margin: 0,
                  marginBottom: 16,
                }}
              >
                We spotted your three weakest scam patterns. Train them directly and watch
                your accuracy climb.
              </p>
              <button
                style={{
                  background: P.primary,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "11px 20px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Train my weak spots
              </button>
            </div>
          </Card>
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
              <p style={{ fontWeight: 800, fontSize: 15, color: P.success, margin: 0 }}>
                Correct
              </p>
            </div>
            <p style={{ fontSize: 13, color: P.text, margin: 0, lineHeight: 1.55 }}>
              This was a <strong>phishing attempt</strong> — urgency cue and spoofed sender
              domain are classic signs. <span style={{ color: P.accent, fontWeight: 700 }}>+12 XP</span>
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
              <p style={{ fontWeight: 800, fontSize: 15, color: P.danger, margin: 0 }}>
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
          {/* Upgrade — coral accent, the signature */}
          <Card
            style={{
              padding: 18,
              marginBottom: 10,
              background: P.accentSubtle,
              border: `1px solid ${P.accent}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: P.accent,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Crown size={18} strokeWidth={2} color="#fff" />
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: 14, margin: 0, marginBottom: 2 }}>
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
                padding: "10px 18px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
              }}
            >
              Upgrade to unlock
            </button>
          </Card>

          {/* Install — plain, primary outline button */}
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
                <p style={{ fontWeight: 800, fontSize: 14, margin: 0, marginBottom: 2 }}>
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
                padding: "10px 18px",
                borderRadius: 999,
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
                <p style={{ fontWeight: 800, fontSize: 14, margin: 0, marginBottom: 2 }}>
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
                <p style={{ fontWeight: 800, fontSize: 14, margin: 0, marginBottom: 2 }}>
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
                { label: "Navy", c: P.primary },
                { label: "Coral", c: P.accent },
                { label: "Arc teal", c: P.arc },
                { label: "Gold", c: P.gold },
                { label: "Flame", c: P.flame },
                { label: "Success", c: P.success },
                { label: "Surface", c: P.surface, border: true },
                { label: "BG", c: P.bg, border: true },
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

        {/* Compare row */}
        <div
          style={{
            marginTop: 32,
            padding: 14,
            borderRadius: 12,
            background: P.primarySubtle,
            fontSize: 12,
            color: P.textMuted,
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: P.text }}>Compare:</strong>{" "}
          <a href="/" style={{ color: P.accent, fontWeight: 700 }}>
            / (vibrant)
          </a>{" "}
          ·{" "}
          <a href="/mock" style={{ color: P.accent, fontWeight: 700 }}>
            /mock (restrained)
          </a>{" "}
          ·{" "}
          <span style={{ color: P.text, fontWeight: 700 }}>this (balanced)</span>
        </div>
      </div>
    </div>
  );
}
