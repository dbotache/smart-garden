/**
 * Domain types for the PlantWiz smart-garden prototype.
 * Rendering code depends on these types; these types never depend on rendering code.
 * Units: metres for positions, % volumetric water content for soil moisture, litres for water.
 */

export const GARDEN_STAGES = ["planning", "planting", "monitoring", "irrigation"] as const;
export type GardenStage = (typeof GARDEN_STAGES)[number];

export type Locale = "en" | "de";

/** [x, y, z] in metres. y is up; the house sits at negative x, the kitchen garden at positive x. */
export type Vec3 = [number, number, number];

/** Axis-aligned rectangle on the ground plane, in metres. */
export type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };

export type SunExposure = "full-sun" | "partial-shade" | "shade";

/** A plantable area. In this demo each raised bed is one planting zone. */
export type PlantingZone = {
  id: string;
  label: string;
  kind: "raised-bed" | "orchard";
  bounds: Rect;
  sunExposure: SunExposure;
  soil: string;
  /** Irrigation zone that waters this planting zone, if the bed is connected. */
  irrigationZoneId?: string;
};

/** Plant record as specified in the project brief, plus a few optional presentation fields. */
export type GardenPlant = {
  id: string;
  species: string;
  commonName: string;
  /** Representative position (centre of the planting); individual plants are laid out by `plantLayout`. */
  position: Vec3;
  plantingZoneId: string;
  sunlightRequirement: string;
  moistureTarget: { min: number; max: number };
  recommendationScore?: number;
  recommendationReason?: string;
  /** "recommended" = proposed by the framework; "existing" = already on site (e.g. recognised from a photo). */
  origin?: "recommended" | "existing";
  /** Visual model used by the 3D scene. */
  model: PlantModel;
  /** Number of individual plants in the bed (columns × rows). Rows must be even so the bed centre stays free for the soil probe. */
  layout?: { columns: number; rows: number };
};

export type PlantModel =
  | "tomato"
  | "basil"
  | "lavender"
  | "lettuce"
  | "kale"
  | "rosemary"
  | "apple-tree"
  | "pear-tree"
  | "plum-tree";

/** Physical quantities. "health-index" is never measured directly; it is always an estimate. */
export type MetricKind =
  | "soil-moisture"
  | "soil-temperature"
  | "air-temperature"
  | "relative-humidity"
  | "light"
  | "rainfall"
  | "health-index";

export type DataSource = "measured" | "estimated";

export type SensorDevice = {
  id: string;
  kind: "soil-probe" | "weather-station";
  label: string;
  position: Vec3;
  /** Planting zone the device belongs to (soil probes only). */
  plantingZoneId?: string;
  measures: MetricKind[];
};

export type Reading = { t: string; value: number };

export type MetricSeries = {
  metric: MetricKind;
  source: DataSource;
  unit: string;
  points: Reading[];
};

export type WeatherScenarioId = "dry-spell" | "rain-expected";

export type WeatherScenario = {
  id: WeatherScenarioId;
  recentRainMm: number;
  forecastRainMm: number;
  /** 0..1 */
  forecastProbability: number;
  airTemperatureC: number;
};

/** Hardware: one solenoid valve per raised bed feeding two drip lines. Plants within a bed are watered together. */
export type IrrigationZone = {
  id: string;
  valveId: string;
  plantingZoneId: string;
  emitterCount: number;
  /** litres per hour per emitter */
  emitterFlowLph: number;
  /** effective root-zone depth used to convert moisture deficits into litres (m) */
  rootZoneDepthM: number;
  /** wetted bed area (m²) */
  areaM2: number;
};

export type IrrigationAction = "water" | "defer" | "skip";

export type IrrigationReason =
  | "below-target"
  | "critically-dry"
  | "rain-expected"
  | "within-target"
  | "above-target"
  | "fixed-schedule";

export type IrrigationInputs = {
  soilMoisture: number;
  target: { min: number; max: number };
  weather: WeatherScenario;
};

export type IrrigationDecision = {
  zoneId: string;
  plantId: string;
  action: IrrigationAction;
  reason: IrrigationReason;
  volumeLiters: number;
  durationMinutes: number;
  moistureBefore: number;
  moistureAfter: number;
  target: { min: number; max: number };
};

export type IrrigationMode = "scheduled" | "adaptive";

/** What the user has selected in the scene. */
export type GardenSelection =
  | { type: "plant"; id: string }
  | { type: "zone"; id: string }
  | { type: "sensor"; id: string }
  | null;
