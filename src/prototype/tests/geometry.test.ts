// Regression tests for the original prototype's geometry defects (audit #1, #2, #9):
// plants, beds, sensors and pipes must never intersect the house or each other.
import { describe, expect, it } from "vitest";
import { GRAVEL_GARDEN, HEDGES, HOUSE_BLOCKS, MANIFOLD, PLANTING_ZONES, PLOT, RAISED_BEDS, TERRACE, WEATHER_STATION_POSITION, rectArea } from "../data/site";
import { EXISTING_PLANTS, PLANTS, RECOMMENDED_PLANTS } from "../data/plants";
import { SENSOR_DEVICES } from "../data/sensors";
import { distance2D, dripLineXs, plantLayout, pointInRect, rectAround, rectsOverlap } from "../utils/geometry";

describe("site layout", () => {
  it("keeps everything inside the plot", () => {
    for (const r of [...HOUSE_BLOCKS.map((b) => b.bounds), TERRACE.bounds, GRAVEL_GARDEN, ...PLANTING_ZONES.map((z) => z.bounds)]) {
      expect(r.minX).toBeGreaterThanOrEqual(PLOT.minX);
      expect(r.maxX).toBeLessThanOrEqual(PLOT.maxX);
      expect(r.minZ).toBeGreaterThanOrEqual(PLOT.minZ);
      expect(r.maxZ).toBeLessThanOrEqual(PLOT.maxZ);
    }
  });

  it("never places a planting zone on the house, terrace or hedges", () => {
    for (const zone of PLANTING_ZONES) {
      for (const blocker of [...HOUSE_BLOCKS, TERRACE, ...HEDGES]) {
        expect(rectsOverlap(zone.bounds, blocker.bounds, 0.5), `${zone.id} vs ${blocker.id}`).toBe(false);
      }
    }
  });

  it("keeps a walkable gap (≥ 0.8 m) between raised beds", () => {
    for (const a of RAISED_BEDS) for (const b of RAISED_BEDS) {
      if (a.id < b.id) expect(rectsOverlap(a.bounds, b.bounds, 0.8), `${a.id}/${b.id}`).toBe(false);
    }
  });

  it("puts all raised beds on the gravel garden", () => {
    for (const bed of RAISED_BEDS) {
      expect(pointInRect(bed.bounds.minX, bed.bounds.minZ, GRAVEL_GARDEN)).toBe(true);
      expect(pointInRect(bed.bounds.maxX, bed.bounds.maxZ, GRAVEL_GARDEN)).toBe(true);
    }
  });

  it("has positive areas", () => {
    for (const z of PLANTING_ZONES) expect(rectArea(z.bounds)).toBeGreaterThan(1);
  });

  it("keeps the manifold and weather station clear of beds", () => {
    const [mx, , mz] = MANIFOLD.position;
    const manifold = { minX: mx - MANIFOLD.size[0] / 2, maxX: mx + MANIFOLD.size[0] / 2, minZ: mz - MANIFOLD.size[2] / 2, maxZ: mz + MANIFOLD.size[2] / 2 };
    const station = rectAround(WEATHER_STATION_POSITION[0], WEATHER_STATION_POSITION[2], 0.4);
    for (const bed of RAISED_BEDS) {
      expect(rectsOverlap(manifold, bed.bounds, 0.2)).toBe(false);
      expect(rectsOverlap(station, bed.bounds, 0.2)).toBe(false);
    }
  });
});

