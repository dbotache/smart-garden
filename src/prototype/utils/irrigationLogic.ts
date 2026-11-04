import type { GardenPlant, IrrigationDecision, IrrigationInputs, IrrigationMode, IrrigationReason, IrrigationZone, WeatherScenario } from "../types";
import { FIXED_SCHEDULE, IRRIGATION_ZONES, RULES } from "../data/irrigation";
import { plantForZone } from "../data/plants";
import { CURRENT_SOIL_MOISTURE } from "../data/sensors";
import { moistureStatus } from "./timeseries";

/** Litres needed to raise volumetric moisture by `deltaPct` percentage points in a zone's root volume. */
export function litersForMoistureDelta(zone: IrrigationZone, deltaPct: number): number {
  return Math.max(0, (deltaPct / 100) * zone.rootZoneDepthM * zone.areaM2 * 1000);
}

/** Inverse of litersForMoistureDelta. */
export function moistureDeltaForLiters(zone: IrrigationZone, liters: number): number {
  return (liters / (zone.rootZoneDepthM * zone.areaM2 * 1000)) * 100;
}

export function isRainExpected(weather: WeatherScenario): boolean {
  return weather.forecastRainMm >= RULES.rainForecastMm && weather.forecastProbability >= RULES.rainProbability;
}

function validate(inputs: IrrigationInputs) {
  const { soilMoisture, target } = inputs;
  if (!Number.isFinite(soilMoisture) || soilMoisture < 0 || soilMoisture > 100) throw new RangeError(`Invalid soil moisture: ${soilMoisture}`);
  if (!Number.isFinite(target.min) || !Number.isFinite(target.max) || target.min >= target.max) throw new RangeError(`Invalid target range: ${target.min}–${target.max}`);
}

/**
 * Adaptive decision for ONE zone. Pure function, no rendering, no I/O.
 *  - within target → skip
 *  - above target → skip
 *  - below target, rain expected and not critical → defer (let the rain do it)
 *  - critically dry → water up to the lower bound only if rain is expected, else up to mid-range
 *  - below target, dry forecast → water up to mid-range
 */
export function decideAdaptive(zone: IrrigationZone, plantId: string, inputs: IrrigationInputs): IrrigationDecision {
  validate(inputs);
  const { soilMoisture, target, weather } = inputs;
  const status = moistureStatus(soilMoisture, target);
  const mid = (target.min + target.max) / 2;
  const critical = soilMoisture < target.min - RULES.criticalMarginPct;
  const rain = isRainExpected(weather);

  let reason: IrrigationReason;
  let goal = soilMoisture;
  if (status === "within") reason = "within-target";
  else if (status === "above") reason = "above-target";
  else if (critical) {
    reason = "critically-dry";
    goal = rain ? target.min : mid;
  } else if (rain) reason = "rain-expected";
  else {
    reason = "below-target";
    goal = mid;
  }
  const volume = litersForMoistureDelta(zone, goal - soilMoisture);
  const action = volume > 0 ? "water" : reason === "rain-expected" ? "defer" : "skip";
  return build(zone, plantId, action, reason, volume, soilMoisture, target);
}

/** Fixed-timer decision for ONE zone: always the same volume, regardless of conditions. */
export function decideScheduled(zone: IrrigationZone, plantId: string, inputs: IrrigationInputs): IrrigationDecision {
  validate(inputs);
  return build(zone, plantId, "water", "fixed-schedule", FIXED_SCHEDULE.litersPerZone, inputs.soilMoisture, inputs.target);
}

function build(zone: IrrigationZone, plantId: string, action: IrrigationDecision["action"], reason: IrrigationReason, liters: number, before: number, target: { min: number; max: number }): IrrigationDecision {
  const volumeLiters = Number(liters.toFixed(1));
  const flowLph = zone.emitterCount * zone.emitterFlowLph;
  return {
    zoneId: zone.id,
    plantId,
    action,
    reason,
    volumeLiters,
    durationMinutes: Math.round((volumeLiters / flowLph) * 60),
    moistureBefore: before,
    moistureAfter: Number((before + moistureDeltaForLiters(zone, volumeLiters)).toFixed(1)),
    target,
  };
}

export type IrrigationPlan = {
  mode: IrrigationMode;
  decisions: IrrigationDecision[];
  totalLiters: number;
  zonesWatered: number;
  /** watered zones that end above their target range (water wasted / plant stress) */
  zonesOverWatered: number;
  /** zones that end below their target range */
  zonesStillDry: number;
};

export type PlanInputs = {
  zones?: IrrigationZone[];
  moisture?: Record<string, number>;
  plantLookup?: (zoneId: string) => GardenPlant | undefined;
};

export function planIrrigation(mode: IrrigationMode, weather: WeatherScenario, opts: PlanInputs = {}): IrrigationPlan {
  const zones = opts.zones ?? IRRIGATION_ZONES;
  const moisture = opts.moisture ?? CURRENT_SOIL_MOISTURE;
  const lookup = opts.plantLookup ?? plantForZone;
  const decisions: IrrigationDecision[] = [];
  for (const zone of zones) {
    const plant = lookup(zone.plantingZoneId);
    const value = moisture[zone.plantingZoneId];
    if (!plant || value === undefined) continue; // unconnected or unmonitored zone: no decision possible
    const inputs = { soilMoisture: value, target: plant.moistureTarget, weather };
    decisions.push(mode === "adaptive" ? decideAdaptive(zone, plant.id, inputs) : decideScheduled(zone, plant.id, inputs));
  }
  const watered = decisions.filter((d) => d.action === "water");
  return {
    mode,
    decisions,
    totalLiters: Number(watered.reduce((a, d) => a + d.volumeLiters, 0).toFixed(1)),
    zonesWatered: watered.length,
    zonesOverWatered: watered.filter((d) => d.moistureAfter > d.target.max).length,
    zonesStillDry: decisions.filter((d) => d.moistureAfter < d.target.min).length,
  };
}

export function compareModes(weather: WeatherScenario, opts: PlanInputs = {}) {
  const scheduled = planIrrigation("scheduled", weather, opts);
  const adaptive = planIrrigation("adaptive", weather, opts);
  const savedLiters = Number((scheduled.totalLiters - adaptive.totalLiters).toFixed(1));
  const savedPct = scheduled.totalLiters > 0 ? Math.round((savedLiters / scheduled.totalLiters) * 100) : 0;
  return { scheduled, adaptive, savedLiters, savedPct };
}
