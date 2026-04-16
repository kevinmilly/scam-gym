# Social Auto-Post Setup Guide

Daily automated pipeline: picks a scam drill → generates comedic image via DALL-E → sends to Telegram for approval → posts to Facebook Page.

---

## Environment Variables

Set all of these in your **Vercel dashboard** (Settings → Environment Variables):

| Variable | How to Get It |
|---|---|
| `OPENAI_API_KEY` | Create at https://platform.openai.com/api-keys |
| `TELEGRAM_BOT_TOKEN` | Message @BotFather on Telegram, run `/newbot`, copy the token |
| `TELEGRAM_CHAT_ID` | Message @userinfobot on Telegram, it replies with your chat ID |
| `TELEGRAM_WEBHOOK_SECRET` | Make up any random string (e.g. `mysecret123xyz`) |
| `FB_PAGE_ACCESS_TOKEN` | See "Facebook Setup" below |
| `FB_PAGE_ID` | See "Facebook Setup" below |
| `KV_REST_API_URL` | Auto-set when you create Upstash Redis (see below) |
| `KV_REST_API_TOKEN` | Auto-set when you create Upstash Redis (see below) |
| `CRON_SECRET` | Vercel provides this automatically for cron routes |

---

## Step-by-Step Setup

### 1. Upstash Redis (State Storage)

1. Go to your Vercel dashboard → **Storage** tab
2. Click **Create** → choose **Upstash Redis**
3. Name it anything (e.g. `scam-gym-kv`)
4. Select the free tier
5. Connect it to your `scam-gym` project
6. `KV_REST_API_URL` and `KV_REST_API_TOKEN` are auto-added to your env vars

### 2. OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new key
3. Add at least $5 credit (DALL-E costs ~$0.04/image)
4. Add the key as `OPENAI_API_KEY` in Vercel

### 3. Telegram Bot

1. Open Telegram and message **@BotFather**
2. Send `/newbot`
3. Choose a name (e.g. "Scam Gym Poster")
4. Choose a username (e.g. `scamgym_poster_bot`)
5. Copy the token → add as `TELEGRAM_BOT_TOKEN` in Vercel
6. Message **@userinfobot** → it replies with your chat ID → add as `TELEGRAM_CHAT_ID`
7. Pick any random string → add as `TELEGRAM_WEBHOOK_SECRET`

### 4. Facebook Page Token

1. Go to https://developers.facebook.com
2. Create a new app (type: Business)
3. Add the **Facebook Login** and **Pages API** products
4. Go to **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
5. Select your app, click **Get Token** → **Get Page Access Token**
6. Grant `pages_manage_posts` and `pages_read_engagement` permissions
7. Copy the Page Access Token → add as `FB_PAGE_ACCESS_TOKEN`
8. Your Page ID is in the page URL (facebook.com/YOUR_PAGE_ID) or in the Graph API Explorer dropdown → add as `FB_PAGE_ID`

**Important:** Page tokens expire in ~60 days. To get a long-lived token:
- Exchange it using the Access Token Debugger: https://developers.facebook.com/tools/debug/accesstoken/
- Click "Extend Access Token"

### 5. Deploy

Push your code to trigger a Vercel deploy. The cron job is configured in `vercel.json`.

### 6. Register Telegram Webhook

After deploying, visit this URL in your browser (replace the placeholders):

```
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://scam-gym.vercel.app/api/telegram-webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>
```

You should see `{"ok":true,"result":true}`.

---

## How It Works

1. **Every day at 2PM UTC**, Vercel cron triggers `/api/cron/daily-post`
2. A random unused scam drill is picked from `data/drills.json`
3. A comedic image prompt + Facebook caption are generated
4. DALL-E 3 creates the image
5. You receive the image + caption on Telegram with 3 buttons:
   - **Approve** → posts to Facebook immediately
   - **Edit Tone** → choose Funny / Serious / Friendly / Newsy / Custom → GPT-4o-mini rewrites the caption → you get it back with Approve/Edit/Reject
   - **Reject** → skips, clears the post

---

## Testing

Trigger the cron manually with curl:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://scam-gym.vercel.app/api/cron/daily-post
```

---

## Cost

| Service | Cost |
|---|---|
| DALL-E 3 | ~$0.04/image/day (~$1.20/month) |
| GPT-4o-mini rewrites | ~$0.001 each (negligible) |
| Upstash Redis | Free tier (3,000 requests/month) |
| Telegram + Facebook APIs | Free |
| **Total** | **~$1.25/month** |
