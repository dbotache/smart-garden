import type { GardenPlant, Rect, Vec3 } from "../types";
import { BED_SIZE, getZone, rectCenter } from "../data/site";

export function rectsOverlap(a: Rect, b: Rect, gap = 0): boolean {
  return a.minX < b.maxX + gap && a.maxX + gap > b.minX && a.minZ < b.maxZ + gap && a.maxZ + gap > b.minZ;
}

export function pointInRect(x: number, z: number, r: Rect, margin = 0): boolean {
  return x >= r.minX + margin && x <= r.maxX - margin && z >= r.minZ + margin && z <= r.maxZ - margin;
}

export function rectAround(x: number, z: number, radius: number): Rect {
  return { minX: x - radius, maxX: x + radius, minZ: z - radius, maxZ: z + radius };
}

/**
 * Positions of the individual plants in a raised bed (world space, on the soil surface).
 * Rows are even so the bed centre (where the soil probe sits) stays free.
 */
export function plantLayout(plant: GardenPlant): Vec3[] {
  const zone = getZone(plant.plantingZoneId);
  if (!plant.layout || !zone || zone.kind !== "raised-bed") return [plant.position];
  const { columns, rows } = plant.layout;
  if (rows % 2 !== 0) throw new Error(`${plant.id}: layout rows must be even to keep the probe position free`);
  const [cx, cz] = rectCenter(zone.bounds);
  const innerW = BED_SIZE.width - 2 * BED_SIZE.wall;
  const innerD = BED_SIZE.depth - 2 * BED_SIZE.wall;
  const cellW = innerW / columns;
  const cellD = innerD / rows;
  const out: Vec3[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      out.push([cx - innerW / 2 + cellW * (c + 0.5), BED_SIZE.height, cz - innerD / 2 + cellD * (r + 0.5)]);
    }
  }
  return out;
}

/** Soil probe sits in the bed centre, between plant rows and between the two drip lines. */
export function probePosition(zoneId: string): Vec3 {
  const zone = getZone(zoneId);
  if (!zone) throw new Error(`Unknown zone ${zoneId}`);
  const [x, z] = rectCenter(zone.bounds);
  return [x, BED_SIZE.height, z];
}

/** Drip lines run along the bed (z) under each plant column. */
export function dripLineXs(zoneId: string): number[] {
  const zone = getZone(zoneId);
  if (!zone) throw new Error(`Unknown zone ${zoneId}`);
  const [cx] = rectCenter(zone.bounds);
  const innerW = BED_SIZE.width - 2 * BED_SIZE.wall;
  return [cx - innerW / 4, cx + innerW / 4];
}

export const distance2D = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[2] - b[2]);
