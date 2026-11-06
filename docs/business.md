# Prototype costs, financial plan and financial model (slides 9–15)

Sources (saved unchanged): `source_documents/GardenTwin_Prototyp_Level_Kostenvergleich.md` and `source_documents/GardenTwin_Geschaeftsmodell_Finanzkalkulation.md` (both dated November 2026).

| Slide | Content | Component |
|---|---|---|
| 14 · Prototypen + Kosten (new) | 3 prototypes, plan budgets, comparison on one scale (1/5/10/25 units), cost breakdown, full parts list | `PrototypeCosts` |
| 12 · Geschäftsmodell (PPTX 7) | Free, Basic, planned Erweitert (Robin's version from `pitch/plantwiz-updates`) | static slide |
| 15 · Finanzplan (new) | Investor summary: the three year-3 states side by side (paying customers, net MRR, costs, monthly result on one scale, progress to break-even), one paying customer (6,29 € → 4,99 € DB, CAC payback, LTV, kit DB), what the pilot measures | `FinanceSummary` |
| 16–19 · Betriebskosten (new) | Phase 1 digital, compatibility stage, own sensor hardware, savings levers – researched prices | see `operating-costs.md` |
| 20 · Finanzmodell (new) | Interactive model: presets, assumptions, KPIs, monthly result, tariffs, customer economics, hardware kit | `FinanceModel` |

All numbers are computed in `src/business/utils/` from the documents' **inputs** (parts lists, prices, costs, rates). No derived total is copied, and unit tests pin every displayed figure.

## Corrections to the source documents

| Where | Document | Recalculated | Effect |
|---|---|---|---|
| Prototype 3 material total | 438,00 € (reserve 65,70 €, plan 503,70 €) | **398,00 €** (59,70 € / **457,70 €**) — the 18 listed parts add up to 398 € | 5/10/25 units: 2.288,50 € / 4.577 € / 11.442,50 € (document: 2.518,50 / 5.037 / 12.592,50) |
| ARPU at mix 60/30/10 (section 4.1) | 6,53 € | **6,29 €** = 0,6 × 4,19 + 0,3 × 8,39 + 0,1 × 12,60 | every table based on it (sections 5, 6, 7.2, 8, 10, 11) |
| Contribution per paying customer | 5,23 € | **4,99 €**, which also matches the document's own per-tariff values: 0,6 × 3,39 + 0,3 × 6,59 + 0,1 × 9,80 | see below |
| Break-even without free users (6.000 € fixed) | 1.148 paying | **1.202** | 1.000 / 12.000 / 25.000 €: 201 / 2.403 / 5.006 |
| Break-even with 19 free users per paying customer | 1.802 paying | **1.940** (38.800 active users) | |
| Worked example (section 10.3) | −5.667 € / −7.260,70 € | **−5.690,59 € / −7.284,29 €** | |
| Year-3 states (section 11) | −3.835 € / −1.175 € / **+18.300 €** | **−3.953 € / −1.765 € / +15.941 €** | the ambitious case is 2.359 € per month lower |
| CAC payback (25 € / 50 €) | 4,78 / 9,56 months | **5,0 / 10,0 months** | |
| LTV at 2/5/8/12 % churn | 261,50 / 104,60 / 65,38 / 43,58 € | **249,71 / 99,88 / 62,43 / 41,62 €** | |
| Rental after 12 / 24 months | −26,46 € / +42,08 € | −26,43 € / +42,14 € (unrounded) | payback 16,6 months unchanged |
| Erweitert DB margin | 78,5 % | 78,6 % (78,5 % comes from rounded 6,59 / 8,39) | |

Unchanged and confirmed: prototypes 1 and 2, the kit calculation and price sensitivity, per-tariff net prices and contributions, the funnel counts, registrations needed per conversion rate, and seasonality. A unit test also shows that the document's formulas are the same as ours: fed the document's 6,53 € it reproduces −5.667 € and −7.260,70 €.

## Consistency changes to existing slides

> **Since the merge of `pitch/plantwiz-updates` (2026-11-05)** the tier slide is Robin's version (slide 7): Free, Basic 4,99 € and Erweitert as "Geplant", no Expert tier and no Erweitert price. The financial slides (10–15) still use the business plan's four tiers (Erweitert 9,99 €, Expert 14,99 €, mix 60/30/10); the compatibility stage (12) sells via Expert. The table below documents the earlier 4-tier version.

| Slide | Before (PPTX) | Now | Reason |
|---|---|---|---|
| 13 Free | "Bis zu 3 Gärten" | "1 Garten mit bis zu 3 Zonen" | business-model document, tariff table |
| 13 Erweitert | "Preis offen", "Abo inklusive Hardware", "Sensoren werden mitgeliefert" | "9,99 €", "pro Monat + Sensor-Kit (Kauf)", "Sensoren, Historie und Benachrichtigungen" | the document recommends kit purchase; rental only after pilot data |
| 13 Expert | "Preis offen", "Skalierungsmöglichkeiten" | "14,99 €", "Offene Schnittstellen, Datenexport" | document |
| 13 footnote | "Basic-Preis laut Launch-Plan: 4,99 €/Monat oder 29,99 €/Jahr." | "Preise brutto pro Monat bei Jahreszahlung (Planungsannahme). Sensor-Kit 149–199 € als Kauf, Miete erst nach Pilotdaten." | 4,99 € is now the monthly equivalent of annual billing (59,88 €/year), which contradicts 29,99 €/year |
| 13 notes | PPTX notes | marked `[Aktualisiert]`; the old statements are quoted at the end | |

Kept: Basic 4,99 € "Preisvorschlag", "Nur von uns freigegebene Modelle", "Die App kennt heute die Stufen Free und Pro", affiliate links, and the 2–5 % conversion benchmark (the model's base is 5 %, cautious 2 %).

**Naming.** The prototype document calls its stages "Level 1–3". The deck already uses "Level" for the subscription tiers (slide 7) and for the architecture build-out (slide 8), so the slides say **Prototyp 1–3**. Mapping: Prototyp 1 covers architecture level 2 (sensors), Prototyp 2 adds level 3 (one irrigation zone) and a camera, and Prototyp 3 is Prototyp 2 off-grid (LTE, solar).

**Brand.** Both documents say "GardenTwin"; the deck says PlantWiz. The new slides avoid the brand name ("Sensor-Kit" instead of "GardenTwin-Kit").

**Live demo vs prototypes.** The 3D demo (slides 18–21) shows a fully built garden with 6 beds, valves and probes. The prototypes start smaller (1–2 valves). The demo slides are labelled as demo data and *geplant*, so this is not a contradiction, but say so if asked.

## Financial plan for investors (slide 10)

A static slide for the pitch; the cost slides (16–19) and the interactive model (20) follow.

- **Scenarios** = the business plan's three states at the end of year 3 (section 11): 5.000 / 25.000 / 100.000 active users, 10 % paying, mix 60/30/10, 0,10 € per free user, fixed costs 6 / 12 / 25 k€. The slide calls the base case **"Realistisch"** (badge "Basisszenario"), as the plan's "Basis".
- **Costs** per card = fixed costs + free-user costs + variable costs of paying customers (7.100 / 17.500 / 47.000 €). MRR − costs = monthly result (−3.953 / −1.765 / +15.941 €).
- **Break-even per scenario** (new, computed with the plan's formula at each scenario's fixed costs and 9 free users per paying customer): 1.466 / 2.932 / 6.107 paying customers, i.e. 34 % / 85 % / 164 % reached.
- **Result bars** share one scale (−5 k€ to +20 k€) across the three cards.
- **One paying customer** uses the base parameters: 25 € CAC → payback 5 months; 5 % churn → 20 months lifetime, LTV 100 € = 4× CAC; kit at 149 € → +30 € DB.
- **Pilot metrics** are the ranges of section 13 (conversion 2–10 %, churn 2–8 %, CAC 15–50 €).
- Deliberately **not shown**: annual revenue, ARR, cash flow or a 3-year curve. The document says these must not be derived from the year-3 states (section 11). A real 36-month plan needs the cohort model of section 12.

## Financial model: what the controls do

| Control | Range | Marks (cautious / base / positive) |
|---|---|---|
| Presets | Beispiel (section 10), Jahr 3 vorsichtig / Basis / ambitioniert (section 11) | |
| Active registered users | 1.000–100.000 (steps incl. 2.000, 10.000, 20.000, 40.000) | |
| Conversion registered → paying | 1–15 % | 2 / 5 / 10 % |
| Tariff mix Basic/Erweitert/Expert | 80/15/5 · 60/30/10 · 40/40/20 | |
| Fixed costs per month | 1–30 k€ | 6 / 12 / 25 k€ (year-3 states) |
| CAC per new paying customer | 5–60 € | 50 / 25 / 15 € |
| Churn per month | 1–12 % | 8 / 5 / 2 % |
| Cost per active free user (tab "Free + 3 Abos") | 0,20 / 0,10 / 0,05 € | |
| Kit price and share of new customers buying one (tab "Hardware-Kit") | 129–199 €, 0–100 % | |

The year-3 presets imply 10 % paying users (500 of 5.000 etc.), as in section 11 of the document.

Formulas are in `src/business/utils/finance.ts`. The running result is a **steady-state month** (no CAC, no kit sales). The optional acquisition month adds CAC for all paying customers and kit contribution for the share that buys a kit, as in section 10.2. This is not a cash-flow plan; the document's section 12 describes what such a plan would need.

## Interaction and presenting

- All controls are buttons, tabs and range sliders. ←/→ adjust a focused slider. PageUp/PageDown (presenter clickers) always change slides, even from a slider.
- Numbers count up when a slide opens or a value changes (0,9 s), and bars grow; both are disabled with "reduced motion". Screen readers and tests read the final value.
- The deck now navigates relative to the slide in the URL at the moment of the key press. Before, two quick presses could land on the same slide (see `testing.md`).
