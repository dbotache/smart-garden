import { expect, test } from "@playwright/test";
import { watchConsole } from "./helpers";

const ORDER = ["title", "team", "problem", "market", "product-videos", "vision", "business", "roadmap", "call"];
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
    await expect(page.getByTestId("deck-counter")).toHaveText("2 / 9");
    expect(problems).toEqual([]);
  });

  test("backup deck: reached from the main deck, cost slides interactive without moving the deck", async ({ page }) => {
    const problems = watchConsole(page);
    await openDeck(page, 9);
    await page.getByTestId("deck-switch").click();
    await expect(page).toHaveURL(/\/presentation\/backup$/);
    await expect(page.getByTestId("deck")).toHaveAttribute("data-keys", "ready");
    await expect(page.getByTestId("deck-counter")).toHaveText("1 / 3");
    await expect(page.getByTestId("deck-pdf")).toHaveAttribute("href", "/presentation/backup/print?download");
    await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", "phase1-costs");
    // phase 1: switching users and paid share recomputes the running costs
    await expect(page.getByTestId("phase1-costs")).toHaveAttribute("data-result", "1110");
    await page.getByTestId("phase1-users").getByText("50.000").click();
    await page.getByTestId("phase1-share").getByText("10 %").click();
    await expect(page.getByTestId("phase1-costs")).toHaveAttribute("data-result", "16098");
    await page.keyboard.press("ArrowRight");
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
    await expect(page.getByTestId("compat-costs")).toHaveAttribute("data-avoided-low", "3463");
    await expect(page.getByTestId("compat-ha")).toHaveAttribute("data-status", "ready");
    await page.getByTestId("deck-switch").click();
    await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", "call");
    expect(problems).toEqual([]);
  });

  test("speaker notes from the PPTX are available", async ({ page }) => {
    await openDeck(page, 4);
    await page.keyboard.press("n");
    await expect(page.getByTestId("speaker-notes")).toContainText("KfW Research");
  });

  test("exports all slides as a 16:9 PDF", async ({ page }) => {
    test.setTimeout(240_000); // 9 page renders incl. videos; slow under parallel load
    const problems = watchConsole(page);
    await openDeck(page);
    const pdfLink = page.getByTestId("deck-pdf");
    await expect(pdfLink).toHaveAttribute("href", "/presentation/print?download");
    await expect(pdfLink).toHaveAttribute("target", "_blank");

    await page.goto("/presentation/print"); // without ?download: the test clicks the button itself
    await expect(page.getByTestId("print-deck")).toHaveAttribute("data-ready", "true", { timeout: 60_000 });
    await expect(page.locator(".print-page")).toHaveCount(ORDER.length);
    // animated figures are printed at their final values
    const shown = await page.locator(".print-page [data-value]").evaluateAll((els) => els.map((e) => [e.children[0]?.textContent, e.children[1]?.textContent]));
    for (const [visible, final] of shown) expect(visible).toBe(final);

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

  test("videos play muted and leave the deck keys to the presenter", async ({ page }) => {
    await openDeck(page, 3);
    await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", "problem");
    const video = page.locator("video");
    await expect(video).toHaveAttribute("src", "/assets/videos/plantwiz-pitch.mp4");
    expect(await video.evaluate((v: HTMLVideoElement) => v.muted && v.autoplay)).toBe(true);
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("deck")).toHaveAttribute("data-slide-id", "market");
    await openDeck(page, 5);
    await expect(page.locator("video")).toHaveAttribute("src", "/assets/videos/pflegekalender.mp4");
  });
});
