import { describe, expect, it } from "vitest";
import { ARCH_EDGES, ARCH_LEVELS, ARCH_NODES, MAP } from "../data/architecture";
import { activeEdges, connections, defaultNodeFor, nodeById, routeEdges, sampleCubic } from "../utils/layout";

const W = MAP.nodeWidth;
const H = MAP.nodeHeight;
const inside = (p: { x: number; y: number }, n: (typeof ARCH_NODES)[number], pad = 0) => p.x > n.x + pad && p.x < n.x + W - pad && p.y > n.y + pad && p.y < n.y + H - pad;

describe("architecture data (migrated verbatim)", () => {
  it("has the 14 modules and 17 data flows of the original", () => {
    expect(ARCH_NODES).toHaveLength(14);
    expect(ARCH_EDGES).toHaveLength(17);
    expect(new Set(ARCH_NODES.map((n) => n.id)).size).toBe(14);
  });

  it("references only existing modules, and a flow is never active before its modules", () => {
    for (const e of ARCH_EDGES) {
      expect(nodeById(e.from).level, `${e.from}→${e.to}`).toBeLessThanOrEqual(e.level);
      expect(nodeById(e.to).level, `${e.from}→${e.to}`).toBeLessThanOrEqual(e.level);
    }
  });

  it("keeps every box inside the map, without overlaps", () => {
    for (const a of ARCH_NODES) {
      expect(a.x + W).toBeLessThanOrEqual(MAP.width);
      expect(a.y + H).toBeLessThanOrEqual(MAP.height);
      for (const b of ARCH_NODES) if (a !== b) expect(a.x + W <= b.x || b.x + W <= a.x || a.y + H <= b.y || b.y + H <= a.y, `${a.id}/${b.id}`).toBe(true);
    }
  });

  it("counts active flows per level and picks the original default module", () => {
    expect([1, 2, 3].map((l) => activeEdges(l as 1 | 2 | 3).length)).toEqual([8, 12, 17]);
    expect(ARCH_LEVELS.map((l) => defaultNodeFor(l.level))).toEqual(["twin", "gateway", "engine"]);
  });
});

describe("edge routing", () => {
  const routes = routeEdges();

  it("starts and ends every flow on the border of its boxes (arrowheads are visible)", () => {
    for (const r of routes) {
      for (const [p, n] of [[r.start, nodeById(r.from)], [r.end, nodeById(r.to)]] as const) {
        const onX = (p.x === n.x || p.x === n.x + W) && p.y >= n.y && p.y <= n.y + H;
        const onY = (p.y === n.y || p.y === n.y + H) && p.x >= n.x && p.x <= n.x + W;
        expect(onX || onY, r.key).toBe(true);
      }
    }
  });

  it("never draws a flow through another module's box", () => {
    for (const r of routes) {
      for (const p of sampleCubic(r.d, 80)) {
        for (const n of ARCH_NODES) if (n.id !== r.from && n.id !== r.to) expect(inside(p, n), `${r.key} crosses ${n.id}`).toBe(false);
      }
    }
  });

  it("routes Analyse + KI → Bewässerungs-Engine around the cloud column, inside the map", () => {
    const r = routes.find((x) => x.key === "ai-engine")!;
    expect(r.detour).toBe(true);
    const xs = sampleCubic(r.d).map((p) => p.x);
    expect(Math.max(...xs)).toBeLessThan(nodeById("app").x); // stays left of the web-app column
  });

  it("gives each flow on the same side of a box its own port", () => {
    const ends = routes.flatMap((r) => [`${r.start.x},${r.start.y}`, `${r.end.x},${r.end.y}`]);
    expect(new Set(ends).size).toBe(ends.length);
  });

  it("lists incoming and outgoing modules of the selection", () => {
    expect(connections("twin", 1).incoming.map((n) => n.id)).toEqual(["api"]);
    expect(connections("twin", 3).incoming.map((n) => n.id)).toEqual(["api", "mqtt"]);
    expect(connections("twin", 3).outgoing.map((n) => n.id)).toEqual(["ai", "db", "engine"]);
  });
});
