const TONE_INSTRUCTIONS: Record<string, string> = {
  funny:
    "Rewrite this in a humorous, lighthearted tone. Add wit and comedy but keep the scam awareness message clear.",
  serious:
    "Rewrite this in a serious, urgent tone. Emphasize the real danger without being fear-mongering.",
  friendly:
    "Rewrite this in a warm, neighborly tone. Like a friend sharing helpful advice over coffee.",
  newsy:
    "Rewrite this in a news-style tone. Factual, concise, slightly journalistic. Like a brief consumer alert.",
};

export async function rewriteCaption(
  originalCaption: string,
  tone: string,
): Promise<string> {
  const instruction =
    TONE_INSTRUCTIONS[tone] ??
    `Rewrite this in the following tone: ${tone}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            "You rewrite social media captions for a scam awareness app called Scam Gym.",
            "Always preserve the URL https://scam-gym.vercel.app and keep all hashtags.",
            "Keep the caption under 200 words.",
            "Target audience: adults 50+, no tech jargon.",
          ].join(" "),
        },
        {
          role: "user",
          content: `${instruction}\n\nOriginal caption:\n${originalCaption}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI chat error (${res.status}): ${err}`);
  }

  const json = await res.json();
  return json.choices[0].message.content as string;
}
