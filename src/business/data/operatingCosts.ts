/**
 * Operating-cost inputs researched on 2026-11-05 (web research; prices net of VAT unless noted).
 *
 * Every price carries its source. Values marked `kind: "assumption"` are OUR planning assumptions (usage per user,
 * sizing, exchange rate) — they are not market data and must be measured in phase 1. Nothing here is copied from the
 * business plan, which only states lump sums (0,10 € per free user, 1,30 € per paying customer, 6–25 k€ fixed costs).
 */

export type Source = { label: string; url: string; note?: string };
export type Confidence = "vendor" | "third-party" | "anecdotal" | "assumption";

export const SOURCES = {
  hetznerCloud: { label: "Hetzner Cloud, Produktseite", url: "https://www.hetzner.com/cloud", note: "abgerufen 05.11.2026; CX/CAX dort „Currently not available“" },
  hetznerJune2026: { label: "wz-it.com: Hetzner-Preiserhöhung Juni 2026", url: "https://wz-it.com/blog/hetzner-preiserhoehung-juni-2026-cpx-ccx-alternativen/", note: "neue Preise ab 15.06.2026, zitiert aus Hetzners Tabelle" },
  hetznerObject: { label: "sliplane.io: S3-kompatible Anbieter 2026", url: "https://sliplane.io/de-de/blog/cheap-s3-compatible-storage-providers", note: "Stand Juli 2026; Quellen widersprechen sich" },
  ses: { label: "Sequenzy: Postmark vs Brevo (Amazon SES 0,10 $/1.000)", url: "https://www.sequenzy.com/versus/postmark-vs-brevo", note: "29.09.2026" },
  claude: { label: "Anthropic API-Preise (Claude Haiku 5.5 / Sonnet 5.5)", url: "https://platform.claude.com/docs/en/about-claude/pricing", note: "Rechenbeispiel; der heutige KI-Anbieter der App ist nicht dokumentiert" },
  plantId: { label: "Kindwise / Plant.id Preise", url: "https://kindwise.com/pricing", note: "0,05 €/Credit bei 1.000, bis 0,01 € bei 1,5 Mio. Credits; Erkennung 1, Gesundheitscheck 2 Credits" },
  stripe: { label: "meetergo: Stripe-Gebühren Deutschland", url: "https://meetergo.com/blog/stripe", note: "Drittquelle, Stand 05.10.2026" },
  stores: { label: "Apple Small Business Program / Google Play Gebühren 2026", url: "https://www.revenuecat.com/blog/engineering/small-business-program.md", note: "15 % auf Abos unter 1 Mio. $ Umsatz; Google EEA ab 30.06.2026 10 % + 5 %" },
  devAccounts: { label: "Apple Developer 99 $/Jahr, Google Play 25 $ einmalig", url: "https://magora-systems.com/apple-developer-fee/" },
  taxAdvisor: { label: "Steuernaut: Steuerberater-Kosten UG", url: "https://steuernaut.de/fragen/was-kostet-steuerberater-ug", note: "1.200–2.500 €/Jahr inkl. Jahresabschluss" },
  legalTexts: { label: "IT-Recht Kanzlei: App-Datenschutzerklärung", url: "https://www.it-recht-kanzlei.de/Service/app-datenschutzerklaerung.php", note: "Unlimited-Paket 54,90 €/Monat" },
  insurance: { label: "onlinebilanz.de: Betriebshaftpflicht Kosten", url: "https://onlinebilanz.de/betriebshaftpflicht-kosten-vergleich/", note: "Kleinstunternehmen 150–400 €/Jahr" },
  workspace: { label: "Google Workspace Starter", url: "https://workspace.google.com/intl/de/landing/partners/referral/gws2.html", note: "6,80 € je Nutzer/Monat im Jahresabo" },
  sentry: { label: "Sentry-Preise (Free / Team 26 $)", url: "https://costbench.com/software/developer-tools/sentry/free-plan/" },
  sim: { label: "1NCE Preisliste (Stand Okt. 2026)", url: "https://a.storyblok.com/f/335000/x/bed0f1009c/1nce_gmbh_price_list_en.pdf", note: "12 € für 10 Jahre, 500 MB, 250 SMS; SIM-Karte 1 €" },
  emc: { label: "mikrocontroller.net: CE/EMV-Prüfung Erfahrungswerte", url: "https://www.mikrocontroller.net/topic/482273", note: "anekdotisch: 1.200–2.500 €; Laborangebote einholen" },
  weee: { label: "IHK-Merkblatt ElektroG (stiftung ear)", url: "https://ihk.de/blueprint/servlet/resource/blob/704976/a21f57b0e01e81441439af95a89586d3/ihk-merkblatt-elektrog-data.pdf", note: "ab 210,50 € je Hersteller, Marke und Geräteart; Stand ggf. veraltet" },
  exist: { label: "EXIST-Gründungsstipendium (gruenderplattform.de)", url: "https://gruenderplattform.de/finanzierung-und-foerderung/exist-gruendungsstipendium", note: "2.500 €/Monat mit Hochschulabschluss, max. 3 Personen, 12 Monate, Sachkosten bis 30.000 € (Team)" },
  hessenIdeen: { label: "Uni Kassel: Hessen Ideen Stipendium", url: "https://www.uni-kassel.de/einrichtung/ukt/unikat-von-der-idee-zur-gruendung/stipendien-und-foerderprogramme.html", note: "2.500 €/Monat je Person, max. 3, 6 Monate (undatiert)" },
  minimumWage: { label: "TK: Mindestlohn 2026", url: "https://www.tk.de/firmenkunden/service/fachthemen/versicherung-fachthema/mindestlohn-2026-minijobs-und-uebergangsbereich-2203074", note: "13,90 €/Std., Minijob 603 €" },
  // third-party hardware (compatibility stage)
  haApi: { label: "Home Assistant: Auth/REST API", url: "https://developers.home-assistant.io/docs/auth_api", note: "Token 10 Jahre gültig; OAuth-Flow für Drittanbieter-Apps" },
  thirdReality: { label: "domadoo: ThirdReality Zigbee-Bodenfeuchtesensor", url: "https://www.domadoo.fr/de/zigbee-geraete/8913-thirdreality-intelligenter-zigbee-gen2-bodenfeuchtesensor-p1sms1b-eu-810210140560.html", note: "19,99 € brutto, Zigbee-Hub nötig" },
  ecowittWh51: { label: "domadoo: Ecowitt WH51 Bodenfeuchtesensor", url: "https://www.domadoo.fr/de/smart-home-produkte/9382-ecowitt-wh51-bodenfeuchtesensor-868-mhz-kompatibel-mit-home-assistant-ueber-hub.html", note: "17,99 € brutto, Gateway nötig (max. 8 Sensoren)" },
  ecowittGw: { label: "intercyprus: Ecowitt GW1100 (868 MHz)", url: "https://intercyprus.com/products/ecowitt-gw1100-wifi-gateway-thermometer-hygrometer-barometric-pressure-indoor-temperature-humidity-meter-for-home-office-iot", note: "48,42 € (Händlerpreis; Herstellershop 19,99 $ in Aktion)" },
  gardenaApi: { label: "GitHub-Wiki ha-gardena-smart-system: API-Limits", url: "https://github.com/kayloehmann/ha-gardena-smart-system/wiki/API-Rate-Limits-DE", note: "inoffiziell: ca. 10.000 Anfragen/Monat je Anwendung; laut Gladys für private Nutzung kostenlos" },
  gardenaSensor: { label: "homeandsmart.de: Gardena smart Sensor", url: "https://www.homeandsmart.de/gardena-smart-system-smart-garden", note: "52,70–55,79 € (Stand 26.07.2026), Gateway nötig, Preis nicht gefunden" },
  netatmoApi: { label: "Netatmo Developer Guideline", url: "https://dev.netatmo.com/guideline", note: "kommerzielle Nutzung nach AGB erlaubt, Netatmo Partnerships informieren; Limits wachsen mit Nutzerzahl" },
  // marketing
  metaDe: { label: "ostend.digital: Facebook-Ads-Kosten Deutschland 2026", url: "https://ostend.digital/?p=35459", note: "CPC 0,40–2,00 €, CPM 5–15 €" },
  metaCtr: { label: "Influee: Facebook-Ads-CPC 2026", url: "https://influee.co/de/blog/good-cpc-facebook-ads", note: "Ø CTR 1,54 %, CPC Deutschland ca. 0,80 $" },
  googleDe: { label: "Bravery Technology: Google-Ads-Statistiken 2026", url: "https://braverytechnology.com/de/google-ads-statistiken/", note: "Ø Search-CPC 1,32 €, Conversion 3,6 % (Q1 2026)" },
  cpi: { label: "semnexus: CPI nach Land 2026", url: "https://semnexus.com/cpi-by-country-where-app-budget-goes-furthest-2026/", note: "Westeuropa iOS 3,40 $, Android 1,85 $ je Installation" },
  influencer: { label: "Shopify DE: Influencer-Preise", url: "https://www.shopify.com/de/blog/influencer-preise", note: "Micro (10–50 Tsd.) 100–500 € je Post; andere Quellen bis 5.000 € je Reel" },
  flyer: { label: "selbststaendigkeit.de: Flyer drucken 2026", url: "https://selbststaendigkeit.de/selbststaendig-machen/marketing/corporate-design/flyer-erstellen", note: "1.000 × DIN A5 beidseitig ca. 32–35 €" },
  plan: { label: "Businessplan Kap. 7.2 (Beispiel-Funnel)", url: "source_documents/GardenTwin_Geschaeftsmodell_Finanzkalkulation.md", note: "10 € CPM, 2 % Klickrate, 20 % Registrierung aus Klicks" },
  tuya: { label: "SaaSHub / Fitgap: Tuya IoT Platform", url: "https://www.saashub.com/tuya-smart", note: "Trial nicht kommerziell; Flagship-Preise widersprüchlich (1.500 $ bis 25.000 $/Jahr)" },
} as const satisfies Record<string, Source>;
export type SourceId = keyof typeof SOURCES;

