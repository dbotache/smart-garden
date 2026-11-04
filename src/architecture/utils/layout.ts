/**
 * Pure layout for the architecture map: which nodes/edges are active per level, and edge routing.
 *
 * Fixes against the original component (which drew every edge centre → centre, under the opaque boxes):
 *  - edges start and end on the box border, so arrowheads are visible
 *  - several edges on one side of a box get separate ports instead of sharing one point
 *  - an edge whose straight route would cross another box in the same column (Analyse + KI →
 *    Bewässerungs-Engine) is routed around the column on the right
 */
import { ARCH_EDGES, ARCH_LEVELS, ARCH_NODES, MAP, type ArchEdge, type ArchLevel, type ArchNode } from "../data/architecture";

export type Side = "left" | "right" | "top" | "bottom";
export type Point = { x: number; y: number };
export type RoutedEdge = ArchEdge & { key: string; start: Point; end: Point; d: string; detour: boolean };

const W = MAP.nodeWidth;
const H = MAP.nodeHeight;

export const nodeById = (id: string): ArchNode => {
  const n = ARCH_NODES.find((v) => v.id === id);
  if (!n) throw new Error(`unknown architecture node: ${id}`);
  return n;
};
const center = (n: ArchNode): Point => ({ x: n.x + W / 2, y: n.y + H / 2 });

export const isNodeActive = (n: ArchNode, level: ArchLevel) => n.level <= level;
export const activeEdges = (level: ArchLevel) => ARCH_EDGES.filter((e) => e.level <= level);
export const defaultNodeFor = (level: ArchLevel) => ARCH_LEVELS.find((l) => l.level === level)!.defaultNode;

/** boxes in the same column strictly between a and b */
function blockers(a: ArchNode, b: ArchNode): ArchNode[] {
  const [top, bottom] = a.y < b.y ? [a, b] : [b, a];
  return ARCH_NODES.filter((n) => n !== a && n !== b && Math.abs(n.x - a.x) < W && n.y > top.y && n.y < bottom.y);
}

type Plan = { fromSide: Side; toSide: Side; detour: boolean };

export function planEdge(e: ArchEdge): Plan {
  const a = nodeById(e.from);
  const b = nodeById(e.to);
  const dx = center(b).x - center(a).x;
  const dy = center(b).y - center(a).y;
  if (Math.abs(dx) >= W) return dx > 0 ? { fromSide: "right", toSide: "left", detour: false } : { fromSide: "left", toSide: "right", detour: false };
  if (blockers(a, b).length) return { fromSide: "right", toSide: "right", detour: true };
  return dy > 0 ? { fromSide: "bottom", toSide: "top", detour: false } : { fromSide: "top", toSide: "bottom", detour: false };
}

/** spread n ports over the middle of a side; ports are sorted by where the other end lies */
function port(n: ArchNode, side: Side, i: number, count: number): Point {
  const t = (i + 1) / (count + 1);
  const span = (len: number) => len * 0.2 + len * 0.6 * t;
  switch (side) {
    case "left":
      return { x: n.x, y: n.y + span(H) };
    case "right":
      return { x: n.x + W, y: n.y + span(H) };
    case "top":
      return { x: n.x + span(W), y: n.y };
    case "bottom":
      return { x: n.x + span(W), y: n.y + H };
  }
}

const DETOUR = 60; // stays inside the 91-unit gap between the cloud column and the app column

function path(s: Point, e: Point, fromSide: Side, detour: boolean): string {
  if (detour) return `M ${s.x} ${s.y} C ${s.x + DETOUR} ${s.y}, ${e.x + DETOUR} ${e.y}, ${e.x} ${e.y}`;
  if (fromSide === "left" || fromSide === "right") {
    const k = Math.max(30, Math.abs(e.x - s.x) * 0.48) * (fromSide === "right" ? 1 : -1);
    return `M ${s.x} ${s.y} C ${s.x + k} ${s.y}, ${e.x - k} ${e.y}, ${e.x} ${e.y}`;
  }
  const k = Math.max(20, Math.abs(e.y - s.y) * 0.48) * (fromSide === "bottom" ? 1 : -1);
  return `M ${s.x} ${s.y} C ${s.x} ${s.y + k}, ${e.x} ${e.y - k}, ${e.x} ${e.y}`;
}

/** Routes for all edges (computed once for the full system so ports don't jump when the level changes). */
export function routeEdges(edges: readonly ArchEdge[] = ARCH_EDGES): RoutedEdge[] {
  const plans = edges.map((e) => ({ e, ...planEdge(e) }));
  // collect every attachment per node side, sorted along the side by the position of the other end
  const slots = new Map<string, { edgeIndex: number; end: "from" | "to"; along: number }[]>();
  plans.forEach((p, edgeIndex) => {
    for (const end of ["from", "to"] as const) {
      const self = nodeById(end === "from" ? p.e.from : p.e.to);
      const other = center(nodeById(end === "from" ? p.e.to : p.e.from));
      const side = end === "from" ? p.fromSide : p.toSide;
      const key = `${self.id}:${side}`;
      const along = side === "left" || side === "right" ? other.y : other.x;
      slots.set(key, [...(slots.get(key) ?? []), { edgeIndex, end, along }]);
    }
  });
  const points = new Map<string, Point>();
  for (const [key, list] of slots) {
    const [id, side] = key.split(":") as [string, Side];
    list.sort((a, b) => a.along - b.along || a.edgeIndex - b.edgeIndex);
    list.forEach((s, i) => points.set(`${s.edgeIndex}:${s.end}`, port(nodeById(id), side, i, list.length)));
  }
  return plans.map((p, i) => {
    const start = points.get(`${i}:from`)!;
    const end = points.get(`${i}:to`)!;
    return { ...p.e, key: `${p.e.from}-${p.e.to}`, start, end, detour: p.detour, d: path(start, end, p.fromSide, p.detour) };
  });
}

/** neighbours of a node at a level, in data order */
export function connections(id: string, level: ArchLevel) {
  const edges = activeEdges(level);
  return {
    incoming: edges.filter((e) => e.to === id).map((e) => nodeById(e.from)),
    outgoing: edges.filter((e) => e.from === id).map((e) => nodeById(e.to)),
  };
}

/** sample a cubic Bézier path string "M x y C x y, x y, x y" (used by tests for collision checks) */
export function sampleCubic(d: string, steps = 40): Point[] {
  const n = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
  const [x0, y0, x1, y1, x2, y2, x3, y3] = n as [number, number, number, number, number, number, number, number];
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const u = 1 - t;
    return {
      x: u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
      y: u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
    };
  });
}
