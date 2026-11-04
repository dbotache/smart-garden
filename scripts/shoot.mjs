// Dev helper: node scripts/shoot.mjs <url> <out.png> [width] [height] [actions-json]
// Waits for the garden to settle (if present), prints console errors/warnings, saves a screenshot.
import { chromium } from "@playwright/test";

const [url, out, w = "1440", h = "900", actions = "[]"] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
const logs = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
await page.goto(url, { waitUntil: "networkidle" });
const settle = async () => {
  if (await page.locator("[data-garden-root]").count()) {
    await page.waitForSelector('[data-garden-root][data-settled="true"]', { timeout: 60000 }).catch(() => logs.push("[shoot] garden never settled"));
  }
  await page.waitForTimeout(400);
};
await settle();
for (const a of JSON.parse(actions)) {
  if (a.click) await page.click(a.click);
  if (a.key) await page.keyboard.press(a.key);
  if (a.wait) await page.waitForTimeout(a.wait);
  if (a.settle) await settle();
  if (a.project) {
    const p = await page.evaluate((sel) => window.__plantwizGarden?.project(sel), a.project);
    logs.push(`[shoot] project ${JSON.stringify(a.project)} -> ${JSON.stringify(p)}`);
    if (p) await page.mouse.click(p.x, p.y);
  }
  if (a.drag) {
    const [x, y, dx, dy] = a.drag;
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + dx, y + dy, { steps: 12 }); await page.mouse.up();
  }
}
await page.screenshot({ path: out });
console.log(logs.join("\n") || "(no console errors/warnings)");
await browser.close();
