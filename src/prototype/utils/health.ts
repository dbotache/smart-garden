import type { Reading } from "../types";

/**
 * ESTIMATED care-status index (0–100). This is a model output, not a measurement:
 * no sensor in this system measures plant health directly.
 *
 * Inputs: soil moisture relative to the species' target range and air temperature stress.
 * It mirrors the planned "Prognosen zum Pflegezustand" feature and is clearly labelled as an estimate in the UI.
 */
export type HealthInputs = {
  soilMoisture: number;
  target: { min: number; max: number };
  airTemperatureC: number;
  /** optimal air temperature band for the species */
  comfortC?: { min: number; max: number };
};

export function estimateHealthIndex({ soilMoisture, target, airTemperatureC, comfortC = { min: 12, max: 28 } }: HealthInputs): number {
  if (![soilMoisture, target.min, target.max, airTemperatureC].every(Number.isFinite) || target.min > target.max) {
    throw new Error("estimateHealthIndex: invalid inputs");
  }
  const width = Math.max(1, target.max - target.min);
  const moistureGap = soilMoisture < target.min ? target.min - soilMoisture : soilMoisture > target.max ? soilMoisture - target.max : 0;
  // 0 within range; −40 points when one full range-width outside. Dry stress weighs more than wet stress.
  const moisturePenalty = Math.min(60, (moistureGap / width) * (soilMoisture < target.min ? 45 : 30));
  const tempGap = airTemperatureC < comfortC.min ? comfortC.min - airTemperatureC : airTemperatureC > comfortC.max ? airTemperatureC - comfortC.max : 0;
  const tempPenalty = Math.min(25, tempGap * 2.5);
  return Math.round(Math.max(0, Math.min(100, 98 - moisturePenalty - tempPenalty)));
}

export type HealthBand = "good" | "watch" | "stressed";
export function healthBand(index: number): HealthBand {
  if (index >= 80) return "good";
  if (index >= 60) return "watch";
  return "stressed";
}

/** Derive an estimated index series from measured moisture + air temperature series (aligned by index). */
export function estimateHealthSeries(moisture: Reading[], airTemp: Reading[], target: { min: number; max: number }): Reading[] {
  return moisture.map((m, i) => ({
    t: m.t,
    value: estimateHealthIndex({ soilMoisture: m.value, target, airTemperatureC: airTemp[i]?.value ?? airTemp[airTemp.length - 1]?.value ?? 20 }),
  }));
}
