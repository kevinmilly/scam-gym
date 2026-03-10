/**
 * Journey: User gets help for a suspicious real-life message
 * Covers: help wizard steps, channel selection, skip buttons, output screen
 */
import { test, expect } from "@playwright/test";
import { clearAllStorage, skipOptionalSteps } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await clearAllStorage(page);
  await page.goto("/help");
});

test("help page shows step 1: channel selection", async ({ page }) => {
  await expect(page.getByText("Help Me Right Now")).toBeVisible();
  await expect(page.getByText("How did they contact you?")).toBeVisible();
});

test("step 1: all 3 channel options are visible", async ({ page }) => {
  await expect(page.getByText("📱")).toBeVisible();
  await expect(page.getByText("📧")).toBeVisible();
  await expect(page.getByText("💬")).toBeVisible();
});

test("step 1 → step 2: selecting SMS channel advances", async ({ page }) => {
  // Click the SMS channel card
  await page.locator("button").filter({ hasText: /SMS|Text message/i }).click();
  await expect(page.getByText("What are they asking you to do?")).toBeVisible();
});

test("step 1 → step 2: selecting EMAIL channel advances", async ({ page }) => {
  await page.locator("button").filter({ hasText: /EMAIL|Email/i }).click();
  await expect(page.getByText("What are they asking you to do?")).toBeVisible();
});

test("step 2: ask options are rendered (multiple choices)", async ({ page }) => {
  await page.locator("button").filter({ hasText: /SMS|Text message/i }).click();
  // There should be multiple ask options rendered
  const options = await page.locator("button").count();
  expect(options).toBeGreaterThan(2);
});

test("step 2 → step 3: selecting an ask option advances", async ({ page }) => {
  await page.locator("button").filter({ hasText: /SMS|Text message/i }).click();
  // Click a specific ask option by its likely text content
  const firstAsk = page.getByRole("button", { name: /verify|click|money|account/i }).first();
  await firstAsk.click();
  // Step 3 is theme selection (optional) or step skips to output
  await expect(
    page.getByText(/Who are they claiming to be|Safe Move|Your Safe Move/)
  ).toBeVisible({ timeout: 3_000 });
});

test("skip buttons advance the wizard", async ({ page }) => {
  await page.locator("button").filter({ hasText: /SMS|Text message/i }).click();
  await page.getByRole("button", { name: /verify|account|money|click/i }).first().click();
  await skipOptionalSteps(page);
  await expect(
    page.getByText(/Your Safe Move|Safe Move/)
  ).toBeVisible({ timeout: 5_000 });
});

test("output screen shows Safe Move, How to Verify, Never Do This", async ({
  page,
}) => {
  await page.locator("button").filter({ hasText: /SMS|Text message/i }).click();
  await page.getByRole("button", { name: /verify|click|money/i }).first().click();
  await skipOptionalSteps(page);

  await expect(page.getByText(/Your Safe Move|Safe Move/)).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText(/How to Verify/)).toBeVisible();
  await expect(page.getByText(/Never Do This/)).toBeVisible();
});

test("Home button on step 1 returns to home page", async ({ page }) => {
  // The Home button on the first step
  await page.getByRole("button", { name: /Home/i }).click();
  await expect(page).toHaveURL(/\?from=drill|\/$/, { timeout: 3_000 });
});

test("Back button on step 2 returns to step 1", async ({ page }) => {
  await page.locator("button").filter({ hasText: /SMS|Text message/i }).click();
  await expect(page.getByText("What are they asking you to do?")).toBeVisible();
  await page.getByRole("button", { name: /Back/i }).click();
  await expect(page.getByText("How did they contact you?")).toBeVisible();
});

test("refreshing the help page restarts wizard at step 1", async ({ page }) => {
  // Navigate to step 2
  await page.locator("button").filter({ hasText: /SMS|Text message/i }).click();
  await expect(page.getByText("What are they asking you to do?")).toBeVisible();

  // Refresh
  await page.reload();
  // Should be back at step 1
  await expect(page.getByText("How did they contact you?")).toBeVisible();
});
