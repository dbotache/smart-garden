import { expect, test } from "@playwright/test";
import { clickInScene, dragCanvas, stageButton, waitForGarden, watchConsole } from "./helpers";

test.describe("standalone prototype", () => {
  test("loads without runtime errors and renders the WebGL garden", async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto("/prototype");
    await waitForGarden(page);
    const canvas = page.locator('[data-testid="garden-canvas"] canvas');
    await expect(canvas).toBeVisible();
    // The canvas actually draws something. WebGL buffers are not readable after compositing
    // (preserveDrawingBuffer is off for performance), so decode a real screenshot of the element instead.
    const png = (await canvas.screenshot()).toString("base64");
    const distinct = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = 96;
      c.height = 54;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 96, 54);
      const d = ctx.getImageData(0, 0, 96, 54).data;
      const set = new Set<number>();
      for (let i = 0; i < d.length; i += 4) set.add((d[i]! >> 4) * 256 + (d[i + 1]! >> 4) * 16 + (d[i + 2]! >> 4));
      return set.size;
    }, png);
    expect(distinct).toBeGreaterThan(20);
    expect(problems).toEqual([]);
  });

  test("all four stages are reachable by buttons and arrow keys", async ({ page }) => {
    await page.goto("/prototype?intro=0");
    const title = page.getByTestId("garden-stage-title");
    for (const [stage, text] of [["planting", "Plant recommendations"], ["monitoring", "Sensor monitoring"], ["irrigation", "Adaptive irrigation"], ["planning", "Architectural planning"]] as const) {
      await stageButton(page, stage).click();
      await expect(title).toHaveText(text);
      await expect(page.locator("[data-garden-root]")).toHaveAttribute("data-stage", stage);
    }
    await page.locator("body").click({ position: { x: 5, y: 5 } });
    await page.keyboard.press("ArrowRight");
    await expect(title).toHaveText("Plant recommendations");
  });

  test("clicking a 3D zone and a 3D plant opens the matching panel", async ({ page }) => {
    await page.goto("/prototype?intro=0");
    await clickInScene(page, { type: "zone", id: "bed-3" });
    await expect(page.getByTestId("zone-panel")).toHaveAttribute("data-zone-id", "bed-3");
    await stageButton(page, "planting").click();
    await page.getByTestId("panel-back").click();
    await clickInScene(page, { type: "plant", id: "tomato" });
    const panel = page.getByTestId("plant-panel");
    await expect(panel).toHaveAttribute("data-plant-id", "tomato");
    await expect(panel).toContainText("Solanum lycopersicum");
    await expect(panel).toContainText("94");
    await clickInScene(page, { type: "plant", id: "pear-tree" });
    await expect(panel).toHaveAttribute("data-plant-id", "pear-tree");
  });

  test("dragging rotates the view without selecting anything", async ({ page }) => {
    await page.goto("/prototype?stage=planting&intro=0");
    await waitForGarden(page);
    // measure an object far from the orbit target, where rotation moves it most
    const before = await page.evaluate(() => window.__plantwizGarden?.project({ type: "sensor", id: "weather-station" }));
    await dragCanvas(page, 300, 40);
    await waitForGarden(page);
    const after = await page.evaluate(() => window.__plantwizGarden?.project({ type: "sensor", id: "weather-station" }));
    expect(Math.hypot(after!.x - before!.x, after!.y - before!.y)).toBeGreaterThan(60);
    await expect(page.getByTestId("plant-panel")).toHaveCount(0);
  });

  test("sensor data panel shows a measured chart and an estimated health index", async ({ page }) => {
    await page.goto("/prototype?stage=monitoring&intro=0");
    await clickInScene(page, { type: "sensor", id: "probe-1" });
    const panel = page.getByTestId("sensor-panel");
    await expect(panel).toHaveAttribute("data-device-id", "probe-1");
    await expect(page.getByTestId("primary-value")).toHaveText("18 %");
    await expect(page.getByTestId("chart-soil-moisture")).toBeVisible();
    await expect(page.getByTestId("health-indicator")).toContainText("Estimated");
    await page.getByTestId("chip-sensor-weather-station").click();
    await expect(panel).toHaveAttribute("data-device-id", "weather-station");
    await expect(page.getByTestId("chart-air-temperature")).toBeVisible();
  });

  test("adaptive irrigation demo runs and differs from the fixed timer", async ({ page }) => {
    const problems = watchConsole(page);
    await page.goto("/prototype?stage=irrigation&intro=0");
    await waitForGarden(page);
    const panel = page.getByTestId("irrigation-panel");
    await expect(page.getByTestId("total-liters")).toHaveText("57.5 L");
    await expect(page.getByTestId("moisture-tomato")).toHaveText("18 %");
    await page.getByTestId("run-irrigation").click();
    await expect(panel).toHaveAttribute("data-demo-status", "running");
    await expect(page.locator("[data-garden-root]")).toHaveAttribute("data-settled", "false"); // frames are being rendered
    await expect(panel).toHaveAttribute("data-demo-status", "done", { timeout: 15_000 });
    await expect(page.getByTestId("moisture-tomato")).toHaveText("30 %");
    await expect(page.getByTestId("moisture-lavender")).toHaveText("14 %");

    await page.getByRole("button", { name: "Fixed timer" }).click();
    await expect(page.getByTestId("total-liters")).toHaveText("120.0 L");
    await expect(panel).toContainText("3 × over-watered");
    await page.getByRole("button", { name: "Rain expected" }).click();
    await page.getByRole("button", { name: "Adaptive", exact: true }).click();
    await expect(page.getByTestId("decision-basil")).toContainText("Wait for rain");
    await page.getByTestId("decision-tomato").click();
    await expect(page.getByTestId("decision-panel")).toContainText("only up to the lower limit because rain is expected");
    expect(problems).toEqual([]);
  });

  test("the canvas follows container resizes (no stretched rendering)", async ({ page }) => {
    await page.goto("/prototype?intro=0");
    await waitForGarden(page);
    await page.setViewportSize({ width: 900, height: 700 });
    await page.waitForTimeout(400);
    const dims = await page.locator('[data-testid="garden-canvas"] canvas').evaluate((c: HTMLCanvasElement) => ({ css: c.getBoundingClientRect().width, backing: c.width / devicePixelRatio }));
    expect(Math.abs(dims.css - dims.backing)).toBeLessThan(2);
  });
});
