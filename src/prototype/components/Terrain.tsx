"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GRAVEL_GARDEN, HEDGES, PATH_TO_GARDEN, PLOT, TERRACE, rectCenter, rectSize } from "../data/site";
import { useGardenMaterials } from "./materials";
import { useLayers } from "./sceneContext";
import { Block, GEOMETRY, rectSegments, segmentsGeometry } from "./primitives";
import type { Rect } from "../types";

function Flat({ rect, y, material }: { rect: Rect; y: number; material: THREE.Material }) {
  const [cx, cz] = rectCenter(rect);
  const [w, d] = rectSize(rect);
  return <mesh geometry={GEOMETRY.plane} material={material} position={[cx, y, cz]} scale={[w, 1, d]} receiveShadow />;
}

/** Ground, lawn, gravel garden, terrace, path, hedges, and the planning grid. */
export function Terrain() {
  const m = useGardenMaterials();
  const layers = useLayers();
  const grid = useRef<THREE.LineSegments>(null);
  const hedges = useRef<THREE.Group>(null);

  const gridGeometry = useMemo(() => {
    const segs: number[][] = [];
    for (let x = PLOT.minX; x <= PLOT.maxX + 1e-6; x += 1) segs.push([x, 0.006, PLOT.minZ, x, 0.006, PLOT.maxZ]);
    for (let z = PLOT.minZ; z <= PLOT.maxZ + 1e-6; z += 1) segs.push([PLOT.minX, 0.006, z, PLOT.maxX, 0.006, z]);
    return segmentsGeometry(segs);
  }, []);
  const plotOutline = useMemo(() => segmentsGeometry(rectSegments(PLOT, 0.012)), []);

  useFrame(() => {
    const { build, materialize, planted } = layers.current;
    if (grid.current) {
      grid.current.visible = materialize < 0.99;
      (grid.current.material as THREE.LineBasicMaterial).opacity = 0.6 * build * (1 - materialize);
    }
    // hedges are planted with the garden
    if (hedges.current) {
      hedges.current.visible = planted > 0.01;
      hedges.current.scale.set(1, Math.max(0.001, planted), 1);
    }
  });

  return (
    <group>
      {/* surroundings */}
      <mesh geometry={GEOMETRY.plane} material={m.ground} position={[0, -0.02, 0]} scale={[140, 1, 140]} receiveShadow />
      <Flat rect={PLOT} y={0} material={m.lawn} />
      <Flat rect={GRAVEL_GARDEN} y={0.008} material={m.gravel} />
      <Flat rect={PATH_TO_GARDEN} y={0.01} material={m.path} />
      <Block bounds={TERRACE.bounds} height={TERRACE.height} material={m.terrace} edgeMaterial={m.edges} castShadow={false} />
      <lineSegments ref={grid} geometry={gridGeometry} material={m.grid} />
      <lineSegments geometry={plotOutline} material={m.planLine} />
      <group ref={hedges}>
        {HEDGES.map((h) => (
          <Block key={h.id} bounds={h.bounds} height={h.height} material={m.hedge} />
        ))}
      </group>
    </group>
  );
}