/** our assumptions — shown on the slides as such */
export const ASSUMPTIONS = {
  usdToEur: 0.9, // rounded up on purpose (costs), not a quoted rate
  // infrastructure sizing
  usersPerAppNode: 10_000,
  dbReplicaFrom: 25_000,
  photoStorageMbPerUser: 20,
  emailsPerUserMonth: 2,
  // AI usage per active user and month
  free: { photoIds: 0.5, healthChecks: 0, chatMessages: 3 },
  paid: { photoIds: 3, healthChecks: 1, chatMessages: 30 },
  chatTokens: { input: 2000, output: 400 },
  // payments
  storeShare: 0.5, // share of paying customers who subscribe through Apple/Google
  // hardware operations
  devicesPerIngestNode: 5_000,
  sensorBytesPerDay: 19_200 * 3, // 96 readings × 200 B, ×3 protocol overhead
  photoBytesPerDay: 200_000, // one 200-KB camera image per day
} as const;

export const PRICES = {
  // Hetzner Cloud, net, Germany, from 15.06.2026
  cpx22: { eur: 19.49, source: "hetznerJune2026", confidence: "third-party" },
  ccx13: { eur: 42.99, source: "hetznerJune2026", confidence: "third-party" },
  objectStorageBase: { eur: 6.49, includedTb: 1, source: "hetznerObject", confidence: "third-party" },
  objectStorageExtraTb: { eur: 8.7, source: "hetznerObject", confidence: "third-party" },
  sesPer1000Usd: { usd: 0.1, source: "ses", confidence: "third-party" },
  // AI
  haiku: { inUsdPerM: 0.1, outUsdPerM: 0.5, source: "claude", confidence: "vendor" },
  sonnet: { inUsdPerM: 2, outUsdPerM: 10, source: "claude", confidence: "vendor" },
  plantIdCredit: { eur: 0.05, eurAtVolume: 0.01, source: "plantId", confidence: "vendor" },
  // payments
  stripeCard: { pct: 0.015, fixedEur: 0.25, source: "stripe", confidence: "third-party" },
  stripeSepa: { fixedEur: 0.35, source: "stripe", confidence: "third-party" },
  storeFee: { pct: 0.15, source: "stores", confidence: "third-party" },
  // fixed operations, per month unless noted
  taxAdvisorYear: { low: 1200, high: 2500, source: "taxAdvisor", confidence: "third-party" },
  legalTexts: { eur: 54.9, source: "legalTexts", confidence: "vendor" },
  insuranceYear: { low: 150, high: 400, source: "insurance", confidence: "third-party" },
  workspacePerUser: { eur: 6.8, source: "workspace", confidence: "vendor" },
  appleDevYearUsd: { usd: 99, source: "devAccounts", confidence: "third-party" },
  googlePlayOnceUsd: { usd: 25, source: "devAccounts", confidence: "third-party" },
  sentryTeamUsd: { usd: 26, freeUpToUsers: 10_000, source: "sentry", confidence: "third-party" },
  // hardware
  simTenYears: { eur: 12, card: 1, mb: 500, source: "sim", confidence: "vendor" },
  emcTest: { low: 1200, high: 2500, source: "emc", confidence: "anecdotal" },
  weeeRegistration: { eur: 210.5, source: "weee", confidence: "third-party" },
  // funding
  exist: { perPersonMonth: 2500, months: 12, maxPersons: 3, materialTeam: 30000, source: "exist", confidence: "third-party" },
  hessenIdeen: { perPersonMonth: 2500, months: 6, maxPersons: 3, source: "hessenIdeen", confidence: "third-party" },
} as const;

