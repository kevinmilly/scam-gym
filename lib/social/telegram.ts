const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function telegramPost(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${TELEGRAM_API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram ${method} error (${res.status}): ${err}`);
  }
  return res.json();
}

export async function sendApprovalMessage(
  imageUrl: string,
  caption: string,
): Promise<void> {
  const truncatedCaption =
    caption.length > 1024 ? caption.slice(0, 1020) + "..." : caption;

  await telegramPost("sendPhoto", {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    photo: imageUrl,
    caption: truncatedCaption,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Approve", callback_data: "approve" },
          { text: "Edit Tone", callback_data: "edit_tone" },
          { text: "Reject", callback_data: "reject" },
        ],
      ],
    },
  });
}

export async function sendTonePicker(chatId: string | number): Promise<void> {
  await telegramPost("sendMessage", {
    chat_id: chatId,
    text: "Pick a tone for the caption:",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Funny", callback_data: "tone_funny" },
          { text: "Serious", callback_data: "tone_serious" },
          { text: "Friendly", callback_data: "tone_friendly" },
        ],
        [
          { text: "Newsy", callback_data: "tone_newsy" },
          { text: "Custom", callback_data: "tone_custom" },
        ],
      ],
    },
  });
}

export async function sendMessage(
  chatId: string | number,
  text: string,
): Promise<void> {
  await telegramPost("sendMessage", {
    chat_id: chatId,
    text,
  });
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text: string,
): Promise<void> {
  await telegramPost("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  });
}

export async function sendUpdatedPost(
  chatId: string | number,
  imageUrl: string,
  caption: string,
): Promise<void> {
  const truncatedCaption =
    caption.length > 1024 ? caption.slice(0, 1020) + "..." : caption;

  await telegramPost("sendPhoto", {
    chat_id: chatId,
    photo: imageUrl,
    caption: `[UPDATED]\n\n${truncatedCaption}`,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Approve", callback_data: "approve" },
          { text: "Edit Tone", callback_data: "edit_tone" },
          { text: "Reject", callback_data: "reject" },
        ],
      ],
    },
  });
}
