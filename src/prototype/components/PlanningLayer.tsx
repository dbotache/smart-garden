"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { GRAVEL_GARDEN, HOUSE_MAIN, HOUSE_WING, PLANTING_ZONES, PLOT, rectCenter, rectSize } from "../data/site";
import { useGardenMaterials } from "./materials";
import { sameSelection, useLayers, useSceneState } from "./sceneContext";
import { GEOMETRY, rectSegments, segmentsGeometry } from "./primitives";
import { BRAND } from "../utils/palette";
import { formatNumber } from "../data/i18n";

type Dim = { from: [number, number]; to: [number, number]; offsetAxis: "x" | "z"; label: number };

/** Dimension lines in the style of an architectural plan (extension lines + 45° tick marks). */
const DIMENSIONS: Dim[] = [
  { from: [HOUSE_MAIN.bounds.minX, -6.5], to: [HOUSE_MAIN.bounds.maxX, -6.5], offsetAxis: "z", label: 8 },
  { from: [-13, HOUSE_MAIN.bounds.minZ], to: [-13, HOUSE_MAIN.bounds.maxZ], offsetAxis: "x", label: 7 },
  { from: [-9.5, HOUSE_WING.bounds.minZ], to: [-9.5, HOUSE_WING.bounds.maxZ], offsetAxis: "x", label: 3.8 },
  { from: [HOUSE_WING.bounds.minX, 6.3], to: [HOUSE_WING.bounds.maxX, 6.3], offsetAxis: "z", label: 4.5 },
  { from: [PLOT.minX, PLOT.maxZ + 0.9], to: [PLOT.maxX, PLOT.maxZ + 0.9], offsetAxis: "z", label: 28 },
  { from: [PLOT.maxX + 0.9, PLOT.minZ], to: [PLOT.maxX + 0.9, PLOT.maxZ], offsetAxis: "x", label: 18 },
];

const Y = 0.014;

function planSegments() {
  const plan: number[][] = [];
  // footprints
  plan.push(...rectSegments(HOUSE_MAIN.bounds, Y), ...rectSegments(HOUSE_WING.bounds, Y));
  // interior walls of the ground-floor plan
  plan.push([-8.6, Y, -5.5, -8.6, Y, -1.0], [-12, Y, -2.2, -8.6, Y, -2.2], [-6.2, Y, -5.5, -6.2, Y, -3.2], [-6.4, Y, 1.5, -6.4, Y, 5.3], [-8.6, Y, 0.2, -8.6, Y, 1.5]);

  const construction: number[][] = [];
  const o = 1.4;
  for (const b of [HOUSE_MAIN.bounds, HOUSE_WING.bounds]) {
    construction.push([b.minX - o, Y, b.minZ, b.maxX + o, Y, b.minZ], [b.minX - o, Y, b.maxZ, b.maxX + o, Y, b.maxZ]);
    construction.push([b.minX, Y, b.minZ - o, b.minX, Y, b.maxZ + o], [b.maxX, Y, b.minZ - o, b.maxX, Y, b.maxZ + o]);
  }
  for (const [x, z, h] of [[HOUSE_MAIN.bounds.maxX, HOUSE_MAIN.bounds.minZ, HOUSE_MAIN.height], [HOUSE_MAIN.bounds.minX, HOUSE_MAIN.bounds.minZ, HOUSE_MAIN.height], [HOUSE_WING.bounds.maxX, HOUSE_WING.bounds.maxZ, HOUSE_WING.height]] as const) {
    construction.push([x, 0, z, x, h + 1.1, z]);
  }

  const dims: number[][] = [];
  const t = 0.28;
  for (const d of DIMENSIONS) {
    const [x1, z1] = d.from;
    const [x2, z2] = d.to;
    dims.push([x1, Y, z1, x2, Y, z2]);
    for (const [x, z] of [d.from, d.to]) {
      dims.push([x - t, Y, z + t, x + t, Y, z - t]); // tick
      if (d.offsetAxis === "z") dims.push([x, Y, z - 0.5 * Math.sign(z), x, Y, z + 0.3 * Math.sign(z)]);
      else dims.push([x - 0.5 * Math.sign(x), Y, z, x + 0.3 * Math.sign(x), Y, z]);
    }
  }
  return { plan, construction, dims };
}

