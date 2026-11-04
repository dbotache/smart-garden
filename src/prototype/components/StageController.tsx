"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { GardenStage } from "../types";
import { layerTargets, layersSettled, stepLayers } from "../utils/stages";
import { useLayers, useSceneState } from "./sceneContext";

/**
 * Drives the layer progress of the single garden model towards the current stage.
 * Runs first in the frame. In on-demand rendering it requests frames only while something moves,
 * so an idle garden costs no GPU time (fixes the original's permanent animation loop, audit #12).
 */
export function StageController({ stage, busyRef, onSettledChange }: { stage: GardenStage; busyRef: MutableRefObject<{ camera: boolean }>; onSettledChange?: (settled: boolean) => void }) {
  const layers = useLayers();
  const { demoRef } = useSceneState();
  const invalidate = useThree((s) => s.invalidate);
  const target = useMemo(() => layerTargets(stage), [stage]);
  const lastSettled = useRef<boolean | null>(null);

  useEffect(() => {
    invalidate();
  }, [target, invalidate]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20); // after idle periods the first delta can be huge
    layers.current = stepLayers(layers.current, target, dt);
    const settled = layersSettled(layers.current, target) && !busyRef.current.camera && !demoRef.current.running;
    if (!settled) invalidate();
    if (settled !== lastSettled.current) {
      lastSettled.current = settled;
      onSettledChange?.(settled);
    }
  });
  return null;
}
