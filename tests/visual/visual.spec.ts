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
  await page.goto("/presentation#/11");
  await waitForGarden(page);
  await page.getByTestId("run-irrigation").click();
  await expect(page.getByTestId("irrigation-panel")).toHaveAttribute("data-demo-status", "done", { timeout: 15_000 });
  await waitForGarden(page);
  await settleChips(page);
  await expect(page).toHaveScreenshot("presentation-garden-irrigation.png");
});

for (const [slide, baseline] of [[1, 1], [2, 2], [4, 3], [5, 4], [7, 5], [12, 13], [14, 15], [15, 16], [16, 6]] as const) {
  test(`presentation: migrated slide ${slide}`, async ({ page }) => {
    await page.goto(`/presentation#/${slide}`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
    await expect(page.getByTestId("deck")).toHaveScreenshot(`slide-${String(baseline).padStart(2, "0")}.png`);
  });
}

test("presentation: architecture slide (Garden Digital Twin selected)", async ({ page }) => {
  await page.goto("/presentation#/17");
  await expect(page.getByTestId("deck")).toHaveAttribute("data-keys", "ready"); // hydrated: clicks are handled
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-node="twin"]').click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  await expect(page.getByTestId("deck")).toHaveScreenshot("slide-11-architecture.png");
});

for (const [slide, baseline, id] of [[18, 12, "prototypes"], [19, 14, "finance"]] as const) {
  test(`presentation: slide ${slide} (${id}) after its count-up`, async ({ page }) => {
    await page.goto(`/presentation#/${slide}`);
    await expect(page.getByTestId("deck")).toHaveAttribute("data-keys", "ready");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500); // number count-up (900 ms) and bar growth
    await expect(page.getByTestId("deck")).toHaveScreenshot(`slide-${baseline}-${id}.png`);
  });
}
