import { track } from "./analytics";

const STREAK_KEY = "scamgym_streak";
const VACATION_KEY = "scamgym_vacation_mode";
const MILESTONES = [3, 7, 14, 30, 60, 100];

type StreakData = {
  current: number;
  lastDate: string; // YYYY-MM-DD
  weekStart: string; // YYYY-MM-DD (Monday of current 7-day window)
  freezeUsedAt?: string; // YYYY-MM-DD — date the grace freeze was consumed this window
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function mondayOf(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getUTCDay(); // 0=Sun, 1=Mon…
  const diff = (day === 0 ? -6 : 1 - day);
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function daysApart(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / 86400000
  );
}

export function getStreak(): StreakData {
  if (typeof window === "undefined") return { current: 0, lastDate: "", weekStart: "" };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { current: 0, lastDate: "", weekStart: today() };
    const data = JSON.parse(raw) as StreakData;
    const t = today();
    const yday = yesterday();

    // Already active today
    if (data.lastDate === t) return data;

    // Consecutive yesterday — still live
    if (data.lastDate === yday) return data;

    // Missed exactly one day — check if grace freeze is available this week
    const gap = daysApart(data.lastDate, t);
    if (gap === 2) {
      const wk = data.weekStart ?? mondayOf(data.lastDate);
      const sameWindow = mondayOf(t) === mondayOf(wk) || daysApart(wk, t) < 7;
      if (sameWindow && !data.freezeUsedAt) {
        // Grace applies — streak still alive (not broken yet, waiting for today's drill)
        return { ...data, weekStart: wk };
      }
    }

    // Streak broken
    return { current: 0, lastDate: data.lastDate, weekStart: mondayOf(t) };
  } catch {
    return { current: 0, lastDate: "", weekStart: today() };
  }
}

/** Returns true if the user has already drilled today. */
export function hasTrainedToday(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw) as StreakData;
    return data.lastDate === today();
  } catch {
    return false;
  }
}

/** Call after completing a drill. Returns updated streak count. */
export function updateStreak(): number {
  if (getVacationMode()) return getStreak().current;

  const streak = getStreak();
  const t = today();

  if (streak.lastDate === t) {
    // Already drilled today — no change
    return streak.current;
  }

  let newCount: number;
  let freezeUsedAt: string | undefined = streak.freezeUsedAt;

  if (streak.lastDate === yesterday()) {
    // Consecutive day
    newCount = streak.current + 1;
  } else {
    const gap = daysApart(streak.lastDate || t, t);
    if (gap === 2 && !streak.freezeUsedAt) {
      // Grace freeze consumed — treat as consecutive
      newCount = (streak.current || 0) + 1;
      freezeUsedAt = yesterday();
    } else {
      // Streak broken or first drill
      newCount = 1;
      freezeUsedAt = undefined;
    }
  }

  const updated: StreakData = {
    current: newCount,
    lastDate: t,
    weekStart: streak.weekStart || mondayOf(t),
    freezeUsedAt,
  };
  localStorage.setItem(STREAK_KEY, JSON.stringify(updated));

  if (MILESTONES.includes(newCount)) {
    track("streak_milestone", { days: newCount });
  }

  return newCount;
}

export function getVacationMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(VACATION_KEY) === "1";
}

export function setVacationMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  if (enabled) {
    localStorage.setItem(VACATION_KEY, "1");
  } else {
    localStorage.removeItem(VACATION_KEY);
  }
}
