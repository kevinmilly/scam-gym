/**
 * Journey: Brand-new user opens the app for the first time
 * Covers: welcome screen, demo drill interaction, context picker, start training
 */
import { test, expect } from "@playwright/test";
import { clearAllStorage, selectContext } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await clearAllStorage(page);
  await page.goto("/"); // re-navigate so app reads fresh storage
});

test("new user sees onboarding welcome screen", async ({ page }) => {
  await expect(
    page.getByText("Practice spotting scams before they hit you.")
  ).toBeVisible();
  await expect(
    page.getByText("Free · No account needed")
  ).toBeVisible();
});

test("CTA button text is visible and clickable", async ({ page }) => {
  const cta = page.getByRole("button", { name: /Try Your First Drill/i });
  await expect(cta).toBeVisible();
  await cta.click();
  await expect(page.getByText("Choose your training mode")).toBeVisible();
});

test("demo drill: scam answer shows correct feedback", async ({ page }) => {
  // Demo scam buttons are inside the mini-drill card
  await page.getByRole("button", { name: /🚫 Scam/ }).click();
  await expect(page.getByText("✓ Correct! This is a scam.")).toBeVisible();
  await expect(page.getByText("Red flags:")).toBeVisible();
  await expect(page.getByText("Domain mismatch")).toBeVisible();
});

test("demo drill: legit answer shows wrong feedback", async ({ page }) => {
  await page.getByRole("button", { name: /✅ Legit/ }).click();
  await expect(page.getByText("Not quite — this is a scam.")).toBeVisible();
});

test("demo drill: after reveal, CTA advances to context picker", async ({ page }) => {
  await page.getByRole("button", { name: /🚫 Scam/ }).click();
  await page.getByRole("button", { name: /Practice more drills/i }).click();
  await expect(page.getByText("Choose your training mode")).toBeVisible();
});

test("context picker: all 4 modes are displayed", async ({ page }) => {
  await page.getByRole("button", { name: /Try Your First Drill/i }).click();
  await expect(page.getByText("Personal", { exact: true })).toBeVisible();
  await expect(page.getByText("Small Business", { exact: true })).toBeVisible();
  await expect(page.getByText("Job Seeker", { exact: true })).toBeVisible();
  await expect(page.getByText("Family Safety", { exact: true })).toBeVisible();
});

test("context picker: Start Training disabled until context selected", async ({ page }) => {
  await page.getByRole("button", { name: /Try Your First Drill/i }).click();
  const startBtn = page.getByRole("button", { name: "Start Training" });
  await expect(startBtn).toBeDisabled();
});

test("context picker: selecting a context enables Start Training", async ({ page }) => {
  await page.getByRole("button", { name: /Try Your First Drill/i }).click();
  await selectContext(page, "Personal");
  const startBtn = page.getByRole("button", { name: "Start Training" });
  await expect(startBtn).not.toBeDisabled();
});

test("context picker: Start Training navigates to drill page", async ({ page }) => {
  await page.getByRole("button", { name: /Try Your First Drill/i }).click();
  await selectContext(page, "Personal");
  await page.getByRole("button", { name: "Start Training" }).click();
  await expect(page).toHaveURL(/\/drill/);
});

test("onboarded key is set in localStorage after start", async ({ page }) => {
  await page.getByRole("button", { name: /Try Your First Drill/i }).click();
  await selectContext(page, "Personal");
  await page.getByRole("button", { name: "Start Training" }).click();
  await page.waitForURL(/\/drill/);
  const onboarded = await page.evaluate(() =>
    localStorage.getItem("scamgym_onboarded")
  );
  expect(onboarded).toBe("1");
});
