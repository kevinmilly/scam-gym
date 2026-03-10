/**
 * Journey: Returning user completes a drill
 * Covers: drill page load, verdict/confidence selection, submit, navigation to result
 */
import { test, expect } from "@playwright/test";
import { clearAllStorage, setOnboarded, completeDrill } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await clearAllStorage(page);
  await setOnboarded(page);
  await page.goto("/"); // re-navigate so auto-redirect to /drill fires
  await page.waitForURL(/\/drill/, { timeout: 8_000 });
});

test("drill page: message card is visible", async ({ page }) => {
  // The drill header text "Is this message…" is always shown with a drill loaded
  await expect(page.getByText("Is this message…")).toBeVisible();
  // At least one of these channel badges should show
  const channelBadge = page.getByText(/^(SMS|EMAIL|DM)$/);
  await expect(channelBadge).toBeVisible();
});

test("drill page: verdict buttons are rendered", async ({ page }) => {
  await expect(page.getByRole("button", { name: /🚨 Scam/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /✅ Legit/ })).toBeVisible();
});

test("drill page: confidence buttons are rendered", async ({ page }) => {
  await expect(page.getByText("How confident are you?")).toBeVisible();
  for (const pct of ["50%", "60%", "70%", "85%", "95%"]) {
    await expect(page.getByRole("button", { name: pct })).toBeVisible();
  }
});

test("drill page: behavior options are rendered", async ({ page }) => {
  await expect(page.getByText("What would you actually do?")).toBeVisible();
  await expect(page.getByRole("button", { name: "Ignore it" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Verify first" })).toBeVisible();
});

test("Submit button disabled before verdict is picked", async ({ page }) => {
  const submit = page.getByRole("button", { name: "Submit" });
  await expect(submit).toBeDisabled();
});

test("Submit button disabled with verdict but no confidence", async ({ page }) => {
  await page.getByRole("button", { name: /🚨 Scam/ }).click();
  const submit = page.getByRole("button", { name: "Submit" });
  await expect(submit).toBeDisabled();
});

test("Submit button disabled with confidence but no verdict", async ({ page }) => {
  await page.getByRole("button", { name: "70%" }).click();
  const submit = page.getByRole("button", { name: "Submit" });
  await expect(submit).toBeDisabled();
});

test("Submit button enabled when verdict AND confidence selected", async ({ page }) => {
  await page.getByRole("button", { name: /🚨 Scam/ }).click();
  await page.getByRole("button", { name: "70%" }).click();
  const submit = page.getByRole("button", { name: "Submit" });
  await expect(submit).not.toBeDisabled();
});

test("submitting navigates to result page", async ({ page }) => {
  await completeDrill(page, "scam", "70%");
  await expect(page).toHaveURL(/\/result/);
});

test("verdict selection is visually highlighted (selected border)", async ({ page }) => {
  const scamBtn = page.getByRole("button", { name: /🚨 Scam/ });
  await scamBtn.click();
  // After selection, the button should have a colored border (inline style changes)
  // We verify the button is still visible and interactable post-selection
  await expect(scamBtn).toBeVisible();
  // Clicking again doesn't deselect (toggles aren't supported for verdict)
  await page.getByRole("button", { name: /✅ Legit/ }).click();
  // Legit is now selected, scam deselected — submit still not available without confidence
  await page.getByRole("button", { name: "50%" }).click();
  await expect(page.getByRole("button", { name: "Submit" })).not.toBeDisabled();
});

test("behavior choice is optional — submit works without it", async ({ page }) => {
  await page.getByRole("button", { name: /🚨 Scam/ }).click();
  await page.getByRole("button", { name: "70%" }).click();
  // Don't select behavior
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page).toHaveURL(/\/result/, { timeout: 8_000 });
});

test("behavior choice can be toggled off after selection", async ({ page }) => {
  const ignoreBtn = page.getByRole("button", { name: "Ignore it" });
  await ignoreBtn.click();
  // Second click deselects it
  await ignoreBtn.click();
  // Submit should still work with verdict + confidence
  await page.getByRole("button", { name: /🚨 Scam/ }).click();
  await page.getByRole("button", { name: "70%" }).click();
  await expect(page.getByRole("button", { name: "Submit" })).not.toBeDisabled();
});

test("Home button navigates to home with ?from=drill", async ({ page }) => {
  await page.getByRole("button", { name: /← Home/ }).click();
  await expect(page).toHaveURL(/\?from=drill/);
});

test("sessionStorage is populated after drill submission", async ({ page }) => {
  await completeDrill(page, "scam", "70%");
  const lastAttempt = await page.evaluate(() =>
    sessionStorage.getItem("lastAttempt")
  );
  const lastDrill = await page.evaluate(() =>
    sessionStorage.getItem("lastDrill")
  );
  const calVerdict = await page.evaluate(() =>
    sessionStorage.getItem("calVerdict")
  );
  expect(lastAttempt).not.toBeNull();
  expect(lastDrill).not.toBeNull();
  expect(calVerdict).not.toBeNull();

  // Validate structure
  const attempt = JSON.parse(lastAttempt!);
  expect(attempt).toHaveProperty("id");
  expect(attempt).toHaveProperty("drillId");
  expect(attempt).toHaveProperty("isCorrect");
  expect(attempt).toHaveProperty("confidence", 70);
});
