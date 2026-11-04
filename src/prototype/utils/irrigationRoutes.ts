import type { Vec3 } from "../types";
import { AISLE_Z, BED_SIZE, MANIFOLD, RAISED_BEDS, WATER_TAP, rectCenter } from "../data/site";
import { DRIP, IRRIGATION_ZONES } from "../data/irrigation";
import { dripLineXs } from "./geometry";

/**
 * Pipe routing (metres). Supply line runs from the house tap, north of the terrace, to the valve manifold.
 * Six laterals leave the manifold along the aisle in separate lanes (farther beds use lanes nearer the
 * aisle centre, so laterals never cross), climb over the bed wall and feed a header + two drip lines.
 */

const GROUND_Y = 0.045;
const MAN_X = MANIFOLD.position[0] + MANIFOLD.size[0] / 2;

export type ZoneRoute = { zoneId: string; bedId: string; lateral: Vec3[]; header: Vec3[]; drips: Vec3[][]; emitters: Vec3[]; valve: Vec3 };

export function buildRoutes() {
  const supply: Vec3[] = [WATER_TAP, [WATER_TAP[0], GROUND_Y, WATER_TAP[2]], [0.3, GROUND_Y, WATER_TAP[2]], [0.3, GROUND_Y, AISLE_Z], [MANIFOLD.position[0] - MANIFOLD.size[0] / 2, GROUND_Y, AISLE_Z]];
  const columns = [...new Set(RAISED_BEDS.map((b) => rectCenter(b.bounds)[0]))].sort((a, b) => a - b);
  const routes: ZoneRoute[] = IRRIGATION_ZONES.map((zone, i) => {
    const bed = RAISED_BEDS.find((b) => b.id === zone.plantingZoneId)!;
    const [cx] = rectCenter(bed.bounds);
    const col = columns.indexOf(cx);
    const north = bed.bounds.maxZ < AISLE_Z;
    const edge = north ? bed.bounds.maxZ : bed.bounds.minZ;
    const dir = north ? -1 : 1; // from aisle into the bed
    const lane = north ? edge + 0.1 * (1 + col) : edge - 0.1 * (1 + col);
    const out = edge - dir * 0.05;
    const inside = edge + dir * (BED_SIZE.wall + 0.06);
    const top = BED_SIZE.height + 0.03;
    const lateral: Vec3[] = [[MAN_X, GROUND_Y, lane], [cx, GROUND_Y, lane], [cx, GROUND_Y, out], [cx, top + 0.05, out], [cx, top + 0.05, inside], [cx, top, inside]];
    const [x1, x2] = dripLineXs(bed.id) as [number, number];
    const header: Vec3[] = [[x1, top, inside], [x2, top, inside]];
    const far = (north ? bed.bounds.minZ : bed.bounds.maxZ) - dir * (BED_SIZE.wall + 0.06);
    const drips: Vec3[][] = [x1, x2].map((x) => [[x, top, inside], [x, top, far]]);
    const emitters: Vec3[] = [];
    for (const x of [x1, x2]) {
      const len = Math.abs(far - inside);
      const n = Math.floor(len / DRIP.emitterSpacingM);
      for (let k = 0; k < n; k++) emitters.push([x, top, inside + dir * (DRIP.emitterSpacingM * (k + 0.5))]);
    }
    const valve: Vec3 = [MANIFOLD.position[0], MANIFOLD.size[1] + 0.02, MANIFOLD.position[2] - MANIFOLD.size[2] / 2 + (MANIFOLD.size[2] / IRRIGATION_ZONES.length) * (i + 0.5)];
    return { zoneId: zone.id, bedId: bed.id, lateral, header, drips, emitters, valve };
  });
  return { supply, routes };
}

