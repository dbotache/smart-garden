import { describe, expect, it } from "vitest";
import { CURRENT_SOIL_MOISTURE, SENSOR_DEVICES, getDeviceSeries, probeForPlant, probeForZone } from "../data/sensors";
import { RAISED_BEDS } from "../data/site";
import { dailyMeans, generateSeries, moistureStatus, summarize, trendDirection } from "../utils/timeseries";
import { estimateHealthIndex, healthBand } from "../utils/health";

describe("sensor fixtures", () => {
  it("installs exactly one soil probe per raised bed plus one weather station", () => {
    for (const bed of RAISED_BEDS) expect(SENSOR_DEVICES.filter((d) => d.plantingZoneId === bed.id)).toHaveLength(1);
    expect(SENSOR_DEVICES.filter((d) => d.kind === "weather-station")).toHaveLength(1);
  });

  it("is deterministic across calls", () => {
    expect(getDeviceSeries("probe-1")).toEqual(getDeviceSeries("probe-1"));
  });

  it("ends every soil-moisture history at the current reading", () => {
    for (const bed of RAISED_BEDS) {
      const series = getDeviceSeries(probeForZone(bed.id)!.id).find((s) => s.metric === "soil-moisture")!;
      expect(series.points.at(-1)!.value).toBe(CURRENT_SOIL_MOISTURE[bed.id]);
      expect(series.points).toHaveLength(42); // 7 days × 6 samples
    }
  });

  it("marks plant health as estimated and everything else as measured", () => {
    const series = getDeviceSeries("probe-1");
    expect(series.find((s) => s.metric === "health-index")?.source).toBe("estimated");
    for (const s of series.filter((x) => x.metric !== "health-index")) expect(s.source).toBe("measured");
    expect(getDeviceSeries("weather-station").some((s) => s.metric === "health-index")).toBe(false);
  });

  it("returns empty data for unknown devices and no probe for trees", () => {
    expect(getDeviceSeries("ghost")).toEqual([]);
    expect(probeForPlant("apple-tree")).toBeUndefined();
    expect(probeForPlant("tomato")?.id).toBe("probe-1");
  });
});

describe("time-series transforms", () => {
  const pts = generateSeries({ seed: 7, current: 20, drift: -6, daily: 1, noise: 0.5 });

  it("summarises min/max/mean/change", () => {
    const s = summarize(pts)!;
    expect(s.latest).toBe(20);
    expect(s.min).toBeLessThanOrEqual(s.mean);
    expect(s.max).toBeGreaterThanOrEqual(s.mean);
    expect(s.change).toBeLessThan(0);
  });

  it("ignores non-finite values and handles empty input", () => {
    expect(summarize([])).toBeNull();
    expect(summarize([{ t: "x", value: Number.NaN }, { t: "y", value: 3 }])!.count).toBe(1);
  });

  it("computes daily means in chronological order", () => {
    const days = dailyMeans(pts);
    expect(days).toHaveLength(8); // 7 × 24 h ending at 10:00 spans 8 calendar dates
    expect(days.map((d) => d.t)).toEqual([...days.map((d) => d.t)].sort());
  });

  it("classifies trend and moisture status", () => {
    expect(trendDirection({ metric: "soil-moisture", source: "measured", unit: "%", points: pts })).toBe("falling");
    expect(moistureStatus(18, { min: 25, max: 35 })).toBe("below");
    expect(moistureStatus(25, { min: 25, max: 35 })).toBe("within");
    expect(moistureStatus(36, { min: 25, max: 35 })).toBe("above");
  });
});

describe("estimated health index", () => {
  it("is high within target and drops with drought stress", () => {
    const ok = estimateHealthIndex({ soilMoisture: 30, target: { min: 25, max: 35 }, airTemperatureC: 22 });
    const dry = estimateHealthIndex({ soilMoisture: 18, target: { min: 25, max: 35 }, airTemperatureC: 22 });
    expect(ok).toBeGreaterThanOrEqual(95);
    expect(dry).toBeLessThan(ok);
    expect(healthBand(ok)).toBe("good");
  });

  it("rejects invalid inputs", () => {
    expect(() => estimateHealthIndex({ soilMoisture: Number.NaN, target: { min: 25, max: 35 }, airTemperatureC: 22 })).toThrow();
    expect(() => estimateHealthIndex({ soilMoisture: 20, target: { min: 35, max: 25 }, airTemperatureC: 22 })).toThrow();
  });
});
