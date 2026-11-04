"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MANIFOLD } from "../data/site";
import { buildRoutes } from "../utils/irrigationRoutes";
import { window01 } from "../utils/stages";
import { useGardenMaterials } from "./materials";
import { useLayers, useSceneState } from "./sceneContext";
import { GEOMETRY } from "./primitives";
import type { Vec3 } from "../types";

const PIPE_R = 0.028;
const DRIP_R = 0.016;

function tube(points: Vec3[], radius: number) {
  const path = new THREE.CurvePath<THREE.Vector3>();
  for (let i = 1; i < points.length; i++) path.add(new THREE.LineCurve3(new THREE.Vector3(...points[i - 1]!), new THREE.Vector3(...points[i]!)));
  const length = path.getLength();
  const g = new THREE.TubeGeometry(path as unknown as THREE.Curve<THREE.Vector3>, Math.max(8, Math.ceil(length * 6)), radius, 6, false);
  // scale u by length so the flow texture has the same stripe spacing on every pipe
  const uv = g.getAttribute("uv") as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * (length / 0.45));
  return g;
}

type PipeSet = { pipe: THREE.TubeGeometry[]; flow: THREE.TubeGeometry[] };
function pipeSet(polylines: Vec3[][], radius: number): PipeSet {
  return { pipe: polylines.map((p) => tube(p, radius)), flow: polylines.map((p) => tube(p, radius * 1.45)) };
}

function GrowingTube({ geometry, material, progress }: { geometry: THREE.BufferGeometry; material: THREE.Material; progress: () => number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const p = progress();
    if (!ref.current) return;
    ref.current.visible = p > 0.001;
    const n = geometry.index?.count ?? 0;
    geometry.setDrawRange(0, Math.floor((p * n) / 6) * 6);
  });
  return <mesh ref={ref} geometry={geometry} material={material} castShadow />;
}

export function IrrigationSystem() {
  const m = useGardenMaterials();
  const layers = useLayers();
  const { decisions, demoStatus, demoRef } = useSceneState();
  const invalidate = useThree((s) => s.invalidate);
  const manifold = useRef<THREE.Group>(null);

  const geo = useMemo(() => {
    const { supply, routes } = buildRoutes();
    return {
      routes,
      supply: pipeSet([supply], PIPE_R),
      zones: routes.map((r) => ({ lateral: pipeSet([r.lateral, r.header], PIPE_R), drips: pipeSet(r.drips, DRIP_R) })),
      emitters: routes.flatMap((r) => r.emitters.map((p) => ({ zoneId: r.zoneId, p }))),
    };
  }, []);
  useEffect(
    () => () => {
      const all = [geo.supply, ...geo.zones.flatMap((z) => [z.lateral, z.drips])];
      all.forEach((s) => [...s.pipe, ...s.flow].forEach((g) => g.dispose()));
    },
    [geo],
  );

  const activeZones = useMemo(
    () => new Set(demoStatus === "running" ? decisions.filter((d) => d.action === "water").map((d) => d.zoneId) : []),
    [decisions, demoStatus],
  );

  // emitters: one InstancedMesh for the whole garden
  const emitterRef = useRef<THREE.InstancedMesh>(null);
  const dropletRef = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = emitterRef.current;
    if (!mesh) return;
    const mat = new THREE.Matrix4();
    geo.emitters.forEach((e, i) => mesh.setMatrixAt(i, mat.compose(new THREE.Vector3(...e.p), new THREE.Quaternion(), new THREE.Vector3(0.05, 0.035, 0.05))));
    mesh.instanceMatrix.needsUpdate = true;
  }, [geo]);

  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), s: new THREE.Vector3() }), []);
  useFrame((state, dt) => {
    const irrigation = layers.current.irrigation;
    if (manifold.current) {
      const g = window01(irrigation, 0, 0.25);
      manifold.current.visible = g > 0.001;
      manifold.current.scale.setScalar(Math.max(0.001, g));
    }
    if (emitterRef.current) emitterRef.current.visible = irrigation > 0.85;

    const running = demoRef.current.running && activeZones.size > 0;
    if (running) {
      m.flowTexture.offset.x -= Math.min(dt, 0.05) * 2.2;
      invalidate();
    }
    const drops = dropletRef.current;
    if (drops) {
      drops.visible = running;
      if (running) {
        const t = state.clock.elapsedTime;
        geo.emitters.forEach((e, i) => {
          const on = activeZones.has(e.zoneId);
          const phase = (t * 1.6 + i * 0.37) % 1;
          tmp.p.set(e.p[0], e.p[1] + 0.02 - phase * 0.03, e.p[2]);
          tmp.s.setScalar(on ? 0.05 * (1 - phase * 0.5) : 0.0001);
          drops.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s));
        });
        drops.instanceMatrix.needsUpdate = true;
      }
    }
  });

  const supplyProgress = () => window01(layers.current.irrigation, 0.05, 0.4);
  const zoneProgress = (i: number) => () => window01(layers.current.irrigation, 0.3 + i * 0.06, 0.6 + i * 0.06);
  const dripProgress = (i: number) => () => window01(layers.current.irrigation, 0.55 + i * 0.05, 0.75 + i * 0.05);
  const anyActive = activeZones.size > 0;

  return (
    <group name="irrigation">
      {geo.supply.pipe.map((g, i) => (
        <GrowingTube key={`s${i}`} geometry={g} material={m.pipe} progress={supplyProgress} />
      ))}
      {anyActive && geo.supply.flow.map((g, i) => <mesh key={`sf${i}`} geometry={g} material={m.flow} renderOrder={4} />)}

      {geo.zones.map((z, i) => {
        const active = activeZones.has(geo.routes[i]!.zoneId);
        return (
          <group key={geo.routes[i]!.zoneId} name={`zone-${geo.routes[i]!.zoneId}`}>
            {z.lateral.pipe.map((g, k) => (
              <GrowingTube key={`l${k}`} geometry={g} material={m.pipe} progress={zoneProgress(i)} />
            ))}
            {z.drips.pipe.map((g, k) => (
              <GrowingTube key={`d${k}`} geometry={g} material={m.pipe} progress={dripProgress(i)} />
            ))}
            {active && [...z.lateral.flow, ...z.drips.flow].map((g, k) => <mesh key={`f${k}`} geometry={g} material={m.flow} renderOrder={4} />)}
          </group>
        );
      })}

      <group ref={manifold} position={[MANIFOLD.position[0], 0, MANIFOLD.position[2]]}>
        <mesh geometry={GEOMETRY.box} material={m.valve} scale={[MANIFOLD.size[0], MANIFOLD.size[1], MANIFOLD.size[2]]} castShadow />
        {geo.routes.map((r) => (
          <mesh
            key={r.zoneId}
            geometry={GEOMETRY.cylinder}
            material={activeZones.has(r.zoneId) ? m.valveOpen : m.pipe}
            position={[0, MANIFOLD.size[1], r.valve[2] - MANIFOLD.position[2]]}
            scale={[0.12, 0.1, 0.12]}
            castShadow
          />
        ))}
      </group>

      <instancedMesh ref={emitterRef} args={[GEOMETRY.sphere, m.pipe, geo.emitters.length]} />
      <instancedMesh ref={dropletRef} args={[GEOMETRY.sphere, m.droplet, geo.emitters.length]} frustumCulled={false} />
    </group>
  );
}
