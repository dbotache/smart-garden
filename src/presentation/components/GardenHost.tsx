"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, type ReactNode, type RefObject } from "react";
import { GardenScene, type GardenStage, type Locale } from "@/prototype";

/**
 * One persistent garden for the whole deck.
 *
 * Slides never mount their own WebGL canvas. A slide renders <PrototypeEmbed>, which registers a "slot";
 * the host positions the single shared <GardenScene> over that slot. Moving between garden slides only
 * changes the controlled stage (the scene glides, nothing is rebuilt) and keeps camera, selection and
 * irrigation state. On non-garden slides the garden is hidden and its render loop is paused
 * (frameloop "never"), but the WebGL context survives — no repeated context creation.
 */

type Slot = { id: string; el: HTMLElement; stage: GardenStage };
type Rect = { left: number; top: number; width: number; height: number };
type HostApi = { register: (slot: Slot) => () => void };

const GardenHostContext = createContext<HostApi | null>(null);
export const useGardenHost = () => useContext(GardenHostContext);

export function GardenHost({ frameRef, locale = "de", printable = false, children }: { frameRef: RefObject<HTMLElement | null>; locale?: Locale; /** PDF export: no build-in, snapshot-able frame */ printable?: boolean; children: ReactNode }) {
  const [slot, setSlot] = useState<Slot | null>(null);
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<GardenStage>("planning");
  const [rect, setRect] = useState<Rect | null>(null);

  const register = useCallback((s: Slot) => {
    setSlot(s);
    setStage(s.stage);
    setMounted(true);
    return () => setSlot((cur) => (cur?.id === s.id ? null : cur));
  }, []);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!slot || !frame) return;
    const measure = () => {
      const f = frame.getBoundingClientRect();
      const r = slot.el.getBoundingClientRect();
      setRect({ left: r.left - f.left, top: r.top - f.top, width: r.width, height: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(slot.el);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [slot, frameRef]);

  // Stable context value: PrototypeEmbed re-registers whenever it changes (a fresh object here = render loop).
  const api = useMemo<HostApi>(() => ({ register }), [register]);
  const visible = !!slot && !!rect;
  return (
    <GardenHostContext.Provider value={api}>
      {children}
      {mounted && (
        <div
          className="absolute z-10 overflow-hidden u-r-10"
          style={rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height, visibility: visible ? "visible" : "hidden" } : { visibility: "hidden" }}
          aria-hidden={!visible}
          inert={!visible}
          data-testid="deck-garden"
          data-visible={visible}
        >
          <GardenScene presentationMode currentStage={stage} onStageChange={setStage} locale={locale} active={visible} intro={!printable} printable={printable} />
        </div>
      )}
    </GardenHostContext.Provider>
  );
}
