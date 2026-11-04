"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { RECOMMENDED_PLANTS, plantForZone } from "../data/plants";
import { CURRENT_SOIL_MOISTURE, CURRENT_WEATHER, SENSOR_DEVICES } from "../data/sensors";
import { BED_SIZE } from "../data/site";
import { formatNumber, localizePlant } from "../data/i18n";
import { moistureStatus } from "../utils/timeseries";
import type { IrrigationDecision, PlantModel, Vec3 } from "../types";
import type { ReactNode } from "react";
import { useSceneState, sameSelection } from "./sceneContext";

/** Approximate plant heights, used to float chips just above the foliage. */
const HEIGHT: Partial<Record<PlantModel, number>> = { tomato: 1.35, basil: 0.42, lavender: 0.55, lettuce: 0.25, kale: 0.78, rosemary: 0.68 };
const above = (p: Vec3, model: PlantModel, extra = 0.35): Vec3 => [p[0], BED_SIZE.height + (HEIGHT[model] ?? 0.5) + extra, p[2]];

const Z = [12, 0] as [number, number];

function Chip({ position, children, onClick, active, label, testId }: { position: Vec3; children: ReactNode; onClick: () => void; active: boolean; label: string; testId: string }) {
  return (
    <Html position={position} center zIndexRange={Z}>
      <button type="button" className={`garden-chip${active ? " garden-chip--active" : ""}`} onClick={(e) => (e.stopPropagation(), onClick())} aria-label={label} data-testid={testId}>
        {children}
      </button>
    </Html>
  );
}

/**
 * Decision chip whose moisture value animates during the irrigation demo.
 * drei <Html> children live in a separate React root (no R3F/scene context there), so the frame loop runs
 * here, inside the canvas, and writes into the chip's DOM node through a ref — no React re-render per frame.
 */
function DecisionChip({ decision }: { decision: IrrigationDecision }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { demoRef, demoStatus, locale, messages, selection, onSelect } = useSceneState();
  const plant = RECOMMENDED_PLANTS.find((p) => p.id === decision.plantId)!;
  const value = (p: number) => `${formatNumber(decision.moistureBefore + (decision.moistureAfter - decision.moistureBefore) * p, locale)} %`;
  useFrame(() => {
    if (!ref.current || demoStatus !== "running") return;
    ref.current.textContent = value(demoRef.current.progress);
  });
  const name = localizePlant(plant, locale).commonName;
  return (
    <Chip position={above(plant.position, plant.model, 0.3)} onClick={() => onSelect({ type: "plant", id: plant.id })} active={sameSelection(selection, { type: "plant", id: plant.id })} label={`${name}: ${messages.irrigation.actions[decision.action]}`} testId={`chip-decision-${plant.id}`}>
      <span className={`garden-chip__dot garden-chip__dot--${decision.action}`} aria-hidden />
      {/* only beds that get water spell out the action; the rest stay compact to avoid overlapping chips */}
      {decision.action !== "skip" && <span className="garden-chip__name">{messages.irrigation.actions[decision.action]}</span>}
      {/* React never owns this text node; it is written by the callback ref (static states) and useFrame (running). */}
      <span
        className="garden-chip__value"
        data-testid={`moisture-${plant.id}`}
        ref={(el) => {
          ref.current = el;
          if (el && demoStatus !== "running") el.textContent = value(demoStatus === "done" ? 1 : 0);
        }}
      />
    </Chip>
  );
}

export function SceneLabels() {
  const { stage, selection, onSelect, locale, messages, decisions } = useSceneState();


  if (stage === "planting") {
    return (
      <group>
        {RECOMMENDED_PLANTS.map((p) => {
          const lp = localizePlant(p, locale);
          return (
            <Chip key={p.id} position={above(p.position, p.model)} onClick={() => onSelect({ type: "plant", id: p.id })} active={sameSelection(selection, { type: "plant", id: p.id })} label={`${lp.commonName}, ${messages.planting.score} ${p.recommendationScore}`} testId={`chip-plant-${p.id}`}>
              <span className="garden-chip__dot garden-chip__dot--leaf" aria-hidden />
              <span className="garden-chip__name">{lp.commonName}</span>
              <span className="garden-chip__value">{p.recommendationScore}</span>
            </Chip>
          );
        })}
      </group>
    );
  }

  if (stage === "monitoring") {
    return (
      <group>
        {SENSOR_DEVICES.map((d) => {
          const active = sameSelection(selection, { type: "sensor", id: d.id });
          if (d.kind === "weather-station") {
            return (
              <Chip key={d.id} position={[d.position[0], 2.95, d.position[2]]} onClick={() => onSelect({ type: "sensor", id: d.id })} active={active} label={messages.monitoring.station} testId={`chip-sensor-${d.id}`}>
                <span className="garden-chip__icon" aria-hidden>☀</span>
                <span className="garden-chip__value">{formatNumber(CURRENT_WEATHER.airTemperatureC, locale, 1)} °C</span>
                <span className="garden-chip__muted">{CURRENT_WEATHER.relativeHumidity} %</span>
              </Chip>
            );
          }
          const plant = plantForZone(d.plantingZoneId!)!;
          const value = CURRENT_SOIL_MOISTURE[d.plantingZoneId!]!;
          const status = moistureStatus(value, plant.moistureTarget);
          return (
            <Chip key={d.id} position={above(plant.position, plant.model, 0.3)} onClick={() => onSelect({ type: "sensor", id: d.id })} active={active} label={`${messages.monitoring.probe} ${localizePlant(plant, locale).commonName}: ${value} %`} testId={`chip-sensor-${d.id}`}>
              <span className={`garden-chip__dot garden-chip__dot--${status}`} aria-hidden />
              <span className="garden-chip__value">{value} %</span>
            </Chip>
          );
        })}
      </group>
    );
  }

  if (stage === "irrigation") {
    return (
      <group>
        {decisions.map((d) => (
          <DecisionChip key={d.zoneId} decision={d} />
        ))}
      </group>
    );
  }

  return null;
}
