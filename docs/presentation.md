# Presentation

Route: `/presentation`. Deep links: `/presentation#/7`.

## Controls

| Key / control | Action |
|---|---|
| → · PageDown · Space | next slide (Space is ignored while a button or the garden has focus) |
| ← · PageUp · Shift+Space | previous slide |
| Home / End | first / last slide |
| F, or the ⛶ button | full screen (Esc leaves) |
| N, or "Notizen" | speaker notes from the PPTX |
| "PDF" button | opens `/presentation/print?download` in a new tab, builds the PDF and downloads `PlantWiz-Praesentation.pdf` |
| Progress bar | jump to any slide (garden slides shown in light green) |

## PDF export

`/presentation/print` (`components/PrintDeck.tsx`) renders all slides one below the other at 1280 × 720 px. It waits for fonts, images (forced to eager) and all four 3D gardens to settle. Then:

- **"PDF herunterladen"** (default; the deck's PDF button triggers it via `?download`): each page is rendered to a 2560 × 1440 JPEG with `modern-screenshot` and placed on a 960 × 540 pt page with `jsPDF` (same size as the PPTX). The file is built in the browser, so Firefox, Chrome and Safari produce the same PDF. Text is part of the image (not searchable); about 7 MB, 7–15 s.
- **"Drucken …"**: the browser's print dialog with `@page { size: 1280px 720px }`. Text stays vector text, but only Chromium browsers keep the 16:9 page size reliably; Firefox falls back to its paper setting (A4/Letter portrait cuts the slides off).

Content rules for both:

- Interactive slides are exported in their opening state (architecture: level 3; finance: "Beispiel" preset, tab "Monatsergebnis"). Count-ups and growing bars render their final values (`StaticMotionContext`).
- The 3D gardens render with `preserveDrawingBuffer`, so the canvas can be copied; for printing each canvas is replaced by a PNG snapshot.
- Speaker notes are not included.

Pitfalls found while testing in Firefox (keep these when changing the export):

- `html-to-image` was replaced: in Firefox it rounds every font size down to "integer − 0.1 px" (42.67 → 41.9 px), which changed line breaks, and it cached all `/_next/image?url=…` images under one key (every picture became the title photo).
- `modern-screenshot` writes only styles that differ from browser defaults, so the page's base reset (margins 0, border-box) is added to the image CSS (`BASE_RESET`); without it headings moved down.
- Fonts are embedded explicitly from the page's `@font-face` rules (`embedFonts`), so a system font of the same name (Noto Serif is installed on many Linux systems) cannot replace the web font.

Presenter clickers send PageUp/PageDown, which always navigate, even after interacting with the garden. Clicking, dragging and scrolling never change slides.

## Migration map (PPTX → web)

Source: `original_presentation.pptx`, 9 slides, 16:9 (12 192 000 × 6 858 000 EMU = 960 × 540 pt). All text, figures and sources were copied **verbatim**, except slide 13 (PPTX 7), which was updated for consistency with the November 2026 business-model document (`business.md`). Positions, sizes and colours were transcribed from the slide XML (`--pt` units). Speaker notes were copied verbatim into `slides/index.ts`.

| Web # | File | PPTX # | Title | Elements migrated | Notes |
|---|---|---|---|---|---|
| 1 | `Slide01.tsx` | 1 | PlantWiz – Dein Garten, dein Plan. | green panel, logo, 66 pt title, tagline, event, raised-bed photo | no page number, as in the original |
| 2 | `Slide02.tsx` | 2 | Team + Mission | 2 profile cards with photos, mission card with icon | ✓ notes |
| 3 | `Slide03.tsx` | 3 | Problem + Challenges | seedling photo, persona quote, 4 challenge cards with icons | ✓ notes |
| 4 | `Slide04.tsx` | 4 | Vision | app calendar screenshot, target-vision box, "läuft heute" (6) vs "kommt als Nächstes" (4) with icons | ✓ notes |
| 5 | `Slide05.tsx` | 5 | Zielgruppe + Markt | 3 KPI cards (24,6 Mio. / 13.155 / 44.500) with sources, agriculture banner | ✓ notes (sources) |
| 6 | `Slide06.tsx` | 6 | Technische Realisierung | 3 numbered layers with status pills, garden-plan screenshot, 2 stats | ✓ notes |
| 7 | `Slide07.tsx` | — *new* | Live-Demo 1: Planung | live garden, stage "planning" | demonstrates layer 1 |
| 8 | `Slide08.tsx` | — *new* | Live-Demo 2: Empfehlungen | live garden, stage "planting" | uses app features listed on slide 4 |
| 9 | `Slide09.tsx` | — *new* | Live-Demo 3: Sensoren | live garden, stage "monitoring" | layer 2, labelled *geplant* |
| 10 | `Slide10.tsx` | — *new* | Live-Demo 4: Bewässerung | live garden, stage "irrigation" | layer 3, labelled *geplant* |
| 11 | `Slide11.tsx` | — *new* | Systemarchitektur | interactive architecture diagram (`@/architecture`), migrated from `original_prototype/gardentwin` | follows the demo; marked *Konzept* |
| 12 | `Slide12.tsx` | — *new* | Prototypen + Kosten | 3 prototypes, animated budgets, fleet scaling, parts lists (`@/business`) | from `source_documents/`; see `business.md` |
| 13 | `Slide13.tsx` | 7 | Geschäftsmodell | 4 tiers (Basic highlighted dark), footnote | **updated** to the business-model document (prices, kit purchase, Free limits); notes marked `[Aktualisiert]` |
| 14 | `Slide14.tsx` | — *new* | Finanzmodell | interactive financial model: presets, sliders, KPIs, 4 views (`@/business`) | from `source_documents/`; see `business.md` |
| 15 | `Slide15.tsx` | 8 | Nächste Schritte | 4 work streams with icons, 3-step timeline (home-plate arrows via `clip-path`) | ✓ notes |
| 16 | `Slide16.tsx` | 9 | Call + Outlook | dark slide, 3 ask cards, 4-step outlook chevrons, contact line | ✓ notes |

**Why the demo sits after slide 6:** slide 6 introduces the three layers (Digitaler Zwilling → IoT-Sensoren → Teilautomatisierung). The four demo slides walk through exactly that progression on the 3D twin before the business model. The demo eyebrows mark layers 2 and 3 as *geplant*, so nothing is presented as already running. The architecture slide (11) comes right after the demo: it shows the infrastructure behind the same three levels. Then come the prototype costs (12), the tier slide (13, PPTX 7) and the interactive financial model (14). The tier slide stays before the model so investors see the offer before the numbers. PPTX slides 7, 8, 9 are web slides 13, 15, 16.

**Assets:** every picture was taken from `ppt/media` and renamed (`public/assets/images`, `public/assets/icons`; the icons are the original white glyphs on brand-green badges). No diagram had to be rasterised: all shapes (cards, pills, chevrons, home-plates, circles) are HTML/CSS.

**Known differences**

- Cambria/Calibri are not web fonts. On machines without Office, Noto Serif and Carlito (metric-compatible with Calibri) are used, and serif headlines run slightly wider. All titles still fit (checked in the visual baselines).
- The PPTX's footer mark comes from the slide layouts. It is reproduced in `SlideLayout`.
- The reference images and the reference video are watermarked stock previews (alamy, envato). They are used only as design references and are **not** shown in the deck.

## Edit a slide

Open `src/presentation/slides/SlideNN.tsx`. Layout primitives:

- `<SlideLayout eyebrow title>` places the eyebrow (30 pt), title (55 pt), body (from 144 pt) and footer. Use `variant="dark"` or `"bare"`, and `bodyTop`/`bodyHeight` for custom bodies.
- `<At x y w h>` positions a box using **PPTX point coordinates relative to the body** (subtract 43 / 144 from the PPTX values).
- `<Card dark?>`, `<IconBadge icon size tone>`, `<Bullets items>`.
- Font-size and spacing utilities in points: `u-fs-15`, `u-p-16`, `u-px-18`, `u-gap-10`, `u-mt-12`, `u-r-10`.

## Add or reorder slides

1. Create `SlideNN.tsx` with a default-exported component.
2. Register it in `slides/index.ts` (array order = slide order) with `id`, `title`, `section`, `source` and `notes`, plus `garden: { stage }` if it embeds the garden.
3. Run `npm run validate`: it fails if a file isn't registered, or if the PPTX mapping lost a slide.

## Embed the garden in a slide

```tsx
import { SlideLayout } from "../components/SlideLayout";
import { PrototypeEmbed } from "../components/PrototypeEmbed";

export default function SlideNN() {
  return (
    <SlideLayout eyebrow="DEMO" title="…" bodyTop={104} bodyHeight={388}>
      <PrototypeEmbed stage="planting" />
    </SlideLayout>
  );
}
```

Add `garden: { stage: "planting" }` to the registry entry so the 3D bundle is prefetched a slide earlier. Inside the deck, every `PrototypeEmbed` shares **one** persistent garden (`GardenHost`). Outside a deck it renders its own `GardenScene`. To use the component directly anywhere:

```tsx
import { GardenScene } from "@/prototype";
<GardenScene presentationMode initialStage="planting" locale="de" />
// or controlled:
<GardenScene currentStage={stage} onStageChange={setStage} />
```
