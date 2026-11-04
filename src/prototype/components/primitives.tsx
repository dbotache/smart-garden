"use client";

import { forwardRef, useMemo } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";
import type { Rect } from "../types";

/**
 * Geometry cache shared by every component (module-level: geometries are immutable and tiny).
 * The unit box has its base at y = 0 so scaling y "extrudes" walls from the ground plan.
 */
export const GEOMETRY = {
  box: new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
  boxEdges: new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0)),
  plane: new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
  cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 10).translate(0, 0.5, 0),
  cone: new THREE.ConeGeometry(0.5, 1, 7).translate(0, 0.5, 0),
  ico: new THREE.IcosahedronGeometry(0.5, 0),
  ico1: new THREE.IcosahedronGeometry(0.5, 1),
  sphere: new THREE.SphereGeometry(0.5, 10, 8),
  ring: new THREE.RingGeometry(0.86, 1, 40).rotateX(-Math.PI / 2),
};

type BlockProps = {
  bounds: Rect;
  height: number;
  baseY?: number;
  material: THREE.Material;
  edgeMaterial?: THREE.LineBasicMaterial;
  castShadow?: boolean;
  receiveShadow?: boolean;
} & Omit<ThreeElements["group"], "position" | "scale" | "ref">;

/** Axis-aligned box (mesh + architectural edge lines) defined by its ground rectangle. */
export const Block = forwardRef<THREE.Group, BlockProps>(function Block(
  { bounds, height, baseY = 0, material, edgeMaterial, castShadow = true, receiveShadow = true, ...rest },
  ref,
) {
  const sx = bounds.maxX - bounds.minX;
  const sz = bounds.maxZ - bounds.minZ;
  return (
    <group ref={ref} position={[(bounds.minX + bounds.maxX) / 2, baseY, (bounds.minZ + bounds.maxZ) / 2]} {...rest}>
      <group scale={[sx, height, sz]}>
        <mesh geometry={GEOMETRY.box} material={material} castShadow={castShadow} receiveShadow={receiveShadow} />
        {edgeMaterial && <lineSegments geometry={GEOMETRY.boxEdges} material={edgeMaterial} />}
      </group>
    </group>
  );
});

/** Rectangle outline built from four thin boxes (WebGL lines are 1 px; frames need visible width). */
export function RectFrame({ bounds, y, width = 0.06, material }: { bounds: Rect; y: number; width?: number; material: THREE.Material }) {
  const pieces = useMemo(() => {
    const { minX, maxX, minZ, maxZ } = bounds;
    const w = width;
    return [
      { p: [(minX + maxX) / 2, y, minZ - w / 2], s: [maxX - minX + 2 * w, 0.02, w] },
      { p: [(minX + maxX) / 2, y, maxZ + w / 2], s: [maxX - minX + 2 * w, 0.02, w] },
      { p: [minX - w / 2, y, (minZ + maxZ) / 2], s: [w, 0.02, maxZ - minZ] },
      { p: [maxX + w / 2, y, (minZ + maxZ) / 2], s: [w, 0.02, maxZ - minZ] },
    ] as { p: [number, number, number]; s: [number, number, number] }[];
  }, [bounds, y, width]);
  return (
    <group>
      {pieces.map((piece, i) => (
        <mesh key={i} geometry={GEOMETRY.box} material={material} position={piece.p} scale={piece.s} renderOrder={2} />
      ))}
    </group>
  );
}

/** Build a LineSegments geometry from [x1,y1,z1,x2,y2,z2] tuples. */
export function segmentsGeometry(segments: number[][]): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(segments.flat(), 3));
  return g;
}

export function rectSegments(r: Rect, y: number): number[][] {
  return [
    [r.minX, y, r.minZ, r.maxX, y, r.minZ],
    [r.maxX, y, r.minZ, r.maxX, y, r.maxZ],
    [r.maxX, y, r.maxZ, r.minX, y, r.maxZ],
    [r.minX, y, r.maxZ, r.minX, y, r.minZ],
  ];
}