describe("plant placement", () => {
  it("lays every recommended plant inside its own bed with a margin", () => {
    for (const plant of RECOMMENDED_PLANTS) {
      const zone = PLANTING_ZONES.find((z) => z.id === plant.plantingZoneId)!;
      const spots = plantLayout(plant);
      expect(spots.length).toBe(plant.layout!.columns * plant.layout!.rows);
      for (const [x, , z] of spots) expect(pointInRect(x, z, zone.bounds, 0.15), plant.id).toBe(true);
    }
  });

  it("keeps the soil probe at least 0.3 m from every plant in its bed", () => {
    for (const probe of SENSOR_DEVICES.filter((d) => d.kind === "soil-probe")) {
      const plant = RECOMMENDED_PLANTS.find((p) => p.plantingZoneId === probe.plantingZoneId)!;
      for (const spot of plantLayout(plant)) expect(distance2D(spot, probe.position)).toBeGreaterThanOrEqual(0.3);
    }
  });

  it("keeps drip lines inside the bed walls and away from the probe", () => {
    for (const bed of RAISED_BEDS) {
      for (const x of dripLineXs(bed.id)) {
        expect(x).toBeGreaterThan(bed.bounds.minX + 0.1);
        expect(x).toBeLessThan(bed.bounds.maxX - 0.1);
        expect(Math.abs(x - (bed.bounds.minX + bed.bounds.maxX) / 2)).toBeGreaterThan(0.2);
      }
    }
  });

  it("places existing trees in the orchard strip, clear of beds and house", () => {
    const orchard = PLANTING_ZONES.find((z) => z.id === "orchard")!;
    for (const tree of EXISTING_PLANTS) {
      expect(pointInRect(tree.position[0], tree.position[2], orchard.bounds, 0.5)).toBe(true);
      const canopy = rectAround(tree.position[0], tree.position[2], 1.6);
      for (const block of [...HOUSE_BLOCKS, ...RAISED_BEDS.map((b) => ({ bounds: b.bounds }))]) expect(rectsOverlap(canopy, block.bounds)).toBe(false);
    }
  });

  it("rejects odd row counts that would put a plant on the probe", () => {
    const bad = { ...PLANTS[0]!, layout: { columns: 2, rows: 3 } };
    expect(() => plantLayout(bad)).toThrow(/even/);
  });
});

import { buildRoutes } from "../utils/irrigationRoutes";
import { HOUSE_MAIN } from "../data/site";

describe("irrigation routing", () => {
  type Seg = [[number, number], [number, number]];
  const ground = (pts: [number, number, number][]): Seg[] =>
    pts.slice(1).map((p, i) => [[pts[i]![0], pts[i]![2]], [p[0], p[2]]] as Seg).filter(([a, b]) => a[0] !== b[0] || a[1] !== b[1]);
  const cross = ([a, b]: Seg, [c, d]: Seg) => {
    const o = (p: number[], q: number[], r: number[]) => Math.sign((q[0]! - p[0]!) * (r[1]! - p[1]!) - (q[1]! - p[1]!) * (r[0]! - p[0]!));
    return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
  };

  it("never crosses two laterals of different zones", () => {
    const { routes } = buildRoutes();
    for (const r1 of routes) for (const r2 of routes) {
      if (r1.zoneId >= r2.zoneId) continue;
      for (const s1 of ground(r1.lateral)) for (const s2 of ground(r2.lateral)) expect(cross(s1, s2), `${r1.zoneId} × ${r2.zoneId}`).toBe(false);
    }
  });

  it("keeps ground pipes outside the beds and the house (no pipe across the roof, audit #3)", () => {
    const { supply, routes } = buildRoutes();
    const groundPts = [...supply.slice(1), ...routes.flatMap((r) => r.lateral.filter((p) => p[1] < 0.1))];
    for (const [x, , z] of groundPts) {
      expect(pointInRect(x, z, HOUSE_MAIN.bounds, -0.01)).toBe(false);
      for (const bed of RAISED_BEDS) expect(pointInRect(x, z, bed.bounds, -0.01), `pipe point in ${bed.id}`).toBe(false);
    }
  });

  it("gives every bed two drip lines with emitters", () => {
    for (const r of buildRoutes().routes) {
      expect(r.drips).toHaveLength(2);
      expect(r.emitters.length).toBeGreaterThanOrEqual(14);
    }
  });
});

describe("trees vs devices", () => {
  it("keeps the weather station out of every tree canopy", () => {
    const station = rectAround(WEATHER_STATION_POSITION[0], WEATHER_STATION_POSITION[2], 0.5);
    for (const tree of EXISTING_PLANTS) expect(rectsOverlap(station, rectAround(tree.position[0], tree.position[2], 1.6))).toBe(false);
  });
});
