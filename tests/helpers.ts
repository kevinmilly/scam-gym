import type { Page } from "@playwright/test";

/** Clear all scamgym localStorage keys and IndexedDB */
export async function clearAllStorage(page: Page) {
  await page.evaluate(async () => {
    // Clear all scamgym localStorage keys
    Object.keys(localStorage)
      .filter((k) => k.startsWith("scamgym_"))
      .forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
    // Clear IndexedDB
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase("ScamGymDB");
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
  });
}

/** Set user as onboarded with a given context (bypasses welcome screen) */
export async function setOnboarded(page: Page, context: string = "personal") {
  await page.evaluate((ctx) => {
    localStorage.setItem("scamgym_onboarded", "1");
    localStorage.setItem("scamgym_context", ctx);
  }, context);
}

/** Unlock premium in localStorage */
export async function setPremium(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem("scamgym_premium", "1");
  });
}

/** Complete one drill and land on result page */
export async function completeDrill(
  page: Page,
  verdict: "scam" | "legit" = "scam",
  confidence = "70%"
) {
  const verdictLabel = verdict === "scam" ? /🚨 Scam/ : /✅ Legit/;
  await page.getByRole("button", { name: verdictLabel }).click();
  await page.getByRole("button", { name: confidence }).click();
  await page.getByRole("button", { name: "Submit" }).click();
  await page.waitForURL(/\/result/, { timeout: 10_000 });
}

/** Click a context button by name in the context picker */
export async function selectContext(page: Page, name = "Personal") {
  await page.locator("button").filter({ hasText: name, hasNotText: "Safety" }).first().click();
}

/** Click Skip through all optional help wizard steps until they stop appearing */
export async function skipOptionalSteps(page: Page) {
  const btn = page.getByRole("button", { name: /Skip/i });
  while (await btn.isVisible({ timeout: 800 }).catch(() => false)) {
    await btn.click();
  }
}

/** Complete all 10 drills in a session (always picks Scam + 50%) */
export async function completeSession(page: Page) {
  for (let i = 0; i < 10; i++) {
    await page.waitForSelector('button:has-text("🚨 Scam")', { timeout: 8_000 });
    await page.getByRole("button", { name: /🚨 Scam/ }).click();
    await page.getByRole("button", { name: "50%" }).click();
    await page.getByRole("button", { name: /Submit \(\d+\/10\)/ }).click();
    // Wait for next drill counter or summary screen
    await Promise.race([
      page.waitForSelector('button:has-text("🚨 Scam")', { timeout: 8_000 }).catch(() => null),
      page.waitForSelector("text=Session Complete", { timeout: 8_000 }).catch(() => null),
    ]);
  }
}
