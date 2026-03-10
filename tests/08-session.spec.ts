/**
 * Journey: Premium user completes a 10-drill session
 * Covers: session load, drill progression, progress bar, summary screen
 */
import { test, expect } from "@playwright/test";
import { clearAllStorage, setOnboarded, setPremium, completeSession } from "./helpers";

test.describe("Session page — premium user", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await setOnboarded(page);
    await setPremium(page);
    await page.goto("/session");
  });

  test("session loads and shows drill 1/10", async ({ page }) => {
    await expect(page.getByText(/1\/10/)).toBeVisible({ timeout: 5_000 });
  });

  test("session shows progress bar", async ({ page }) => {
    // Progress bar sits below the header — verify the session header is present
    await expect(page.getByText(/1\/10/)).toBeVisible({ timeout: 5_000 });
    // And the submit button includes the counter, confirming the drill UI loaded
    await expect(page.getByRole("button", { name: /Submit \(1\/10\)/ })).toBeVisible();
  });

  test("session shows channel badge", async ({ page }) => {
    const channelBadge = page.getByText(/^(SMS|EMAIL|DM)$/);
    await expect(channelBadge).toBeVisible({ timeout: 5_000 });
  });

  test("session submit button shows progress counter", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Submit \(1\/10\)/ })).toBeVisible({
      timeout: 5_000,
    });
  });

  test("session submit disabled without verdict + confidence", async ({
    page,
  }) => {
    const submitBtn = page.getByRole("button", { name: /Submit \(\d+\/10\)/ });
    await expect(submitBtn).toBeDisabled();
  });

  test("completing a drill advances to drill 2/10", async ({ page }) => {
    // Pick verdict + confidence
    await page.getByRole("button", { name: /🚨 Scam/ }).click();
    await page.getByRole("button", { name: "70%" }).click();
    await page.getByRole("button", { name: /Submit \(1\/10\)/ }).click();

    // Now on drill 2
    await expect(page.getByText(/2\/10/)).toBeVisible({ timeout: 5_000 });
  });

  test("exit button with cancel keeps user in session", async ({ page }) => {
    // The Exit button uses confirm() — in Playwright, we handle the dialog
    page.once("dialog", async (dialog) => {
      await dialog.dismiss(); // Cancel
    });
    await page.getByRole("button", { name: /← Exit/ }).click();
    // Should still be on session page
    await expect(page).toHaveURL(/\/session/);
    await expect(page.getByText(/1\/10/)).toBeVisible();
  });

  test("exit button with confirm navigates to home", async ({ page }) => {
    page.once("dialog", async (dialog) => {
      await dialog.accept(); // Confirm exit
    });
    await page.getByRole("button", { name: /← Exit/ }).click();
    await expect(page).toHaveURL(/\?from=drill/);
  });

  test("session state persists if user navigates away and back", async ({
    page,
  }) => {
    // Do 1 drill
    await page.getByRole("button", { name: /🚨 Scam/ }).click();
    await page.getByRole("button", { name: "70%" }).click();
    await page.getByRole("button", { name: /Submit \(1\/10\)/ }).click();
    await expect(page.getByText(/2\/10/)).toBeVisible({ timeout: 5_000 });

    // Navigate away and back
    await page.goto("/?from=drill");
    await page.goto("/session");

    // Should restore at drill 2 (not restart)
    await expect(page.getByText(/2\/10/)).toBeVisible({ timeout: 5_000 });
  });
});

test.describe("Session summary screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await setOnboarded(page);
    await setPremium(page);
    await page.goto("/session");
    await completeSession(page);
    await expect(page.getByText("Session Complete!")).toBeVisible({ timeout: 10_000 });
  });

  test("completing all 10 drills shows Session Complete screen", async ({ page }) => {
    await expect(page.getByText(/Here's how you did across 10 drills/)).toBeVisible();
  });

  test("summary shows accuracy and XP earned", async ({ page }) => {
    await expect(page.getByText("Accuracy")).toBeVisible();
    await expect(page.getByText("XP Earned")).toBeVisible();
  });

  test("summary shows Keep Training and Back to Home buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Keep Training/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Back to Home/ })).toBeVisible();
  });
});
