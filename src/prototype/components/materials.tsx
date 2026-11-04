"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLayers } from "./sceneContext";
import { BRAND } from "../utils/palette";

/**
 * One shared set of materials per canvas (no per-mesh materials → few shader programs, easy disposal).
 * "Blend" materials interpolate from a paper-white sketch look (planning) to their final colour
 * as the `materialize` layer goes 0 → 1, so the single garden model evolves instead of being swapped.
 */

const SKETCH = "#fbfaf6";

type Blend = { material: THREE.MeshStandardMaterial | THREE.LineBasicMaterial; from: THREE.Color; to: THREE.Color; opacityFrom?: number; opacityTo?: number };

function standard(color: string, extra: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0, ...extra });
}

export function createGardenMaterials() {
  const blends: Blend[] = [];
  const blend = <M extends THREE.MeshStandardMaterial | THREE.LineBasicMaterial>(material: M, from: string, to: string, opacityFrom?: number, opacityTo?: number) => {
    blends.push({ material, from: new THREE.Color(from), to: new THREE.Color(to), opacityFrom, opacityTo });
    return material;
  };

  const m = {
    // terrain & architecture (blend from sketch to final)
    ground: standard("#f3f2ec"),
    lawn: blend(standard(SKETCH), "#f6f5ef", "#b4c39a"),
    gravel: blend(standard(SKETCH), "#f6f5ef", "#ddd5c4"),
    terrace: blend(standard(SKETCH), SKETCH, "#b8a07f"),
    path: blend(standard(SKETCH), "#f6f5ef", "#d3c9b4"),
    plaster: blend(standard(SKETCH), SKETCH, "#f1efe8"),
    plinth: blend(standard(SKETCH), "#f3f2ed", "#cbc7bd"),
    roof: blend(standard(SKETCH), SKETCH, "#e4e1d9"),
    frame: blend(standard(SKETCH), SKETCH, "#454b48"),
    glass: blend(standard(SKETCH, { transparent: true, roughness: 0.18, metalness: 0.15 }), SKETCH, "#6a7f86", 1, 0.88),
    bedWood: blend(standard(SKETCH), SKETCH, "#9a7856"),
    soil: blend(standard(SKETCH), "#f1efe8", "#5d4a3a"),
    hedge: blend(standard(SKETCH, { flatShading: true }), SKETCH, "#6c875c"),
    canopy: blend(standard(SKETCH, { flatShading: true }), SKETCH, "#7d9a66"),
    trunk: blend(standard(SKETCH), SKETCH, "#85705d"),

    // plants (appear by growing; no sketch phase)
    stake: standard("#b59c76"),
    tomatoLeaf: standard("#4e7d43", { flatShading: true }),
    tomatoFruit: standard("#c4523b", { roughness: 0.55 }),
    basil: standard("#5f9b4b", { flatShading: true }),
    lavenderLeaf: standard("#94a68b", { flatShading: true }),
    lavenderFlower: standard("#8577bd", { flatShading: true }),
    lettuce: standard("#9cc36b", { flatShading: true }),
    lettuceHeart: standard("#c7dd92", { flatShading: true }),
    kale: standard("#4d6e62", { flatShading: true }),
    rosemary: standard("#4b6a50", { flatShading: true }),
    apple: standard("#bf4638", { roughness: 0.5 }),
    pear: standard("#c8b24a", { roughness: 0.5 }),
    plum: standard("#5a4979", { roughness: 0.5 }),

    // devices
    sensorBody: standard("#f4f4f0", { roughness: 0.6 }),
    sensorCap: standard(BRAND.green700, { roughness: 0.5 }),
    led: new THREE.MeshBasicMaterial({ color: BRAND.green400 }),
    metal: standard("#9aa4a6", { roughness: 0.4, metalness: 0.5 }),
    solar: standard("#2c3e50", { roughness: 0.3, metalness: 0.3 }),

    // irrigation
    pipe: standard("#37434a", { roughness: 0.7 }),
    valve: standard("#56656e", { roughness: 0.5 }),
    valveOpen: standard("#3b8fc6", { roughness: 0.4, emissive: new THREE.Color("#174a6b") }),
    droplet: new THREE.MeshBasicMaterial({ color: "#5aa9dc", transparent: true, opacity: 0.85 }),
    flow: new THREE.MeshBasicMaterial({ color: "#56aee6", transparent: true, depthWrite: false, opacity: 0.95 }),

    // interaction
    highlight: new THREE.MeshBasicMaterial({ color: BRAND.green400, transparent: true, opacity: 0.95, depthWrite: false }),
    hover: new THREE.MeshBasicMaterial({ color: BRAND.green200, transparent: true, opacity: 0.9, depthWrite: false }),
    zoneFill: new THREE.MeshBasicMaterial({ color: BRAND.green400, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }),

    // lines
    edges: blend(new THREE.LineBasicMaterial({ color: "#36403b", transparent: true }), "#36403b", "#6d776f", 0.95, 0.3),
    planLine: new THREE.LineBasicMaterial({ color: "#37423c", transparent: true, opacity: 0.9 }),
    construction: new THREE.LineBasicMaterial({ color: "#7f8b84", transparent: true, opacity: 0.55 }),
    dimension: new THREE.LineBasicMaterial({ color: "#56665d", transparent: true, opacity: 0.9 }),
    zoneOutline: new THREE.LineDashedMaterial({ color: BRAND.green700, dashSize: 0.22, gapSize: 0.14, transparent: true, opacity: 0.95 }),
    grid: new THREE.LineBasicMaterial({ color: "#c9d0c8", transparent: true, opacity: 0.6 }),
  };

  const flowTexture = createFlowTexture();
  m.flow.map = flowTexture;
  m.flow.alphaMap = flowTexture;

  return { ...m, blends, flowTexture };
}

/** Stripe texture scrolled along pipes to show water flowing. Generated on the client, no asset needed. */
function createFlowTexture() {
  const size = 64;
  const data = new Uint8Array(size * 4 * 4);
  for (let x = 0; x < size; x++) {
    const v = Math.round(255 * Math.max(0, Math.sin((x / size) * Math.PI * 2)) ** 2);
    for (let y = 0; y < 4; y++) {
      const i = (y * size + x) * 4;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, 4);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

export type GardenMaterials = ReturnType<typeof createGardenMaterials>;

const MaterialsContext = createContext<GardenMaterials | null>(null);

export function GardenMaterialsProvider({ children }: { children: ReactNode }) {
  const materials = useMemo(() => createGardenMaterials(), []);
  const layers = useLayers();

  useFrame(() => {
    const t = layers.current.materialize;
    for (const b of materials.blends) {
      b.material.color.lerpColors(b.from, b.to, t);
      if (b.opacityFrom !== undefined && b.opacityTo !== undefined) b.material.opacity = b.opacityFrom + (b.opacityTo - b.opacityFrom) * t;
    }
  });

  useEffect(
    () => () => {
      for (const value of Object.values(materials)) if (value instanceof THREE.Material) value.dispose();
      materials.flowTexture.dispose();
    },
    [materials],
  );

  return <MaterialsContext.Provider value={materials}>{children}</MaterialsContext.Provider>;
}

export function useGardenMaterials(): GardenMaterials {
  const ctx = useContext(MaterialsContext);
  if (!ctx) throw new Error("useGardenMaterials must be used inside <GardenMaterialsProvider>");
  return ctx;
}
