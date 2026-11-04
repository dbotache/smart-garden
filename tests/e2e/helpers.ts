import { expect, type ConsoleMessage, type Page } from "@playwright/test";

/** Collects console errors/warnings and uncaught exceptions; assert empty at the end of a test. */
export function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on("console", (m: ConsoleMessage) => {
    if (m.type() === "error" || m.type() === "warning") problems.push(`[${m.type()}] ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`[pageerror] ${e.message}`));
  return problems;
}

export async function waitForGarden(page: Page) {
  await page.locator('[data-garden-root][data-settled="true"]').first().waitFor({ timeout: 60_000 });
}

type Sel = { type: "plant" | "sensor" | "zone"; id: string };

/** Click a real 3D object: projects its world anchor to screen coordinates via the garden's debug bridge. */
export async function clickInScene(page: Page, sel: Sel) {
  await waitForGarden(page);
  const p = await page.evaluate((s) => window.__plantwizGarden?.project(s) ?? null, sel);
  expect(p, `projection for ${sel.type}:${sel.id}`).not.toBeNull();
  await page.mouse.click(p!.x, p!.y);
}

export async function dragCanvas(page: Page, dx: number, dy = 0) {
  const canvas = page.locator('[data-testid="garden-canvas"] canvas').first();
  const box = (await canvas.boundingBox())!;
  const x = box.x + box.width * 0.35;
  const y = box.y + box.height * 0.55;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 12 });
  await page.mouse.up();
}

export const stageButton = (page: Page, stage: string) => page.locator(`[data-stage-button="${stage}"]`).first();
