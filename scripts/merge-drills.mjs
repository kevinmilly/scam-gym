#!/usr/bin/env node
/**
 * merge-drills.mjs — merge one or more batch files into data/drills.json
 * Usage: node scripts/merge-drills.mjs data/drills-batch.json [data/drills-batch2.json ...]
 *
 * What it does:
 *   1. Loads existing drills.json
 *   2. Loads each batch file passed as arguments
 *   3. Skips any drills whose ID already exists
 *   4. Appends new drills and saves drills.json
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const cwd = process.cwd();
const drillsPath = resolve(cwd, "data/drills.json");

const batchFiles = process.argv.slice(2);
if (batchFiles.length === 0) {
  console.error("Usage: node scripts/merge-drills.mjs <batch-file> [...]");
  process.exit(1);
}

const existing = JSON.parse(readFileSync(drillsPath, "utf8"));
const existingIds = new Set(existing.map((d) => d.id));

let added = 0;
let skipped = 0;

for (const file of batchFiles) {
  const batch = JSON.parse(readFileSync(resolve(cwd, file), "utf8"));
  for (const drill of batch) {
    if (existingIds.has(drill.id)) {
      console.log(`  SKIP (duplicate ID): ${drill.id}`);
      skipped++;
    } else {
      existing.push(drill);
      existingIds.add(drill.id);
      added++;
    }
  }
  console.log(`Processed: ${file}`);
}

writeFileSync(drillsPath, JSON.stringify(existing, null, 2), "utf8");
console.log(`\nDone: +${added} drills added, ${skipped} skipped.`);
console.log(`Total drills: ${existing.length}`);
console.log(`\nRun validation: npx tsx scripts/validate-drills.ts`);
