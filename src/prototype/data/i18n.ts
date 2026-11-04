import type { GardenPlant, GardenStage, IrrigationDecision, Locale, MetricKind, PlantingZone, SunExposure } from "../types";

/** All user-facing prototype copy. German is used inside the (German) presentation; English is the standalone default. */

const fmt = (n: number, locale: Locale, digits = 0) =>
  n.toLocaleString(locale === "de" ? "de-DE" : "en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits });

const en = {
  brand: "PlantWiz",
  demoBadge: "Demo data",
  demoDisclaimer: "Concept prototype · simulated demonstration data · not a connected irrigation controller",
  canvasLabel: "Interactive 3D garden. Drag to orbit, scroll to zoom, click plants, beds or sensors for details.",
  hint: "Drag to orbit · Scroll to zoom · Click plants and sensors",
  loading: "Preparing 3D garden…",
  webglError: "The 3D view could not start in this browser (WebGL unavailable). The data panels still work.",
  retry: "Retry",
  close: "Close",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  resetView: "Reset view",
  stageNav: "Garden stages",
  stages: {
    planning: { short: "Plan", title: "Architectural planning", subtitle: "House, terrain and possible planting zones — to scale.", detail: "Sketch, space & structure" },
    planting: { short: "Plants", title: "Plant recommendations", subtitle: "Suitable species for each bed, with the reason why.", detail: "Species & placement" },
    monitoring: { short: "Sensors", title: "Sensor monitoring", subtitle: "Soil and weather measurements per bed.", detail: "Measured & estimated" },
    irrigation: { short: "Water", title: "Adaptive irrigation", subtitle: "Water only the zones that need it.", detail: "Decide, then water" },
  } satisfies Record<GardenStage, { short: string; title: string; subtitle: string; detail: string }>,
  planning: {
    intro: "The building and its plot are captured to scale. Select a highlighted area to see whether it suits planting.",
    zonesTitle: "Potential planting zones",
    area: "Area",
    sun: "Sun exposure",
    soil: "Soil",
    status: "Status",
    planned: "Planned raised bed",
    existing: "Existing trees",
    selectZone: "Select zone",
  },
  planting: {
    intro: "Each bed receives the species that suits its sun, soil and neighbours. Click a plant or pick one below.",
    recommended: "Recommended",
    existingRecognised: "Existing · recognised from photo",
    score: "Recommendation score",
    why: "Why here?",
    requirements: "Requirements",
    sunlight: "Sunlight",
    moistureTarget: "Soil moisture target",
    zone: "Planting zone",
    noScore: "Not scored — this plant was already on site.",
    exampleData: "Example data, not yet produced by the PlantWiz framework.",
  },
  monitoring: {
    intro: "One soil probe per bed and a weather station. Click a bed, plant or sensor to open its history.",
    measured: "Measured",
    estimated: "Estimated",
    measuredNote: "Measured by a sensor",
    estimatedNote: "Model estimate from moisture and temperature — not a direct measurement.",
    healthTitle: "Care status (estimate)",
    sevenDays: "Last 7 days",
    now: "Now",
    target: "Target",
    probe: "Soil probe",
    station: "Weather station",
    noSensor: "No sensor is installed for this plant. Values would be estimates only.",
    statusBelow: "below target",
    statusWithin: "within target",
    statusAbove: "above target",
    health: { good: "good", watch: "watch", stressed: "stressed" },
  },
  irrigation: {
    intro: "Each bed has its own valve and drip lines, so watering is decided per bed (one species per bed). Single plants are not valved individually.",
    weather: "Weather",
    scenarios: { "dry-spell": "Dry spell", "rain-expected": "Rain expected" },
    scenarioDetail: (rain: number, prob: number, l: Locale) => `Forecast ${fmt(rain, l, 1)} mm · ${fmt(prob * 100, l)} % chance`,
    mode: "Strategy",
    modes: { scheduled: "Fixed timer", adaptive: "Adaptive" },
    modeDetail: { scheduled: "Every bed, every morning, 20 L", adaptive: "Only beds below their target" },
    run: "Run watering demo",
    running: "Watering…",
    replay: "Run again",
    total: "Water used",
    zones: "Beds watered",
    overWatered: "over-watered",
    stillDry: "still too dry",
    saved: (liters: number, pct: number, l: Locale) => `Adaptive saves ${fmt(liters, l, 0)} L (${pct} %) versus the fixed timer.`,
    actions: { water: "Water", defer: "Wait for rain", skip: "No water" },
    decisionTitle: "Decision",
    reason: "Reason",
    volume: "Volume",
    duration: "Duration",
    after: "After watering",
    explain: (d: IrrigationDecision, plantName: string, l: Locale): string => {
      const now = `${fmt(d.moistureBefore, l)} %`;
      const range = `${d.target.min}–${d.target.max} %`;
      switch (d.reason) {
        case "below-target": return `${plantName}: soil moisture ${now} is below its preferred ${range} and little rain is forecast. Water this bed's zone.`;
        case "critically-dry": return `${plantName}: soil moisture ${now} is far below ${range}. It cannot wait — water now${d.moistureAfter <= d.target.min + 0.5 ? ", only up to the lower limit because rain is expected" : ""}.`;
        case "rain-expected": return `${plantName}: ${now} is slightly below ${range}, but rain is expected. Wait and re-check after the rain.`;
        case "within-target": return `${plantName}: ${now} is within ${range}. No water needed.`;
        case "above-target": return `${plantName}: ${now} is above ${range}. Watering would harm this plant.`;
        case "fixed-schedule": return `${plantName}: the timer waters ${fmt(d.volumeLiters, l)} L regardless of the ${now} measured.`;
      }
    },
  },
  metrics: {
    "soil-moisture": "Soil moisture",
    "soil-temperature": "Soil temperature",
    "air-temperature": "Air temperature",
    "relative-humidity": "Relative humidity",
    light: "Light",
    rainfall: "Rainfall",
    "health-index": "Care-status index",
  } satisfies Record<MetricKind, string>,
  sun: { "full-sun": "Full sun", "partial-shade": "Partial shade", shade: "Shade" } satisfies Record<SunExposure, string>,
  zoneLabel: (z: PlantingZone) => z.label,
  soil: (z: PlantingZone) => z.soil,
};

export type Messages = typeof en;

const de: Messages = {
  brand: "PlantWiz",
  demoBadge: "Demo-Daten",
  demoDisclaimer: "Konzept-Prototyp · simulierte Demo-Daten · keine angeschlossene Bewässerungssteuerung",
  canvasLabel: "Interaktiver 3D-Garten. Ziehen zum Drehen, Scrollen zum Zoomen, Pflanzen, Beete oder Sensoren anklicken.",
  hint: "Ziehen: drehen · Scrollen: zoomen · Pflanzen und Sensoren anklicken",
  loading: "3D-Garten wird vorbereitet …",
  webglError: "Die 3D-Ansicht konnte in diesem Browser nicht starten (kein WebGL). Die Datenansichten funktionieren weiterhin.",
  retry: "Erneut versuchen",
  close: "Schließen",
  zoomIn: "Hineinzoomen",
  zoomOut: "Herauszoomen",
  resetView: "Ansicht zurücksetzen",
  stageNav: "Gartenphasen",
  stages: {
    planning: { short: "Plan", title: "Architektonische Planung", subtitle: "Haus, Gelände und mögliche Pflanzflächen – maßstabsgetreu.", detail: "Skizze, Raum & Struktur" },
    planting: { short: "Pflanzen", title: "Pflanzempfehlungen", subtitle: "Passende Arten je Beet – mit Begründung.", detail: "Arten & Platzierung" },
    monitoring: { short: "Sensoren", title: "Sensor-Überwachung", subtitle: "Boden- und Wetterdaten je Beet.", detail: "Gemessen & geschätzt" },
    irrigation: { short: "Wasser", title: "Adaptive Bewässerung", subtitle: "Nur die Zonen gießen, die es brauchen.", detail: "Entscheiden, dann gießen" },
  },
  planning: {
    intro: "Gebäude und Grundstück werden maßstabsgetreu erfasst. Markierte Fläche anklicken, um ihre Eignung zu sehen.",
    zonesTitle: "Mögliche Pflanzflächen",
    area: "Fläche",
    sun: "Besonnung",
    soil: "Boden",
    status: "Status",
    planned: "Geplantes Hochbeet",
    existing: "Bestandsbäume",
    selectZone: "Fläche wählen",
  },
  planting: {
    intro: "Jedes Beet erhält die Art, die zu Sonne, Boden und Nachbarn passt. Pflanze anklicken oder unten auswählen.",
    recommended: "Empfohlen",
    existingRecognised: "Bestand · per Foto erkannt",
    score: "Empfehlungswert",
    why: "Warum hier?",
    requirements: "Ansprüche",
    sunlight: "Licht",
    moistureTarget: "Ziel-Bodenfeuchte",
    zone: "Pflanzfläche",
    noScore: "Ohne Wert – die Pflanze stand bereits im Garten.",
    exampleData: "Beispieldaten, noch nicht vom PlantWiz-Framework erzeugt.",
  },
  monitoring: {
    intro: "Ein Bodensensor je Beet plus Wetterstation. Beet, Pflanze oder Sensor anklicken, um den Verlauf zu öffnen.",
    measured: "Gemessen",
    estimated: "Geschätzt",
    measuredNote: "Von einem Sensor gemessen",
    estimatedNote: "Modellschätzung aus Feuchte und Temperatur – keine direkte Messung.",
    healthTitle: "Pflegezustand (Schätzung)",
    sevenDays: "Letzte 7 Tage",
    now: "Jetzt",
    target: "Ziel",
    probe: "Bodensensor",
    station: "Wetterstation",
    noSensor: "Für diese Pflanze ist kein Sensor installiert. Werte wären nur Schätzungen.",
    statusBelow: "unter Zielbereich",
    statusWithin: "im Zielbereich",
    statusAbove: "über Zielbereich",
    health: { good: "gut", watch: "beobachten", stressed: "gestresst" },
  },
  irrigation: {
    intro: "Jedes Beet hat ein eigenes Ventil mit Tropfschläuchen – entschieden wird je Beet (eine Art pro Beet). Einzelpflanzen sind nicht einzeln schaltbar.",
    weather: "Wetter",
    scenarios: { "dry-spell": "Trockenphase", "rain-expected": "Regen erwartet" },
    scenarioDetail: (rain, prob, l) => `Prognose ${fmt(rain, l, 1)} mm · ${fmt(prob * 100, l)} % Wahrscheinlichkeit`,
    mode: "Strategie",
    modes: { scheduled: "Feste Zeitschaltuhr", adaptive: "Adaptiv" },
    modeDetail: { scheduled: "Jedes Beet, jeden Morgen, 20 L", adaptive: "Nur Beete unter Zielbereich" },
    run: "Bewässerung abspielen",
    running: "Bewässert …",
    replay: "Erneut abspielen",
    total: "Wasserverbrauch",
    zones: "Bewässerte Beete",
    overWatered: "überwässert",
    stillDry: "noch zu trocken",
    saved: (liters, pct, l) => `Adaptiv spart ${fmt(liters, l, 0)} L (${pct} %) gegenüber der Zeitschaltuhr.`,
    actions: { water: "Gießen", defer: "Regen abwarten", skip: "Nicht gießen" },
    decisionTitle: "Entscheidung",
    reason: "Begründung",
    volume: "Menge",
    duration: "Dauer",
    after: "Nach dem Gießen",
    explain: (d, plantName, l) => {
      const now = `${fmt(d.moistureBefore, l)} %`;
      const range = `${d.target.min}–${d.target.max} %`;
      switch (d.reason) {
        case "below-target": return `${plantName}: Bodenfeuchte ${now} liegt unter dem Zielbereich ${range}, kaum Regen in Sicht. Zone dieses Beets gießen.`;
        case "critically-dry": return `${plantName}: Bodenfeuchte ${now} liegt weit unter ${range}. Nicht warten – jetzt gießen${d.moistureAfter <= d.target.min + 0.5 ? ", wegen erwartetem Regen nur bis zur Untergrenze" : ""}.`;
        case "rain-expected": return `${plantName}: ${now} liegt knapp unter ${range}, aber Regen ist angekündigt. Abwarten und danach neu prüfen.`;
        case "within-target": return `${plantName}: ${now} liegt im Zielbereich ${range}. Kein Wasser nötig.`;
        case "above-target": return `${plantName}: ${now} liegt über ${range}. Gießen würde der Pflanze schaden.`;
        case "fixed-schedule": return `${plantName}: Die Zeitschaltuhr gibt ${fmt(d.volumeLiters, l)} L – unabhängig von den gemessenen ${now}.`;
      }
    },
  },
  metrics: {
    "soil-moisture": "Bodenfeuchte",
    "soil-temperature": "Bodentemperatur",
    "air-temperature": "Lufttemperatur",
    "relative-humidity": "Luftfeuchte",
    light: "Einstrahlung",
    rainfall: "Niederschlag",
    "health-index": "Pflegezustands-Index",
  },
  sun: { "full-sun": "Volle Sonne", "partial-shade": "Halbschatten", shade: "Schatten" },
  zoneLabel: (z) => (z.kind === "orchard" ? "Obstbaumstreifen" : z.label.replace("Bed", "Beet")),
  soil: (z) => DE_SOIL[z.soil] ?? z.soil,
};

const DE_SOIL: Record<string, string> = {
  "Loamy raised-bed mix": "Lehmige Hochbeeterde",
  "Sandy, well-drained mix": "Sandige, durchlässige Erde",
  "Humus-rich raised-bed mix": "Humusreiche Hochbeeterde",
  "Existing lawn on loam": "Bestandsrasen auf Lehm",
};

const DE_PLANTS: Record<string, Pick<GardenPlant, "commonName" | "sunlightRequirement"> & { recommendationReason?: string }> = {
  tomato: { commonName: "Tomate", sunlightRequirement: "Volle Sonne, mind. 6–8 h am Tag", recommendationReason: "Wärmstes, sonnigstes Beet direkt an der Terrasse, mit Basilikum als Mischkultur-Partner im Nachbarbeet." },
  basil: { commonName: "Basilikum", sunlightRequirement: "Volle Sonne, windgeschützt", recommendationReason: "Klassischer Partner der Tomate. Gleicher Feuchtebereich, daher ähnlicher Gießrhythmus in beiden Beeten." },
  lavender: { commonName: "Lavendel", sunlightRequirement: "Volle Sonne, trocken und durchlässig", recommendationReason: "Insektenfreundlich (Wert 5/5) und trockenheitsverträglich. Passt ins sandige Außenbeet, das am schnellsten abtrocknet." },
  lettuce: { commonName: "Salat", sunlightRequirement: "Halbschatten, 4–6 h Sonne", recommendationReason: "Schießt bei starker Mittagshitze; der Nachmittagsschatten des Hauses hält dieses Beet kühler." },
  kale: { commonName: "Grünkohl", sunlightRequirement: "Sonne bis Halbschatten", recommendationReason: "Starkzehrer nach den Hülsenfrüchten des Vorjahres (Fruchtfolge), Ernte bis in den Winter." },
  rosemary: { commonName: "Rosmarin", sunlightRequirement: "Volle Sonne, trocken und durchlässig", recommendationReason: "Mediterranes Kraut für den sonnigen, sandigen Rand – mit Abstand zum feuchtigkeitsliebenden Salat." },
  "apple-tree": { commonName: "Apfelbaum", sunlightRequirement: "Volle Sonne" },
  "pear-tree": { commonName: "Birnbaum", sunlightRequirement: "Volle Sonne" },
  "plum-tree": { commonName: "Pflaumenbaum", sunlightRequirement: "Volle Sonne" },
};

export const MESSAGES: Record<Locale, Messages> = { en, de };

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? en;
}

/** Returns the plant with user-facing text in the requested locale. Canonical data stays English. */
export function localizePlant(plant: GardenPlant, locale: Locale): GardenPlant {
  if (locale === "en") return plant;
  const t = DE_PLANTS[plant.id];
  return t ? { ...plant, ...t } : plant;
}

export const formatNumber = fmt;
