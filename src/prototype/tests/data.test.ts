import { describe, expect, it } from "vitest";
import { PLANTS, RECOMMENDED_PLANTS, getPlant, plantForZone } from "../data/plants";
import { PLANTING_ZONES, RAISED_BEDS, getZone } from "../data/site";
import { IRRIGATION_ZONES } from "../data/irrigation";
import { MESSAGES, localizePlant } from "../data/i18n";
import { GARDEN_STAGES } from "../types";

describe("plant data", () => {
  it("has unique ids", () => {
    expect(new Set(PLANTS.map((p) => p.id)).size).toBe(PLANTS.length);
  });

  it("links every plant to an existing planting zone", () => {
    for (const p of PLANTS) expect(getZone(p.plantingZoneId), p.id).toBeDefined();
  });

  it("assigns exactly one recommended species per raised bed", () => {
    for (const bed of RAISED_BEDS) expect(RECOMMENDED_PLANTS.filter((p) => p.plantingZoneId === bed.id)).toHaveLength(1);
    expect(plantForZone("orchard")).toBeUndefined();
  });

  it("has valid moisture target ranges", () => {
    for (const p of PLANTS) {
      expect(p.moistureTarget.min).toBeGreaterThanOrEqual(0);
      expect(p.moistureTarget.max).toBeLessThanOrEqual(60);
      expect(p.moistureTarget.min).toBeLessThan(p.moistureTarget.max);
    }
  });

  it("scores and explains every recommended plant, and leaves existing plants unscored", () => {
    for (const p of PLANTS) {
      if (p.origin === "existing") {
        expect(p.recommendationScore).toBeUndefined();
      } else {
        expect(p.recommendationScore).toBeGreaterThanOrEqual(0);
        expect(p.recommendationScore).toBeLessThanOrEqual(100);
        expect(p.recommendationReason?.length).toBeGreaterThan(20);
      }
    }
  });

  it("returns undefined for unknown ids instead of throwing", () => {
    expect(getPlant("does-not-exist")).toBeUndefined();
    expect(getZone("nope")).toBeUndefined();
  });

  it("connects every raised bed to exactly one irrigation zone", () => {
    for (const bed of RAISED_BEDS) {
      const zones = IRRIGATION_ZONES.filter((z) => z.plantingZoneId === bed.id);
      expect(zones).toHaveLength(1);
      expect(zones[0]!.id).toBe(bed.irrigationZoneId);
    }
    expect(PLANTING_ZONES.find((z) => z.kind === "orchard")?.irrigationZoneId).toBeUndefined();
  });
});

describe("localisation", () => {
  it("translates every plant and stage into German", () => {
    for (const p of PLANTS) {
      const de = localizePlant(p, "de");
      expect(de.commonName).not.toBe(p.commonName);
      expect(de.species).toBe(p.species); // botanical names are not translated
      if (p.recommendationReason) expect(de.recommendationReason).not.toBe(p.recommendationReason);
    }
    for (const s of GARDEN_STAGES) expect(MESSAGES.de.stages[s].title).not.toBe(MESSAGES.en.stages[s].title);
  });

  it("keeps the English canonical record untouched", () => {
    const tomato = getPlant("tomato")!;
    expect(localizePlant(tomato, "en")).toBe(tomato);
  });
});
