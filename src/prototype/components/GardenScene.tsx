"use client";

import { Component, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { GardenSelection, GardenStage, Locale } from "../types";
import { GARDEN_STAGES } from "../types";
import { getMessages, type Messages } from "../data/i18n";
import { getPlant } from "../data/plants";
import { SENSOR_DEVICES } from "../data/sensors";
import { getZone, rectCenter } from "../data/site";
import { plantLayout } from "../utils/geometry";
import { stageIndex, stepStage } from "../utils/stages";
import { useGardenController, type GardenController } from "../hooks/useGardenController";
import type { SceneState } from "./sceneContext";
import type { CameraApi } from "./CameraController";
import { StageControls } from "../overlays/StageControls";
import { CameraTools } from "../overlays/CameraTools";
import { Badge } from "../overlays/ui";
import { PlanningStage } from "../stages/PlanningStage";
import { PlantingStage } from "../stages/PlantingStage";
import { MonitoringStage } from "../stages/MonitoringStage";
import { IrrigationStage } from "../stages/IrrigationStage";
import type { Vec3 } from "../types";

export type GardenSceneProps = {
  /** Uncontrolled: stage to start in. */
  initialStage?: GardenStage;
  /** Controlled: the stage to show. Changing it glides the existing scene; nothing is rebuilt. */
  currentStage?: GardenStage;
  /** Called when the user picks a stage inside the garden (controlled and uncontrolled). */
  onStageChange?: (stage: GardenStage) => void;
  /** Embedded in a slide: no global keyboard handling, compact copy. */
  presentationMode?: boolean;
  locale?: Locale;
  /** false pauses rendering (WebGL context and state are kept). */
  active?: boolean;
  /** Arrow keys switch stages (standalone default). Never enabled in presentation mode. */
  keyboardStageNavigation?: boolean;
  /** Play the plan → walls build-in on first mount. */
  intro?: boolean;
  className?: string;
};

const GardenCanvas = dynamic(() => import("./GardenCanvas"), { ssr: false, loading: () => null });

/** WebGL detection, cached; `null` during SSR so server and first client render match (no hydration mismatch). */
let webglCache: boolean | undefined;
function detectWebGL() {
  if (webglCache === undefined) {
    try {
      const c = document.createElement("canvas");
      webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
}
const noop = () => () => {};
function useWebGL(): boolean | null {
  return useSyncExternalStore(noop, detectWebGL, () => null);
}

class CanvasErrorBoundary extends Component<{ fallback: (retry: () => void) => ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("[garden] 3D view failed", error);
  }
  render() {
    return this.state.failed ? this.props.fallback(() => this.setState({ failed: false })) : this.props.children;
  }
}

/** World anchor for a selection, used by the test/debug bridge to click real 3D objects. */
function anchorFor(sel: NonNullable<GardenSelection>): Vec3 | null {
  if (sel.type === "plant") {
    const plant = getPlant(sel.id);
    if (!plant) return null;
    if (plant.origin === "existing") return [plant.position[0], 1.0, plant.position[2]];
    const [first] = plantLayout(plant);
    return first ? [first[0], first[1] + 0.12, first[2]] : null;
  }
  if (sel.type === "sensor") {
    const d = SENSOR_DEVICES.find((x) => x.id === sel.id);
    return d ? [d.position[0], d.position[1] + (d.kind === "weather-station" ? 1.2 : 0.45), d.position[2]] : null;
  }
  const z = getZone(sel.id);
  if (!z) return null;
  const [x, zz] = rectCenter(z.bounds);
  return [x, 0.03, zz];
}

declare global {
  interface Window {
    __plantwizGarden?: {
      stage: GardenStage;
      settled: boolean;
      project: (sel: NonNullable<GardenSelection>) => { x: number; y: number } | null;
      stats: () => { calls: number; triangles: number; programs: number } | null;
    };
  }
}

function StagePanel({ garden, locale }: { garden: GardenController; locale: Locale }) {
  switch (garden.stage) {
    case "planning":
      return <PlanningStage garden={garden} locale={locale} />;
    case "planting":
      return <PlantingStage garden={garden} locale={locale} />;
    case "monitoring":
      return <MonitoringStage garden={garden} locale={locale} />;
    case "irrigation":
      return <IrrigationStage garden={garden} locale={locale} />;
  }
}

function isTypingTarget(el: EventTarget | null) {
  return el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

/**
 * The complete interactive garden: 3D canvas + overlays. Works standalone (/prototype) and embedded in slides.
 */
export function GardenScene({ initialStage, currentStage, onStageChange, presentationMode = false, locale = "en", active = true, keyboardStageNavigation, intro = true, className = "" }: GardenSceneProps) {
  const garden = useGardenController({ initialStage, currentStage, onStageChange });
  const t: Messages = getMessages(locale);
  const webgl = useWebGL();
  const cameraApi = useRef<CameraApi | null>(null);
  const [settled, setSettled] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const panelRef = useRef<HTMLElement>(null);
  const inset = usePanelInset(panelRef);
  const { stage, setStage, selection, select, hover, setHover, plan, demo } = garden;

  const scene: SceneState = useMemo(
    () => ({ stage, selection, hover, locale, messages: t, decisions: plan.decisions, demoStatus: demo.status, demoRef: demo.demoRef, onSelect: select, onHover: setHover }),
    [stage, selection, hover, locale, t, plan.decisions, demo.status, demo.demoRef, select, setHover],
  );

  // Standalone keyboard: arrows switch stages. Off in presentation mode so the deck owns the arrow keys.
  const keys = keyboardStageNavigation ?? !presentationMode;
  useEffect(() => {
    if (!keys) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || isTypingTarget(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") setStage(stepStage(stage, 1));
      else if (e.key === "ArrowLeft") setStage(stepStage(stage, -1));
      else if (e.key === "Escape") select(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [keys, stage, setStage, select]);

  // Debug/test bridge: lets Playwright click real 3D objects deterministically.
  useEffect(() => {
    window.__plantwizGarden = { stage, settled, project: (sel) => { const p = anchorFor(sel); return p && cameraApi.current ? cameraApi.current.project(p) : null; }, stats: () => cameraApi.current?.stats() ?? null };
    return () => {
      delete window.__plantwizGarden;
    };
  }, [stage, settled]);

  const [ready, setReady] = useState(false); // first settle reached: the loading hint never comes back
  const onSettledChange = useCallback((s: boolean) => {
    setSettled(s);
    if (s) setReady(true);
  }, []);
  const copy = t.stages[stage];
  const index = stageIndex(stage) + 1;

  return (
    <section
      className={`garden-root @container relative isolate h-full min-h-[340px] w-full overflow-hidden bg-[#f3f2ec] text-[#1F2D26] ${className}`}
      data-garden-root
      data-stage={stage}
      data-settled={settled}
      data-presentation={presentationMode || undefined}
      aria-label={`${t.brand} — ${copy.title}`}
      data-keyboard-scope="garden"
    >
      {/* 3D layer */}
      <div className="absolute inset-0">
        {webgl === false ? (
          <Fallback message={t.webglError} />
        ) : webgl ? (
          <CanvasErrorBoundary key={canvasKey} fallback={(retry) => <Fallback message={t.webglError} action={{ label: t.retry, onClick: () => (retry(), setCanvasKey((k) => k + 1)) }} />}>
            <GardenCanvas scene={scene} active={active} cameraApiRef={cameraApi} onSettledChange={onSettledChange} intro={intro} ariaLabel={t.canvasLabel} inset={inset} />
          </CanvasErrorBoundary>
        ) : null}
        {!ready && webgl !== false && (
          <p className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 text-[11px] text-[#6b776f]" aria-live="polite" data-testid="garden-loading">
            {t.loading}
          </p>
        )}
      </div>

      {/* heading (soft paper backdrop keeps it legible over the model) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-[#f3f2ec]/90 via-[#f3f2ec]/55 to-transparent" aria-hidden />
      <header className="pointer-events-none absolute left-4 top-3 z-20 max-w-[min(460px,52%)] @max-3xl:max-w-[calc(100%-2rem)]">
        <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#2D6A4F]">
          <span>
            {String(index).padStart(2, "0")} / {String(GARDEN_STAGES.length).padStart(2, "0")}
          </span>
          <Badge tone="gray">{t.demoBadge}</Badge>
        </p>
        <h2 className="mt-1 font-serif text-[clamp(18px,2.6cqw,28px)] leading-tight text-[#1B4332]" data-testid="garden-stage-title">
          {copy.title}
        </h2>
        <p className="mt-0.5 text-[12.5px] text-[#3d4a43]">{copy.subtitle}</p>
        {!presentationMode && <p className="mt-1 text-[10.5px] text-[#6b776f] @max-3xl:hidden">{t.hint}</p>}
      </header>

      {/* detail panel */}
      <aside
        ref={panelRef}
        className="absolute bottom-[60px] right-3 top-3 z-30 flex w-[min(340px,40%)] flex-col overflow-hidden rounded-xl bg-white/95 shadow-[0_10px_40px_rgba(27,67,50,0.14)] ring-1 ring-[#dfe6dd] backdrop-blur @max-3xl:inset-x-3 @max-3xl:bottom-[60px] @max-3xl:top-auto @max-3xl:h-[44%] @max-3xl:w-auto"
        aria-label={copy.title}
        data-testid="garden-panel"
        onPointerDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[#e6ebe5] px-3.5 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#56635C]">{copy.short}</span>
          {selection && (
            <button type="button" onClick={() => select(null)} className="rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold text-[#2D6A4F] hover:bg-[#EEF8F1] focus-visible:outline-2 focus-visible:outline-[#2D6A4F]" data-testid="panel-back">
              ← {t.close}
            </button>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5 py-3">
          <StagePanel garden={garden} locale={locale} />
        </div>
        <p className="border-t border-[#e6ebe5] px-3.5 py-1.5 text-[9.5px] leading-snug text-[#7b877f]">{t.demoDisclaimer}</p>
      </aside>

      {/* bottom bar */}
      <div className="pointer-events-none absolute bottom-3 left-3 right-[calc(min(340px,40%)+1.5rem)] z-30 flex items-end justify-between gap-2 @max-3xl:right-3">
        <StageControls stage={stage} onChange={setStage} messages={t} />
        <div className="@max-3xl:hidden">
          <CameraTools messages={t} onZoomIn={() => cameraApi.current?.zoomBy(0.8)} onZoomOut={() => cameraApi.current?.zoomBy(1.25)} onReset={() => cameraApi.current?.reset()} />
        </div>
      </div>
    </section>
  );
}

/** How much of the canvas the detail panel covers: its width when docked right, its height as a bottom sheet. */
function usePanelInset(ref: React.RefObject<HTMLElement | null>) {
  const [inset, setInset] = useState({ right: 0, bottom: 0 });
  useEffect(() => {
    const el = ref.current;
    const root = el?.parentElement;
    if (!el || !root) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const p = root.getBoundingClientRect();
      const docked = r.height > p.height * 0.6;
      const next = docked ? { right: Math.round(p.right - r.left), bottom: 0 } : { right: 0, bottom: Math.round(p.bottom - r.top) };
      setInset((prev) => (prev.right === next.right && prev.bottom === next.bottom ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(root);
    return () => ro.disconnect();
  }, [ref]);
  return inset;
}

function Fallback({ message, action }: { message: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-8" role="alert" data-testid="garden-fallback">
      <div className="max-w-sm text-center text-[13px] text-[#3d4a43]">
        <p>{message}</p>
        {action && (
          <button type="button" onClick={action.onClick} className="mt-3 rounded-lg bg-[#1B4332] px-3 py-1.5 text-white">
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
