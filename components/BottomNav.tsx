"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/?from=drill", label: "Home", icon: HomeIcon, match: (p: string) => p === "/" },
  { href: "/drill", label: "Drill", icon: DrillIcon, match: (p: string) => p === "/drill" },
  { href: "/stats", label: "Stats", icon: StatsIcon, match: (p: string) => p === "/stats" },
  { href: "/settings", label: "Settings", icon: SettingsIcon, match: (p: string) => p === "/settings" || p === "/upgrade" || p === "/help" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on session page (immersive) and onboarding
  const hidden = pathname === "/" || pathname === "/session" || pathname === "/offline";
  if (hidden) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", boxShadow: "0 -1px 8px rgba(0,0,0,0.08)" }}
      aria-label="Main navigation"
    >
      <div className="max-w-lg mx-auto flex items-stretch">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] transition-colors duration-150"
              style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
              aria-current={active ? "page" : undefined}
            >
              <Icon active={active} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for iPhone home indicator */}
      <div style={{ height: "env(safe-area-inset-bottom, 0px)", background: "var(--surface)" }} />
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" />
    </svg>
  );
}

function DrillIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3" y="5" width="18" height="14" rx="2"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path d="M8 10h2m0 0l2 2-2 2m0-4h6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="13" width="4" height="8" rx="1" fill="currentColor" fillOpacity={active ? 1 : 0.4} />
      <rect x="10" y="8" width="4" height="13" rx="1" fill="currentColor" fillOpacity={active ? 1 : 0.4} />
      <rect x="17" y="3" width="4" height="18" rx="1" fill="currentColor" fillOpacity={active ? 1 : 0.4} />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
      />
    </svg>
  );
}
