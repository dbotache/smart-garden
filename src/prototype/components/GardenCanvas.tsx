"use client";

import { useRef, type MutableRefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { CAMERA_HOME } from "../data/site";
import { EMPTY_LAYERS, layerTargets, type LayerProgress } from "../utils/stages";
import { LayersContext, SceneStateContext, type SceneState } from "./sceneContext";
import { GardenMaterialsProvider } from "./materials";
import { StageController } from "./StageController";
import { CameraController, type CameraApi, type ViewInset } from "./CameraController";
import { Terrain } from "./Terrain";
import { House } from "./House";
import { PlanningLayer } from "./PlanningLayer";
import { GardenBeds } from "./GardenBeds";
import { Sensors } from "./Sensor";
import { IrrigationSystem } from "./IrrigationSystem";
import { SceneLabels } from "./SceneLabels";

const PAPER = "#f3f2ec";

export type GardenCanvasProps = {
  scene: SceneState;
  /** When false the render loop stops entirely (e.g. slide not visible) while the WebGL context and state stay alive. */
  active: boolean;
  cameraApiRef: MutableRefObject<CameraApi | null>;
  onSettledChange?: (settled: boolean) => void;
  /** Play the architectural build-in (plan lines → extruded walls) on first mount. */
  intro: boolean;
  ariaLabel: string;
  /** Pixels of the canvas covered by overlays (side panel / bottom sheet). */
  inset: ViewInset;
  /** Keep the last frame in the drawing buffer so it can be copied (PDF export). */
  printable?: boolean;
};

/**
 * The WebGL scene. The same scene graph is used in every stage: stages only change layer targets.
 * Loaded client-side only (see GardenScene.tsx) — three.js must not run during SSR.
 */
export default function GardenCanvas({ scene, active, cameraApiRef, onSettledChange, intro, ariaLabel, inset, printable = false }: GardenCanvasProps) {
  const layers = useRef<LayerProgress>(intro ? { ...EMPTY_LAYERS } : layerTargets(scene.stage));
  const busy = useRef({ camera: false });

  return (
    <Canvas
      frameloop={active ? "demand" : "never"}
      shadows="percentage"
      flat
      dpr={[1, 2]}
      camera={{ position: CAMERA_HOME.position, fov: CAMERA_HOME.fov, near: 0.5, far: 220 }}
      gl={{ antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: printable }}
      aria-label={ariaLabel}
      role="img"
      data-testid="garden-canvas"
      style={{ position: "absolute", inset: 0 }}
    >
      <LayersContext.Provider value={layers}>
        <SceneStateContext.Provider value={scene}>
          <GardenMaterialsProvider>
            <StageController stage={scene.stage} busyRef={busy} onSettledChange={onSettledChange} />
            <CameraController stage={scene.stage} apiRef={cameraApiRef} busyRef={busy} inset={inset} />

            <color attach="background" args={[PAPER]} />
            <fog attach="fog" args={[PAPER, 60, 120]} />
            <hemisphereLight args={["#ffffff", "#d8d4c6", 1.15]} />
            <directionalLight
              position={[14, 24, 11]}
              intensity={1.7}
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-19}
              shadow-camera-right={19}
              shadow-camera-top={16}
              shadow-camera-bottom={-16}
              shadow-camera-near={1}
              shadow-camera-far={80}
              shadow-bias={-0.0005}
              shadow-normalBias={0.03}
            />

            <Terrain />
            <House />
            <PlanningLayer />
            <GardenBeds />
            <Sensors />
            <IrrigationSystem />
            <SceneLabels />
          </GardenMaterialsProvider>
        </SceneStateContext.Provider>
      </LayersContext.Provider>
    </Canvas>
  );
}
