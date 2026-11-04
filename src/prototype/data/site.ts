import type { PlantingZone, Rect, Vec3 } from "../types";

/**
 * Site model (metres). Single source of truth for every position used by the 3D scene.
 * Unit tests in tests/geometry.test.ts check that nothing here overlaps.
 *
 *            -z (north: hedge, fruit trees in front of it)
 *   house ──────── terrace ── gravel garden (2 × 3 raised beds) ── weather station
 *            +z (south: open lawn, towards the default camera)
 */

export const PLOT: Rect = { minX: -14, maxX: 14, minZ: -9, maxZ: 9 };

export type Block = { id: string; bounds: Rect; height: number; baseY?: number };

/** Two-storey main volume plus a single-storey wing (L-shaped, after reference "1-overall view"). */
export const HOUSE_MAIN: Block = { id: "house-main", bounds: { minX: -12, maxX: -4, minZ: -5.5, maxZ: 1.5 }, height: 6.2 };
export const HOUSE_WING: Block = { id: "house-wing", bounds: { minX: -8.5, maxX: -4, minZ: 1.5, maxZ: 5.3 }, height: 3.2 };
export const HOUSE_BLOCKS = [HOUSE_MAIN, HOUSE_WING];

export const TERRACE: Block = { id: "terrace", bounds: { minX: -4, maxX: -1.4, minZ: -3.6, maxZ: 1.5 }, height: 0.16 };
export const GRAVEL_GARDEN: Rect = { minX: 0.4, maxX: 10.8, minZ: -5.5, maxZ: 2.6 };
export const PATH_TO_GARDEN: Rect = { minX: -1.4, maxX: 0.4, minZ: -2.2, maxZ: -1.2 };

export const BED_SIZE = { width: 1.4, depth: 2.6, height: 0.45, wall: 0.08 } as const;
const BED_COLUMNS = [2.6, 5.6, 8.6] as const;
const BED_ROWS = { north: -3.6, south: 0.2 } as const;
/** Aisle between the two bed rows; the irrigation laterals run here. */
export const AISLE_Z = -1.7;

function bedRect(cx: number, cz: number): Rect {
  return {
    minX: cx - BED_SIZE.width / 2,
    maxX: cx + BED_SIZE.width / 2,
    minZ: cz - BED_SIZE.depth / 2,
    maxZ: cz + BED_SIZE.depth / 2,
  };
}

export const rectCenter = (r: Rect): [number, number] => [(r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2];
export const rectSize = (r: Rect): [number, number] => [r.maxX - r.minX, r.maxZ - r.minZ];
export const rectArea = (r: Rect) => (r.maxX - r.minX) * (r.maxZ - r.minZ);

export const PLANTING_ZONES: PlantingZone[] = [
  { id: "bed-1", label: "Bed 1", kind: "raised-bed", bounds: bedRect(BED_COLUMNS[0], BED_ROWS.south), sunExposure: "full-sun", soil: "Loamy raised-bed mix", irrigationZoneId: "iz-1" },
  { id: "bed-2", label: "Bed 2", kind: "raised-bed", bounds: bedRect(BED_COLUMNS[1], BED_ROWS.south), sunExposure: "full-sun", soil: "Loamy raised-bed mix", irrigationZoneId: "iz-2" },
  { id: "bed-3", label: "Bed 3", kind: "raised-bed", bounds: bedRect(BED_COLUMNS[2], BED_ROWS.south), sunExposure: "full-sun", soil: "Sandy, well-drained mix", irrigationZoneId: "iz-3" },
  { id: "bed-4", label: "Bed 4", kind: "raised-bed", bounds: bedRect(BED_COLUMNS[0], BED_ROWS.north), sunExposure: "partial-shade", soil: "Humus-rich raised-bed mix", irrigationZoneId: "iz-4" },
  { id: "bed-5", label: "Bed 5", kind: "raised-bed", bounds: bedRect(BED_COLUMNS[1], BED_ROWS.north), sunExposure: "full-sun", soil: "Loamy raised-bed mix", irrigationZoneId: "iz-5" },
  { id: "bed-6", label: "Bed 6", kind: "raised-bed", bounds: bedRect(BED_COLUMNS[2], BED_ROWS.north), sunExposure: "full-sun", soil: "Sandy, well-drained mix", irrigationZoneId: "iz-6" },
  { id: "orchard", label: "Orchard strip", kind: "orchard", bounds: { minX: 0.4, maxX: 11.6, minZ: -7.4, maxZ: -5.7 }, sunExposure: "full-sun", soil: "Existing lawn on loam" },
];

export const RAISED_BEDS = PLANTING_ZONES.filter((z) => z.kind === "raised-bed");

export function getZone(id: string): PlantingZone | undefined {
  return PLANTING_ZONES.find((z) => z.id === id);
}

/** Hedge along the northern boundary and a lower hedge on the east boundary. */
export const HEDGES: Block[] = [
  { id: "hedge-north", bounds: { minX: -13.4, maxX: 13.4, minZ: -8.7, maxZ: -7.9 }, height: 1.5 },
  { id: "hedge-east", bounds: { minX: 12.8, maxX: 13.6, minZ: -7.9, maxZ: 8.4 }, height: 1.1 },
];

export const WEATHER_STATION_POSITION: Vec3 = [11.9, 0, -3.2];

/** Garden tap on the east facade of the main house; the supply line starts here. */
export const WATER_TAP: Vec3 = [-3.9, 0.6, -4.6];
/** Valve manifold at the west end of the aisle. */
export const MANIFOLD = { position: [0.9, 0, AISLE_Z] as Vec3, size: [0.45, 0.32, 1.25] as Vec3 };

/** Camera presets. Same projection in every stage; only the target and distance shift gently. */
export const CAMERA_HOME = {
  position: [16, 15.5, 21] as Vec3,
  target: [0.5, 0.8, -0.6] as Vec3,
  fov: 32,
};

export const STAGE_CAMERA: Record<string, { target: Vec3; distance: number }> = {
  planning: { target: [-0.5, 1.0, -0.6], distance: 42 },
  planting: { target: [3.0, 0.6, -1.6], distance: 33 },
  monitoring: { target: [4.2, 0.6, -1.8], distance: 30 },
  irrigation: { target: [3.6, 0.4, -1.9], distance: 30 },
};
