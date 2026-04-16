import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export type PendingPost = {
  drillId: string;
  imageUrl: string;
  caption: string;
  createdAt: number;
};

// --- Pending post ---

export async function getPendingPost(): Promise<PendingPost | null> {
  return redis.get<PendingPost>("pending_post");
}

export async function setPendingPost(post: PendingPost): Promise<void> {
  await redis.set("pending_post", post, { ex: 86400 }); // 24h TTL
}

export async function updatePendingCaption(caption: string): Promise<void> {
  const post = await getPendingPost();
  if (!post) return;
  await setPendingPost({ ...post, caption });
}

export async function deletePendingPost(): Promise<void> {
  await redis.del("pending_post");
}

// --- Used drill tracking ---

export async function getUsedDrillIds(): Promise<string[]> {
  return redis.smembers("used_drill_ids");
}

export async function markDrillUsed(id: string): Promise<void> {
  await redis.sadd("used_drill_ids", id);
}

export async function resetUsedDrills(): Promise<void> {
  await redis.del("used_drill_ids");
}

// --- Custom tone awaiting flag ---

export async function isAwaitingCustomTone(): Promise<boolean> {
  const val = await redis.get<boolean>("awaiting_custom_tone");
  return val === true;
}

export async function setAwaitingCustomTone(value: boolean): Promise<void> {
  if (value) {
    await redis.set("awaiting_custom_tone", true, { ex: 3600 }); // 1h TTL
  } else {
    await redis.del("awaiting_custom_tone");
  }
}
