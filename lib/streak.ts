import { track } from "./analytics";

const STREAK_KEY = "scamgym_streak";
const MILESTONES = [3, 7, 14, 30, 60, 100];

type StreakData = {
  current: number;
  lastDate: string; // YYYY-MM-DD
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function getStreak(): StreakData {
  if (typeof window === "undefined") return { current: 0, lastDate: "" };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { current: 0, lastDate: "" };
    const data = JSON.parse(raw) as StreakData;
    // If last date is before yesterday, streak has lapsed
    if (data.lastDate < yesterday()) {
      return { current: 0, lastDate: data.lastDate };
    }
    return data;
  } catch {
    return { current: 0, lastDate: "" };
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
  const streak = getStreak();
  const t = today();

  if (streak.lastDate === t) {
    // Already drilled today — no change
    return streak.current;
  }

  let newCount: number;
  if (streak.lastDate === yesterday()) {
    // Consecutive day
    newCount = streak.current + 1;
  } else {
    // Streak broken or first drill
    newCount = 1;
  }

  const updated: StreakData = { current: newCount, lastDate: t };
  localStorage.setItem(STREAK_KEY, JSON.stringify(updated));

  if (MILESTONES.includes(newCount)) {
    track("streak_milestone", { days: newCount });
  }

  return newCount;
}
