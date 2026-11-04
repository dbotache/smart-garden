"use client";

import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import * as THREE from "three";
import { SENSOR_DEVICES } from "../data/sensors";
import type { SensorDevice } from "../types";
import { useGardenMaterials } from "./materials";
import { sameSelection, useLayers, useSceneState } from "./sceneContext";
import { GEOMETRY } from "./primitives";
import { window01 } from "../utils/stages";

/** Invisible, generous hit volume so small devices are easy to click. Raycasting ignores `material.visible`. */
const HIT_MATERIAL = new THREE.MeshBasicMaterial({ visible: false });

function useDeviceInteraction(device: SensorDevice) {
  const { stage, selection, hover, onSelect, onHover } = useSceneState();
  const me = { type: "sensor" as const, id: device.id };
  const interactive = stage === "monitoring" || stage === "irrigation";
  const hovered = sameSelection(hover, me);
  useCursor(hovered && interactive);
  const handlers = interactive
    ? {
        onClick: (e: ThreeEvent<MouseEvent>) => {
          if (e.delta > 5) return;
          e.stopPropagation();
          onSelect(me);
        },
        onPointerOver: (e: ThreeEvent<PointerEvent>) => (e.stopPropagation(), onHover(me)),
        onPointerOut: () => onHover(null),
      }
    : {};
  return { handlers, selected: sameSelection(selection, me), hovered };
}

function SoilProbe({ device, index }: { device: SensorDevice; index: number }) {
  const m = useGardenMaterials();
  const layers = useLayers();
  const ref = useRef<THREE.Group>(null);
  const { handlers, selected, hovered } = useDeviceInteraction(device);
  useFrame(() => {
    const g = window01(layers.current.sensors, index * 0.07, 0.45 + index * 0.07);
    if (ref.current) {
      ref.current.visible = g > 0.001;
      ref.current.scale.setScalar(Math.max(0.001, g));
    }
  });
  return (
    <group ref={ref} position={device.position} name={device.id}>
      <mesh geometry={GEOMETRY.cylinder} material={m.metal} scale={[0.03, 0.42, 0.03]} castShadow />
      <mesh geometry={GEOMETRY.box} material={m.sensorBody} position={[0, 0.42, 0]} scale={[0.12, 0.15, 0.08]} castShadow />
      <mesh geometry={GEOMETRY.box} material={m.sensorCap} position={[0, 0.57, 0]} scale={[0.13, 0.035, 0.09]} castShadow />
      <mesh geometry={GEOMETRY.sphere} material={m.led} position={[0, 0.51, 0.042]} scale={0.026} />
      {(selected || hovered) && <mesh geometry={GEOMETRY.ring} material={selected ? m.highlight : m.hover} position={[0, 0.012, 0]} scale={0.32} renderOrder={3} />}
      <mesh geometry={GEOMETRY.box} material={HIT_MATERIAL} position={[0, 0.1, 0]} scale={[0.4, 0.75, 0.4]} {...handlers} />
    </group>
  );
}

function WeatherStation({ device }: { device: SensorDevice }) {
  const m = useGardenMaterials();
  const layers = useLayers();
  const ref = useRef<THREE.Group>(null);
  const cups = useRef<THREE.Group>(null);
  const { handlers, selected, hovered } = useDeviceInteraction(device);
  const arms = useMemo(() => [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3], []);
  useFrame((_, dt) => {
    const g = window01(layers.current.sensors, 0.3, 0.9);
    if (ref.current) {
      ref.current.visible = g > 0.001;
      ref.current.scale.setScalar(Math.max(0.001, g));
    }
    if (cups.current && g > 0.99) cups.current.rotation.y += Math.min(dt, 0.05) * 0.8;
  });
  return (
    <group ref={ref} position={device.position} name={device.id}>
      <mesh geometry={GEOMETRY.cylinder} material={m.metal} scale={[0.07, 2.3, 0.07]} castShadow />
      <mesh geometry={GEOMETRY.box} material={m.sensorBody} position={[0, 1.25, 0.06]} scale={[0.26, 0.34, 0.14]} castShadow />
      <mesh geometry={GEOMETRY.box} material={m.sensorCap} position={[0, 1.6, 0.06]} scale={[0.28, 0.04, 0.16]} />
      <mesh geometry={GEOMETRY.box} material={m.solar} position={[0, 1.95, 0.25]} scale={[0.5, 0.03, 0.34]} rotation={[0.6, 0, 0]} castShadow />
      <mesh geometry={GEOMETRY.box} material={m.metal} position={[0, 2.12, 0]} scale={[0.9, 0.035, 0.035]} />
      <mesh geometry={GEOMETRY.cylinder} material={m.sensorBody} position={[0.42, 2.15, 0]} scale={[0.14, 0.2, 0.14]} />
      <group ref={cups} position={[-0.42, 2.3, 0]}>
        <mesh geometry={GEOMETRY.cylinder} material={m.metal} scale={[0.02, 0.12, 0.02]} />
        {arms.map((a) => (
          <mesh key={a} geometry={GEOMETRY.sphere} material={m.sensorBody} position={[Math.cos(a) * 0.14, 0.12, Math.sin(a) * 0.14]} scale={0.07} />
        ))}
      </group>
      {(selected || hovered) && <mesh geometry={GEOMETRY.ring} material={selected ? m.highlight : m.hover} position={[0, 0.02, 0]} scale={0.55} renderOrder={3} />}
      <mesh geometry={GEOMETRY.box} material={HIT_MATERIAL} position={[0, 0, 0]} scale={[0.9, 2.5, 0.9]} {...handlers} />
    </group>
  );
}

export function Sensors() {
  return (
    <group>
      {SENSOR_DEVICES.map((d, i) => (d.kind === "soil-probe" ? <SoilProbe key={d.id} device={d} index={i} /> : <WeatherStation key={d.id} device={d} />))}
    </group>
  );
}
