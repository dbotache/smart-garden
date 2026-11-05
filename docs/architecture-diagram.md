# System-architecture diagram

Source: `original_prototype/gardentwin/GardenTwinArchitecture.jsx` (+ its README; the zip next to it holds identical copies). The original files are untouched; `npm run validate` checks that they still exist.

Shown as **slide 13** (after the live demo and the tier slide) and standalone at **`/architecture`**.

## What was kept verbatim

- All 14 modules: name, sub-line, level, group, detail text, and their positions on the 1100 × 745 map.
- All 17 data flows and the level each one belongs to.
- The level buttons (`01 · Digital`, `02 · Sensorik`, `03 · Automatisierung`), the band labels, the four legend groups, the animation toggle, the footnote ("Datenflüsse sind schematisch, nicht maßstabsgetreu"), and the title and subtitle. The title is used as the slide title.
- Behaviour: a level shows its own modules and flows plus those of lower levels; switching level selects the same default module as before (Twin / Gateway / Engine); clicking a module shows its description.

## What changed

| Change | Why |
|---|---|
| Deck style instead of the dark navy theme: light `pw-50` map surface, white cards with a coloured group stripe, Cambria/Noto Serif headings, Calibri/Carlito text, green selection state | Fits the deck's style |
| Group colours from the deck palette: Garten/Geräte `#52b788`, Backend/Gateway `#1b4332`, Cloud/KI `#56635c`, Nutzeroberfläche `#f2a93b`. Flow colours per level: `#2d6a4f`, `#52b788`, `#c98516` | Brand palette. The four groups differ in lightness, not only in hue, and the legend names them |
| Flows end on the box border, not the box centre | In the original, every arrowhead sat at the centre of the target box, hidden underneath it |
| Arrowheads are coloured per level | The original used one cyan marker for all levels |
| Flows on the same side of a box get separate ports | In the original, flows met in one point |
| Analyse + KI → Bewässerungs-Engine goes around the right side of its column | Drawn straight, it ran through Datenplattform and IoT-Ingestion |
| Flows connected to the selected module are highlighted, and the detail card lists its inputs and outputs | Lets a presenter follow one data path. The lists are derived from the flows, so no content was added |
| Scales with the slide (container-query units) instead of a fixed 1100 px canvas with a horizontal scrollbar | A slide can't scroll. The standalone page stacks the panel below 720 px and scrolls only the map |
| SVG marker ids from `useId`, stable keys, TypeScript | Two diagrams on one page no longer share marker ids |
| Inactive modules at 28 % opacity (originally 13 %) | Still readable on a projector |
| Eyebrow "HOW · SYSTEMARCHITEKTUR (KONZEPT)" | Labels it a concept, like the original's "Konzeptvisualisierung" and the demo slides' *geplant* |

## Not changed / limitations

- The brand name **"GardenTwin"** and the module names ("Garden Digital Twin", "React Web-App") are kept as supplied, although the deck says PlantWiz. The speaker notes of slide 6 name Vue as today's stack, while the diagram says "React Web-App". Both are the author's content; align them before presenting if needed.
- It is a concept visualisation, as the original README says: no backend, MQTT or device code exists behind it.

## API

```tsx
import { ArchitectureDiagram } from "@/architecture";

<ArchitectureDiagram fit="slide" />                            // inside a slide body (873 × 388 pt)
<ArchitectureDiagram showHeader />                             // standalone, responsive
<ArchitectureDiagram level={lvl} onLevelChange={setLvl} />     // controlled level
```

To edit modules or flows, change `src/architecture/data/architecture.ts`. The routing tests in `src/architecture/tests/layout.test.ts` fail if a flow then crosses a box.
