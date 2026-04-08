import type { Drill } from "@/lib/types";
import { Smartphone } from "lucide-react";

type Props = { drill: Drill };

export default function MessageCard({ drill }: Props) {
  const { channel, message } = drill;

  if (channel === "email") {
    return <EmailCard message={message} />;
  }
  if (channel === "sms") {
    return <SmsCard message={message} />;
  }
  return <DmCard message={message} />;
}

function EmailCard({ message }: { message: Drill["message"] }) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Email header */}
      <div
        className="px-4 py-3 border-b"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {message.from_name[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-base truncate" style={{ color: "var(--text)" }}>
              {message.from_name}
            </div>
            <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {message.from_handle}
            </div>
          </div>
        </div>
        {message.subject && (
          <div className="mt-2 font-semibold text-base" style={{ color: "var(--text)" }}>
            {message.subject}
          </div>
        )}
      </div>

      {/* Email body */}
      <div className="px-4 py-4">
        <p
          className="text-base leading-relaxed whitespace-pre-line"
          style={{ color: "var(--text)" }}
        >
          {message.body}
        </p>
      </div>
    </div>
  );
}

function SmsCard({ message }: { message: Drill["message"] }) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* SMS header */}
      <div
        className="px-4 py-3 border-b flex items-center gap-3"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: "#2a2a38", color: "var(--text-muted)" }}
        >
          <Smartphone size={16} strokeWidth={1.75} />
        </div>
        <div>
          <div className="font-semibold text-base" style={{ color: "var(--text)" }}>
            {message.from_name}
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            {message.from_handle}
          </div>
        </div>
      </div>

      {/* SMS bubble */}
      <div className="px-4 py-4">
        <div
          className="inline-block max-w-[85%] px-4 py-3 rounded-2xl rounded-tl-sm text-base leading-relaxed"
          style={{ background: "var(--surface-2)", color: "var(--text)" }}
        >
          {message.body}
        </div>
      </div>
    </div>
  );
}

function DmCard({ message }: { message: Drill["message"] }) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* DM header */}
      <div
        className="px-4 py-3 border-b flex items-center gap-3"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: "#1da1f2", color: "#fff" }}
        >
          {message.from_name[0].toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-base" style={{ color: "var(--text)" }}>
            {message.from_name}
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            {message.from_handle}
          </div>
        </div>
        <div
          className="ml-auto text-xs px-2 py-0.5 rounded-full"
          style={{ background: "var(--border)", color: "var(--text-muted)" }}
        >
          DM
        </div>
      </div>

      {/* DM message */}
      <div className="px-4 py-4">
        <p className="text-base leading-relaxed" style={{ color: "var(--text)" }}>
          {message.body}
        </p>
      </div>
    </div>
  );
}
