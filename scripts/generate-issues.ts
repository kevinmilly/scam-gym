/**
 * generate-issues.ts
 *
 * Reads playwright-report/results.json after a test run,
 * sends all failures to Claude, and writes ISSUES.md —
 * a structured fix list ready for Claude Code to act on.
 *
 * Usage:
 *   npm run issues
 *   (or: npx tsx scripts/generate-issues.ts)
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, relative } from "path";

// Load .env.local if present (Next.js convention)
const envLocalPath = join(__dirname, "..", ".env.local");
if (existsSync(envLocalPath)) {
  for (const line of readFileSync(envLocalPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue; // skip blank lines and comments
    const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
  }
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "\n❌  ANTHROPIC_API_KEY not set.\n" +
    "   Add it to .env.local:\n" +
    "     ANTHROPIC_API_KEY=sk-ant-...\n" +
    "   Or set it in your shell before running:\n" +
    "     set ANTHROPIC_API_KEY=sk-ant-...   (Windows)\n" +
    "     export ANTHROPIC_API_KEY=sk-ant-... (Mac/Linux)\n"
  );
  process.exit(1);
}

const ROOT = join(__dirname, "..");
const RESULTS_PATH = join(ROOT, "playwright-report", "results.json");
const OUTPUT_PATH = join(ROOT, "ISSUES.md");

// ── Types matching Playwright's JSON reporter output ──────────────────────────

type PWStatus = "passed" | "failed" | "timedOut" | "skipped" | "interrupted";

interface PWError {
  message?: string;
  stack?: string;
  value?: string;
}

interface PWStep {
  title: string;
  error?: PWError;
  steps?: PWStep[];
}

interface PWResult {
  status: PWStatus;
  errors: PWError[];
  steps: PWStep[];
  attachments: { name: string; path?: string; contentType: string }[];
  duration: number;
  retry: number;
}

interface PWTest {
  projectName: string;
  status: string;
  results: PWResult[];
}

interface PWTestCase {
  title: string;
  ok: boolean;
  tests: PWTest[];
  file?: string;
}

interface PWSuite {
  title: string;
  file?: string;
  specs?: PWTestCase[];
  suites?: PWSuite[];
}

interface PWReport {
  stats: {
    expected: number;
    skipped: number;
    unexpected: number;
    flaky: number;
    duration: number;
  };
  suites: PWSuite[];
}

// ── Collect all failed tests recursively ─────────────────────────────────────

interface FailedTest {
  file: string;
  suite: string;
  title: string;
  fullTitle: string;
  error: string;
  screenshotPath?: string;
}

function collectFailures(
  suites: PWSuite[],
  parentFile = "",
  parentSuite = ""
): FailedTest[] {
  const failures: FailedTest[] = [];

  for (const suite of suites) {
    const file = suite.file ?? parentFile;
    const suiteName = [parentSuite, suite.title].filter(Boolean).join(" › ");

    // Recurse into nested suites
    if (suite.suites?.length) {
      failures.push(...collectFailures(suite.suites, file, suiteName));
    }

    // Check specs (individual test cases)
    for (const spec of suite.specs ?? []) {
      if (spec.ok) continue;

      // specs have a `tests` array (one per project/browser), each with `results`
      // Pick the last result from any browser that failed
      let lastResult: PWResult | undefined;
      for (const t of spec.tests ?? []) {
        const r = t.results[t.results.length - 1];
        if (r && r.status === "failed") { lastResult = r; break; }
      }
      if (!lastResult) {
        // fall back to first test's last result
        const t = (spec.tests ?? [])[0];
        lastResult = t?.results[t.results.length - 1];
      }
      if (!lastResult) continue;

      // Grab the most informative error message (prefer singular `error`, fall back to `errors[]`)
      const errorLines: string[] = [];
      const singular = (lastResult as unknown as { error?: PWError }).error;
      if (singular?.message) {
        errorLines.push(singular.message);
      } else {
        for (const err of lastResult.errors ?? []) {
          if (err.message) errorLines.push(err.message);
          else if (err.value) errorLines.push(err.value);
        }
      }
      const raw = errorLines.join("\n").trim() || "Test failed (no error message)";
      // Strip ANSI escape codes
      const error = raw.replace(/\u001b\[[0-9;]*m/g, "");

      // Find screenshot attachment if any
      const screenshot = lastResult.attachments.find(
        (a) => a.contentType === "image/png" && a.path
      );

      failures.push({
        file: relative(ROOT, file || "unknown"),
        suite: suiteName,
        title: spec.title,
        fullTitle: [suiteName, spec.title].filter(Boolean).join(" › "),
        error: error.slice(0, 1200), // cap length for API
        screenshotPath: screenshot?.path
          ? relative(ROOT, screenshot.path)
          : undefined,
      });
    }
  }

  return failures;
}

// ── Format failures for the Claude prompt ────────────────────────────────────

function formatFailures(failures: FailedTest[]): string {
  return failures
    .map(
      (f, i) => `
--- FAILURE ${i + 1} ---
Test file : ${f.file}
Test suite: ${f.suite}
Test title: ${f.title}
Screenshot: ${f.screenshotPath ?? "none"}
Error:
${f.error}
`.trim()
    )
    .join("\n\n");
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(RESULTS_PATH)) {
    console.error(
      `\n❌  No results file found at playwright-report/results.json\n` +
        `   Run "npm test" first, then re-run this script.\n`
    );
    process.exit(1);
  }

  const report: PWReport = JSON.parse(readFileSync(RESULTS_PATH, "utf-8"));
  const { stats } = report;

  console.log(
    `\n📊  Test run: ${stats.expected} passed, ${stats.unexpected} failed, ${stats.skipped} skipped`
  );

  const failures = collectFailures(report.suites);

  if (failures.length === 0) {
    const msg = `# ISSUES.md\n\n✅ All tests passed — no issues to report.\n\n_Generated ${new Date().toISOString()}_\n`;
    writeFileSync(OUTPUT_PATH, msg);
    console.log(`\n✅  All tests passed. ISSUES.md updated.\n`);
    return;
  }

  console.log(`\n🔍  Found ${failures.length} failing test(s). Calling Claude...\n`);

  const client = new Anthropic();

  const systemPrompt = `You are a senior engineer reviewing automated Playwright E2E test failures for a Next.js PWA called "Scam Gym" — a scam-detection training app.

The app uses:
- Next.js 16 (App Router, client components)
- Tailwind CSS + CSS variables (--background, --accent, --text, --surface, etc.)
- Dexie (IndexedDB) for attempt/flag storage
- localStorage for user state (scamgym_onboarded, scamgym_context, scamgym_premium, scamgym_streak, etc.)
- sessionStorage on /result page (lastAttempt, lastDrill, calVerdict, lastReward)
- Pages: /, /drill, /result, /stats, /settings, /session, /upgrade, /help

Your job is to produce ISSUES.md — a structured list of actionable issues derived from the test failures. Each issue must be specific enough for Claude Code to locate and fix the problem without additional context.

Format each issue exactly like this:

## Issue N: [Short title]

**Severity:** P1 | P2 | P3
**Failing test:** [test file] › [test title]
**Symptom:** [One sentence: what the test expected vs. what happened]
**Likely cause:** [Specific code location and reason — file:line if known]
**Fix:** [Concrete, actionable steps to fix. Reference exact variable names, component names, or logic that needs changing]

---

After all issues, add a ## Summary section with a bullet list of all issue titles grouped by severity.

Be precise and technical. Do not pad or speculate beyond what the failure evidence shows.`;

  const userMessage = `Here are the failing tests from the Scam Gym Playwright run:

${formatFailures(failures)}

Total: ${failures.length} failures out of ${stats.expected + stats.unexpected} tests.

Produce ISSUES.md content as described. Start directly with the issues — no preamble.`;

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: userMessage }],
    system: systemPrompt,
  });

  const content = response.content?.[0];
  if (!content || content.type !== "text") {
    console.error("Unexpected response from Claude:", JSON.stringify(response.content));
    process.exit(1);
  }

  const header = `# ISSUES.md — Scam Gym Test Failures\n_Generated ${new Date().toISOString()} · ${failures.length} issue(s) from ${stats.unexpected} failing test(s)_\n\n`;
  const output = header + content.text.trim() + "\n";

  writeFileSync(OUTPUT_PATH, output);
  console.log(`\n✅  ISSUES.md written with ${failures.length} issue(s).\n`);
  console.log(`   Open ISSUES.md and paste it to Claude Code with:\n`);
  console.log(`   "Fix all issues in ISSUES.md"\n`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
