# Testing

| Layer | Tool | Location | Command |
|---|---|---|---|
| Unit (domain logic) | Vitest | `src/prototype/tests/*.test.ts`, `src/presentation/tests/*.test.ts` | `npm test` |
| Component | Vitest + Testing Library (jsdom) | `src/prototype/tests/*.test.tsx` | `npm test` |
| Integration (deck + garden host) | Vitest + Testing Library | `tests/integration/` | `npm test` |
| End-to-end | Playwright (Chromium, production build) | `tests/e2e/` | `npm run build && npm run test:e2e` |
| Visual regression | Playwright screenshots | `tests/visual/` (baselines in `__screenshots__/`) | `npm run test:visual` |
| Structure | tsx scripts | `scripts/validate-project.ts`, `scripts/inspect-assets.ts` | `npm run validate`, `npm run inspect-assets` |
| Everything static | | | `npm run check` (lint, typecheck, unit, validate, build) |

## What is covered

**Unit:**
- Plant data integrity, plant→zone→irrigation-zone relationships.
- Geometry: no overlaps with the house, terrace, hedges or beds; plants inside their bed; probe clearance; trees away from devices; **pipes never cross and never enter beds or the house** (mutation-checked).
- Sensor fixtures: deterministic, histories end at the current value, health index always *estimated*.
- Time-series transforms and invalid data.
- The irrigation decisions, including the brief's tomato example, rain deferral, critical watering, invalid inputs and the pinned demo numbers.
- Stage transitions and layer cascade; selection carried across stages; recommendation API contract (valid and invalid payloads, HTTP errors); deck keyboard rules; slide registry and PPTX mapping.

**Component:**
- Stage controls (click does not bubble), plant panel (EN/DE, existing tree), sensor dashboard (measured vs estimated), chart (band, data table, ←/→ consumed so the deck does not move), decision card.
- `GardenScene` uncontrolled and controlled, keyboard (standalone vs presentation), WebGL fallback, and the full irrigation demo timeline with fake timers.

**Architecture diagram** (`src/architecture/tests/`):
- Data: 14 modules and 17 flows, valid references, no flow active before its modules, boxes inside the map and not overlapping.
- Routing: every flow starts and ends on a box border, **no flow crosses another box** (sampled Bézier curves), the KI → Engine detour stays left of the app column, and each port is unique.
- Component: levels hide flows and disable modules, details and connections, the animation toggle, the controlled level, unique SVG marker ids.

**Business** (`src/business/tests/`):
- Prototype costs: totals of prototypes 1 and 2 as in the document, prototype 3 corrected to 398 € / 457,70 €, budgets inside the stated ranges, fleet scaling, category split, component counts.
- Finance: per-tariff values, kit and price sensitivity, rental payback, funnel, seasonality, the corrected mix ARPU (6,29 €) and DB (4,99 €), the document's formulas reproduced with its own inputs, worked example, year-3 states, break-even with and without free users, payback, LTV, German formatting.
- Components: budgets, selection, fleet scaling, parts list; presets, slider changes, tariffs consistent with the business plan, customer and hardware views, acquisition month in the waterfall.

**Integration:**
- Two quick key presses move two slides.
- Deck order; **one** garden instance across all demo slides, with its stage driven by the slide; paused when hidden; garden stage changes don't change the slide; clicks, drags, wheel and focused Space don't navigate; navigation still works afterwards; speaker notes.

**E2E** (real WebGL via SwiftShader):
- No console errors or warnings; the canvas renders pixels; all stages reachable.
- Clicking **real 3D objects** (zone, tomato, pear tree, probe) through the projection bridge; dragging rotates without selecting.
- Sensor charts; the watering demo runs to completion with animated moisture values; fixed timer vs adaptive; rain scenario; canvas resizing.
- Presentation: order and URL; three.js **not** loaded; the backup deck (reached via the Backup button; phase-1, prototype and compatibility slides interactive without moving the deck; back to the call); notes; videos muted with deck keys left to the presenter. (The garden journey tests were removed with the live-demo slides on 2026-11-06; the garden is covered by the `/prototype` tests.)
- PDF export: the print view has one page per slide (9), every animated number shows its final value; "PDF herunterladen" downloads `PlantWiz-Praesentation.pdf` with one 960 × 540 pt page per slide, and the print path (`page.pdf()`) has the same page count and size.
- Firefox is not covered by Playwright here. The download was checked once in Firefox 159 through WebDriver BiDi (headless, with the then 16 slides): 16 pages of 960 × 540 pt, compared page by page with Firefox's own rendering (1–3 % differing pixels from anti-aliasing/JPEG, no layout shifts).

**Visual:**
- 4 stages, the sensor detail, the embedded garden after the watering demo, the architecture slide, the prototype-cost, financial-plan, four operating-cost and financial-model slides (after their count-up), and the 9 migrated PPTX slides.
- 1440×900, DPR 1, intro off, fixed camera presets, seeded data.
- Tolerance is `maxDiffPixels: 300`. It was tightened from 1 % after a review showed that 1 % let a chip-label change pass.
- Baselines were reviewed by eye. They are renderer-specific: regenerate them with `npm run test:visual:update` on a new machine or browser version, and review the diff before committing.

## Load and timeouts

Playwright runs with 2 workers. Every worker renders WebGL in software (SwiftShader), and since the PDF-export test (4 gardens + 9 page renders) was added, 3 workers starved the 3D tests on a busy machine. The garden visual test on the irrigation slide then exceeded its waits; on its own it passed. `waitForGarden` therefore allows 120 s, and the irrigation-slide garden test (it waits twice, before and after the watering demo) has a 4-minute limit.

## Waiting for hydration

The deck sets `data-keys="ready"` once its keyboard handler is attached. E2E tests open the deck with `openDeck()`, which waits for it: a key pressed before hydration is lost, and under parallel load this made the presenter-journey test fail intermittently.

## Key presses during slide changes

The E2E run exposed that a key pressed right after a slide change was handled with the previous slide index. The deck now navigates relative to the URL hash (`useDeckLocation().step`), and an integration test sends two presses in one tick.

## Determinism

- No `Math.random` (enforced by `npm run validate`).
- Sensor histories come from `mulberry32` seeded by device and metric, ending at fixed values, with a fixed "now" of `2026-07-15T10:00Z`.
- The watering demo is time-based (6 s) and ends in fixed values.
- Tests wait for `[data-garden-root][data-settled="true"]`, which is set only when layer, camera and demo animations are finished.

## Known test-environment messages

- jsdom prints `Not implemented: HTMLCanvasElement's getContext()`. This is expected: there is no WebGL in jsdom, and the test asserts that the fallback UI renders.
- The integration test prints `THREE.WARNING: Multiple instances of Three.js being imported` once. It comes from the jsdom module graph only. The browser console is clean, and the E2E tests assert zero warnings.
