"use client";

import type { Attempt } from "@/lib/types";

type TrendChartProps = {
  attempts: Attempt[];
  windowSize?: number;
};

/**
 * SVG line chart showing rolling accuracy over recent drills.
 * Each point = accuracy of the last `windowSize` drills at that position.
 */
export default function TrendChart({ attempts, windowSize = 5 }: TrendChartProps) {
  if (attempts.length < 3) {
    return (
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        Complete a few more drills to see your accuracy trend.
      </p>
    );
  }

  // Compute rolling accuracy: for each position i, accuracy of drills [i-windowSize+1 .. i]
  const sorted = [...attempts].sort((a, b) => a.timestamp - b.timestamp);
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = sorted.slice(start, i + 1);
    const accuracy = window.filter((a) => a.isCorrect).length / window.length;
    points.push({ x: i, y: accuracy });
  }

  // Only show last 30
  const display = points.slice(-30);
  if (display.length < 2) return null;

  const W = 320;
  const H = 140;
  const PAD_X = 30;
  const PAD_Y = 20;
  const chartW = W - PAD_X * 2;
  const chartH = H - PAD_Y * 2;

  function toSvg(idx: number, val: number): { sx: number; sy: number } {
    const sx = PAD_X + (idx / (display.length - 1)) * chartW;
    const sy = PAD_Y + (1 - val) * chartH;
    return { sx, sy };
  }

  // Build path
  const pathParts = display.map((p, i) => {
    const { sx, sy } = toSvg(i, p.y);
    return `${i === 0 ? "M" : "L"} ${sx} ${sy}`;
  });

  // Y-axis labels
  const yLabels = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ maxHeight: 180 }}
    >
      {/* Grid lines */}
      {yLabels.map((v) => {
        const y = PAD_Y + (1 - v) * chartH;
        return (
          <g key={v}>
            <line
              x1={PAD_X}
              y1={y}
              x2={W - PAD_X}
              y2={y}
              stroke="var(--border)"
              strokeWidth={0.5}
            />
            <text
              x={PAD_X - 4}
              y={y + 3}
              textAnchor="end"
              fontSize={8}
              fill="var(--text-muted)"
            >
              {Math.round(v * 100)}%
            </text>
          </g>
        );
      })}

      {/* Line */}
      <path
        d={pathParts.join(" ")}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {display.map((p, i) => {
        const { sx, sy } = toSvg(i, p.y);
        return (
          <circle
            key={i}
            cx={sx}
            cy={sy}
            r={display.length > 20 ? 1.5 : 2.5}
            fill="var(--accent)"
          />
        );
      })}

      {/* Latest value label */}
      {(() => {
        const last = display[display.length - 1];
        const { sx, sy } = toSvg(display.length - 1, last.y);
        return (
          <text
            x={sx}
            y={sy - 6}
            textAnchor="middle"
            fontSize={9}
            fontWeight="bold"
            fill="var(--accent)"
          >
            {Math.round(last.y * 100)}%
          </text>
        );
      })()}
    </svg>
  );
}
