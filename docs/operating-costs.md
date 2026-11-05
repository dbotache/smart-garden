# Operating costs: phase 1 (digital), compatibility stage, sensor variants, savings (slides 16–19)

Prices were researched on 2026-11-05 and are **net of VAT**. The business plan only gives lump sums (0,10 € per free user, 0,80–2,80 € per paying customer, 6–25 k€ fixed costs), so these slides break them down with market prices.

- Inputs: `src/business/data/operatingCosts.ts`, which gives every price with its source and confidence.
- Formulas: `src/business/utils/operatingCosts.ts`, pinned by `src/business/tests/operatingCosts.test.ts`.

**Confidence levels:**
- *vendor*: the provider's own page or price list.
- *third-party*: a blog or comparison site citing the vendor.
- *anecdotal*: forum experience reports.
- *assumption*: our own planning value, not market data.

Re-check the third-party and anecdotal values before a funding round.

## Prices

| Item | Value | Confidence | Source |
|---|---|---|---|
| App/login/test server | Hetzner CPX22 19,49 €/month (since 15.06.2026, +144 %) | third-party | [wz-it.com](https://wz-it.com/blog/hetzner-preiserhoehung-juni-2026-cpx-ccx-alternativen/) |
| Database server | Hetzner CCX13 (dedicated vCPU) 42,99 €/month | third-party | same |
| Note | Cheaper CX/CAX lines show "Currently not available" | vendor | [hetzner.com/cloud](https://www.hetzner.com/cloud) |
| Object storage | 6,49 €/month incl. 1 TB + 1 TB egress; extra TB 8,70 € (sources disagree: 4,89–8,70 €) | third-party | [sliplane.io](https://sliplane.io/de-de/blog/cheap-s3-compatible-storage-providers) |
| E-mail | Amazon SES 0,10 $ per 1.000 | third-party | [sequenzy.com](https://www.sequenzy.com/versus/postmark-vs-brevo) |
| AI chat | Claude Haiku 5.5: 0,10 $ / 0,50 $ per million input/output tokens; Sonnet 5.5: 2 $ / 10 $ | vendor | [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing) |
| Plant photo ID | Plant.id 0,05 € per credit (down to 0,01 € at 1,5 M credits); identification 1 credit, health check 2 | vendor | [kindwise.com/pricing](https://kindwise.com/pricing) |
| Card payments | Stripe 1,5 % + 0,25 € (EU standard cards); SEPA 0,35 € | third-party | [meetergo.com](https://meetergo.com/blog/stripe) |
| App stores | 15 % on subscriptions below 1 M$ revenue (Apple Small Business Program; Google EEA 10 % + 5 % since 30.06.2026) | third-party | [RevenueCat](https://www.revenuecat.com/blog/engineering/small-business-program.md) |
| Developer accounts | Apple 99 $/year, Google Play 25 $ once | third-party | [magora-systems.com](https://magora-systems.com/apple-developer-fee/) |
| Tax advisor (UG) | 1.200–2.500 €/year incl. annual accounts; the slide uses 2.500 € | third-party | [steuernaut.de](https://steuernaut.de/fragen/was-kostet-steuerberater-ug) |
| Legal texts | 54,90 €/month (IT-Recht Kanzlei Unlimited) | vendor | [it-recht-kanzlei.de](https://www.it-recht-kanzlei.de/Service/app-datenschutzerklaerung.php) |
| Liability insurance | 150–400 €/year for micro companies; the slide uses 400 € | third-party | [onlinebilanz.de](https://onlinebilanz.de/betriebshaftpflicht-kosten-vergleich/) |
| Office | Google Workspace Starter 6,80 € per user/month | vendor | [workspace.google.com](https://workspace.google.com/intl/de/landing/partners/referral/gws2.html) |
| Error monitoring | Sentry free; Team 26 $/month above 10.000 users | third-party | [costbench.com](https://costbench.com/software/developer-tools/sentry/free-plan/) |
| IoT SIM | 1NCE 12 € for 10 years (500 MB, 250 SMS) + 1 € card | vendor | [1NCE price list](https://a.storyblok.com/f/335000/x/bed0f1009c/1nce_gmbh_price_list_en.pdf) |
| EMC/radio test | 1.200–2.500 € (forum experience; get lab quotes) | anecdotal | [mikrocontroller.net](https://www.mikrocontroller.net/topic/482273) |
| WEEE registration | from 210,50 € per manufacturer, brand and device type, plus a guarantee | third-party, possibly outdated | [IHK leaflet](https://ihk.de/blueprint/servlet/resource/blob/704976/a21f57b0e01e81441439af95a89586d3/ihk-merkblatt-elektrog-data.pdf) |
| EXIST grant | 2.500 €/month per graduate, max. 3 persons, 12 months; material costs up to 30.000 € per team; coaching 5.000 € | third-party | [gruenderplattform.de](https://gruenderplattform.de/finanzierung-und-foerderung/exist-gruendungsstipendium) |
| Hessen Ideen | 2.500 €/month per person, max. 3, 6 months (undated) | third-party | [Uni Kassel](https://www.uni-kassel.de/einrichtung/ukt/unikat-von-der-idee-zur-gruendung/stipendien-und-foerderprogramme.html) |

## Our assumptions (measure in phase 1)

| Assumption | Value | Why it matters |
|---|---|---|
| Exchange rate | 1 $ = 0,90 € (rounded up, not a quoted rate) | AI, e-mail, Apple account, Sentry |
| Server sizing | 1 app server per 10.000 active users; database replica from 25.000 | server costs (small either way) |
| Photo storage | 20 MB per active user | object storage |
| E-mails | 2 per active user and month | negligible |
| AI use, free user | 0,5 photo identifications + 3 chat questions per month | **largest variable cost** |
| AI use, Basic customer | 3 identifications + 1 health check + 30 chat questions per month | |
| Chat size | 2.000 input + 400 output tokens per question | |
| Store share | 50 % of paying customers subscribe via Apple/Google | payment costs |
| Sensor data | 96 readings/day × 200 B × 3 overhead ≈ 210 MB in 10 years | LTE SIM feasibility |
| Camera | one 200-KB image/day = 730 MB in 10 years | exceeds the 500-MB SIM |
| Ingest server | 1 CPX22 per 5.000 devices | running cost per device |

The AI provider of today's app is not documented in the repository. Claude is used as a price example only.

## Results (computed, see tests)

**Phase 1, digital only.** Paying customers can choose only Basic (4,99 € gross, 4,19 € net). Erweitert needs the sensor kit, Expert needs own hardware.

| Active users / paying | Revenue | Running costs (no staff) | Left for staff |
|---|---:|---:|---:|
| 2.000 / 5 % | 419 € | 538 € | −118 € |
| 10.000 / 5 % | 2.097 € | 987 € | +1.110 € |
| 10.000 / 10 % | 4.193 € | 1.285 € | +2.908 € |
| 50.000 / 10 % | 20.966 € | 4.868 € | +16.098 € |

Running costs are covered from about **140 paying customers**: **2.800** active users at 5 % paying (140 paying), **1.300** at 10 % (130 paying), before staff. Most costs are fixed (about 430 € for servers, tax advisor, legal texts and tools), so the paying count barely depends on the share.

Per user and month we compute:
- **Free user:** 0,03 €. The plan assumes 0,10 €.
- **Basic customer:** 0,62 €. The plan assumes 0,80 €.

The biggest variable item is photo recognition, not servers. The plan's variable lump sums are therefore conservative, and its fixed costs are the issue.

**Sensor variants:**
- **One-off until the first kit sale: 3,5–4,8 T€.** This covers pilot units (5 × Prototyp 1, 10 × Prototyp 2), the EMC/radio test and the WEEE registration.
- **Per kit:** 25,21 € contribution with the 5-€ warranty reserve, or 30,21 € without it, as in the plan.
- **Per device and month:** data ingestion about 0,004 €; LTE only for Prototyp 3, at 0,11 €.
- **Not quantified:** support and product liability.

**Savings levers** (10.000 users, 5 % paying):

| Lever | Effect per month |
|---|---:|
| Photo recognition only in the paid tier | −238 € |
| Fixed-price tax advisor | −108 € |
| Web instead of store subscriptions | −107 € |
| Test server only when needed | −19 € |
| Together | **−472 €** of 987 € |
| Keeping the small AI model (vs. the large one) | avoids +298 € |

Of the plan's 6.000 € fixed costs, our researched non-staff fixed costs are about 427 €, so about 5.573 € is staff. The plan does not break this down, so the split is our inference. Grants (EXIST: 2 × 2.500 € for 12 months; Hessen Ideen: 6 months) are therefore the main lever.

## Compatibility stage (slide 17)

A step between phase 1 and own hardware: connect sensors customers already own and ship no device. The data is in `COMPAT_SYSTEMS` and the calculation in `compatCosts()`.

| System | Interface · terms | Test device (gross) | Status | Source |
|---|---|---:|---|---|
| Home Assistant | REST API with long-lived token / OAuth; free, open source | Zigbee soil sensor 19,99 € (+ Zigbee stick, not researched) | first | [HA auth API](https://developers.home-assistant.io/docs/auth_api), [domadoo](https://www.domadoo.fr/de/zigbee-geraete/8913-thirdreality-intelligenter-zigbee-gen2-bodenfeuchtesensor-p1sms1b-eu-810210140560.html) |
| Ecowitt | cloud ecowitt.net / gateway; API terms not yet checked | WH51 17,99 € + GW1100 48,42 € (manufacturer shop 19,99 $ on sale) | check | [domadoo](https://www.domadoo.fr/de/smart-home-produkte/9382-ecowitt-wh51-bodenfeuchtesensor-868-mhz-kompatibel-mit-home-assistant-ueber-hub.html), [intercyprus](https://intercyprus.com/products/ecowitt-gw1100-wifi-gateway-thermometer-hygrometer-barometric-pressure-indoor-temperature-humidity-meter-for-home-office-iot) |
| Gardena smart system | Husqvarna developer portal; about 10.000 requests/month per application (unofficial); free for private use per a third party; **commercial use to be clarified** | smart Sensor 52,70–55,79 € (+ gateway, price not found) | check | [GitHub wiki](https://github.com/kayloehmann/ha-gardena-smart-system/wiki/API-Rate-Limits-DE), [homeandsmart.de](https://www.homeandsmart.de/gardena-smart-system-smart-garden) |
| Netatmo | Connect API; commercial use allowed under its T&C, inform Netatmo Partnerships; limits grow with users | weather station (price not researched) | first | [dev.netatmo.com](https://dev.netatmo.com/guideline) |
| Tuya / Smart Life | cloud trial not for commercial use; license prices conflict (1.500 $ to 25.000 $/year) | – | later | [SaaSHub](https://www.saashub.com/tuya-smart) |

What the stage avoids and what it gives up:
- **Avoided one-off: 3,5–4,8 T€.** That is the pilot devices, the EMC/radio test and the WEEE registration, the same figures as on slide 18. There is also no stock, warranty or returns.
- **Given up:** the kit contribution of 25,21 € per kit.
- **Dependency:** the stage relies on third-party APIs. With Gardena, a per-application quota of about 10.000 requests a month would not scale to many customers, if confirmed.
- **Revenue:** the Expert tariff (14,99 €, "eigene Hardware, offene Schnittstellen") at 9,80 € contribution per month, from the plan. Erweitert stays tied to the kit. Note: since the merge, the tier slide (12) shows only Free, Basic and a planned Erweitert, no Expert.
- **Running cost:** data polling about 0,004 € per device and month (same assumption as for own devices).
- **Not quantified:** development time per integration (staff) and support for many device types.

## Costs per phase incl. advertising (slide 21)

`phaseCosts()` combines the earlier figures per phase and adds advertising. Staff costs are not included.

**Advertising funnel.** We use the business plan's formula (section 7.2):

  cost per registration = CPM / 1000 / click rate / 20 % registration from clicks

| | CPM | Click rate | Cost per registration | Basis |
|---|---:|---:|---:|---|
| optimistic | 10 € | 2,0 % | 2,50 € | = business plan section 7.2 |
| **base** | 10 € | 1,5 % | **3,33 €** | Meta Germany CPM 5–15 € ([ostend.digital](https://ostend.digital/?p=35459)); average click rate 1,54 % ([Influee](https://influee.co/de/blog/good-cpc-facebook-ads)) |
| cautious | 15 € | 1,0 % | 7,50 € | upper CPM, below-average click rate |

Cross-checks:
- **Implied cost per click:** 0,67 € in the base case, inside the German Meta range of 0,40–2,00 €.
- **Cost per app install:** Western Europe iOS 3,40 $, Android 1,85 $ ([semnexus](https://semnexus.com/cpi-by-country-where-app-budget-goes-furthest-2026/)).
- **Google Search:** average cost per click in Germany 1,32 € ([Bravery Technology](https://braverytechnology.com/de/google-ads-statistiken/)).

**Budgets per phase.** The targets and budget sizes are our proposals; the unit prices are market values.

| Phase | One-off | Running | Advertising | Advertising basis |
|---|---:|---|---:|---|
| 1 · digital | – | 538–987 €/month (slide 16) | **9.333 €** (7.000–21.000 €) | 2.800 registrations (operating break-even of slide 16) × cost per registration; start with a 1.000-€ test (100.000 impressions, as in the plan) |
| Vorstufe · kompatibel | 142 € test devices | +0,004 € per device/month | 500 € | search-ads test, about 379 clicks at 1,32 € |
| 2 · Pilot | 2.053 € pilot devices | ≈ 0 € | 32–35 € | 1.000 A5 flyers for allotment clubs ([selbststaendigkeit.de](https://selbststaendigkeit.de/selbststaendig-machen/marketing/corporate-design/flyer-erstellen)) |
| 3 · Kit | 1.411–2.711 € test + registration | +25,21 € per kit | 500–2.500 € | 5 micro-influencer posts at 100–500 € ([Shopify DE](https://www.shopify.com/de/blog/influencer-preise); other sources up to 5.000 € per reel); advertising per kit must stay below the 25-€ contribution |
| **Total** | | | | **11,6–28,9 T€** one-off + advertising, plus running costs |

**Finding: CAC.** With ads alone and 5 % paying, a paying customer costs about **67 €** (base). The plan's base CAC is 25 €. Its own funnel example (section 7.2) already gives 50 €, and its cautious case is 50 €. Reaching 25 € needs cheaper channels: allotment clubs, influencers, referrals. Measure the CAC in the 1.000-€ test before scaling.

## Not included

- staff, marketing/CAC, taxes on profit
- IHK membership, bank account, domain
- support time, returns, storage, product liability insurance
- App-store rule details: whether and how a web subscription may be offered alongside the app has to be checked per store before relying on that lever.
