# PlantWiz · Smart Garden

An interactive 3D smart-garden prototype (planning → plant recommendations → sensor monitoring → adaptive irrigation), embedded live in a web version of the PlantWiz pitch deck (migrated from `original_presentation.pptx`).

| Route | What |
|---|---|
| `/presentation/print` | PDF export: all slides as 16:9 pages. The deck's **PDF** button opens it and downloads `PlantWiz-Praesentation.pdf` |
| `/presentation` | The deck (19 slides; intro video on slide 3, product playlist on slide 6, live garden on slides 8–11, business model 12, roadmap 13, appendix 16–19). `#/7` deep-links a slide |
| `/architecture` | The interactive system architecture on its own |
| `/prototype` | The garden on its own. `?stage=monitoring&lang=de&intro=0` |
| `/original/index.html` | The untouched original prototype, for comparison |

All garden values are **simulated demonstration data**; no hardware is connected.

## Setup

Requires Node 20+ (tested with Node 22).

```bash
npm install
npx playwright install chromium     # only for E2E / visual tests
npm run dev                         # http://localhost:3100
```

| Command | Purpose |
|---|---|
| `npm run dev` | development server on port 3100 |
| `npm run build` / `npm start` | production build / serve it on port 3100 |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm test` | unit + component + integration tests (Vitest) |
| `npm run test:e2e` | Playwright E2E against the production build (run `npm run build` first; starts `next start -p 3200`) |
| `npm run test:visual` · `npm run test:visual:update` | visual regression · regenerate baselines (review before committing) |
| `npm run validate` | structure checks: slide files ↔ registry ↔ PPTX map, module boundary, no `Math.random`, inputs preserved |
| `npm run inspect-assets` | list assets, find unreferenced or missing ones |
| `npm run check` | lint + typecheck + unit + validate + build |

## Presenting

→ / PageDown / Space = next · ← / PageUp = back · F = full screen · N = speaker notes · Home/End.

In the garden: drag to orbit, scroll to zoom, click plants, beds, sensors or chips. The stage bar switches stages without leaving the slide.

## Project layout

```
src/app/            routes
src/prototype/      the garden module (public API: src/prototype/index.ts)
src/architecture/   the system-architecture diagram (public API: src/architecture/index.ts)
src/business/       prototype costs + financial model (public API: src/business/index.ts)
src/presentation/   deck: slides/SlideNN.tsx + slides/index.ts registry, components, hooks
src/shared/         brand palette
tests/              e2e/, visual/ (+ baselines), integration/
scripts/            audit-original.mjs, shoot.mjs, inspect-assets.ts, validate-project.ts
docs/               architecture, design system, prototype, presentation, testing, audit, migration report
original_prototype/ (incl. gardentwin/), original_presentation.pptx, reference_images/, source_documents/   untouched inputs
```

## How do I …

| Task | Where |
|---|---|
| replace the building model | `docs/prototype.md` → *Replace the building model* (`data/site.ts`, `components/House.tsx`) |
| add a plant | `docs/prototype.md` → *Add a plant* (`data/plants.ts`, `components/Plant.tsx`, `data/i18n.ts`) |
| change sensor values | `src/prototype/data/sensors.ts` (`CURRENT_SOIL_MOISTURE`, `CURRENT_WEATHER`) |
| change irrigation rules | `src/prototype/data/irrigation.ts` (`RULES`, `FIXED_SCHEDULE`), logic in `utils/irrigationLogic.ts` |
| add a garden stage | `docs/prototype.md` → *Add a stage* |
| edit a slide | `src/presentation/slides/SlideNN.tsx`; see `docs/presentation.md` |
| add or reorder slides | `src/presentation/slides/index.ts` |
| embed the garden in a slide | `<PrototypeEmbed stage="planting" />`; see `docs/presentation.md` |
| change prototype parts or business assumptions | `src/business/data/prototypes.ts`, `src/business/data/businessModel.ts`; see `docs/business.md` |
| edit the architecture diagram | `src/architecture/data/architecture.ts` (modules, flows, levels); see `docs/architecture-diagram.md` |
| connect the recommendation API | `createHttpRecommendationProvider()` in `src/prototype/data/recommendations.ts`; contract in `docs/prototype.md` |

## Documentation

- [architecture.md](docs/architecture.md): module structure and the decisions behind it
- [design-system.md](docs/design-system.md): how the references and the PPTX map to the scene and UI
- [prototype.md](docs/prototype.md): stages, hardware model, decision logic, extension guide
- [architecture-diagram.md](docs/architecture-diagram.md): the migrated system-architecture visualisation (slide 17)
- [business.md](docs/business.md): prototype costs and financial model (slides 12–14), **corrections to the source documents**, consistency changes
- [presentation.md](docs/presentation.md): controls, **PPTX migration map**, editing slides
- [testing.md](docs/testing.md): the test suite and determinism
- [audit-report.md](docs/audit-report.md): the original prototype's defects, causes, fixes and verification
- [migration-report.md](docs/migration-report.md): before/after, inputs, limitations
