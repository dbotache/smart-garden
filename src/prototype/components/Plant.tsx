"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import * as THREE from "three";
import type { GardenPlant, PlantModel, Vec3 } from "../types";
import { plantLayout } from "../utils/geometry";
import { hashString, mulberry32 } from "../utils/random";
import { window01 } from "../utils/stages";
import { GEOMETRY } from "./primitives";
import { useGardenMaterials, type GardenMaterials } from "./materials";
import { sameSelection, useLayers, useSceneState } from "./sceneContext";

/**
 * Procedural low-poly plant models (faceted, after reference "2-putting plants with recommendations").
 * Every species is described as parts (geometry + material + local transforms). All plants of one bed are
 * merged into one InstancedMesh per part → a handful of draw calls per bed regardless of plant count.
 */

type GeoKey = keyof typeof GEOMETRY;
type MatKey = keyof GardenMaterials;
type Part = { geo: GeoKey; mat: MatKey; matrices: THREE.Matrix4[] };

const tmp = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), scale: new THREE.Vector3(), euler: new THREE.Euler() };
function mat4(p: Vec3, s: Vec3, rot: Vec3 = [0, 0, 0]) {
  tmp.euler.set(rot[0], rot[1], rot[2]);
  tmp.quat.setFromEuler(tmp.euler);
  return new THREE.Matrix4().compose(tmp.pos.set(...p), tmp.quat, tmp.scale.set(...s));
}

function speciesParts(model: PlantModel, rand: () => number): Part[] {
  const parts: Record<string, Part> = {};
  const add = (geo: GeoKey, mat: MatKey, m: THREE.Matrix4) => {
    const key = `${geo}:${String(mat)}`;
    (parts[key] ??= { geo, mat, matrices: [] }).matrices.push(m);
  };
  const j = (a: number) => (rand() - 0.5) * 2 * a;
  const turn = rand() * Math.PI * 2;

  switch (model) {
    case "tomato": {
      add("cylinder", "stake", mat4([0.06, 0, 0.04], [0.03, 1.3, 0.03]));
      add("cylinder", "tomatoLeaf", mat4([0, 0, 0], [0.04, 1.05, 0.04]));
      for (let i = 0; i < 7; i++) {
        const a = turn + i * 2.3;
        const y = 0.22 + i * 0.12;
        const r = 0.13 - i * 0.008;
        add("ico", "tomatoLeaf", mat4([Math.cos(a) * r, y, Math.sin(a) * r], [0.34 - i * 0.02, 0.2, 0.3 - i * 0.02], [j(0.4), a, j(0.3)]));
        if (i % 2 === 0 && i < 6) add("sphere", "tomatoFruit", mat4([Math.cos(a + 0.9) * (r + 0.1), y - 0.08, Math.sin(a + 0.9) * (r + 0.1)], [0.08, 0.075, 0.08]));
      }
      break;
    }
    case "basil":
      for (let i = 0; i < 6; i++) {
        const a = turn + (i / 6) * Math.PI * 2;
        add("ico", "basil", mat4([Math.cos(a) * 0.07, 0.1 + (i % 3) * 0.07, Math.sin(a) * 0.07], [0.17, 0.13, 0.17], [j(0.5), a, j(0.5)]));
      }
      add("ico", "basil", mat4([0, 0.3, 0], [0.13, 0.12, 0.13]));
      break;
    case "lavender":
      add("ico", "lavenderLeaf", mat4([0, 0.09, 0], [0.38, 0.2, 0.38], [0, turn, 0]));
      for (let i = 0; i < 11; i++) {
        const a = turn + i * 2.4;
        const r = 0.04 + rand() * 0.08;
        const tilt = 0.12 + rand() * 0.18;
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        add("cylinder", "lavenderLeaf", mat4([x, 0.12, z], [0.012, 0.3, 0.012], [Math.sin(a) * tilt, 0, -Math.cos(a) * tilt]));
        add("cone", "lavenderFlower", mat4([x + Math.cos(a) * tilt * 0.3, 0.38, z + Math.sin(a) * tilt * 0.3], [0.045, 0.14, 0.045]));
      }
      break;
    case "lettuce":
      for (let i = 0; i < 8; i++) {
        const a = turn + (i / 8) * Math.PI * 2;
        add("sphere", "lettuce", mat4([Math.cos(a) * 0.11, 0.06, Math.sin(a) * 0.11], [0.2, 0.08, 0.13], [0, -a, 0.35]));
      }
      add("sphere", "lettuceHeart", mat4([0, 0.09, 0], [0.17, 0.14, 0.17]));
      break;
    case "kale":
      add("cylinder", "kale", mat4([0, 0, 0], [0.05, 0.42, 0.05]));
      for (let i = 0; i < 10; i++) {
        const a = turn + i * 2.4;
        const y = 0.12 + (i % 5) * 0.08;
        add("ico", "kale", mat4([Math.cos(a) * 0.12, y + 0.12, Math.sin(a) * 0.12], [0.16, 0.42, 0.08], [0, -a, 0.55]));
      }
      break;
    case "rosemary":
      for (let i = 0; i < 15; i++) {
        const a = turn + i * 2.4;
        const r = rand() * 0.12;
        add("cone", "rosemary", mat4([Math.cos(a) * r, 0, Math.sin(a) * r], [0.06, 0.38 + rand() * 0.22, 0.06], [Math.sin(a) * 0.15, 0, -Math.cos(a) * 0.15]));
      }
      break;
    case "apple-tree":
    case "pear-tree":
    case "plum-tree": {
      const fruit: MatKey = model === "apple-tree" ? "apple" : model === "pear-tree" ? "pear" : "plum";
      add("cylinder", "trunk", mat4([0, 0, 0], [0.24, 2.0, 0.24]));
      add("cylinder", "trunk", mat4([0.25, 1.6, 0], [0.1, 0.9, 0.1], [0, 0, -0.7]));
      add("cylinder", "trunk", mat4([-0.2, 1.7, 0.1], [0.1, 0.8, 0.1], [0.3, 0, 0.6]));
      const blobs: Vec3[] = [[0, 2.75, 0], [0.75, 2.45, 0.2], [-0.7, 2.5, -0.15], [0.15, 2.5, 0.75], [-0.1, 2.45, -0.75], [0.35, 3.25, -0.2], [-0.35, 3.2, 0.3]];
      blobs.forEach((b, i) => add("ico1", "canopy", mat4(b, [1.55 - (i > 4 ? 0.4 : 0), 1.25 - (i > 4 ? 0.3 : 0), 1.5], [j(0.3), turn + i, j(0.3)])));
      for (let i = 0; i < 16; i++) {
        const a = turn + i * 2.4;
        const y = 2.1 + (i % 4) * 0.35;
        const r = 1.05 - Math.abs(y - 2.7) * 0.35;
        add("sphere", fruit, mat4([Math.cos(a) * r, y, Math.sin(a) * r], fruit === "pear" ? [0.13, 0.17, 0.13] : [0.14, 0.14, 0.14]));
      }
      break;
    }
  }
  return Object.values(parts);
}