export function PlanningLayer() {
  const m = useGardenMaterials();
  const layers = useLayers();
  const { stage, messages, locale } = useSceneState();
  const planRef = useRef<THREE.LineSegments>(null);
  const constructionRef = useRef<THREE.LineSegments>(null);
  const dimsRef = useRef<THREE.LineSegments>(null);

  const geo = useMemo(() => {
    const s = planSegments();
    return { plan: segmentsGeometry(s.plan), construction: segmentsGeometry(s.construction), dims: segmentsGeometry(s.dims) };
  }, []);
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  useFrame(() => {
    const { build, materialize } = layers.current;
    // lines draw in progressively during the build-in (plan first, then construction & dimensions)
    const draw = (g: THREE.BufferGeometry, p: number) => {
      const n = g.getAttribute("position").count;
      g.setDrawRange(0, Math.floor((Math.min(1, Math.max(0, p)) * n) / 2) * 2);
    };
    draw(geo.plan, build / 0.4);
    draw(geo.construction, (build - 0.25) / 0.5);
    draw(geo.dims, (build - 0.45) / 0.55);
    if (constructionRef.current) (constructionRef.current.material as THREE.LineBasicMaterial).opacity = 0.55 - 0.4 * materialize;
    if (dimsRef.current) dimsRef.current.visible = materialize < 0.98;
    if (planRef.current) planRef.current.visible = materialize < 0.98;
  });

  const showLabels = stage === "planning";

  return (
    <group>
      <lineSegments ref={planRef} geometry={geo.plan} material={m.planLine} />
      <lineSegments ref={constructionRef} geometry={geo.construction} material={m.construction} />
      <lineSegments ref={dimsRef} geometry={geo.dims} material={m.dimension} />
      {showLabels &&
        DIMENSIONS.map((d, i) => (
          <Html key={i} position={[(d.from[0] + d.to[0]) / 2, 0.05, (d.from[1] + d.to[1]) / 2]} center zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
            <span className="garden-dim-label">{formatNumber(d.label, locale, 2)}</span>
          </Html>
        ))}
      {PLANTING_ZONES.map((zone) => (
        <PlantingZoneMarker key={zone.id} zoneId={zone.id} />
      ))}
      <ZoneLegend visible={showLabels} label={messages.planning.zonesTitle} />
    </group>
  );
}

function ZoneLegend({ visible, label }: { visible: boolean; label: string }) {
  if (!visible) return null;
  const [cx] = rectCenter(GRAVEL_GARDEN);
  const cz = GRAVEL_GARDEN.maxZ + 0.6;
  return (
    <Html position={[cx, 0.05, cz]} center zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
      <span className="garden-dim-label garden-dim-label--zone">{label}</span>
    </Html>
  );
}

/** Dashed outline + pickable fill for a potential planting zone. Only interactive in the planning stage. */
function PlantingZoneMarker({ zoneId }: { zoneId: string }) {
  const zone = PLANTING_ZONES.find((z) => z.id === zoneId)!;
  const m = useGardenMaterials();
  const layers = useLayers();
  const { stage, selection, hover, onSelect, onHover } = useSceneState();
  const outline = useRef<THREE.LineSegments>(null);
  const fill = useRef<THREE.Mesh>(null);
  const fillMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: BRAND.green400, transparent: true, opacity: 0, depthWrite: false }), []);
  const outlineGeometry = useMemo(() => {
    const g = segmentsGeometry(rectSegments({ minX: zone.bounds.minX - 0.12, maxX: zone.bounds.maxX + 0.12, minZ: zone.bounds.minZ - 0.12, maxZ: zone.bounds.maxZ + 0.12 }, 0.03));
    return new THREE.LineSegments(g).computeLineDistances().geometry;
  }, [zone]);
  useEffect(() => () => { fillMaterial.dispose(); outlineGeometry.dispose(); }, [fillMaterial, outlineGeometry]);

  const me = { type: "zone" as const, id: zone.id };
  const selected = sameSelection(selection, me);
  const hovered = sameSelection(hover, me);
  const interactive = stage === "planning";

  useFrame(() => {
    const { build, planted, materialize } = layers.current;
    const presence = Math.min(1, Math.max(0, (build - 0.6) / 0.4)) * (1 - (zone.kind === "raised-bed" ? planted : materialize));
    if (outline.current) outline.current.visible = presence > 0.02;
    fillMaterial.opacity = presence * (selected ? 0.42 : hovered ? 0.26 : 0.1);
    if (fill.current) fill.current.visible = presence > 0.02;
  });

  const [cx, cz] = rectCenter(zone.bounds);
  const [w, d] = rectSize(zone.bounds);
  const handlers = interactive
    ? {
        onClick: (e: ThreeEvent<MouseEvent>) => {
          if (e.delta > 5) return;
          e.stopPropagation();
          onSelect(me);
        },
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(me);
        },
        onPointerOut: () => onHover(null),
      }
    : {};

  return (
    <group>
      <lineSegments ref={outline} geometry={outlineGeometry} material={m.zoneOutline} />
      <mesh ref={fill} geometry={GEOMETRY.plane} material={fillMaterial} position={[cx, 0.025, cz]} scale={[w + 0.24, 1, d + 0.24]} renderOrder={1} {...handlers} />
    </group>
  );
}
