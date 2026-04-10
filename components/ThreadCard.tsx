import type { Drill } from "@/lib/types";

type Props = { drill: Drill };

export default function ThreadCard({ drill }: Props) {
  const thread = drill.thread ?? [];
  const { message } = drill;

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center gap-3"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {(message.from_name || "?")[0].toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-base" style={{ color: "var(--text)" }}>
            {message.from_name || message.from_handle}
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            {message.from_handle}
          </div>
        </div>
        <div
          className="ml-auto text-xs px-2 py-0.5 rounded-full"
          style={{ background: "var(--border)", color: "var(--text-muted)" }}
        >
          Thread
        </div>
      </div>

      {/* Messages */}
      <div className="px-4 py-4 space-y-3">
        {thread.map((msg, i) => {
          const isYou = msg.sender === "you";
          return (
            <div
              key={i}
              className={`flex ${isYou ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  isYou ? "rounded-br-sm" : "rounded-bl-sm"
                }`}
                style={{
                  background: isYou ? "var(--accent)" : "var(--surface-2)",
                  color: isYou ? "#fff" : "var(--text)",
                }}
              >
                <p className="whitespace-pre-line">{msg.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
