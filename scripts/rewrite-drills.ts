/**
 * Rewrites drills.json explanation fields using Claude API.
 *
 * Three changes applied to every drill:
 *   1. TELLS — pattern-based language instead of fictional-company-specific assertions
 *   2. SAFE_MOVE — general guidance, no fictional URLs or phone numbers
 *   3. CONSEQUENCE / TELLS — hedged language ("could", "may") instead of absolutes
 *
 * Plus for legit drills:
 *   4. GREEN_FLAGS — new array explaining why the message is trustworthy
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx scripts/rewrite-drills.ts
 *
 * Creates data/drills.backup.json before writing.
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const DRILLS_PATH = path.join(process.cwd(), "data/drills.json");
const BATCH_SIZE = 8;

const SYSTEM_PROMPT = `You rewrite explanation fields for scam-detection training drills.

These drills use FICTIONAL companies (e.g. SwiftShip, QuikPass, NationPost, TrueBank) as stand-ins for real services. The drill message content stays fictional — do NOT change it. But explanations must NOT treat fictional companies as real or verifiable entities.

RULES:

1. TELLS — Make pattern-based, not company-specific:
   BEFORE: "SwiftShip communicates via short codes, not random 10-digit numbers"
   AFTER:  "Legitimate shipping carriers communicate via short codes, not random 10-digit numbers"
   BEFORE: "QuikPass never demands payment in 30 minutes via a text link"
   AFTER:  "Government toll services never demand payment via urgency timers in unsolicited text links"

2. SAFE_MOVE — Remove all fictional URLs and phone numbers. Give general, actionable guidance:
   BEFORE: "Go to swiftship.com directly. Call SwiftShip at 1-800-555-0400 if you have concerns."
   AFTER:  "Go directly to the carrier's official website by searching for it — never use any URL or contact number from the message itself."

3. CONSEQUENCE and TELLS — Soften absolute language to hedged language:
   BEFORE: "Calling the number leads to scammers who install remote-access software."
   AFTER:  "Calling this type of number could connect you to scammers who may instruct you to install remote-access software."
   BEFORE: "This link will steal your credentials."
   AFTER:  "This type of link is commonly designed to harvest your login credentials."
   Words to soften: "leads to" → "could lead to", "will" → "may/could", "steals" → "is designed to steal", "gives" → "could give"

4. SHORT — Only change if it directly names a fictional company as if it's a real verifiable entity. Otherwise keep unchanged.

5. BEHAVIORAL_REINFORCEMENT — Keep unchanged unless it contains a fictional company name or URL.

6. GREEN_FLAGS (legit drills only, where ground_truth === "legit") — Add a green_flags array with 2–4 items explaining why the message is trustworthy. Format: [{id: "snake_case_id", label: "Short readable label"}].
   Good green flag examples:
   - {id: "official_short_code", label: "Sent from official short code"}
   - {id: "no_payment_request", label: "No payment or fee requested"}
   - {id: "links_to_official_domain", label: "Links to official domain only"}
   - {id: "no_urgency", label: "No pressure or urgency tactics"}
   - {id: "includes_tracking_number", label: "Includes verifiable tracking number"}
   - {id: "standard_service_notification", label: "Standard service notification format"}
   - {id: "proper_sender_format", label: "Proper business sender format"}
   - {id: "no_credential_request", label: "No login or personal info requested"}
   - {id: "no_unusual_action_required", label: "No unusual action required"}
   Base the green flags on the actual message body and from_handle provided.

OUTPUT: Return ONLY a valid JSON array. No markdown fences, no explanation text. Each element:
{
  "id": "<drill id>",
  "explanation": {
    "short": "...",
    "tells": ["...", "..."],
    "safe_move": "...",
    "consequence": "...",
    "behavioral_reinforcement": "..."
  },
  "green_flags": [{"id": "...", "label": "..."}]   // only include for legit drills
}`;

type DrillInput = {
  id: string;
  ground_truth: string;
  from_name: string;
  from_handle: string;
  message_body: string;
  explanation: {
    short: string;
    tells: string[];
    safe_move: string;
    consequence: string;
    behavioral_reinforcement: string;
  };
};

type RewrittenDrill = {
  id: string;
  explanation: {
    short: string;
    tells: string[];
    safe_move: string;
    consequence: string;
    behavioral_reinforcement: string;
  };
  green_flags?: { id: string; label: string }[];
};

async function rewriteBatch(drills: DrillInput[]): Promise<RewrittenDrill[]> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Rewrite these ${drills.length} drills following all rules:\n\n${JSON.stringify(drills, null, 2)}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("Raw response:", text.slice(0, 500));
    throw new Error("No JSON array found in response");
  }
  return JSON.parse(jsonMatch[0]) as RewrittenDrill[];
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY environment variable is not set.");
    process.exit(1);
  }

  const drills = JSON.parse(fs.readFileSync(DRILLS_PATH, "utf-8")) as Record<string, unknown>[];
  console.log(`Loaded ${drills.length} drills.`);

  // Backup
  const backupPath = DRILLS_PATH.replace(".json", ".backup.json");
  fs.writeFileSync(backupPath, JSON.stringify(drills, null, 2));
  console.log(`Backup saved to ${backupPath}`);

  const allResults: RewrittenDrill[] = [];
  const totalBatches = Math.ceil(drills.length / BATCH_SIZE);

  for (let i = 0; i < drills.length; i += BATCH_SIZE) {
    const batch = drills.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    console.log(`Processing batch ${batchNum}/${totalBatches} (drills ${i + 1}–${Math.min(i + BATCH_SIZE, drills.length)})...`);

    const inputs: DrillInput[] = batch.map((d) => {
      const msg = d.message as { from_name: string; from_handle: string; body: string };
      const exp = d.explanation as DrillInput["explanation"];
      return {
        id: d.id as string,
        ground_truth: d.ground_truth as string,
        from_name: msg.from_name,
        from_handle: msg.from_handle,
        message_body: msg.body,
        explanation: exp,
      };
    });

    try {
      const results = await rewriteBatch(inputs);
      allResults.push(...results);
      console.log(`  ✓ Batch ${batchNum} done (${results.length} drills rewritten)`);
    } catch (err) {
      console.error(`  ✗ Batch ${batchNum} failed:`, err);
      console.error("  Keeping original data for this batch.");
      // Push originals as fallback so merge still works
      allResults.push(
        ...inputs.map((d) => ({ id: d.id, explanation: d.explanation }))
      );
    }

    // Rate limit buffer between batches
    if (i + BATCH_SIZE < drills.length) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  // Merge rewritten fields back into original drills
  const resultsMap = new Map(allResults.map((r) => [r.id, r]));
  const updated = drills.map((d) => {
    const r = resultsMap.get(d.id as string);
    if (!r) return d;
    const merged: Record<string, unknown> = { ...d, explanation: r.explanation };
    if (r.green_flags && r.green_flags.length > 0) {
      merged.green_flags = r.green_flags;
    }
    return merged;
  });

  fs.writeFileSync(DRILLS_PATH, JSON.stringify(updated, null, 2));
  console.log(`\nDone! Rewrote ${allResults.length}/${drills.length} drills.`);
  console.log(`Original saved at: ${backupPath}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
