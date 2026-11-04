import { expect, test } from "@playwright/test";
import { clickInScene, dragCanvas, stageButton, waitForGarden, watchConsole } from "./helpers";

const ORDER = ["title", "team", "problem", "vision", "market", "tech", "demo-planning", "demo-planting", "demo-monitoring", "demo-irrigation", "architecture", "prototypes", "business", "finance", "next-steps", "call"];
/** open the deck and wait until hydration attached the keyboard handler (keys pressed earlier are lost) */
async function openDeck(page: import("@playwright/test").Page, slide?: number) {
  await page.goto(slide ? `/presentation#/${slide}` : "/presentation");
  await expect(page.getByTestId("deck")).toHaveAttribute("data-keys", "ready");
}
const slideId = (page: import("@playwright/test").Page) => page.getByTestId("deck").getAttribute("data-slide-id");

test.describe("presentation", () => {
  test("loads and navigates through all slides in order", async ({ page }) => {
    const problems = watchConsole(page);
    await openDeck(page);
    await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", "title");
    // three.js is not loaded on regular slides
    expect(await page.evaluate(() => (window as { __THREE__?: string }).__THREE__)).toBeUndefined();
    for (let i = 1; i < ORDER.length; i++) {
      await page.keyboard.press("ArrowRight");
      await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", ORDER[i]!);
      await expect(page).toHaveURL(new RegExp(`#/${i + 1}$`));
    }
    await page.keyboard.press("ArrowRight"); // stays on the last slide
    expect(await slideId(page)).toBe("call");
    await page.keyboard.press("Home");
    await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", "title");
    await page.getByTestId("deck-next").click();
    await expect(page.getByTestId("deck-counter")).toHaveText("2 / 16");
    expect(problems).toEqual([]);
  });

  test("the full presenter journey: reach the garden, use it, continue", async ({ page }) => {
    const problems = watchConsole(page);
    await openDeck(page, 6);
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", "demo-planning");
    await waitForGarden(page);
    const garden = page.locator("[data-garden-root]");
    await expect(garden).toHaveAttribute("data-stage", "planning");

    // rotate
    await dragCanvas(page, 200, 30);
    expect(await slideId(page)).toBe("demo-planning");
    // zoom with the wheel over the canvas
    await page.mouse.wheel(0, -400);
    expect(await slideId(page)).toBe("demo-planning");
    // click a zone in 3D
    await clickInScene(page, { type: "zone", id: "bed-1" });
    await expect(page.getByTestId("zone-panel")).toBeVisible();
    expect(await slideId(page)).toBe("demo-planning");

    // switch stage inside the garden: slide does not change
    await stageButton(page, "planting").click();
    await expect(garden).toHaveAttribute("data-stage", "planting");
    expect(await slideId(page)).toBe("demo-planning");
    // Space on a focused garden button must not advance the deck
    await page.keyboard.press("Space");
    expect(await slideId(page)).toBe("demo-planning");

    // click a plant (selection carried over from the zone: tomato)
    await clickInScene(page, { type: "plant", id: "basil" });
    await expect(page.getByTestId("plant-panel")).toHaveAttribute("data-plant-id", "basil");

    // sensor plot
    await stageButton(page, "monitoring").click();
    await clickInScene(page, { type: "sensor", id: "probe-1" });
    await expect(page.getByTestId("chart-soil-moisture")).toBeVisible();

    // irrigation demo
    await stageButton(page, "irrigation").click();
    await page.getByTestId("run-irrigation").click();
    await expect(page.getByTestId("irrigation-panel")).toHaveAttribute("data-demo-status", "done", { timeout: 15_000 });

    // continue presenting with the keyboard after interacting
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", "demo-planting");
    await expect(garden).toHaveAttribute("data-stage", "planting"); // slide drives the stage
    await page.getByTestId("deck-next").click();
    await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", "demo-monitoring");
    expect(problems).toEqual([]);
  });

  test("one persistent WebGL garden across demo slides; paused when hidden", async ({ page }) => {
    await openDeck(page, 7);
    await waitForGarden(page);
    await page.evaluate(() => {
      (window as { __gardenCanvasNode?: Element }).__gardenCanvasNode = document.querySelector('[data-testid="garden-canvas"] canvas')!;
    });
    for (const id of ["demo-planting", "demo-monitoring", "demo-irrigation"]) {
      await page.keyboard.press("ArrowRight");
      await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", id);
    }
    expect(await page.evaluate(() => document.querySelector('[data-testid="garden-canvas"] canvas') === (window as { __gardenCanvasNode?: Element }).__gardenCanvasNode)).toBe(true);
    expect(await page.locator('[data-testid="garden-canvas"] canvas').count()).toBe(1);
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("deck-garden")).toHaveAttribute("data-visible", "false");
    await expect(page.getByTestId("deck-garden")).toBeHidden();
  });

  test("garden resizes with the slide frame and in full screen", async ({ page }) => {
    await openDeck(page, 8);
    await waitForGarden(page);
    const sizeOf = () => page.locator('[data-testid="garden-canvas"] canvas').evaluate((c: HTMLCanvasElement) => ({ css: Math.round(c.getBoundingClientRect().width), backing: Math.round(c.width / devicePixelRatio) }));
    const a = await sizeOf();
    await page.setViewportSize({ width: 1100, height: 700 });
    await expect.poll(async () => (await sizeOf()).css).toBeLessThan(a.css);
    const b = await sizeOf();
    expect(Math.abs(b.css - b.backing)).toBeLessThan(2);
    // full screen toggle via F (headless Chromium supports the Fullscreen API)
    await page.locator("body").click({ position: { x: 3, y: 3 } });
    await page.keyboard.press("f");
    await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(true);
    await expect(page.locator("[data-garden-root]")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect.poll(() => page.evaluate(() => !!document.fullscreenElement)).toBe(false);
  });

  test("architecture slide follows the garden demo and is interactive without moving the deck", async ({ page }) => {
    const problems = watchConsole(page);
    await openDeck(page, 10);
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", "architecture");
    await expect(page.getByTestId("deck-garden")).toHaveAttribute("data-visible", "false");
    const arch = page.getByTestId("architecture");
    await page.locator('[data-node="mqtt"]').click();
    await expect(page.getByTestId("arch-detail")).toHaveAttribute("data-node", "mqtt");
    await page.getByTestId("arch-level-1").click();
    await page.keyboard.press("Space"); // focused button: Space must not advance the deck
    await expect(arch).toHaveAttribute("data-level", "1");
    await expect(page.locator('[data-node="mqtt"]')).toBeDisabled();
    expect(await slideId(page)).toBe("architecture");
    // the diagram fits the slide: map and panel stay inside the frame
    const frame = (await page.locator(".deck-frame").boundingBox())!;
    for (const sel of ['[data-testid="architecture-map"]', ".arch-panel"]) {
      const b = (await page.locator(sel).boundingBox())!;
      expect(b.x + b.width).toBeLessThanOrEqual(frame.x + frame.width);
      expect(b.y + b.height).toBeLessThanOrEqual(frame.y + frame.height);
    }
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", "prototypes");
    expect(problems).toEqual([]);
  });

  test("prototype costs and financial model are interactive without moving the deck", async ({ page }) => {
    const problems = watchConsole(page);
    await openDeck(page, 12);
    await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", "prototypes");
    await page.getByTestId("prototype-3").click();
    await expect(page.getByTestId("breakdown-budget")).toHaveText("457,70 €");
    await page.getByTestId("fleet-size").getByText("10×").click();
    await expect(page.getByTestId("fleet-3")).toHaveAttribute("data-value", "4577");
    await page.getByTestId("show-bom").click();
    await expect(page.getByTestId("bom")).toContainText("398,00 €");
    await page.keyboard.press("Space"); // focused button
    expect(await slideId(page)).toBe("prototypes");

    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", "finance");
    await page.getByTestId("preset-j3-ambitioniert").click();
    await expect(page.getByTestId("kpi-paying")).toHaveAttribute("data-value", "10000");
    await expect(page.getByTestId("kpi-result-tile")).toHaveAttribute("data-tone", "good");
    for (const t of ["tarife", "kunde", "hardware", "ergebnis"]) {
      await page.getByTestId(`tab-${t}`).click();
      await expect(page.getByTestId(`panel-${t}`)).toBeVisible();
    }
    // arrows move a focused slider, not the deck; a presenter clicker (PageDown) still advances
    const churn = page.getByTestId("slider-churn");
    await churn.focus();
    await page.keyboard.press("ArrowRight");
    await expect(churn).toHaveValue("5.5");
    expect(await slideId(page)).toBe("finance");
    await page.keyboard.press("PageDown");
    await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", "next-steps");
    expect(problems).toEqual([]);
  });

  test("speaker notes from the PPTX are available", async ({ page }) => {
    await openDeck(page, 5);
    await page.keyboard.press("n");
    await expect(page.getByTestId("speaker-notes")).toContainText("KfW Research");
  });

  test("exports all slides as a 16:9 PDF", async ({ page }) => {
    test.setTimeout(240_000); // 4 software-WebGL gardens + 16 page renders; slow under parallel load
    const problems = watchConsole(page);
    await openDeck(page);
    const pdfLink = page.getByTestId("deck-pdf");
    await expect(pdfLink).toHaveAttribute("href", "/presentation/print?download");
    await expect(pdfLink).toHaveAttribute("target", "_blank");

    await page.goto("/presentation/print"); // without ?download: the test clicks the button itself
    await expect(page.getByTestId("print-deck")).toHaveAttribute("data-ready", "true", { timeout: 60_000 });
    await expect(page.locator(".print-page")).toHaveCount(ORDER.length);
    // every garden slide got a snapshot of its own stage (the PDF never shows an empty canvas)
    await expect(page.locator("img.print-snapshot")).toHaveCount(4);
    const stages = await page.locator("[data-garden-root]").evaluateAll((els) => els.map((e) => e.getAttribute("data-stage")));
    expect(stages).toEqual(["planning", "planting", "monitoring", "irrigation"]);
    // animated figures are printed at their final values
    const shown = await page.locator(".print-page [data-value]").evaluateAll((els) => els.map((e) => [e.children[0]?.textContent, e.children[1]?.textContent]));
    expect(shown.length).toBeGreaterThanOrEqual(10);
    for (const [visible, final] of shown) expect(visible).toBe(final);
    await expect(page.getByTestId("print-prototypes")).toContainText("457,70 €");
    await expect(page.getByTestId("print-finance")).toContainText("Break-even");

    // "PDF herunterladen": built in the browser, same file in every browser
    const [download] = await Promise.all([page.waitForEvent("download", { timeout: 180_000 }), page.getByTestId("print-save").click()]);
    expect(download.suggestedFilename()).toBe("PlantWiz-Praesentation.pdf");
    await expect(page.getByTestId("print-deck")).toHaveAttribute("data-export", "done");
    const file = (await import("node:fs")).readFileSync((await download.path())!).toString("latin1");
    expect(file.match(/\/Type\s*\/Page[^s]/g)?.length).toBe(ORDER.length);
    expect(file).toMatch(/\/MediaBox\s*\[0 0 960\.?0* 540\.?0*\]/);

    // "Drucken …" (browser print dialog) uses the same 16:9 page size in Chromium
    const printed = (await page.pdf({ preferCSSPageSize: true, printBackground: true })).toString("latin1");
    expect(printed.match(/\/Type\s*\/Page[^s]/g)?.length).toBe(ORDER.length);
    expect(printed).toMatch(/\/MediaBox\s*\[0 0 960 540\]/);
    expect(problems).toEqual([]);
  });
});
