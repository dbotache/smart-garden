import type { IrrigationZone, WeatherScenario, WeatherScenarioId } from "../types";
import { BED_SIZE, RAISED_BEDS } from "./site";

/**
 * DEMONSTRATION irrigation hardware model.
 * One solenoid valve per raised bed → each bed is an independently controllable zone.
 * Because every bed holds one species, watering is effectively per species
 * (matches the planned "Bewässerung für einzelne Pflanzenarten"). Individual plants inside a bed
 * are NOT independently controllable: they share the bed's two drip lines.
 */

const INNER_AREA = (BED_SIZE.width - 2 * BED_SIZE.wall) * (BED_SIZE.depth - 2 * BED_SIZE.wall);

export const DRIP = { linesPerBed: 2, emitterSpacingM: 0.3, emitterFlowLph: 2 } as const;
const EMITTERS_PER_LINE = Math.floor((BED_SIZE.depth - 2 * BED_SIZE.wall) / DRIP.emitterSpacingM);

export const IRRIGATION_ZONES: IrrigationZone[] = RAISED_BEDS.map((bed, i) => ({
  id: bed.irrigationZoneId ?? `iz-${i + 1}`,
  valveId: `valve-${i + 1}`,
  plantingZoneId: bed.id,
  emitterCount: DRIP.linesPerBed * EMITTERS_PER_LINE,
  emitterFlowLph: DRIP.emitterFlowLph,
  rootZoneDepthM: 0.1,
  areaM2: Number(INNER_AREA.toFixed(3)),
}));

export function irrigationZoneForBed(bedId: string): IrrigationZone | undefined {
  return IRRIGATION_ZONES.find((z) => z.plantingZoneId === bedId);
}

/** Fixed timer baseline: every zone, every morning at 06:00, same volume. */
export const FIXED_SCHEDULE = { time: "06:00", litersPerZone: 20 } as const;

/** Decision thresholds. */
export const RULES = {
  /** below min by more than this (percentage points) = critically dry, cannot wait for rain */
  criticalMarginPct: 5,
  /** rain is "expected" when the forecast meets both thresholds */
  rainForecastMm: 5,
  rainProbability: 0.6,
} as const;

export const WEATHER_SCENARIOS: Record<WeatherScenarioId, WeatherScenario> = {
  "dry-spell": { id: "dry-spell", recentRainMm: 0, forecastRainMm: 0.5, forecastProbability: 0.1, airTemperatureC: 26.5 },
  "rain-expected": { id: "rain-expected", recentRainMm: 0, forecastRainMm: 12, forecastProbability: 0.8, airTemperatureC: 21 },
};
