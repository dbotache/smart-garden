import { describe, expect, it } from "vitest";
import { IRRIGATION_ZONES, WEATHER_SCENARIOS } from "../data/irrigation";
import { compareModes, decideAdaptive, litersForMoistureDelta, moistureDeltaForLiters, planIrrigation } from "../utils/irrigationLogic";

const zone = IRRIGATION_ZONES[0]!;
const dry = WEATHER_SCENARIOS["dry-spell"];
const rain = WEATHER_SCENARIOS["rain-expected"];
const tomatoTarget = { min: 25, max: 35 };

describe("adaptive irrigation decision", () => {
  it("waters the brief's tomato example: 18 % vs 25–35 %, no rain", () => {
    const d = decideAdaptive(zone, "tomato", { soilMoisture: 18, target: tomatoTarget, weather: { ...dry, forecastRainMm: 0 } });
    expect(d.action).toBe("water");
    expect(d.reason).toBe("critically-dry");
    expect(d.moistureAfter).toBeCloseTo(30, 0); // refilled to mid-range
    expect(d.volumeLiters).toBeGreaterThan(0);
    expect(d.durationMinutes).toBeGreaterThan(0);
  });

  it("waters a slightly dry bed when no rain is coming", () => {
    const d = decideAdaptive(zone, "basil", { soilMoisture: 23, target: tomatoTarget, weather: dry });
    expect([d.action, d.reason]).toEqual(["water", "below-target"]);
  });

  it("defers a slightly dry bed when rain is expected", () => {
    const d = decideAdaptive(zone, "basil", { soilMoisture: 23, target: tomatoTarget, weather: rain });
    expect([d.action, d.reason, d.volumeLiters]).toEqual(["defer", "rain-expected", 0]);
  });

  it("still waters a critically dry bed before rain, but only up to the lower limit", () => {
    const d = decideAdaptive(zone, "tomato", { soilMoisture: 18, target: tomatoTarget, weather: rain });
    expect(d.action).toBe("water");
    expect(d.moistureAfter).toBeCloseTo(25, 0);
  });

  it("skips beds within or above target", () => {
    expect(decideAdaptive(zone, "x", { soilMoisture: 30, target: tomatoTarget, weather: dry }).reason).toBe("within-target");
    const above = decideAdaptive(zone, "x", { soilMoisture: 40, target: tomatoTarget, weather: dry });
    expect([above.action, above.reason, above.volumeLiters]).toEqual(["skip", "above-target", 0]);
  });

  it("rejects invalid sensor values and target ranges", () => {
    expect(() => decideAdaptive(zone, "x", { soilMoisture: Number.NaN, target: tomatoTarget, weather: dry })).toThrow(RangeError);
    expect(() => decideAdaptive(zone, "x", { soilMoisture: 140, target: tomatoTarget, weather: dry })).toThrow(RangeError);
    expect(() => decideAdaptive(zone, "x", { soilMoisture: 20, target: { min: 30, max: 30 }, weather: dry })).toThrow(RangeError);
  });

  it("converts litres and moisture consistently", () => {
    expect(moistureDeltaForLiters(zone, litersForMoistureDelta(zone, 7))).toBeCloseTo(7, 6);
    expect(litersForMoistureDelta(zone, -3)).toBe(0);
  });
});

describe("plan comparison", () => {
  it("waters only tomato and basil adaptively in a dry spell", () => {
    const plan = planIrrigation("adaptive", dry);
    expect(plan.decisions.filter((d) => d.action === "water").map((d) => d.plantId)).toEqual(["tomato", "basil"]);
    expect(plan.zonesOverWatered).toBe(0);
    expect(plan.zonesStillDry).toBe(0);
  });

  it("over-waters the drought-tolerant beds with a fixed timer", () => {
    const plan = planIrrigation("scheduled", dry);
    expect(plan.zonesWatered).toBe(6);
    expect(plan.totalLiters).toBe(120);
    expect(plan.zonesOverWatered).toBe(3); // lavender, kale, rosemary
    expect(plan.zonesStillDry).toBe(1); // and the tomato still does not get enough
  });

  it("pins the dry-spell numbers shown in the demo", () => {
    const { adaptive, savedLiters, savedPct } = compareModes(dry);
    expect(adaptive.totalLiters).toBe(57.5);
    expect([savedLiters, savedPct]).toEqual([62.5, 52]);
  });

  it("saves water versus the fixed timer in both scenarios", () => {
    for (const w of [dry, rain]) {
      const { adaptive, scheduled, savedLiters, savedPct } = compareModes(w);
      expect(adaptive.totalLiters).toBeLessThan(scheduled.totalLiters);
      expect(savedLiters).toBeGreaterThan(0);
      expect(savedPct).toBeGreaterThan(0);
    }
  });

  it("skips zones without a plant or a reading instead of guessing", () => {
    const plan = planIrrigation("adaptive", dry, { moisture: { "bed-1": 18 } });
    expect(plan.decisions).toHaveLength(1);
  });
});
