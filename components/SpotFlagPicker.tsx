import { Check } from "lucide-react";
import { tap } from "@/lib/haptics";

type Option = { id: string; label: string };

type Props = {
  options: Option[];
  selected: string | null;
  onSelect: (id: string) => void;
};

export default function SpotFlagPicker({ options, selected, onSelect }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
        What&apos;s the first red flag you notice?
      </p>
      <div className="space-y-2">
        {options.map(({ id, label }) => {
          const isSelected = selected === id;
          return (
            <button
              key={id}
              onClick={() => { tap(); onSelect(id); }}
              aria-pressed={isSelected}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors duration-150 active:scale-[0.98]"
              style={{
                borderColor: isSelected ? "var(--accent)" : "var(--border)",
                background: isSelected ? "rgba(124,106,247,0.12)" : "var(--surface)",
              }}
            >
              <div
                className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center"
                style={{
                  borderColor: isSelected ? "var(--accent)" : "var(--border)",
                  background: isSelected ? "var(--accent)" : "transparent",
                }}
              >
                {isSelected && <Check size={12} strokeWidth={3} className="text-white" />}
              </div>
              <span className="text-sm font-medium" style={{ color: isSelected ? "var(--accent)" : "var(--text)" }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