/** Fruits on existing trees and every part of bed plants appear with the `planted` layer. */
const isGrowingPart = (model: PlantModel, mat: MatKey) => !model.endsWith("-tree") || ["apple", "pear", "plum"].includes(String(mat));

function InstancedPart({ part, positions, onPointer }: { part: Part; positions: Vec3[]; onPointer?: Record<string, unknown> }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const materials = useGardenMaterials();
  const count = positions.length * part.matrices.length;
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const offset = new THREE.Matrix4();
    let i = 0;
    for (const p of positions) {
      offset.makeTranslation(p[0], p[1], p[2]);
      for (const m of part.matrices) mesh.setMatrixAt(i++, new THREE.Matrix4().multiplyMatrices(offset, m));
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    mesh.computeBoundingBox();
  }, [part, positions]);
  return <instancedMesh ref={ref} args={[GEOMETRY[part.geo], materials[part.mat] as THREE.Material, count]} castShadow receiveShadow {...onPointer} />;
}

/** All individual plants of one GardenPlant record (a bed, or a single tree). Clicking any of them selects the record. */
export function PlantGroup({ plant, index }: { plant: GardenPlant; index: number }) {
  const layers = useLayers();
  const { stage, hover, onSelect, onHover } = useSceneState();
  const growRef = useRef<THREE.Group>(null);
  const staticRef = useRef<THREE.Group>(null);
  const isTree = plant.model.endsWith("-tree");
  const me = { type: "plant" as const, id: plant.id };
  const hovered = sameSelection(hover, me);
  useCursor(hovered);

  const { positions, growing, fixed } = useMemo(() => {
    const positions = plantLayout(plant);
    // one variant per bed (seeded) keeps instancing simple and the scene deterministic
    const parts = speciesParts(plant.model, mulberry32(hashString(plant.id)));
    return {
      positions,
      growing: parts.filter((p) => isGrowingPart(plant.model, p.mat)),
      fixed: parts.filter((p) => !isGrowingPart(plant.model, p.mat)),
    };
  }, [plant]);

  useFrame(() => {
    const { planted } = layers.current;
    const g = isTree ? window01(planted, 0.5, 1) : window01(planted, 0.25 + index * 0.08, 0.6 + index * 0.08);
    if (growRef.current) {
      growRef.current.visible = g > 0.001;
      // grow from the soil: height leads, width follows
      growRef.current.scale.set(Math.max(0.001, g ** 0.7), Math.max(0.001, g), Math.max(0.001, g ** 0.7));
    }
  });

  const interactive = stage !== "planning";
  const pointer = interactive
    ? {
        onClick: (e: ThreeEvent<MouseEvent>) => {
          if (e.delta > 5) return;
          e.stopPropagation();
          onSelect(me);
        },
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(me);
        },
        onPointerOut: () => onHover(null),
      }
    : undefined;

  // Scale around the bed's soil surface so plants grow out of it.
  const origin = plant.position;
  const local = useMemo(() => positions.map((p) => [p[0] - origin[0], p[1] - origin[1], p[2] - origin[2]] as Vec3), [positions, origin]);

  return (
    <group position={origin} name={`plant-${plant.id}`}>
      <group ref={staticRef}>
        {fixed.map((part, i) => (
          <InstancedPart key={i} part={part} positions={local} onPointer={pointer} />
        ))}
      </group>
      <group ref={growRef}>
        {growing.map((part, i) => (
          <InstancedPart key={i} part={part} positions={local} onPointer={pointer} />
        ))}
      </group>
    </group>
  );
}

export function TreeSelectionRing({ plant }: { plant: GardenPlant }) {
  const m = useGardenMaterials();
  const { selection, hover } = useSceneState();
  const me = { type: "plant" as const, id: plant.id };
  const on = sameSelection(selection, me) || sameSelection(hover, me);
  if (!on) return null;
  return <mesh geometry={GEOMETRY.ring} material={sameSelection(selection, me) ? m.highlight : m.hover} position={[plant.position[0], 0.03, plant.position[2]]} scale={[1.7, 1, 1.7]} renderOrder={3} />;
}
