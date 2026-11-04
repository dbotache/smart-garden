"use client";

import { createContext, useContext, type MutableRefObject } from "react";
import type { GardenSelection, GardenStage, IrrigationDecision, Locale } from "../types";
import type { LayerProgress } from "../utils/stages";
import type { Messages } from "../data/i18n";

/** Animated layer progress lives in a ref: it changes every frame and must not trigger React renders. */
export const LayersContext = createContext<MutableRefObject<LayerProgress> | null>(null);

export function useLayers(): MutableRefObject<LayerProgress> {
  const ctx = useContext(LayersContext);
  if (!ctx) throw new Error("useLayers must be used inside the garden canvas");
  return ctx;
}

/** Irrigation demo progress, also frame-rate data → ref. */
export type DemoState = { running: boolean; progress: number; activeZoneIds: string[] };

export type SceneState = {
  stage: GardenStage;
  selection: GardenSelection;
  hover: GardenSelection;
  locale: Locale;
  messages: Messages;
  decisions: IrrigationDecision[];
  demoStatus: "idle" | "running" | "done";
  demoRef: MutableRefObject<DemoState>;
  onSelect: (s: GardenSelection) => void;
  onHover: (s: GardenSelection) => void;
};

export const SceneStateContext = createContext<SceneState | null>(null);

export function useSceneState(): SceneState {
  const ctx = useContext(SceneStateContext);
  if (!ctx) throw new Error("useSceneState must be used inside the garden canvas");
  return ctx;
}

export const sameSelection = (a: GardenSelection, b: GardenSelection) => a?.type === b?.type && a?.id === b?.id;
