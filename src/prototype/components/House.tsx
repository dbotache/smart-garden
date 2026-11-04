"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HOUSE_MAIN, HOUSE_WING } from "../data/site";
import { useGardenMaterials } from "./materials";
import { useLayers } from "./sceneContext";
import { Block } from "./primitives";
import { window01 } from "../utils/stages";
import type { Rect } from "../types";

/**
 * Modern flat-roof house after reference "1-overall view": two-storey main volume, single-storey wing,
 * thin roof slabs, large east-facing glazing towards the garden. The house never moves between stages;
 * during the planning build-in its walls are extruded from the ground plan (reference video "1-planning stage").
 */

type Pane = { bounds: Rect; baseY: number; height: number };

const EAST = HOUSE_MAIN.bounds.maxX; // facade facing the garden

function glazing(): { panes: Pane[]; mullions: Pane[] } {
  const panes: Pane[] = [];
  const mullions: Pane[] = [];
  const add = (x: number, z0: number, z1: number, y0: number, h: number, step: number) => {
    panes.push({ bounds: { minX: x, maxX: x + 0.06, minZ: z0, maxZ: z1 }, baseY: y0, height: h });
    for (let z = z0; z <= z1 + 1e-6; z += step) mullions.push({ bounds: { minX: x + 0.04, maxX: x + 0.1, minZ: z - 0.03, maxZ: z + 0.03 }, baseY: y0, height: h });
    mullions.push({ bounds: { minX: x + 0.04, maxX: x + 0.1, minZ: z0, maxZ: z1 }, baseY: y0 + h - 0.06, height: 0.06 });
  };
  add(EAST, -4.9, 0.9, 0.25, 2.55, 0.97); // ground floor, main
  add(EAST, -4.9, 0.9, 3.45, 2.15, 0.97); // upper floor, main
  add(HOUSE_WING.bounds.maxX, 2.0, 4.7, 0.25, 2.4, 0.9); // wing
  // south facade of the main block (west of the wing)
  panes.push({ bounds: { minX: -11.4, maxX: -9.0, minZ: HOUSE_MAIN.bounds.maxZ, maxZ: HOUSE_MAIN.bounds.maxZ + 0.06 }, baseY: 3.45, height: 2.15 });
  return { panes, mullions };
}

const expand = (r: Rect, d: number): Rect => ({ minX: r.minX - d, maxX: r.maxX + d, minZ: r.minZ - d, maxZ: r.maxZ + d });

export function House() {
  const m = useGardenMaterials();
  const layers = useLayers();
  const walls = useRef<THREE.Group>(null);
  const details = useRef<THREE.Group>(null);
  const { panes, mullions } = useMemo(() => glazing(), []);

  useFrame(() => {
    const { build, materialize } = layers.current;
    // walls rise from the plan once the plan lines are drawn (build 0.35 → 1)
    const rise = Math.max(0.002, window01(build, 0.35, 1));
    if (walls.current) walls.current.scale.y = rise;
    if (details.current) details.current.visible = rise > 0.98 || materialize > 0.01;
  });

  return (
    <group>
      <Block bounds={expand(HOUSE_MAIN.bounds, 0.12)} height={0.18} material={m.plinth} edgeMaterial={m.edges} castShadow={false} />
      <Block bounds={expand(HOUSE_WING.bounds, 0.12)} height={0.18} material={m.plinth} edgeMaterial={m.edges} castShadow={false} />
      <group ref={walls}>
        <Block bounds={HOUSE_MAIN.bounds} baseY={0.18} height={HOUSE_MAIN.height - 0.18} material={m.plaster} edgeMaterial={m.edges} />
        <Block bounds={HOUSE_WING.bounds} baseY={0.18} height={HOUSE_WING.height - 0.18} material={m.plaster} edgeMaterial={m.edges} />
        {/* thin cantilevered roof slabs */}
        <Block bounds={expand(HOUSE_MAIN.bounds, 0.35)} baseY={HOUSE_MAIN.height} height={0.28} material={m.roof} edgeMaterial={m.edges} />
        <Block bounds={expand(HOUSE_WING.bounds, 0.3)} baseY={HOUSE_WING.height} height={0.24} material={m.roof} edgeMaterial={m.edges} />
        {/* floor slab line between storeys on the garden facade */}
        <Block bounds={{ minX: EAST, maxX: EAST + 0.14, minZ: HOUSE_MAIN.bounds.minZ, maxZ: HOUSE_MAIN.bounds.maxZ }} baseY={2.95} height={0.32} material={m.roof} edgeMaterial={m.edges} />
        <group ref={details}>
          {panes.map((p, i) => (
            <Block key={`p${i}`} bounds={p.bounds} baseY={p.baseY} height={p.height} material={m.glass} edgeMaterial={m.edges} castShadow={false} />
          ))}
          {mullions.map((p, i) => (
            <Block key={`m${i}`} bounds={p.bounds} baseY={p.baseY} height={p.height} material={m.frame} castShadow={false} receiveShadow={false} />
          ))}
        </group>
      </group>
    </group>
  );
}
