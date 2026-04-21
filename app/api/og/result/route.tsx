import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const score = parseInt(searchParams.get("score") ?? "0", 10);
  const total = parseInt(searchParams.get("total") ?? "10", 10);
  const type = searchParams.get("type") ?? "quiz"; // "quiz" | "result"
  const pct = Math.round((score / total) * 100);

  const tierLabel =
    pct >= 90 ? "Expert Scam Spotter" :
    pct >= 70 ? "Sharp Eye" :
    pct >= 50 ? "Getting There" :
    "Keep Practicing";

  const accentColor = "#f77a0f"; // coral/signature
  const navy = "#0d1f3c";
  const bg = "#faf7f2";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          position: "relative",
          padding: "60px",
        }}
      >
        {/* Accent top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: accentColor,
          }}
        />

        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          {/* Shield SVG */}
          <svg width="48" height="48" viewBox="0 0 512 512">
            <path d="M256 28 L460 120 C460 120 468 320 256 484 C44 320 52 120 52 120 Z" fill="#7c6af7"/>
            <path d="M192 260 L232 310 L328 200" fill="none" stroke="#fff" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: "32px", fontWeight: "700", color: navy, letterSpacing: "-0.02em" }}>
            Scam Gym
          </span>
        </div>

        {/* Score */}
        <div
          style={{
            fontSize: "120px",
            fontWeight: "900",
            color: accentColor,
            lineHeight: 1,
            marginBottom: "12px",
            letterSpacing: "-0.04em",
          }}
        >
          {score}/{total}
        </div>

        {/* Tier label */}
        <div
          style={{
            fontSize: "36px",
            fontWeight: "700",
            color: navy,
            marginBottom: "24px",
          }}
        >
          {tierLabel}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "26px",
            color: "#4a5568",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          {type === "quiz"
            ? "I scored on the Scam IQ quiz — can you beat me?"
            : "Scam Gym tracks not just whether you got it right, but how sure you were."}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "22px",
            color: accentColor,
            fontWeight: "600",
          }}
        >
          scamgym.com/quiz
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
