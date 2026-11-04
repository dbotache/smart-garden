"use client";

import { useCallback, useMemo, useState } from "react";
import type { GardenSelection, GardenStage, IrrigationMode, WeatherScenarioId } from "../types";
import { parseStage } from "../utils/stages";
import { selectionForStage } from "../utils/selection";
import { compareModes, planIrrigation } from "../utils/irrigationLogic";
import { WEATHER_SCENARIOS } from "../data/irrigation";
import { useIrrigationDemo } from "./useIrrigationDemo";

export type GardenControllerOptions = {
  initialStage?: GardenStage;
  currentStage?: GardenStage;
  onStageChange?: (stage: GardenStage) => void;
};

/**
 * State of one garden experience.
 * Stage supports controlled (`currentStage` + `onStageChange`) and uncontrolled (`initialStage`) use, like a React input.
 */
export function useGardenController({ initialStage, currentStage, onStageChange }: GardenControllerOptions) {
  const [internalStage, setInternalStage] = useState<GardenStage>(() => parseStage(initialStage));
  const controlled = currentStage !== undefined;
  const stage = controlled ? parseStage(currentStage) : internalStage;

  const [rawSelection, setRawSelection] = useState<GardenSelection>(null);
  const [hover, setHover] = useState<GardenSelection>(null);
  const [weatherId, setWeatherIdState] = useState<WeatherScenarioId>("dry-spell");
  const [mode, setModeState] = useState<IrrigationMode>("adaptive");
  const demo = useIrrigationDemo();

  const setStage = useCallback(
    (next: GardenStage) => {
      if (next === stage) return;
      if (!controlled) setInternalStage(next);
      onStageChange?.(next);
    },
    [controlled, onStageChange, stage],
  );

  const selection = useMemo(() => selectionForStage(rawSelection, stage), [rawSelection, stage]);
  const weather = WEATHER_SCENARIOS[weatherId];
  const plan = useMemo(() => planIrrigation(mode, weather), [mode, weather]);
  const comparison = useMemo(() => compareModes(weather), [weather]);

  const { reset: resetDemo, run: runDemo } = demo;
  const setWeatherId = useCallback((id: WeatherScenarioId) => (resetDemo(), setWeatherIdState(id)), [resetDemo]);
  const setMode = useCallback((m: IrrigationMode) => (resetDemo(), setModeState(m)), [resetDemo]);
  const runIrrigation = useCallback(() => runDemo(plan.decisions.filter((d) => d.action === "water").map((d) => d.zoneId)), [plan, runDemo]);

  return {
    stage,
    setStage,
    controlled,
    selection,
    select: setRawSelection,
    hover,
    setHover,
    weatherId,
    weather,
    setWeatherId,
    mode,
    setMode,
    plan,
    comparison,
    demo,
    runIrrigation,
  };
}

export type GardenController = ReturnType<typeof useGardenController>;
