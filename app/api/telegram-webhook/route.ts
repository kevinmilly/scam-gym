import { NextResponse } from "next/server";
import {
  getPendingPost,
  updatePendingCaption,
  deletePendingPost,
  isAwaitingCustomTone,
  setAwaitingCustomTone,
} from "../../../lib/social/state";
import {
  answerCallbackQuery,
  sendTonePicker,
  sendMessage,
  sendUpdatedPost,
} from "../../../lib/social/telegram";
import { postToFacebook } from "../../../lib/social/facebook";
import { rewriteCaption } from "../../../lib/social/caption-rewriter";

const TONE_MAP: Record<string, string> = {
  tone_funny: "funny",
  tone_serious: "serious",
  tone_friendly: "friendly",
  tone_newsy: "newsy",
};

export async function POST(req: Request) {
  // Validate webhook secret
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Handle inline button callbacks
  if (body.callback_query) {
    const { id: callbackId, data, message } = body.callback_query;
    const chatId = message.chat.id;

    if (data === "approve") {
      const post = await getPendingPost();
      if (!post) {
        await answerCallbackQuery(callbackId, "No pending post found");
        return NextResponse.json({ ok: true });
      }
      try {
        await postToFacebook(post.imageUrl, post.caption);
        await deletePendingPost();
        await setAwaitingCustomTone(false);
        await answerCallbackQuery(callbackId, "Posted to Facebook!");
        await sendMessage(chatId, "Post published to Facebook.");
      } catch (err) {
        console.error("Facebook post failed:", err);
        await answerCallbackQuery(callbackId, "Facebook post failed — check logs");
      }
      return NextResponse.json({ ok: true });
    }

    if (data === "reject") {
      await deletePendingPost();
      await setAwaitingCustomTone(false);
      await answerCallbackQuery(callbackId, "Post rejected");
      await sendMessage(chatId, "Post rejected and cleared.");
      return NextResponse.json({ ok: true });
    }

    if (data === "edit_tone") {
      await answerCallbackQuery(callbackId, "Choose a tone");
      await sendTonePicker(chatId);
      return NextResponse.json({ ok: true });
    }

    if (data === "tone_custom") {
      await setAwaitingCustomTone(true);
      await answerCallbackQuery(callbackId, "Type your tone instruction");
      await sendMessage(chatId, "Type your tone instruction (e.g. 'make it more casual' or 'add more urgency'):");
      return NextResponse.json({ ok: true });
    }

    // Preset tone selection
    if (TONE_MAP[data]) {
      const post = await getPendingPost();
      if (!post) {
        await answerCallbackQuery(callbackId, "No pending post found");
        return NextResponse.json({ ok: true });
      }
      await answerCallbackQuery(callbackId, "Rewriting caption...");
      try {
        const newCaption = await rewriteCaption(post.caption, TONE_MAP[data]);
        await updatePendingCaption(newCaption);
        await sendUpdatedPost(chatId, post.imageUrl, newCaption);
      } catch (err) {
        console.error("Caption rewrite failed:", err);
        await sendMessage(chatId, "Caption rewrite failed — try again or approve as-is.");
      }
      return NextResponse.json({ ok: true });
    }

    // Unknown callback
    await answerCallbackQuery(callbackId, "Unknown action");
    return NextResponse.json({ ok: true });
  }

  // Handle plain text messages (custom tone input)
  if (body.message?.text) {
    const chatId = body.message.chat.id;
    const awaitingCustom = await isAwaitingCustomTone();

    if (awaitingCustom) {
      const post = await getPendingPost();
      if (!post) {
        await sendMessage(chatId, "No pending post to edit.");
        await setAwaitingCustomTone(false);
        return NextResponse.json({ ok: true });
      }

      await setAwaitingCustomTone(false);
      try {
        const newCaption = await rewriteCaption(post.caption, body.message.text);
        await updatePendingCaption(newCaption);
        await sendUpdatedPost(chatId, post.imageUrl, newCaption);
      } catch (err) {
        console.error("Custom rewrite failed:", err);
        await sendMessage(chatId, "Rewrite failed — try again or approve as-is.");
      }
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ ok: true });
}
