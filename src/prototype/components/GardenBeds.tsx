"use client";

import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { BED_SIZE, RAISED_BEDS } from "../data/site";
import { EXISTING_PLANTS, plantForZone } from "../data/plants";
import { useGardenMaterials } from "./materials";
import { sameSelection, useLayers, useSceneState } from "./sceneContext";
import { Block, GEOMETRY, RectFrame, segmentsGeometry } from "./primitives";
import { PlantGroup, TreeSelectionRing } from "./Plant";
import { window01 } from "../utils/stages";
import type { PlantingZone } from "../types";

/** Plank seams and corner posts drawn as lines on every bed side (after reference "2-putting plants"). */
function plankSegments(bed: PlantingZone): number[][] {
  const { minX, maxX, minZ, maxZ } = bed.bounds;
  const segs: number[][] = [];
  for (const y of [BED_SIZE.height / 3, (2 * BED_SIZE.height) / 3]) {
    segs.push([minX, y, minZ - 0.002, maxX, y, minZ - 0.002], [minX, y, maxZ + 0.002, maxX, y, maxZ + 0.002]);
    segs.push([minX - 0.002, y, minZ, minX - 0.002, y, maxZ], [maxX + 0.002, y, minZ, maxX + 0.002, y, maxZ]);
  }
  return segs;
}

function Bed({ bed, index }: { bed: PlantingZone; index: number }) {
  const m = useGardenMaterials();
  const layers = useLayers();
  const { stage, selection, hover, onSelect, onHover } = useSceneState();
  const group = useRef<THREE.Group>(null);
  const plant = plantForZone(bed.id);
  const seams = useMemo(() => segmentsGeometry(plankSegments(bed)), [bed]);

  useFrame(() => {
    // beds are built one after another as the planting layer starts
    const g = window01(layers.current.planted, index * 0.05, 0.3 + index * 0.05);
    if (group.current) {
      group.current.visible = g > 0.001;
      group.current.scale.y = Math.max(0.001, g);
    }
  });

  const plantSel = plant ? { type: "plant" as const, id: plant.id } : null;
  const selected = plantSel && sameSelection(selection, plantSel);
  const sensorSelected = selection?.type === "sensor" && selection.id === `probe-${index + 1}`;
  const hovered = plantSel && sameSelection(hover, plantSel);
  const interactive = stage !== "planning" && plantSel;

  const inner = {
    minX: bed.bounds.minX + BED_SIZE.wall,
    maxX: bed.bounds.maxX - BED_SIZE.wall,
    minZ: bed.bounds.minZ + BED_SIZE.wall,
    maxZ: bed.bounds.maxZ - BED_SIZE.wall,
  };

  return (
    <group>
      <group
        ref={group}
        name={`bed-${bed.id}`}
        onClick={
          interactive
            ? (e: ThreeEvent<MouseEvent>) => {
                if (e.delta > 5) return;
                e.stopPropagation();
                onSelect(plantSel);
              }
            : undefined
        }
        onPointerOver={interactive ? (e: ThreeEvent<PointerEvent>) => (e.stopPropagation(), onHover(plantSel)) : undefined}
        onPointerOut={interactive ? () => onHover(null) : undefined}
      >
        <Block bounds={bed.bounds} height={BED_SIZE.height} material={m.bedWood} edgeMaterial={m.edges} />
        <lineSegments geometry={seams} material={m.edges} />
        <mesh geometry={GEOMETRY.plane} material={m.soil} position={[(inner.minX + inner.maxX) / 2, BED_SIZE.height + 0.004, (inner.minZ + inner.maxZ) / 2]} scale={[inner.maxX - inner.minX, 1, inner.maxZ - inner.minZ]} receiveShadow />
      </group>
      {(selected || hovered || sensorSelected) && stage !== "planning" && (
        <RectFrame bounds={{ minX: bed.bounds.minX - 0.12, maxX: bed.bounds.maxX + 0.12, minZ: bed.bounds.minZ - 0.12, maxZ: bed.bounds.maxZ + 0.12 }} y={0.02} width={0.09} material={selected || sensorSelected ? m.highlight : m.hover} />
      )}
    </group>
  );
}

export function GardenBeds() {
  return (
    <group>
      {RAISED_BEDS.map((bed, i) => {
        const plant = plantForZone(bed.id);
        return (
          <group key={bed.id}>
            <Bed bed={bed} index={i} />
            {plant && <PlantGroup plant={plant} index={i} />}
          </group>
        );
      })}
      {EXISTING_PLANTS.map((tree, i) => (
        <group key={tree.id}>
          <PlantGroup plant={tree} index={i} />
          <TreeSelectionRing plant={tree} />
        </group>
      ))}
    </group>
  );
}
