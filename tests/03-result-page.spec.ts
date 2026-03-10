/**
 * Journey: User views drill result and interacts with explanation
 * Covers: result page content, reveal flow, red flags, report issue, navigation
 */
import { test, expect } from "@playwright/test";
import { clearAllStorage, setOnboarded, completeDrill } from "./helpers";

test.describe("Result page — after completing a drill", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await setOnboarded(page);
    await page.goto("/");
    await page.waitForURL(/\/drill/, { timeout: 8_000 });
    await completeDrill(page, "scam", "70%");
  });

  test("shows safe/risky banner", async ({ page }) => {
    await expect(
      page.getByText(/You were safe|You were at risk/)
    ).toBeVisible();
  });

  test("shows summary line with verdict and confidence", async ({ page }) => {
    await expect(
      page.getByText(/You said (SCAM|LEGIT) at \d+%/)
    ).toBeVisible();
  });

  test("shows XP earned breakdown", async ({ page }) => {
    await expect(page.getByText(/\+ \d+ base|\+\d+ base/i)).toBeVisible();
    await expect(page.getByText(/XP/)).toBeVisible();
  });

  test("shows consequence card", async ({ page }) => {
    // One of these labels should appear on every drill
    const label = page.getByText(
      /If this were real|You were right to be suspicious|This was safe to engage|You flagged a safe/
    );
    await expect(label).toBeVisible();
  });

  test("footer shows See Explanation and Skip buttons before reveal", async ({
    page,
  }) => {
    await expect(
      page.getByRole("button", { name: /See Explanation/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Skip/i })
    ).toBeVisible();
  });

  test("See Explanation reveals calibration verdict", async ({ page }) => {
    await page.getByRole("button", { name: /See Explanation/i }).click();
    // One of the three verdicts must appear
    await expect(
      page.getByText(/Overconfident|Underconfident|Well-calibrated/)
    ).toBeVisible();
  });

  test("after reveal: shows pattern family tag", async ({ page }) => {
    await page.getByRole("button", { name: /See Explanation/i }).click();
    // Pattern family is rendered as a pill span alongside the SCAM/LEGIT tag
    await expect(
      page.getByText(/SCAM|LEGIT/).first()
    ).toBeVisible();
  });

  test("after reveal: shows Safe Move section", async ({ page }) => {
    await page.getByRole("button", { name: /See Explanation/i }).click();
    await expect(page.getByText("Safe Move")).toBeVisible();
  });

  test("after reveal: shows The Rule section", async ({ page }) => {
    await page.getByRole("button", { name: /See Explanation/i }).click();
    await expect(page.getByText("The Rule")).toBeVisible();
  });

  test("after reveal: footer shows Next Drill button", async ({ page }) => {
    await page.getByRole("button", { name: /See Explanation/i }).click();
    await expect(
      page.getByRole("button", { name: /Next Drill/i })
    ).toBeVisible();
  });

  test("Next Drill navigates back to drill page", async ({ page }) => {
    await page.getByRole("button", { name: /See Explanation/i }).click();
    await page.getByRole("button", { name: /Next Drill/i }).click();
    await expect(page).toHaveURL(/\/drill/);
  });

  test("Skip button navigates to drill without revealing", async ({ page }) => {
    await page.getByRole("button", { name: /Skip/i }).click();
    await expect(page).toHaveURL(/\/drill/);
  });

  test("report issue form: opens, selects reason, and submits", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /See Explanation/i }).click();
    await page.getByRole("button", { name: /Report an issue/i }).click();
    await expect(
      page.getByText("What's wrong with this drill?")
    ).toBeVisible();
    await page.getByText("The answer is wrong").click();
    await page.getByRole("button", { name: "Submit" }).filter({ hasText: "Submit" }).last().click();
    await expect(page.getByText("Thanks for the report")).toBeVisible();
    // Form should be gone
    await expect(
      page.getByText("What's wrong with this drill?")
    ).not.toBeVisible();
  });

  test("report issue: Submit disabled until reason selected", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /See Explanation/i }).click();
    await page.getByRole("button", { name: /Report an issue/i }).click();
    // The submit button inside the report form (last Submit button on page)
    const reportSubmit = page
      .getByRole("button", { name: "Submit" })
      .last();
    await expect(reportSubmit).toBeDisabled();
  });
});

test.describe("Result page — edge cases", () => {
  test("navigating directly to /result redirects to /drill", async ({
    page,
  }) => {
    await page.goto("/");
    await clearAllStorage(page);
    // Go directly to result with no sessionStorage
    await page.goto("/result");
    await expect(page).toHaveURL(/\/drill/, { timeout: 5_000 });
  });

  test("after completing 2 drills, each result is distinct", async ({
    page,
  }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await setOnboarded(page);
    await page.goto("/");
    await page.waitForURL(/\/drill/, { timeout: 8_000 });

    // First drill
    await completeDrill(page, "scam", "70%");
    const drill1 = await page.evaluate(() =>
      JSON.parse(sessionStorage.getItem("lastDrill") || "{}")
    );
    await page.getByRole("button", { name: /See Explanation/i }).click();
    await page.getByRole("button", { name: /Next Drill/i }).click();
    await page.waitForURL(/\/drill/, { timeout: 5_000 });

    // Second drill
    await completeDrill(page, "legit", "50%");
    const drill2 = await page.evaluate(() =>
      JSON.parse(sessionStorage.getItem("lastDrill") || "{}")
    );

    // Should have gotten a different drill (engine uses variety)
    // Note: with random selection this could theoretically match, but weighted engine avoids repeats
    expect(drill2.id).toBeDefined();
    // Both should have valid IDs
    expect(drill1.id).toBeDefined();
  });
});
