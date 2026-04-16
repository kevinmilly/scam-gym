# Scam Gym — Marketing Plan (AI-Assisted)

## Core Positioning
**"Train your brain before scammers do."**
Free, 2-minute daily drills. Real scam messages. No signup needed.

Target audiences:
- **Primary:** Adults 50+ who want to protect themselves
- **Secondary:** Adult children worried about aging parents
- **Tertiary:** Caregivers, senior center staff, librarians

---

## Weekly Workflow (Your Time: ~45 min/week)

| Day | Task | Time | AI Role |
|---|---|---|---|
| Monday | Run content batch prompt | 5 min | Generates full week of posts |
| Monday | Paste + schedule in Buffer/Meta | 20 min | You |
| Wednesday | Check Google Alerts, forward 1 headline | 2 min | You find it, AI writes the post |
| Friday | Respond to comments/Reddit threads | 15 min | AI drafts, you post |
| Monthly | Send 2–3 pitch emails | 5 min | AI generates, you personalize name |

---

## Platform Strategy

### 1. Facebook
- **What:** "Spot the scam" challenges, Reels, scam news tie-ins
- **Scheduling:** Meta Business Suite (free) — batch schedule Monday for the week
- **AI handles:** All captions, hooks, post copy

**Prompt to use:**
```
Read data/drills.json and pick 3 drills that would make good
"spot the scam" Facebook challenge posts. For each, write:
- A hook line (curiosity-driven, no spoilers)
- The message text from the drill as a screenshot caption
- A spoiler answer in the comments (ROT13 or hidden)
- A CTA linking to scam-gym.vercel.app
Audience: adults 50+, casual tone, no jargon.
```

---

### 2. YouTube Shorts / TikTok
- **What:** 30–60s screen recordings of drills with voiceover
- **AI handles:** Full script + voiceover text per video
- **You handle:** Screen record on phone, paste into CapCut (auto-captions)

**Prompt to use:**
```
Write a 45-second YouTube Shorts script for Scam Gym.
Pick one drill from data/drills.json that feels realistic and scary.
Format: hook (5s) → show the message → "what would you do?" (10s)
→ reveal red flags one by one → CTA to practice free.
Tone: warm, slightly urgent, like a concerned friend.
```

---

### 3. Reddit
- **Subreddits:** r/Scams, r/AgingParents, r/personalfinance, r/CyberSecurity101
- **Strategy:** Answer real questions authentically, mention Scam Gym naturally
- **AI handles:** Draft responses to threads you find

**Prompt to use:**
```
Here's a Reddit thread about scams: [paste thread text]
Write a helpful, genuine reply that answers their question using
real scam detection advice. Near the end, naturally mention
Scam Gym (scam-gym.vercel.app) as a free practice tool — don't
lead with it. Sound like a knowledgeable person, not a marketer.
```

---

### 4. Nextdoor
- **What:** Community safety post, share as local resource
- **Cadence:** Once/month in your neighborhood + encourage resharing

**Prompt to use:**
```
Write a short Nextdoor post (150 words max) sharing Scam Gym
as a free community resource. Angle: you found this tool and
wanted to share it with neighbors, especially for older relatives.
Warm, neighbor-to-neighbor tone. Include the URL.
```

---

### 5. Pinterest
- **What:** Infographic pins on scam red flags
- **AI handles:** All copy; you paste into a free Canva template

**Prompt to use:**
```
Write copy for 5 Pinterest infographic pins about spotting scams.
Each pin: a bold title (e.g. "5 Red Flags in a Text Message"),
5 bullet points, and a footer CTA to scam-gym.vercel.app.
Keep language simple — audience is non-technical adults 50+.
Topics: text scams, email scams, phone call scams, fake Amazon/IRS,
romance scams.
```

---

## AI Automation Workflows

### Weekly Content Batch (Core Prompt — run every Monday)
```
I run a free scam-awareness training app called Scam Gym
(scam-gym.vercel.app). Read data/drills.json and generate
my content for this week:

1. 3 Facebook "spot the scam" challenge posts (hook + message + hidden answer + CTA)
2. 1 Reddit reply template for r/Scams or r/AgingParents
3. 1 short video script (45s) for YouTube Shorts/TikTok
4. 1 Pinterest pin copy block

Audience: adults 50+, caregivers of elderly parents.
Tone: warm, plain language, no tech jargon.
Vary the scam types across the week — don't repeat patterns.
```

---

### Scam News Tie-In (run when you see a news story)
```
Here's a news headline about a scam: [paste headline or article]

1. Write a Facebook post tying this news to Scam Gym — use the
   real story as the hook, then invite people to practice spotting
   this type of scam for free. Max 150 words.
2. Search data/drills.json for drills that match this scam pattern
   and name the best one to feature.
3. Write a tweet-length version (under 280 chars).
```

---

### Pitch Email Generator (run once, reuse forever)
```
Write 5 outreach email templates for Scam Gym (scam-gym.vercel.app),
a free scam-detection training app. One email each for:
1. Local senior center director
2. Public library digital literacy coordinator
3. AARP local chapter volunteer
4. Local TV news producer (human interest pitch)
5. Church/community newsletter editor

Each email: 3 short paragraphs max. Subject line included.
Tone: friendly, community-minded, not salesy.
Leave [NAME], [ORGANIZATION], [CITY] as fill-in placeholders.
```

---

### Comment Response Drafts (run when people engage)
```
Someone left this comment on my Scam Gym post: [paste comment]

Write a warm, genuine reply that:
- Acknowledges what they said
- Adds one useful tip or insight about scam detection
- Invites them to try a specific drill if relevant
Keep it under 3 sentences. Sound human, not corporate.
```

---

## Free Outreach / Partnership Channels

- **AARP** — Submit to fraud resources page; use Pitch Email prompt #3
- **Public libraries** — Offer free "Scam Awareness" workshop using the app; use prompt #2
- **Senior centers** — Use pitch email prompt #1
- **Local news** — Use pitch email prompt #4; best ROI if it lands
- **Church/community newsletters** — Use pitch email prompt #5; high trust, low competition

---

## Premium Conversion

- Free drills are the hook — let them get invested
- After engagement, surface: *"$9.99 once — less than one scam costs you"*
- Upsell framing for posts: *"The free version trains you. Premium trains your weak spots."*

---

## One-Time Setup (Do This First)

1. **Google Alerts** — set alerts for `"scam"`, `"elder fraud"`, `"phishing 2026"` → delivered to email daily
2. **Buffer or Meta Business Suite** — connect your Facebook page, schedule posts in batches
3. **Canva free account** — use their "Instagram Post" or "Pinterest Pin" templates for visuals
4. **Run the Pitch Email Generator prompt** — save all 5 emails in a doc, ready to personalize and send
