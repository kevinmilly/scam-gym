/**
 * Drill generation script
 * Generates 300 new non-standard drills (comparison, spot_flag, thread, preview)
 * Run: node scripts/generate-drills.mjs
 *
 * Rules enforced in prompts:
 * - NO real brands (no Amazon, Google, PayPal, Apple, Chase, Bank of America, etc.)
 * - Use fictional brands only (e.g. NovaMart, Horizon Bank, CoinVault, etc.)
 * - Follow exact JSON schema
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRILLS_PATH = path.join(__dirname, "../data/drills.json");

const client = new Anthropic();

// ─── Target batches ───────────────────────────────────────────────────────────
// Each entry: { type, family, ground_truth, channel, difficulty, count }
// comparison drills come in scam+legit pairs — count = number of pairs
const BATCHES = [
  // ── comparison pairs (60 pairs = 120 drills) ──────────────────────────────
  { type: "comparison", family: "romance_social",         channel: "dm",    difficulty: 3, pairs: 4 },
  { type: "comparison", family: "charity_fraud",          channel: "email", difficulty: 3, pairs: 4 },
  { type: "comparison", family: "prize_lottery",          channel: "sms",   difficulty: 3, pairs: 4 },
  { type: "comparison", family: "qr_code",                channel: "email", difficulty: 4, pairs: 4 },
  { type: "comparison", family: "government_impersonation",channel: "sms",  difficulty: 4, pairs: 4 },
  { type: "comparison", family: "rental_housing",         channel: "email", difficulty: 3, pairs: 4 },
  { type: "comparison", family: "otp_sim_swap",           channel: "sms",   difficulty: 4, pairs: 4 },
  { type: "comparison", family: "payment_reversal",       channel: "email", difficulty: 3, pairs: 4 },
  { type: "comparison", family: "tech_support",           channel: "email", difficulty: 3, pairs: 4 },
  { type: "comparison", family: "account_verification",   channel: "sms",   difficulty: 3, pairs: 4 },
  { type: "comparison", family: "delivery_toll",          channel: "sms",   difficulty: 2, pairs: 4 },
  { type: "comparison", family: "malware_attachment",     channel: "email", difficulty: 4, pairs: 4 },
  { type: "comparison", family: "oauth_consent",          channel: "email", difficulty: 4, pairs: 4 },
  { type: "comparison", family: "deepfake_voice",         channel: "phone", difficulty: 5, pairs: 4 },
  { type: "comparison", family: "marketplace",            channel: "dm",    difficulty: 3, pairs: 4 },

  // ── spot_flag (80 drills) ─────────────────────────────────────────────────
  { type: "spot_flag", family: "job_seeker",              channel: "email", difficulty: 3, count: 8 },
  { type: "spot_flag", family: "marketplace",             channel: "dm",    difficulty: 2, count: 8 },
  { type: "spot_flag", family: "invoice_vendor",          channel: "email", difficulty: 4, count: 8 },
  { type: "spot_flag", family: "romance_social",          channel: "dm",    difficulty: 3, count: 8 },
  { type: "spot_flag", family: "charity_fraud",           channel: "email", difficulty: 3, count: 8 },
  { type: "spot_flag", family: "crypto_wallet",           channel: "dm",    difficulty: 4, count: 8 },
  { type: "spot_flag", family: "qr_code",                 channel: "email", difficulty: 4, count: 8 },
  { type: "spot_flag", family: "subscription_renewal",    channel: "email", difficulty: 3, count: 8 },
  { type: "spot_flag", family: "government_impersonation",channel: "sms",   difficulty: 4, count: 8 },
  { type: "spot_flag", family: "rental_housing",          channel: "email", difficulty: 3, count: 8 },

  // ── thread (60 drills) ────────────────────────────────────────────────────
  { type: "thread", family: "bank_fraud_alert",           channel: "sms",   difficulty: 3, count: 7 },
  { type: "thread", family: "credential_phishing",        channel: "email", difficulty: 3, count: 7 },
  { type: "thread", family: "tech_support",               channel: "dm",    difficulty: 3, count: 7 },
  { type: "thread", family: "government_impersonation",   channel: "sms",   difficulty: 4, count: 7 },
  { type: "thread", family: "charity_fraud",              channel: "dm",    difficulty: 2, count: 7 },
  { type: "thread", family: "rental_housing",             channel: "email", difficulty: 3, count: 7 },
  { type: "thread", family: "prize_lottery",              channel: "dm",    difficulty: 3, count: 7 },
  { type: "thread", family: "romance_social",             channel: "dm",    difficulty: 4, count: 4 },
  { type: "thread", family: "marketplace",                channel: "dm",    difficulty: 2, count: 7 },

  // ── preview (40 drills) ───────────────────────────────────────────────────
  { type: "preview", family: "invoice_vendor",            channel: "email", difficulty: 4, count: 6 },
  { type: "preview", family: "job_seeker",                channel: "email", difficulty: 3, count: 6 },
  { type: "preview", family: "account_verification",      channel: "sms",   difficulty: 3, count: 6 },
  { type: "preview", family: "subscription_renewal",      channel: "email", difficulty: 3, count: 6 },
  { type: "preview", family: "qr_code",                   channel: "email", difficulty: 4, count: 5 },
  { type: "preview", family: "government_impersonation",  channel: "email", difficulty: 4, count: 5 },
  { type: "preview", family: "prize_lottery",             channel: "sms",   difficulty: 2, count: 6 },
];

// ─── Brand rules injected into every prompt ──────────────────────────────────
const BRAND_RULES = `
CRITICAL — FICTIONAL BRANDS ONLY:
Never use real brand names. Use invented names instead. Examples:
- Banks: Horizon Bank, Ridgeline Bank, TrustBank, Granite Credit Union, Apex Federal Credit Union
- Retailers: NovaMart, ShopGuard, TrueVine Market, PulseShop
- Crypto: CoinVault, BitNest, VaultChain, NexCoin
- Shipping: SwiftShip, NexShip, RapidPack, CourierLink
- Tech/Social: BlueSky (social), NexCloud (storage), DataVault (software)
- Government: Use "IRS", "SSA", "USPS" (real gov agencies are fine — scammers impersonate them)
- Charities: Bright Hope Foundation, Children's Relief Fund, Hope Kids Foundation
- Telecom: SignalOne, TrueConnect, LinkMobile
- General companies: Vertex Electronics, Grainger Supply, Summit Analytics

Do NOT use: Amazon, Google, Apple, Microsoft, PayPal, Chase, Bank of America, Wells Fargo,
Coinbase, Facebook, Instagram, Netflix, Spotify, Venmo, Zelle (as sender), eBay, Craigslist,
UPS, FedEx, USPS (as scam sender), DHL, St. Jude, or any other recognizable brand.
`;

// ─── Schema reference ─────────────────────────────────────────────────────────
const SCHEMA_REF = `
Each drill follows this JSON schema:
{
  "id": string,              // unique slug e.g. "thread_dm_romance_005"
  "channel": "sms"|"email"|"dm"|"phone",
  "pattern_family": string, // one of the families listed
  "difficulty": 1|2|3|4|5,
  "ground_truth": "scam"|"legit",
  "ai_amplified": false,
  "drill_type": "thread"|"spot_flag"|"preview"|"comparison",
  "tricks": TrickType[],    // from: urgency, authority_impersonation, secrecy, small_dollar_bait,
                            // advance_fee, credential_harvest, remote_access, callback_trap,
                            // lookalike_domain, trust_then_pivot, emotional_leverage, fear_lockout,
                            // qr_redirect, payment_redirect, social_proof, overconfidence_trap
  "framing": string,        // short scenario framing shown before message e.g. "This just hit your inbox."
  "message": {
    "from_name": string|null,
    "from_handle": string,  // phone number, email, or @handle
    "subject": string|null, // null for sms/dm
    "body": string          // the actual message text (thread drills: use summary like "[Thread starts here...]")
  },
  "red_flags": [{ "id": string, "label": string }],
  "green_flags": [{ "id": string, "label": string }],  // for legit drills
  "correct_red_flag_ids": string[],  // empty array for legit drills
  "explanation": {
    "short": string,        // 1-2 sentence explanation
    "tells": string[],      // 3-5 specific tells
    "safe_move": string,    // what to do
    "consequence": string,  // what happens if you fall for it
    "behavioral_reinforcement": string  // habit to build
  },
  "tags": string[],

  // spot_flag only:
  "spot_flag_options": [{ "id": string, "label": string }],  // 4 options, one is correct
  "spot_flag_correct_id": string,

  // thread only:
  "thread": [{ "sender": "them"|"you", "body": string }],  // 3-5 messages alternating

  // comparison only:
  "comparison_role": "scam"|"legit",
  "paired_drill_id": string   // the id of the paired drill
}
`;

// ─── Prompts per type ─────────────────────────────────────────────────────────

function comparisonPrompt(family, channel, difficulty, pairIndex, existingIds) {
  const scamId = `comp_${family}_scam_gen_${pairIndex.toString().padStart(3, "0")}`;
  const legitId = `comp_${family}_legit_gen_${pairIndex.toString().padStart(3, "0")}`;
  return `You are generating training drills for Scam Gym, a scam-detection training app.

${BRAND_RULES}

${SCHEMA_REF}

Generate ONE comparison pair: a scam drill and a legit drill that look superficially similar but differ in key tells.
The user will see both side-by-side and must identify which one is the scam.

Pattern family: ${family}
Channel: ${channel}
Difficulty: ${difficulty}/5
Scam ID: ${scamId}
Legit ID: ${legitId}

Rules for comparison pairs:
- Both messages must look plausibly similar at first glance (same topic, similar tone)
- The scam should have 2-3 subtle but findable red flags
- The legit version should have clear green flags (short code vs full number, real domain, no link, etc.)
- The legit drill's correct_red_flag_ids must be an empty array []
- The legit drill must have green_flags array

Existing IDs to avoid duplicating: ${existingIds.slice(-20).join(", ")}

Respond with a JSON array containing exactly 2 drills: [scamDrill, legitDrill]
No markdown, no explanation — raw JSON array only.`;
}

function spotFlagPrompt(family, channel, difficulty, startIndex, count, existingIds) {
  return `You are generating training drills for Scam Gym, a scam-detection training app.

${BRAND_RULES}

${SCHEMA_REF}

Generate ${count} spot_flag drills for the following spec:
Pattern family: ${family}
Channel: ${channel}
Difficulty: ${difficulty}/5
IDs should follow pattern: spot_${channel}_${family}_gen_${startIndex.toString().padStart(3,"0")} through _${(startIndex+count-1).toString().padStart(3,"0")}

Rules for spot_flag drills:
- All ground_truth must be "scam"
- spot_flag_options: exactly 4 options. One is the KEY red flag (the most important tell), others are plausible distractors
  - Distractors can be: things that seem suspicious but aren't definitive, or real features of the message that aren't the main red flag
- spot_flag_correct_id: the id of the most important/definitive red flag
- Make the correct answer non-obvious — avoid making urgency/poor grammar the answer every time
- Vary the key tell: sometimes it's the domain, sometimes the request type, sometimes the sender format

Existing IDs to avoid: ${existingIds.slice(-20).join(", ")}

Respond with a JSON array of ${count} drills. No markdown, no explanation — raw JSON array only.`;
}

function threadPrompt(family, channel, difficulty, startIndex, count, existingIds) {
  const scamCount = Math.ceil(count * 0.7);
  const legitCount = count - scamCount;
  return `You are generating training drills for Scam Gym, a scam-detection training app.

${BRAND_RULES}

${SCHEMA_REF}

Generate ${count} thread drills (${scamCount} scam, ${legitCount} legit) for:
Pattern family: ${family}
Channel: ${channel}
Difficulty: ${difficulty}/5
IDs: thread_${channel}_${family}_gen_${startIndex.toString().padStart(3,"0")} through _${(startIndex+count-1).toString().padStart(3,"0")}

Rules for thread drills:
- thread array: 3-5 messages alternating "them" and "you", starting with "them"
- The conversation should feel natural at first, then show red flags
- For scam threads: the pivot to suspicious behavior should happen at message 2 or 3 (not immediately)
- For legit threads: the whole conversation should be normal — no pivot
- message.body should be a brief summary like "[Conversation about scheduling an interview...]"
- The "At which point did it get suspicious?" question will show Message 1, Message 2, Message 3... or "None — seems fine"
- For legit drills: the correct answer is "None — seems fine"
- Distribute: ~${scamCount} scam and ~${legitCount} legit

Existing IDs to avoid: ${existingIds.slice(-20).join(", ")}

Respond with a JSON array of ${count} drills. No markdown, no explanation — raw JSON array only.`;
}

function previewPrompt(family, channel, difficulty, startIndex, count, existingIds) {
  const scamCount = Math.ceil(count * 0.7);
  return `You are generating training drills for Scam Gym, a scam-detection training app.

${BRAND_RULES}

${SCHEMA_REF}

Generate ${count} preview drills (${scamCount} scam, ${count - scamCount} legit) for:
Pattern family: ${family}
Channel: ${channel}
Difficulty: ${difficulty}/5
IDs: preview_${channel}_${family}_gen_${startIndex.toString().padStart(3,"0")} through _${(startIndex+count-1).toString().padStart(3,"0")}

Rules for preview drills:
- The "preview" format shows ONLY sender name + subject/handle first, then reveals the body
- The challenge is: can you guess scam vs legit from just the sender info?
- For email: from_name, from_handle (email address), and subject matter most
- For sms: from_handle (phone number format — scam often uses full number, legit uses short code)
- Make some scam previews look legitimate on the surface (that's the training value)
- For legit drills: message should be genuinely benign, correct_red_flag_ids = []

Existing IDs to avoid: ${existingIds.slice(-20).join(", ")}

Respond with a JSON array of ${count} drills. No markdown, no explanation — raw JSON array only.`;
}

// ─── Generation logic ─────────────────────────────────────────────────────────

async function generateBatch(prompt, batchLabel) {
  console.log(`  Generating: ${batchLabel}...`);
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text.trim();
  // Strip markdown code fences if present
  const jsonText = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();

  try {
    const parsed = JSON.parse(jsonText);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    console.error(`  ✗ JSON parse failed for ${batchLabel}:`, e.message);
    console.error("  Raw:", text.slice(0, 300));
    return [];
  }
}

function validateDrill(d) {
  if (!d.id || !d.channel || !d.pattern_family || !d.ground_truth) return false;
  if (!d.message || !d.explanation) return false;
  if (!Array.isArray(d.red_flags) || !Array.isArray(d.correct_red_flag_ids)) return false;
  return true;
}

function checkNoBrands(d) {
  const REAL_BRANDS = ["Amazon", "Google", "Apple", "Microsoft", "PayPal", "Chase",
    "Bank of America", "Wells Fargo", "Coinbase", "Facebook", "Instagram",
    "Netflix", "Spotify", "Venmo", "eBay", "Craigslist", "UPS", "FedEx", "DHL",
    "St. Jude", "Walmart", "Target", "Best Buy"];
  const text = JSON.stringify(d);
  return REAL_BRANDS.filter(b => text.includes(b));
}

async function main() {
  const drills = JSON.parse(fs.readFileSync(DRILLS_PATH, "utf-8"));
  const existingIds = new Set(drills.map(d => d.id));
  let newDrills = [];
  let totalGenerated = 0;
  let totalSkipped = 0;

  // Track counters per family for ID generation
  const counters = {};
  const getCounter = (key) => {
    counters[key] = (counters[key] || 0) + 1;
    return counters[key];
  };

  for (const batch of BATCHES) {
    const { type, family, channel, difficulty } = batch;

    if (type === "comparison") {
      const pairs = batch.pairs;
      // Generate in groups of 2 pairs per request
      for (let i = 0; i < pairs; i += 2) {
        const allIds = [...existingIds, ...newDrills.map(d => d.id)];
        const pairIdx = getCounter(`comp_${family}`);
        const prompt = comparisonPrompt(family, channel, difficulty, pairIdx, allIds);
        const generated = await generateBatch(prompt, `comparison/${family} pair ${pairIdx}`);

        for (const d of generated) {
          if (!validateDrill(d)) { console.log(`  ✗ Invalid drill skipped: ${d?.id}`); totalSkipped++; continue; }
          const brandIssues = checkNoBrands(d);
          if (brandIssues.length) { console.log(`  ✗ Real brand found in ${d.id}: ${brandIssues.join(", ")}`); totalSkipped++; continue; }
          if (existingIds.has(d.id) || newDrills.find(x => x.id === d.id)) { console.log(`  ✗ Duplicate ID: ${d.id}`); totalSkipped++; continue; }
          newDrills.push(d);
          totalGenerated++;
          console.log(`  ✓ ${d.id}`);
        }

        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 500));
      }
    } else {
      const count = batch.count;
      const startIdx = getCounter(`${type}_${family}`) * count - count + 1;
      const allIds = [...existingIds, ...newDrills.map(d => d.id)];

      let prompt;
      if (type === "spot_flag") prompt = spotFlagPrompt(family, channel, difficulty, startIdx, count, allIds);
      else if (type === "thread") prompt = threadPrompt(family, channel, difficulty, startIdx, count, allIds);
      else if (type === "preview") prompt = previewPrompt(family, channel, difficulty, startIdx, count, allIds);

      const generated = await generateBatch(prompt, `${type}/${family} x${count}`);

      for (const d of generated) {
        if (!validateDrill(d)) { console.log(`  ✗ Invalid drill skipped: ${d?.id}`); totalSkipped++; continue; }
        const brandIssues = checkNoBrands(d);
        if (brandIssues.length) { console.log(`  ✗ Real brand found in ${d.id}: ${brandIssues.join(", ")}`); totalSkipped++; continue; }
        if (existingIds.has(d.id) || newDrills.find(x => x.id === d.id)) { console.log(`  ✗ Duplicate ID: ${d.id}`); totalSkipped++; continue; }
        newDrills.push(d);
        totalGenerated++;
        console.log(`  ✓ ${d.id}`);
      }

      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Append and save
  const updated = [...drills, ...newDrills];
  fs.writeFileSync(DRILLS_PATH, JSON.stringify(updated, null, 2));

  console.log(`\n✅ Done! Generated ${totalGenerated} new drills (${totalSkipped} skipped).`);
  console.log(`📦 Total drills: ${updated.length}`);

  // Print new distribution
  const byType = {};
  updated.forEach(d => { const t = d.drill_type || "standard"; byType[t] = (byType[t] || 0) + 1; });
  Object.entries(byType).sort((a,b) => b[1]-a[1]).forEach(([t,c]) => {
    console.log(`  ${t}: ${c} (${(c/updated.length*100).toFixed(1)}%)`);
  });
}

main().catch(console.error);
