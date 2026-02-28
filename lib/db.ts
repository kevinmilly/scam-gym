import Dexie, { type Table } from "dexie";
import type { Attempt, ContentFlag } from "./types";

export class ScamGymDB extends Dexie {
  attempts!: Table<Attempt>;
  contentFlags!: Table<ContentFlag>;

  constructor() {
    super("ScamGymDB");
    this.version(1).stores({
      attempts: "id, drillId, timestamp, isCorrect, syncedAt",
      contentFlags: "id, drillId, timestamp, syncedAt",
    });
  }
}

export const db = new ScamGymDB();

// ── Attempt helpers ────────────────────────────────────────────────

export async function saveAttempt(attempt: Attempt): Promise<void> {
  await db.attempts.put(attempt);
}

export async function getAllAttempts(): Promise<Attempt[]> {
  return db.attempts.orderBy("timestamp").toArray();
}

export async function getAttemptsByDrill(drillId: string): Promise<Attempt[]> {
  return db.attempts.where("drillId").equals(drillId).toArray();
}

export async function getRecentAttempts(limit = 20): Promise<Attempt[]> {
  return db.attempts.orderBy("timestamp").reverse().limit(limit).toArray();
}

/** IDs of drills the user has already attempted, most recent first */
export async function getAttemptedDrillIds(): Promise<string[]> {
  const all = await db.attempts.orderBy("timestamp").reverse().toArray();
  // deduplicate while preserving order
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const a of all) {
    if (!seen.has(a.drillId)) {
      seen.add(a.drillId);
      ids.push(a.drillId);
    }
  }
  return ids;
}

// ── ContentFlag helpers ────────────────────────────────────────────

export async function saveContentFlag(flag: ContentFlag): Promise<void> {
  await db.contentFlags.put(flag);
}

// ── Export / Import ────────────────────────────────────────────────

export async function exportData(): Promise<string> {
  const attempts = await db.attempts.toArray();
  const contentFlags = await db.contentFlags.toArray();
  return JSON.stringify({ attempts, contentFlags }, null, 2);
}

export async function importData(json: string): Promise<void> {
  const { attempts, contentFlags } = JSON.parse(json);
  await db.transaction("rw", db.attempts, db.contentFlags, async () => {
    await db.attempts.bulkPut(attempts);
    await db.contentFlags.bulkPut(contentFlags);
  });
}

export async function resetAllData(): Promise<void> {
  await db.transaction("rw", db.attempts, db.contentFlags, async () => {
    await db.attempts.clear();
    await db.contentFlags.clear();
  });
}
