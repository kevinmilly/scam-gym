import { NextResponse } from "next/server";
import drills from "../../../../data/drills.json";
import { Drill } from "../../../../lib/types";
import { generateImagePrompt, generateCaption } from "../../../../lib/social/prompt-templates";
import { generateImage } from "../../../../lib/social/image-gen";
import { sendApprovalMessage } from "../../../../lib/social/telegram";
import {
  getPendingPost,
  setPendingPost,
  getUsedDrillIds,
  markDrillUsed,
  resetUsedDrills,
} from "../../../../lib/social/state";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Don't overwrite a pending post
  const existing = await getPendingPost();
  if (existing) {
    return NextResponse.json({ message: "Pending post already exists, skipping" });
  }

  // Pick an unused drill
  const allDrills = drills as Drill[];
  const scamDrills = allDrills.filter((d) => d.ground_truth === "scam");
  const usedIds = await getUsedDrillIds();
  let available = scamDrills.filter((d) => !usedIds.includes(d.id));

  if (available.length === 0) {
    await resetUsedDrills();
    available = scamDrills;
  }

  const drill = available[Math.floor(Math.random() * available.length)];

  // Generate image + caption
  const imagePrompt = generateImagePrompt(drill);
  const caption = generateCaption(drill);

  let imageUrl: string;
  try {
    imageUrl = await generateImage(imagePrompt);
  } catch (err) {
    console.error("DALL-E failed:", err);
    return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
  }

  // Store pending post
  await setPendingPost({
    drillId: drill.id,
    imageUrl,
    caption,
    createdAt: Date.now(),
  });
  await markDrillUsed(drill.id);

  // Send to Telegram for approval
  try {
    await sendApprovalMessage(imageUrl, caption);
  } catch (err) {
    console.error("Telegram send failed:", err);
    return NextResponse.json({ error: "Telegram send failed" }, { status: 500 });
  }

  return NextResponse.json({ message: "Post sent for approval", drillId: drill.id });
}
