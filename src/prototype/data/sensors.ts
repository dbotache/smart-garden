import type { MetricKind, MetricSeries, SensorDevice } from "../types";
import { RAISED_BEDS, WEATHER_STATION_POSITION } from "./site";
import { PLANTS, plantForZone } from "./plants";
import { probePosition } from "../utils/geometry";
import { generateSeries } from "../utils/timeseries";
import { hashString } from "../utils/random";
import { estimateHealthSeries } from "../utils/health";

/**
 * DEMONSTRATION SENSOR FIXTURES — deterministic, simulated values (no hardware connected).
 *
 * Hardware model (matches the planned PlantWiz sensor set: soil + air moisture, temperature, irradiance, plus weather data):
 *  - one capacitive soil probe per raised bed → soil moisture (% VWC) + soil temperature
 *  - one weather station → air temperature, relative humidity, light (klx), rainfall
 *  - plant health is NOT measured; an estimated index is derived from the measurements.
 */

export const DEMO_TIMESTAMP_LABEL = "15 Jul 2026, 10:00";

export const SENSOR_DEVICES: SensorDevice[] = [
  ...RAISED_BEDS.map<SensorDevice>((zone, i) => ({
    id: `probe-${i + 1}`,
    kind: "soil-probe",
    label: `Soil probe ${i + 1}`,
    position: probePosition(zone.id),
    plantingZoneId: zone.id,
    measures: ["soil-moisture", "soil-temperature"],
  })),
  {
    id: "weather-station",
    kind: "weather-station",
    label: "Weather station",
    position: WEATHER_STATION_POSITION,
    measures: ["air-temperature", "relative-humidity", "light", "rainfall"],
  },
];

/** Current soil moisture per bed (% VWC). Chosen to show all three irrigation outcomes. */
export const CURRENT_SOIL_MOISTURE: Record<string, number> = {
  "bed-1": 18, // tomato  — target 25–35 → well below (critically dry)
  "bed-2": 23, // basil   — target 25–35 → slightly below
  "bed-3": 14, // lavender — target 10–20 → within
  "bed-4": 31, // lettuce — target 30–40 → within
  "bed-5": 38, // kale    — target 28–40 → within
  "bed-6": 22, // rosemary — target 10–20 → above
};

const SOIL_TEMPERATURE: Record<string, number> = { "bed-1": 21.4, "bed-2": 21.0, "bed-3": 22.3, "bed-4": 18.6, "bed-5": 19.8, "bed-6": 22.1 };

export const CURRENT_WEATHER = { airTemperatureC: 26.5, relativeHumidity: 46, lightKlx: 68, rainLast24hMm: 0 };

export const UNITS: Record<MetricKind, string> = {
  "soil-moisture": "%",
  "soil-temperature": "°C",
  "air-temperature": "°C",
  "relative-humidity": "%",
  light: "klx",
  rainfall: "mm",
  "health-index": "/100",
};

function seriesFor(deviceId: string, metric: MetricKind): MetricSeries | null {
  const seed = hashString(`${deviceId}:${metric}`);
  const device = SENSOR_DEVICES.find((d) => d.id === deviceId);
  if (!device || !device.measures.includes(metric)) return null;
  const zone = device.plantingZoneId;
  switch (metric) {
    case "soil-moisture": {
      const current = CURRENT_SOIL_MOISTURE[zone!]!;
      // Beds that are dry now have been drying out over the week.
      const drift = current < 20 ? -11 : current < 25 ? -6 : -2;
      return { metric, source: "measured", unit: UNITS[metric], points: generateSeries({ seed, current, drift, daily: 0.8, noise: 0.5, min: 0, max: 60 }) };
    }
    case "soil-temperature":
      return { metric, source: "measured", unit: UNITS[metric], points: generateSeries({ seed, current: SOIL_TEMPERATURE[zone!]!, drift: 1.5, daily: 1.6, noise: 0.3 }) };
    case "air-temperature":
      return { metric, source: "measured", unit: UNITS[metric], points: generateSeries({ seed, current: CURRENT_WEATHER.airTemperatureC, drift: 3, daily: 6, noise: 0.8 }) };
    case "relative-humidity":
      return { metric, source: "measured", unit: UNITS[metric], points: generateSeries({ seed, current: CURRENT_WEATHER.relativeHumidity, drift: -8, daily: 12, noise: 2, min: 15, max: 100, decimals: 0 }) };
    case "light":
      return { metric, source: "measured", unit: UNITS[metric], points: generateSeries({ seed, current: CURRENT_WEATHER.lightKlx, drift: 0, daily: 45, noise: 6, min: 0, max: 110, decimals: 0 }) };
    case "rainfall":
      // dry week: two light showers early on, nothing since
      return {
        metric,
        source: "measured",
        unit: UNITS[metric],
        points: generateSeries({ seed, current: 0, drift: 0, daily: 0, noise: 0, decimals: 1 }).map((p, i) => ({ ...p, value: i === 4 ? 2.4 : i === 9 ? 0.8 : 0 })),
      };
    default:
      return null;
  }
}

/** All series for a device, including the ESTIMATED health index for soil probes. Deterministic. */
export function getDeviceSeries(deviceId: string): MetricSeries[] {
  const device = SENSOR_DEVICES.find((d) => d.id === deviceId);
  if (!device) return [];
  const measured = device.measures.map((m) => seriesFor(deviceId, m)).filter((s): s is MetricSeries => s !== null);
  if (device.kind === "soil-probe" && device.plantingZoneId) {
    const plant = plantForZone(device.plantingZoneId);
    const moisture = measured.find((s) => s.metric === "soil-moisture");
    const air = seriesFor("weather-station", "air-temperature");
    if (plant && moisture && air) {
      measured.push({ metric: "health-index", source: "estimated", unit: UNITS["health-index"], points: estimateHealthSeries(moisture.points, air.points, plant.moistureTarget) });
    }
  }
  return measured;
}

export function probeForZone(zoneId: string): SensorDevice | undefined {
  return SENSOR_DEVICES.find((d) => d.plantingZoneId === zoneId);
}

export function probeForPlant(plantId: string): SensorDevice | undefined {
  const plant = PLANTS.find((p) => p.id === plantId);
  return plant ? probeForZone(plant.plantingZoneId) : undefined;
}
