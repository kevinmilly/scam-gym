#!/usr/bin/env tsx
/**
 * Drill validator — run with: npx tsx scripts/validate-drills.ts
 * Checks all drills in data/drills.json for schema integrity.
 */

import * as fs from "fs";
import * as path from "path";

const REQUIRED_FIELDS = [
  "id", "channel", "pattern_family", "difficulty",
  "ground_truth", "message", "red_flags",
  "correct_red_flag_ids", "explanation", "tags",
];
const REQUIRED_MESSAGE_FIELDS = ["from_name", "from_handle", "body"];
const REQUIRED_EXPLANATION_FIELDS = ["short", "tells", "safe_move", "consequence"];
const VALID_CHANNELS = ["sms", "email", "dm"];
const VALID_VERDICTS = ["scam", "legit"];
const VALID_DIFFICULTIES = [1, 2, 3, 4, 5];
const MAX_BODY_LENGTH = 1000;
const MIN_BODY_LENGTH = 20;

type AnyDrill = Record<string, unknown>;

let errors = 0;
let warnings = 0;

function error(drillId: string, msg: string) {
  console.error(`  ❌ [${drillId}] ${msg}`);
  errors++;
}

function warn(drillId: string, msg: string) {
  console.warn(`  ⚠️  [${drillId}] ${msg}`);
  warnings++;
}

function validateDrill(drill: AnyDrill, index: number) {
  const id = (drill.id as string) ?? `drill[${index}]`;

  // Required top-level fields
  for (const field of REQUIRED_FIELDS) {
    if (drill[field] === undefined || drill[field] === null) {
      error(id, `Missing required field: ${field}`);
    }
  }

  // Channel
  if (!VALID_CHANNELS.includes(drill.channel as string)) {
    error(id, `Invalid channel: "${drill.channel}". Must be: ${VALID_CHANNELS.join(", ")}`);
  }

  // Ground truth
  if (!VALID_VERDICTS.includes(drill.ground_truth as string)) {
    error(id, `Invalid ground_truth: "${drill.ground_truth}". Must be: ${VALID_VERDICTS.join(", ")}`);
  }

  // Difficulty
  if (!VALID_DIFFICULTIES.includes(drill.difficulty as number)) {
    error(id, `Invalid difficulty: ${drill.difficulty}. Must be 1–5.`);
  }

  // Message fields
  if (drill.message && typeof drill.message === "object") {
    const msg = drill.message as Record<string, unknown>;
    for (const field of REQUIRED_MESSAGE_FIELDS) {
      if (!msg[field]) error(id, `Missing message.${field}`);
    }
    const body = msg.body as string;
    if (body) {
      if (body.length < MIN_BODY_LENGTH) warn(id, `message.body is very short (${body.length} chars)`);
      if (body.length > MAX_BODY_LENGTH) error(id, `message.body too long (${body.length} chars, max ${MAX_BODY_LENGTH})`);
    }
  }

  // Red flags
  const redFlags = (drill.red_flags as { id: string; label: string }[]) ?? [];
  const redFlagIds = new Set(redFlags.map((f) => f.id));
  for (const rf of redFlags) {
    if (!rf.id) error(id, "Red flag missing id");
    if (!rf.label) error(id, "Red flag missing label");
  }

  // correct_red_flag_ids reference valid red_flags
  const correctIds = (drill.correct_red_flag_ids as string[]) ?? [];
  for (const cid of correctIds) {
    if (!redFlagIds.has(cid)) {
      error(id, `correct_red_flag_ids contains "${cid}" which is not in red_flags`);
    }
  }

  // Legit drills should have empty correct_red_flag_ids
  if (drill.ground_truth === "legit" && correctIds.length > 0) {
    warn(id, `Legit drill has ${correctIds.length} correct_red_flag_ids — expected empty array`);
  }

  // Scam drills should have at least one correct red flag
  if (drill.ground_truth === "scam" && correctIds.length === 0) {
    warn(id, `Scam drill has no correct_red_flag_ids — users can't learn what to look for`);
  }

  // Explanation fields
  if (drill.explanation && typeof drill.explanation === "object") {
    const exp = drill.explanation as Record<string, unknown>;
    for (const field of REQUIRED_EXPLANATION_FIELDS) {
      if (!exp[field]) error(id, `Missing explanation.${field}`);
    }
    const tells = exp.tells as unknown[];
    if (!Array.isArray(tells) || tells.length < 2) {
      warn(id, `explanation.tells should have at least 2 items`);
    }
  }

  // Tags
  const tags = drill.tags as string[];
  if (!Array.isArray(tags) || tags.length === 0) {
    warn(id, `No tags defined`);
  }
}

function main() {
  const drillsPath = path.join(process.cwd(), "data", "drills.json");

  if (!fs.existsSync(drillsPath)) {
    console.error(`❌ Cannot find data/drills.json at ${drillsPath}`);
    process.exit(1);
  }

  let drills: AnyDrill[];
  try {
    drills = JSON.parse(fs.readFileSync(drillsPath, "utf-8"));
  } catch (e) {
    console.error("❌ Failed to parse drills.json:", e);
    process.exit(1);
  }

  if (!Array.isArray(drills)) {
    console.error("❌ drills.json must be a JSON array");
    process.exit(1);
  }

  console.log(`\nValidating ${drills.length} drills…\n`);

  // Check for duplicate IDs
  const ids = drills.map((d) => d.id as string);
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) error(id, `Duplicate ID`);
    seen.add(id);
  }

  // Validate each drill
  drills.forEach((drill, i) => validateDrill(drill, i));

  // Content balance report
  const scamCount = drills.filter((d) => d.ground_truth === "scam").length;
  const legitCount = drills.filter((d) => d.ground_truth === "legit").length;
  const ratio = scamCount / drills.length;

  console.log("\n── Content balance ─────────────────────────");
  console.log(`  Scam:  ${scamCount} (${Math.round(ratio * 100)}%)`);
  console.log(`  Legit: ${legitCount} (${Math.round((1 - ratio) * 100)}%)`);
  if (ratio < 0.55 || ratio > 0.70) {
    warn("content", `Scam/legit ratio is ${Math.round(ratio * 100)}% — target 60–65% scam`);
  }

  // Channel distribution
  const channelCounts: Record<string, number> = {};
  for (const d of drills) {
    const ch = d.channel as string;
    channelCounts[ch] = (channelCounts[ch] ?? 0) + 1;
  }
  console.log("\n── Channel distribution ────────────────────");
  for (const [ch, count] of Object.entries(channelCounts)) {
    console.log(`  ${ch}: ${count}`);
  }

  // Family coverage
  const families = new Set(drills.map((d) => d.pattern_family as string));
  console.log(`\n── Pattern families (${families.size}) ─────────────────`);
  for (const f of families) {
    const count = drills.filter((d) => d.pattern_family === f).length;
    const hasLegit = drills.some((d) => d.pattern_family === f && d.ground_truth === "legit");
    console.log(`  ${f}: ${count} drills ${hasLegit ? "" : "⚠️  NO LEGIT TWIN"}`);
  }

  // Summary
  console.log("\n────────────────────────────────────────────");
  if (errors === 0 && warnings === 0) {
    console.log(`✅ All ${drills.length} drills valid — no errors or warnings.\n`);
  } else {
    if (errors > 0) console.log(`❌ ${errors} error(s) found`);
    if (warnings > 0) console.log(`⚠️  ${warnings} warning(s) found`);
    console.log();
    if (errors > 0) process.exit(1);
  }
}

main();
