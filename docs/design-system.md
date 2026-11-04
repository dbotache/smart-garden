# Design system

Two authorities are combined here. **The reference images govern the 3D scene. The original PowerPoint governs everything typographic and all brand colour.**

## 1. Reference analysis → decisions

| Reference (`reference_images/`) | What it shows | How the scene uses it |
|---|---|---|
| `1-overall view.png` | Ink sketch from an aerial three-quarter view: a cubic flat-roof house (two-storey block plus one-storey wing), large glazing, thin roof slabs, trees framing the plot, beds bordered with stones | House massing (`House.tsx`: L-shape, 6.2 m / 3.2 m, cantilevered 0.3 m slabs, east glazing with mullions). Trees placed *behind* the beds as a frame. Ink-on-paper palette for stage 1 |
| `1-planning.jpg` *(alamy watermark, reference only)* | White wireframe house, black lines, construction lines running past the corners, no fills | Stage 1 is a line drawing: white "clay" faces with dark edges (`EdgesGeometry`), construction lines that overshoot the corners by 1.4 m, and vertical construction lines at three corners |
| `1-planning stage.mp4` *(envato watermark, reference only)* | A floor plan with dimension strings that **extrudes into walls** while the camera orbits slowly | The build-in: plan lines draw progressively (`drawRange`), then the dimension strings, then the walls rise from the plan (`scale.y`, `build` 0.35 → 1) |
| `2-choosing an area…jpg` | SketchUp-style planning: grey translucent volumes, dashed guides, a selected area | Dashed planting-zone outlines with a translucent selectable fill (hover 0.26, selected 0.42 opacity) |
| `2-putting plants with recommendations.jpg` | White low-poly plants with visible facets in wooden raised beds with plank seams | Faceted plants (`flatShading`, icosahedron and cone parts). Plank seams drawn as lines on the bed sides; 2 × 3 raised beds |
| `3-final 3d model.jpg` | Top-down kitchen garden: six wooden beds on gravel, fruit trees (apple, pear, plum), lawn | Final materials: gravel `#ddd5c4`, lawn `#b4c39a`, wood `#9a7856`, soil `#5d4a3a`. The existing trees are apple, pear and plum, with fruit |
| `3-recognizing additional plants.jpg` | A richer planting scheme with birches and perennials, isometric with shadows | Soft shadows (PCF, 2048² map), a hedge boundary, muted greens; existing plants labelled "recognised from photo" |

**Projection:** a perspective camera with a narrow 32° FOV. It reads almost axonometric, like the references, but still orbits naturally. **Every stage uses the same projection.** Only the target and distance glide (1.1 s ease-in-out) and the user's viewing angle is kept, so stage changes never jump.

**Level of realism:** an architectural model, not photorealism. Flat-shaded geometry, no textures, soft hemisphere and directional light, no bloom, no neon, no tone mapping (`flat`), so the brand colours render exactly.

## 2. One model, five layers

The garden is a single scene graph. Stages only move layer targets (0–1), and a layer may grow only once the previous layer is mostly complete (`utils/stages.ts → stepLayers`):

`build` (lines → walls) → `materialize` (sketch → colour) → `planted` (beds rise, plants grow, staggered per bed) → `sensors` (devices pop in) → `irrigation` (pipes draw along their length, then drip lines)

Going back removes the layers in reverse order. The house never moves.

## 3. Palette

| Token | Hex | Source | Use |
|---|---|---|---|
| `pw-900` | `#1B4332` | PPTX dk2 | Titles, dark cards, active stage |
| `pw-700` | `#2D6A4F` | PPTX accent1 | Eyebrows, icon badges, values |
| `pw-400` | `#52B788` | PPTX accent2 | Highlight and selection in 3D, accents |
| `pw-200` | `#B7E4C7` | PPTX accent3 | Text on dark backgrounds, "planned" badges |
| `pw-50` | `#EEF8F1` | PPTX lt2 | Cards |
| `pw-ink` | `#1F2D26` | PPTX dk1 | Body text |
| `pw-muted` | `#56635C` | PPTX accent6 | Captions, sources |
| `pw-red` | `#D9482B` | PPTX accent4 | "Pilot gardens" badge only |
| paper | `#f3f2ec` | reference sketches | 3D background, panels |
| measured | `#287a52` | dataviz-validated | Measured series, solid line |
| estimated | `#b5630b` | dataviz-validated | Estimates, **always dashed and text-labelled** |

The measured/estimated pair was run through the dataviz palette validator. Chroma passes and normal-vision ΔE is 19.4. Protan ΔE is 6.3, which is acceptable only with secondary encoding, and that is guaranteed by the dash pattern and the "Gemessen / Geschätzt" badges.

Irrigation status dots always come with a word: water = blue `#2b7db8`, wait for rain = amber `#d0912c`, no water = grey `#a5ada8`. Moisture status uses below = `#B4532A`, within = `#2D6A4F`, above = `#2E6F9E`, always with "below / within / above target" text.

## 4. Typography

- **Headlines:** `Cambria` (as in the PPTX) → web fallback **Noto Serif** (self-hosted via `next/font`).
- **Body:** `Calibri` → **Carlito**, its metric-compatible open substitute, so line breaks match the PPTX.
- On a presenter laptop with Office installed, the original faces are used automatically.
- Slide sizes come straight from the PPTX in points through the `--pt` unit (1 pt = 1/960 of the frame width): title 32 pt, eyebrow 13 pt caps tracked, card headings 17–18 pt, body 13–16 pt.

## 5. UI in the 3D view

- At most **one floating panel**, docked right and becoming a bottom sheet when narrow, plus one stage bar and the camera tools. The heading sits on a soft paper gradient.
- In-scene chips appear **only for the active stage** (scores → moisture → decisions), fade in after the growth animation, and are compact. Labels are dropped for "no water" beds so chips don't overlap at slide size.
- Every number shown in the scene is also in the panel list, so nothing is readable only through a hover or a chip.
- `prefers-reduced-motion` disables the chip and label animations and shortens the watering demo to 0.8 s.
