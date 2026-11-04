import { expect, test } from "@playwright/test";
import { waitForGarden } from "../e2e/helpers";

/**
 * Visual regression. Deterministic: fixed viewport, intro animation off, fixed camera presets,
 * seeded demo data. Baselines live in tests/visual/__screenshots__ (reviewed manually before committing).
 */

const settleChips = (page: import("@playwright/test").Page) => page.waitForTimeout(1600); // chip/label fade-ins

for (const stage of ["planning", "planting", "monitoring", "irrigation"] as const) {
  test(`prototype stage: ${stage}`, async ({ page }) => {
    await page.goto(`/prototype?stage=${stage}&intro=0`);
    await waitForGarden(page);
    await settleChips(page);
    await expect(page).toHaveScreenshot(`prototype-${stage}.png`);
  });
}

test("prototype: tomato sensor detail", async ({ page }) => {
  await page.goto("/prototype?stage=monitoring&intro=0");
  await waitForGarden(page);
  await page.getByTestId("sensor-probe-1").click();
  await settleChips(page);
  await expect(page).toHaveScreenshot("prototype-sensor-detail.png");
});

test("presentation: embedded garden (irrigation slide, after the demo)", async ({ page }) => {
  await page.goto("/presentation#/10");
  await waitForGarden(page);
  await page.getByTestId("run-irrigation").click();
  await expect(page.getByTestId("irrigation-panel")).toHaveAttribute("data-demo-status", "done", { timeout: 15_000 });
  await waitForGarden(page);
  await settleChips(page);
  await expect(page).toHaveScreenshot("presentation-garden-irrigation.png");
});

for (const n of [1, 2, 3, 4, 5, 6, 12, 13, 14]) {
  test(`presentation: migrated slide ${n}`, async ({ page }) => {
    await page.goto(`/presentation#/${n}`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await expect(page.getByTestId("deck")).toHaveScreenshot(`slide-${String(n).padStart(2, "0")}.png`);
  });
}

test("presentation: architecture slide (Garden Digital Twin selected)", async ({ page }) => {
  await page.goto("/presentation#/11");
  await expect(page.getByTestId("deck")).toHaveAttribute("data-keys", "ready"); // hydrated: clicks are handled
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-node="twin"]').click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  await expect(page.getByTestId("deck")).toHaveScreenshot("slide-11-architecture.png");
});
