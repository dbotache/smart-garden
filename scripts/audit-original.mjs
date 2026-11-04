// Phase 1 audit: drives the ORIGINAL prototype (public/original/index.html) in Chromium,
// captures screenshots per stage and collects runtime evidence for docs/audit-report.md.
import { chromium } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = "file://" + path.join(root, "public/original/index.html");
const out = (n) => path.join(root, "docs/audit", n);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
page.on("dialog", async (d) => { logs.push(`[dialog:${d.type()}] ${d.message()}`); await d.dismiss(); });
await page.goto(url);
await page.waitForTimeout(800);

for (let s = 0; s < 4; s++) {
  await page.click(`[data-stage="${s}"]`);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: out(`original-stage-${s + 1}.png`) });
}
// rotate to a low side angle to expose painter's-algorithm sorting errors
const box = await page.locator("#scene").boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + 260, box.y + box.height / 2 + 120, { steps: 10 });
await page.mouse.up();
await page.waitForTimeout(300);
await page.screenshot({ path: out("original-rotated.png") });

// rAF activity while idle (stage 4 forces a redraw every frame)
const frames = await page.evaluate(() => new Promise((r) => { let n = 0; const t0 = performance.now();
  const f = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else r(n); }; requestAnimationFrame(f); }));
logs.push(`[probe] rAF callbacks in 1s idle: ${frames}`);

// global arrow keys change stage even when focus is elsewhere (conflicts with slide navigation)
await page.click(`[data-stage="0"]`);
await page.keyboard.press("ArrowRight");
logs.push(`[probe] stage counter after global ArrowRight: ${await page.textContent("#sceneNum")}`);

// wheel over canvas: does it block page scroll?
const scrolled = await page.evaluate(() => { const e = new WheelEvent("wheel", { deltaY: 100, cancelable: true });
  document.getElementById("scene").dispatchEvent(e); return e.defaultPrevented; });
logs.push(`[probe] wheel defaultPrevented on canvas: ${scrolled}`);

// container resize (as when embedded in a slide) without window resize
await page.evaluate(() => { document.getElementById("view").style.width = "500px"; });
await page.waitForTimeout(300);
const dims = await page.evaluate(() => { const c = document.getElementById("scene"); const b = c.getBoundingClientRect();
  return { css: Math.round(b.width), backing: c.width, dpr: devicePixelRatio }; });
logs.push(`[probe] after container resize: css width ${dims.css}, canvas backing width ${dims.backing} (dpr ${dims.dpr})`);
await page.screenshot({ path: out("original-container-resize.png") });

// decision button uses window.alert
await page.evaluate(() => { document.getElementById("view").style.width = ""; });
await page.click(`[data-stage="3"]`);
await page.waitForTimeout(600);
await page.click("#showDecision").catch((e) => logs.push("[probe] decision click failed " + e.message));
await page.waitForTimeout(300);

// mobile layout
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(400);
await page.screenshot({ path: out("original-mobile.png"), fullPage: true });

console.log(logs.join("\n"));
await browser.close();
