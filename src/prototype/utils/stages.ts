import { GARDEN_STAGES, type GardenStage } from "../types";

export function isGardenStage(value: unknown): value is GardenStage {
  return typeof value === "string" && (GARDEN_STAGES as readonly string[]).includes(value);
}

export function parseStage(value: unknown, fallback: GardenStage = "planning"): GardenStage {
  return isGardenStage(value) ? value : fallback;
}

export const stageIndex = (s: GardenStage) => GARDEN_STAGES.indexOf(s);

export function stepStage(current: GardenStage, delta: number): GardenStage {
  const i = Math.min(GARDEN_STAGES.length - 1, Math.max(0, stageIndex(current) + delta));
  return GARDEN_STAGES[i]!;
}

/**
 * Visual layers of the single, continuously evolving garden model.
 * Each layer is 0..1; stages only change the targets, never rebuild the scene.
 */
export type LayerProgress = {
  /** construction lines drawing in (plan → extruded walls) */
  build: number;
  /** line drawing → materials and colour */
  materialize: number;
  /** beds filled and plants grown */
  planted: number;
  /** sensors installed */
  sensors: number;
  /** irrigation hardware visible */
  irrigation: number;
};

export const LAYER_ORDER: (keyof LayerProgress)[] = ["build", "materialize", "planted", "sensors", "irrigation"];

export const EMPTY_LAYERS: LayerProgress = { build: 0, materialize: 0, planted: 0, sensors: 0, irrigation: 0 };

export function layerTargets(stage: GardenStage): LayerProgress {
  const i = stageIndex(stage);
  return {
    build: 1,
    materialize: i >= 1 ? 1 : 0,
    planted: i >= 1 ? 1 : 0,
    sensors: i >= 2 ? 1 : 0,
    irrigation: i >= 3 ? 1 : 0,
  };
}

/**
 * Advance layers towards their targets. Layers cascade: a layer may only grow once the layer before it
 * is mostly complete, and may only shrink once the layer after it is mostly gone — so growth and
 * removal read as a controlled sequence instead of everything popping at once.
 */
export function stepLayers(current: LayerProgress, target: LayerProgress, dtSeconds: number, speed = 1.1): LayerProgress {
  const next = { ...current };
  const step = Math.max(0, dtSeconds) * speed;
  LAYER_ORDER.forEach((key, i) => {
    const goal = target[key];
    const value = current[key];
    if (goal > value) {
      const prev = LAYER_ORDER[i - 1];
      if (prev && current[prev] < 0.75 && target[prev] >= goal) return;
      next[key] = Math.min(goal, value + step);
    } else if (goal < value) {
      const after = LAYER_ORDER[i + 1];
      if (after && current[after] > 0.25) return;
      next[key] = Math.max(goal, value - step * 1.4);
    }
  });
  return next;
}

export function layersSettled(current: LayerProgress, target: LayerProgress, epsilon = 1e-3): boolean {
  return LAYER_ORDER.every((k) => Math.abs(current[k] - target[k]) < epsilon);
}

/** Smooth 0..1 easing used by the scene for scale/opacity animations. */
export const easeInOut = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

/** Re-map a 0..1 progress into a sub-window, e.g. stagger(p, 0.2, 0.6) is 0 until 0.2 and 1 after 0.6. */
export const window01 = (p: number, start: number, end: number) => easeInOut((p - start) / Math.max(1e-6, end - start));
