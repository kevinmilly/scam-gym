import type { Drill } from "@/lib/types";
import MessageCard from "./MessageCard";
import { tap } from "@/lib/haptics";

type Props = {
  drillA: Drill;
  drillB: Drill;
  selected: "A" | "B" | null;
  onSelect: (pick: "A" | "B") => void;
};

export default function ComparisonLayout({ drillA, drillB, selected, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        Which one is the scam?
      </p>

      {/* Message A */}
      <button
        onClick={() => { tap(); onSelect("A"); }}
        className="w-full text-left rounded-2xl border-2 p-1 transition-colors duration-150"
        style={{
          borderColor: selected === "A" ? "var(--danger)" : "var(--border)",
          background: selected === "A" ? "var(--danger-bg)" : "transparent",
        }}
      >
        <div className="flex items-center gap-2 px-3 py-1.5">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background: selected === "A" ? "var(--danger)" : "var(--surface-2)",
              color: selected === "A" ? "#fff" : "var(--text-muted)",
            }}
          >
            A
          </span>
          <span className="text-xs font-semibold" style={{ color: selected === "A" ? "var(--danger)" : "var(--text-muted)" }}>
            Message A
          </span>
        </div>
        <MessageCard drill={drillA} />
      </button>

      {/* Message B */}
      <button
        onClick={() => { tap(); onSelect("B"); }}
        className="w-full text-left rounded-2xl border-2 p-1 transition-colors duration-150"
        style={{
          borderColor: selected === "B" ? "var(--danger)" : "var(--border)",
          background: selected === "B" ? "var(--danger-bg)" : "transparent",
        }}
      >
        <div className="flex items-center gap-2 px-3 py-1.5">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background: selected === "B" ? "var(--danger)" : "var(--surface-2)",
              color: selected === "B" ? "#fff" : "var(--text-muted)",
            }}
          >
            B
          </span>
          <span className="text-xs font-semibold" style={{ color: selected === "B" ? "var(--danger)" : "var(--text-muted)" }}>
            Message B
          </span>
        </div>
        <MessageCard drill={drillB} />
      </button>
    </div>
  );
}
