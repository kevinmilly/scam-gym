/**
 * Journey: Navigation integrity and routing edge cases
 * Covers: auto-redirect, ?from=drill guard, returning user screen, stats page, full loop
 */
import { test, expect } from "@playwright/test";
import { clearAllStorage, setOnboarded, setPremium, completeDrill } from "./helpers";

test.describe("Home page routing", () => {
  test("onboarded user auto-redirects to /drill on home load", async ({
    page,
  }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await setOnboarded(page);
    await page.reload();
    await expect(page).toHaveURL(/\/drill/, { timeout: 5_000 });
  });

  test("?from=drill prevents auto-redirect — shows returning user screen", async ({
    page,
  }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await setOnboarded(page);
    await page.goto("/?from=drill");
    // Should stay and show home content
    await expect(page.getByText("Continue Training")).toBeVisible();
    await expect(page).not.toHaveURL(/\/drill/);
  });

  test("Continue Training from home goes to /drill", async ({ page }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await setOnboarded(page);
    await page.goto("/?from=drill");
    await page.getByRole("button", { name: "Continue Training" }).click();
    await expect(page).toHaveURL(/\/drill/);
  });

  test("My Stats link from home goes to /stats", async ({ page }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await setOnboarded(page);
    await page.goto("/?from=drill");
    await page.getByRole("link", { name: "My Stats" }).click();
    await expect(page).toHaveURL(/\/stats/);
  });

  test("Settings link from home goes to /settings", async ({ page }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await setOnboarded(page);
    await page.goto("/?from=drill");
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test("Panic button from home goes to /help", async ({ page }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await setOnboarded(page);
    await page.goto("/?from=drill");
    await page.getByText("I got a suspicious message").click();
    await expect(page).toHaveURL(/\/help/);
  });
});

test.describe("Full drill loop", () => {
  test("home → drill → result → next drill completes without errors", async ({
    page,
  }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await setOnboarded(page);
    await page.reload();
    await page.waitForURL(/\/drill/, { timeout: 8_000 });

    // Drill 1
    await completeDrill(page, "scam", "70%");
    await expect(page.getByText(/You were safe|You were at risk/)).toBeVisible();

    // Reveal and go next
    await page.getByRole("button", { name: /See Explanation/i }).click();
    await page.getByRole("button", { name: /Next Drill/i }).click();
    await page.waitForURL(/\/drill/, { timeout: 5_000 });

    // Drill 2 — verify a new drill loaded
    await expect(
      page.getByRole("button", { name: /🚨 Scam/ })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /✅ Legit/ })
    ).toBeVisible();
  });

  test("drill → home (← Home) → continue training → drill", async ({
    page,
  }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await setOnboarded(page);
    await page.reload();
    await page.waitForURL(/\/drill/, { timeout: 8_000 });

    // Go back home from drill
    await page.getByRole("button", { name: /← Home/ }).click();
    await expect(page).toHaveURL(/\?from=drill/);
    await expect(page.getByText("Continue Training")).toBeVisible();

    // Continue training
    await page.getByRole("button", { name: "Continue Training" }).click();
    await expect(page).toHaveURL(/\/drill/);
  });
});

test.describe("Stats page", () => {
  test("stats page loads with zero drills", async ({ page }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await page.goto("/stats");
    await expect(page.getByText(/0 drills completed/)).toBeVisible();
    await expect(page.getByText(/0% overall accuracy/i)).toBeVisible();
  });

  test("stats page shows drill count after completing drills", async ({
    page,
  }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await setOnboarded(page);
    await page.reload();
    await page.waitForURL(/\/drill/, { timeout: 8_000 });

    await completeDrill(page, "scam", "70%");
    await page.goto("/stats");
    await expect(page.getByText(/1 drill completed/)).toBeVisible();
  });

  test("stats page Keep Training button navigates to /drill", async ({
    page,
  }) => {
    await page.goto("/stats");
    await page.getByRole("button", { name: /Keep Training/i }).click();
    await expect(page).toHaveURL(/\/drill/);
  });

  test("stats page Settings link navigates to /settings", async ({ page }) => {
    await page.goto("/stats");
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test("stats shows premium-gated upsell cards for free user", async ({
    page,
  }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await page.goto("/stats");
    await expect(page.getByText("Upgrade to unlock").first()).toBeVisible();
  });

  test("premium user does not see upsell cards on stats page", async ({
    page,
  }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await setPremium(page);
    await page.goto("/stats");
    await expect(page.getByText("Upgrade to unlock")).not.toBeVisible();
  });
});

test.describe("Upgrade page", () => {
  test("upgrade page shows feature list and price", async ({ page }) => {
    await page.goto("/upgrade");
    await expect(page.getByText("Upgrade to Pro")).toBeVisible();
    await expect(page.getByText("$2.99")).toBeVisible();
    await expect(page.getByText("One-time purchase · No subscription")).toBeVisible();
  });

  test("upgrade page shows Already purchased link for restore", async ({
    page,
  }) => {
    await page.goto("/upgrade");
    await expect(
      page.getByText(/Already purchased|Restore/)
    ).toBeVisible();
  });

  test("restore section expands and shows email input", async ({ page }) => {
    await page.goto("/upgrade");
    await page.getByText(/Already purchased|Restore here/i).click();
    await expect(
      page.getByPlaceholder(/your@email.com/i)
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Restore/i })
    ).toBeVisible();
  });

  test("restore button disabled until email entered", async ({ page }) => {
    await page.goto("/upgrade");
    await page.getByText(/Already purchased|Restore here/i).click();
    const restoreBtn = page.getByRole("button", { name: /^Restore$/i });
    await expect(restoreBtn).toBeDisabled();

    // Enter email
    await page.getByPlaceholder(/your@email.com/i).fill("test@example.com");
    await expect(restoreBtn).not.toBeDisabled();
  });

  test("upgrade page shows Pro Unlocked for premium user", async ({ page }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await setPremium(page);
    await page.goto("/upgrade");
    await expect(page.getByText("Pro Unlocked")).toBeVisible();
    // Should NOT show the upsell price
    await expect(page.getByText("Upgrade to Pro")).not.toBeVisible();
  });
});
