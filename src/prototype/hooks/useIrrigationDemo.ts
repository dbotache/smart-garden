"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DemoState } from "../components/sceneContext";

export type DemoStatus = "idle" | "running" | "done";

/**
 * Timeline of the watering demonstration. Progress is written to a ref every animation frame
 * (read by the 3D scene); React state only changes at start and end.
 */
export function useIrrigationDemo(durationMs = 6000) {
  const demoRef = useRef<DemoState>({ running: false, progress: 0, activeZoneIds: [] });
  const [status, setStatus] = useState<DemoStatus>("idle");
  const frame = useRef<number | null>(null);

  const stop = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  };

  const run = useCallback(
    (activeZoneIds: string[]) => {
      stop();
      const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const duration = reduced ? Math.min(durationMs, 800) : durationMs;
      demoRef.current = { running: true, progress: 0, activeZoneIds };
      setStatus("running");
      const t0 = performance.now();
      const tick = () => {
        const p = Math.min(1, (performance.now() - t0) / duration);
        demoRef.current.progress = p;
        if (p < 1) frame.current = requestAnimationFrame(tick);
        else {
          frame.current = null;
          demoRef.current.running = false;
          setStatus("done");
        }
      };
      frame.current = requestAnimationFrame(tick);
    },
    [durationMs],
  );

  const reset = useCallback(() => {
    stop();
    demoRef.current = { running: false, progress: 0, activeZoneIds: [] };
    setStatus("idle");
  }, []);

  useEffect(() => stop, []);

  return { demoRef, status, run, reset };
}