/** Phase 1 sells only the digital subscription: Basic (Erweitert needs the sensor kit, Expert own hardware). */
export const PHASE1_TARIFF = "basic" as const;
export const PHASE1_USERS = [2_000, 10_000, 50_000] as const;
export const PHASE1_PAID_SHARES = [0.05, 0.1] as const;
export const FOUNDERS = 2;

/**
 * Compatibility stage (before own hardware): integrate sensors customers already own. Prices gross (consumer
 * devices bought once for testing). `null` = not found in the research.
 */
export type CompatSystem = { id: string; name: string; api: string; terms: string; device: string; deviceGross: number | null; extra: string; status: "ready" | "check" | "later"; sources: SourceId[] };
export const COMPAT_SYSTEMS: readonly CompatSystem[] = [
  { id: "ha", name: "Home Assistant", api: "REST-API mit Token / OAuth", terms: "kostenlos, Open Source", device: "Zigbee-Bodensensor (ThirdReality)", deviceGross: 19.99, extra: "+ Zigbee-Stick (nicht recherchiert)", status: "ready", sources: ["haApi", "thirdReality"] },
  { id: "ecowitt", name: "Ecowitt", api: "Cloud ecowitt.net / Gateway", terms: "API-Bedingungen noch prüfen", device: "WH51 + Gateway GW1100", deviceGross: 17.99 + 48.42, extra: "Gateway für bis zu 8 Sensoren", status: "check", sources: ["ecowittWh51", "ecowittGw"] },
  { id: "gardena", name: "Gardena smart system", api: "Husqvarna-Entwicklerportal", terms: "ca. 10.000 Anfragen/Monat je App (inoffiziell); kommerzielle Nutzung klären", device: "smart Sensor", deviceGross: 55.79, extra: "+ smart Gateway (Preis nicht gefunden)", status: "check", sources: ["gardenaApi", "gardenaSensor"] },
  { id: "netatmo", name: "Netatmo", api: "Netatmo Connect API", terms: "kommerziell erlaubt, Partnerships informieren", device: "Wetterstation", deviceGross: null, extra: "Preis nicht recherchiert", status: "ready", sources: ["netatmoApi"] },
  { id: "tuya", name: "Tuya / Smart Life", api: "Tuya Cloud", terms: "Trial nicht kommerziell; Lizenz 1,5–25 T$/Jahr (widersprüchlich)", device: "–", deviceGross: null, extra: "", status: "later", sources: ["tuya"] },
];

/**
 * Advertising assumptions. Cost per registration = CPM / 1000 / CTR / registration rate (funnel of the plan,
 * section 7.2). Market ranges from the sources; the budgets per phase are OUR proposals.
 */
export const MARKETING = {
  funnel: {
    cautious: { cpm: 15, ctr: 0.01 },
    base: { cpm: 10, ctr: 0.015 },
    optimistic: { cpm: 10, ctr: 0.02 }, // = business plan section 7.2
    registrationFromClick: 0.2, // business plan assumption
    sources: ["metaDe", "metaCtr", "plan"] as SourceId[],
  },
  googleCpc: { eur: 1.32, source: "googleDe" as SourceId },
  cpiUsd: { ios: 3.4, android: 1.85, source: "cpi" as SourceId },
  influencerPost: { low: 100, high: 500, source: "influencer" as SourceId },
  flyerA5Per1000: { low: 32, high: 35, source: "flyer" as SourceId },
  // our proposals per phase
  phase1TargetUsers: 2800, // = operating break-even of backup slide 1 (5 % paying)
  phase1TestBudget: 1000, // plan example: 100.000 impressions at 10 € CPM
  compatSearchBudget: 500,
  pilotFlyers: 1000,
  kitInfluencerPosts: 5,
} as const;
