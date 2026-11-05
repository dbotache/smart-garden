# Architecture

```
src/
├── app/                      Next.js App Router (routes only, no logic)
│   ├── page.tsx              landing: links to /presentation, /prototype, /original
│   ├── prototype/            standalone garden (?stage=…&lang=de&intro=0)
│   └── presentation/         the slide deck
├── prototype/                ← independent module; public API = index.ts
│   ├── types/                domain types (GardenStage, GardenPlant, IrrigationDecision …)
│   ├── data/                 site layout, plants, sensors, irrigation hardware, recommendations, i18n
│   ├── utils/                pure logic: stages, irrigation decisions, routing, geometry, time series, health estimate
│   ├── hooks/                useGardenController (controlled/uncontrolled state), useIrrigationDemo
│   ├── components/           GardenScene (public component) + R3F scene: GardenCanvas, House, Terrain,
│   │                         PlanningLayer, GardenBeds, Plant, Sensor, IrrigationSystem, CameraController,
│   │                         StageController, SceneLabels, materials, primitives
│   ├── overlays/             DOM panels: StageControls, PlantInfoPanel, ZoneInfoPanel, SensorDashboard,
│   │                         TimeSeriesChart/MoistureChart, HealthIndicator, IrrigationDecision, CameraTools
│   ├── stages/               panel content per stage (PlanningStage … IrrigationStage)
│   ├── styles/garden.css     classes for chips inside drei <Html> (separate React roots)
│   └── tests/                unit + component tests
├── architecture/             ← system-architecture diagram (slide 13, /architecture); public API = index.ts
│   ├── data/architecture.ts  modules, flows, levels (verbatim from original_prototype/gardentwin)
│   ├── utils/layout.ts       pure: active nodes/edges per level, edge routing (border ports, detours)
│   ├── components/           ArchitectureDiagram
│   ├── styles/               architecture.css (imported by globals.css)
│   └── tests/
├── business/                 ← prototype costs (slide 14), financial plan + operating costs (15–19), financial model (slide 20); public API = index.ts
│   ├── data/                 parts lists, tariffs, kit, presets (inputs only, from source_documents/)
│   ├── utils/                pure: prototypeCosts.ts, finance.ts, money.ts (German formatting)
│   ├── components/           PrototypeCosts, FinanceModel, FinanceCharts (SVG), ui (count-up, slider, tiles)
│   └── tests/
├── presentation/
│   ├── slides/               Slide01.tsx … Slide22.tsx + index.ts (the registry, sole source of order)
│   ├── components/           SlideDeck, SlideLayout, SlidePrimitives, SlideNavigation, SlideProgress,
│   │                         GardenHost, PrototypeEmbed, SlideMeta
│   ├── hooks/                useDeckLocation (URL hash), useFullscreen
│   ├── utils/keyboard.ts     pure keyboard rules
│   ├── config/types.ts       SlideDefinition
│   └── tests/
└── shared/brand.ts           PPTX palette shared by both modules
```

## Decisions

| Decision | Why |
|---|---|
| **Replace the 2D canvas renderer with React Three Fiber** | Its back-to-front polygon sorting caused the critical defects (see `audit-report.md`). A depth buffer fixes the cause; R3F gives declarative scene composition, ResizeObserver sizing, on-demand rendering and raycast events. |
| **Domain logic is pure TypeScript, outside React and three.js** | Irrigation decisions, stage cascade, routing, health estimate and selection mapping are unit-tested without WebGL. Rendering components only read the results. |
| **One scene graph, layer progress in a ref** | The model evolves instead of being swapped per stage. Progress changes every frame, so it lives in a `useRef` read by `useFrame`. React re-renders only on stage or selection changes. |
| **`frameloop="demand"`, `"never"` when hidden** | No GPU work while idle. `StageController` requests frames only while layers, the camera or the watering demo move. |
| **Shared materials and geometries; instancing for plants** | One shared set of 47 materials for the whole scene (plus 7 small per-zone highlight materials), module-level geometries, one `InstancedMesh` per plant part per bed. Everything is disposed on unmount. |
| **Controlled + uncontrolled stage** (`currentStage`/`onStageChange` vs `initialStage`) | The same component serves the standalone page (uncontrolled) and the deck (controlled by the slide). |
| **One persistent garden per deck (`GardenHost`)** | Slides render a `<PrototypeEmbed stage=…>` *slot*. The host positions a single `GardenScene` over the current slot. Moving between demo slides changes only the stage, never the WebGL context. Camera, selection and demo state survive. On other slides the garden is hidden and paused, not unmounted. |
| **Slides scale with `--pt` and container query units, not CSS `transform: scale`** | Transforms would break the pointer→ray mapping of the embedded canvas. With `--pt` (1/960 of the frame width), layouts are transcribed straight from PPTX coordinates. |
| **Slide index in the URL hash (`#/7`), read via `useSyncExternalStore`** | Deep links, reload-safe, no hydration mismatch, and `location.replace` keeps the history clean. |
| **The deck never navigates on pointer or wheel input** | Removes any conflict with orbiting, zooming and clicking in the garden. Keyboard rules are a pure function (`deckKeyAction`). |
| **three.js loads lazily** | `GardenCanvas` is a `next/dynamic` (`ssr:false`) chunk. Slides 1–6 never load three.js (an E2E test asserts `window.__THREE__` is undefined). The deck prefetches the chunk one slide early. |
| **Dependencies kept minimal** | Charts are about 150 lines of SVG (`TimeSeriesChart`), so no Recharts. Animations are R3F `useFrame` plus CSS, so no Framer Motion. State is React state plus refs, so no Zustand. Each would have added weight without adding capability here. |
| **Module stylesheets are imported by `globals.css`, not by components** | A component-level CSS import becomes a separate chunk. `<Link>` prefetches of `/presentation` then preload that chunk on pages that never use it, and Chromium logs a warning (the E2E tests require a clean console). The two sheets are 7 kB together. |
| **Business figures are computed, never copied** | The source documents contain arithmetic errors (`business.md`). Storing only inputs and deriving every figure in pure functions makes errors visible and keeps all slides consistent. |
| **Relative deck navigation reads the URL hash** | `step(±1)` reads `location.hash` at key-press time. With the rendered index, a key pressed before the new slide's effect re-registered the handler went to the slide already shown. |
| **German in the deck, English standalone** | The pitch is German. All prototype copy lives in `data/i18n.ts` (`en`, `de`), and the canonical data stays English. |

## Data flow (garden)

```
GardenScene ─ useGardenController ─┬─ stage (controlled | internal)
                                   ├─ selection → selectionForStage()  (zone ↔ plant ↔ probe)
                                   ├─ weather, mode → planIrrigation() / compareModes()   (pure)
                                   └─ useIrrigationDemo → demoRef (progress, per frame)
        │ SceneState (React context, re-created on discrete changes only)
        ▼
GardenCanvas ─ StageController (layers ref) ─ materials blend ─ Terrain / House / PlanningLayer /
               GardenBeds+Plant / Sensors / IrrigationSystem / SceneLabels (drei Html chips)
```

## Test/debug bridge

`window.__plantwizGarden = { stage, settled, project(selection), stats() }`. `project` maps a plant, sensor or zone anchor to screen coordinates, and `stats` returns the renderer's draw calls, triangles and programs for the last frame (72–168 calls, ≤ 49k triangles across the stages). Playwright uses it to click real 3D objects deterministically. `data-settled` on the garden root signals that no animation is running.
