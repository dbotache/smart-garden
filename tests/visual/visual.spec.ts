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

for (const n of [1, 2, 3, 4, 6, 7, 8, 9]) {
  test(`presentation: migrated slide ${n}`, async ({ page }) => {
    await page.goto(`/presentation#/${n}`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await expect(page.getByTestId("deck")).toHaveScreenshot(`slide-${String(n).padStart(2, "0")}.png`);
  });
}

for (const [n, id] of [[1, "phase1-costs"], [2, "prototypes"], [3, "compat-costs"]] as const) {
  test(`backup: slide ${n} (${id}) after its count-up`, async ({ page }) => {
    await page.goto(`/presentation/backup#/${n}`);
    await expect(page.getByTestId("deck")).toHaveAttribute("data-keys", "ready");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500); // number count-up (900 ms) and bar growth
    await expect(page.getByTestId("deck")).toHaveScreenshot(`backup-${String(n).padStart(2, "0")}-${id}.png`);
  });
}
