import { defineConfig, devices } from "@playwright/test";

/**
 * E2E + visual tests run against the PRODUCTION build (`npm run build` first).
 * WebGL runs on SwiftShader in headless Chromium, so screenshots are deterministic for a given machine.
 */
const PORT = Number(process.env.E2E_PORT ?? 3200);

export default defineConfig({
  testDir: "tests",
  testMatch: ["e2e/**/*.spec.ts", "visual/**/*.spec.ts"],
  timeout: 90_000,
  expect: { timeout: 30_000, toHaveScreenshot: { maxDiffPixels: 300, animations: "disabled", caret: "hide" } },
  fullyParallel: true,
  // 2 workers: every worker renders WebGL in software (SwiftShader); with 3 the 3D tests starved under load
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  snapshotPathTemplate: "{testDir}/visual/__screenshots__/{arg}{ext}",
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
    reducedMotion: "no-preference",
    trace: "retain-on-failure",
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
