"use client";

import { useCallback, useEffect, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { GardenStage, Vec3 } from "../types";
import { CAMERA_HOME, STAGE_CAMERA } from "../data/site";
import { easeInOut } from "../utils/stages";

export type CameraApi = {
  zoomBy: (factor: number) => void;
  reset: () => void;
  project: (p: Vec3) => { x: number; y: number } | null;
  /** renderer statistics of the last frame (draw calls, triangles) — for diagnostics */
  stats: () => { calls: number; triangles: number; programs: number };
};

const LIMITS = { minDistance: 11, maxDistance: 64, minPolarAngle: 0.28, maxPolarAngle: 1.22 };
const HOME_DIR = new THREE.Vector3(...CAMERA_HOME.position).sub(new THREE.Vector3(...CAMERA_HOME.target)).normalize();

type Anim = { fromT: THREE.Vector3; toT: THREE.Vector3; fromD: number; toD: number; fromDir: THREE.Vector3; toDir: THREE.Vector3 | null; t: number; duration: number };

/**
 * One consistent perspective for every stage. Stage changes only glide the orbit target and distance;
 * the user's chosen viewing angle is kept (no abrupt jumps). Polar limits keep the camera above the
 * ground and outside the house (original camera clipping, audit #5).
 */
export type ViewInset = { right: number; bottom: number };

export function CameraController({ stage, apiRef, busyRef, inset }: { stage: GardenStage; apiRef: MutableRefObject<CameraApi | null>; busyRef: MutableRefObject<{ camera: boolean }>; inset: ViewInset }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const anim = useRef<Anim | null>(null);
  const initialised = useRef(false);

  const animateTo = useCallback(
    (toT: Vec3, toD: number, toDir: THREE.Vector3 | null = null, duration = 1.1) => {
      const c = controls.current;
      if (!c) return;
      const fromT = c.target.clone();
      anim.current = { fromT, toT: new THREE.Vector3(...toT), fromD: camera.position.distanceTo(fromT), toD: THREE.MathUtils.clamp(toD, LIMITS.minDistance, LIMITS.maxDistance), fromDir: camera.position.clone().sub(fromT).normalize(), toDir, t: 0, duration };
      busyRef.current.camera = true;
      invalidate();
    },
    [camera, invalidate, busyRef],
  );

  // Shift the projection centre into the area not covered by the side panel / bottom sheet, so the garden is
  // framed in the visible part of the canvas without moving the camera (keeps orbiting centred on the target).
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (!cam.isPerspectiveCamera || size.width === 0) return;
    cam.setViewOffset(size.width, size.height, inset.right / 2, inset.bottom / 2, size.width, size.height);
    cam.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, inset.right, inset.bottom, invalidate]);

  // initial placement (no animation), then glide on stage change
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const preset = STAGE_CAMERA[stage]!;
    if (!initialised.current) {
      initialised.current = true;
      c.target.set(...preset.target);
      camera.position.copy(c.target).addScaledVector(HOME_DIR, preset.distance);
      c.update();
      invalidate();
      return;
    }
    animateTo(preset.target, preset.distance);
  }, [stage, camera, animateTo, invalidate]);

  useEffect(() => {
    apiRef.current = {
      zoomBy: (f) => {
        const c = controls.current;
        if (!c) return;
        animateTo(c.target.toArray() as Vec3, camera.position.distanceTo(c.target) * f, null, 0.45);
      },
      reset: () => {
        const preset = STAGE_CAMERA[stage]!;
        animateTo(preset.target, preset.distance, HOME_DIR, 1.0);
      },
      project: (p) => {
        const v = new THREE.Vector3(...p).project(camera);
        if (v.z > 1) return null;
        const rect = gl.domElement.getBoundingClientRect();
        return { x: rect.left + ((v.x + 1) / 2) * rect.width, y: rect.top + ((1 - v.y) / 2) * rect.height };
      },
      stats: () => ({ calls: gl.info.render.calls, triangles: gl.info.render.triangles, programs: gl.info.programs?.length ?? 0 }),
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, animateTo, camera, gl, stage]);

  useFrame((_, delta) => {
    const a = anim.current;
    const c = controls.current;
    if (!a || !c) return;
    a.t = Math.min(1, a.t + Math.min(delta, 1 / 20) / a.duration);
    const e = easeInOut(a.t);
    c.target.lerpVectors(a.fromT, a.toT, e);
    const dir = a.toDir ? a.fromDir.clone().lerp(a.toDir, e).normalize() : camera.position.clone().sub(c.target).normalize();
    camera.position.copy(c.target).addScaledVector(dir, THREE.MathUtils.lerp(a.fromD, a.toD, e));
    c.update();
    invalidate();
    if (a.t >= 1) {
      anim.current = null;
      busyRef.current.camera = false;
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.09}
      rotateSpeed={0.55}
      zoomSpeed={0.7}
      {...LIMITS}
      onStart={() => {
        anim.current = null; // user takes over: cancel any glide
        busyRef.current.camera = false;
      }}
    />
  );
}
