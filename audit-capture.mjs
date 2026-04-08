import { chromium } from "playwright";
import { join, relative } from "path";
import { mkdirSync, readdirSync, statSync, writeFileSync } from "fs";

// ── Config ──────────────────────────────────────────────────────────────────
const PROJECT_ROOT = "C:/Users/jamik/kevinProjects/scam-gym";
const OUT = join(PROJECT_ROOT, "audit-screenshots");
const BASE = process.env.AUDIT_URL || "https://www.scamgym.com";
const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1440, height: 900 };

mkdirSync(OUT, { recursive: true });

// ── 1. Discover routes from app/ directory ──────────────────────────────────
function discoverRoutes(appDir) {
  const routes = [];
  function walk(dir, routePrefix) {
    const entries = readdirSync(dir, { withFileTypes: true });
    const hasPage = entries.some(e => e.isFile() && e.name === "page.tsx");
    if (hasPage) {
      routes.push({
        path: routePrefix || "/",
        file: relative(PROJECT_ROOT, join(dir, "page.tsx")).replace(/\\/g, "/"),
      });
    }
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith("_") && entry.name !== "api") {
        walk(join(dir, entry.name), `${routePrefix}/${entry.name}`);
      }
    }
  }
  walk(appDir, "");
  return routes;
}

const routes = discoverRoutes(join(PROJECT_ROOT, "app")).filter(r => r.path !== "/offline");
console.log(`Found ${routes.length} routes:\n${routes.map(r => `  ${r.path} → ${r.file}`).join("\n")}\n`);

// ── 2. Screenshot helpers ───────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const manifest = []; // Will hold all screenshot metadata

async function capture(page, name, route, viewport, state, description, fullPage = true) {
  await sleep(600);
  const filename = `${name}.png`;
  await page.screenshot({ path: join(OUT, filename), fullPage });
  manifest.push({ filename, route, viewport, state, description, capturedAt: new Date().toISOString() });
  console.log(`  ✓ ${filename}`);
}

async function openPage(ctx, path, storage = {}) {
  const page = await ctx.newPage();
  // Inject localStorage before any page loads
  if (Object.keys(storage).length > 0) {
    await page.addInitScript((items) => {
      for (const [k, v] of Object.entries(items)) localStorage.setItem(k, v);
    }, storage);
  }
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 20000 });
  await sleep(1200);
  return page;
}

// ── 3. User states ──────────────────────────────────────────────────────────
const STATES = {
  fresh: {},
  returning: { scamgym_onboarded: "1", scamgym_context: "personal" },
  premium: {
    scamgym_onboarded: "1", scamgym_context: "personal", scamgym_premium: "1",
    scamgym_streak: JSON.stringify({ current: 5, lastDate: new Date().toISOString().split("T")[0] }),
  },
};

// Routes that need auth/onboarding to render properly
const NEEDS_ONBOARDING = ["/drill", "/result", "/stats", "/settings", "/session"];

// ── 4. Main capture logic ───────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({ headless: true });

  try {
    // ── Mobile screenshots ──────────────────────────────────────────────
    console.log("=== MOBILE CAPTURES ===");
    const mobileCtx = await browser.newContext({
      viewport: MOBILE, deviceScaleFactor: 2,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
    });

    for (const route of routes) {
      const slug = route.path === "/" ? "home" : route.path.replace(/\//g, "-").slice(1);

      // Determine which states to capture for this route
      const statesToCapture = route.path === "/"
        ? ["fresh", "returning", "premium"]
        : NEEDS_ONBOARDING.includes(route.path)
          ? ["returning", "premium"]
          : ["returning"];

      for (const stateName of statesToCapture) {
        const storage = STATES[stateName];
        const prefix = `mobile-${slug}-${stateName}`;

        console.log(`\n  ${route.path} [${stateName}]`);
        try {
          const page = await openPage(mobileCtx, route.path, storage);

          // Top of page
          await capture(page, `${prefix}-top`, route.path, "mobile", stateName,
            `${route.path} — ${stateName} user, top of page`);

          // Check if page is scrollable, capture bottom if so
          const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
          const viewportHeight = await page.evaluate(() => window.innerHeight);
          if (scrollHeight > viewportHeight + 100) {
            await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
            await sleep(400);
            await capture(page, `${prefix}-bottom`, route.path, "mobile", stateName,
              `${route.path} — ${stateName} user, bottom of page`, false);
          }

          await page.close();
        } catch (e) {
          console.log(`    ⚠ Failed: ${e.message}`);
        }
      }
    }
    await mobileCtx.close();

    // ── Desktop screenshots ─────────────────────────────────────────────
    console.log("\n\n=== DESKTOP CAPTURES ===");
    const desktopCtx = await browser.newContext({ viewport: DESKTOP, deviceScaleFactor: 1 });

    for (const route of routes) {
      const slug = route.path === "/" ? "home" : route.path.replace(/\//g, "-").slice(1);
      const storage = NEEDS_ONBOARDING.includes(route.path) || route.path === "/"
        ? STATES.returning : STATES.returning;
      const prefix = `desktop-${slug}-returning`;

      console.log(`\n  ${route.path}`);
      try {
        const page = await openPage(desktopCtx, route.path, storage);

        await capture(page, `${prefix}-top`, route.path, "desktop", "returning",
          `${route.path} — returning user, desktop top`);

        const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        if (scrollHeight > viewportHeight + 100) {
          await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
          await sleep(400);
          await capture(page, `${prefix}-bottom`, route.path, "desktop", "returning",
            `${route.path} — returning user, desktop bottom`, false);
        }

        await page.close();
      } catch (e) {
        console.log(`    ⚠ Failed: ${e.message}`);
      }
    }
    await desktopCtx.close();

  } catch (e) {
    console.error("FATAL:", e.message);
  }

  await browser.close();

  // ── 5. Save manifest ──────────────────────────────────────────────────
  const manifestData = {
    capturedAt: new Date().toISOString(),
    baseUrl: BASE,
    projectRoot: PROJECT_ROOT,
    routes: routes,
    screenshots: manifest,
    summary: {
      totalScreenshots: manifest.length,
      totalRoutes: routes.length,
      viewports: ["mobile (390x844 @2x)", "desktop (1440x900)"],
      userStates: Object.keys(STATES),
    },
  };

  writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifestData, null, 2));
  console.log(`\n✅ Done! ${manifest.length} screenshots saved to: ${OUT}`);
  console.log(`📋 Manifest: ${join(OUT, "manifest.json")}`);
})();
