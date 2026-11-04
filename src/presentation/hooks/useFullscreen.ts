"use client";

import { useCallback, useSyncExternalStore, type RefObject } from "react";

const subscribe = (cb: () => void) => {
  document.addEventListener("fullscreenchange", cb);
  return () => document.removeEventListener("fullscreenchange", cb);
};

export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const active = useSyncExternalStore(subscribe, () => !!document.fullscreenElement, () => false);
  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await ref.current?.requestFullscreen?.();
    } catch {
      /* not supported / denied: stay windowed */
    }
  }, [ref]);
  const exit = useCallback(async () => {
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
  }, []);
  return { active, toggle, exit, supported: typeof document !== "undefined" && !!document.fullscreenEnabled };
}
