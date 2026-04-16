export async function postToFacebook(
  imageUrl: string,
  caption: string,
): Promise<string> {
  const pageId = process.env.FB_PAGE_ID;
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${pageId}/photos`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: imageUrl,
        message: caption,
        access_token: accessToken,
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Facebook API error (${res.status}): ${err}`);
  }

  const json = await res.json();
  return json.post_id ?? json.id;
}
