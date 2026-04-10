import type { Drill } from "@/lib/types";
import { Bell } from "lucide-react";

type Props = { drill: Drill };

export default function PreviewCard({ drill }: Props) {
  const { message, channel } = drill;
  const preview = message.body.slice(0, 80) + (message.body.length > 80 ? "..." : "");
  const timeAgo = "now";

  const channelLabel = channel === "sms" ? "Messages" : channel === "email" ? "Mail" : "DM";

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Notification bar */}
      <div
        className="px-4 py-2 border-b flex items-center gap-2"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <Bell size={12} strokeWidth={2} style={{ color: "var(--text-muted)" }} />
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {channelLabel}
        </span>
        <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>{timeAgo}</span>
      </div>

      {/* Preview content */}
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {(message.from_name || "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate" style={{ color: "var(--text)" }}>
                {message.from_name || message.from_handle}
              </span>
            </div>
            {message.subject && (
              <p className="text-sm font-medium truncate mt-0.5" style={{ color: "var(--text)" }}>
                {message.subject}
              </p>
            )}
            <p className="text-sm mt-0.5 line-clamp-2" style={{ color: "var(--text-muted)" }}>
              {preview}
            </p>
          </div>
        </div>
      </div>

      {/* Hint */}
      <div
        className="px-4 py-2 border-t text-center"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
          You only see the notification preview. Decide before opening.
        </p>
      </div>
    </div>
  );
}
