"use client";

import { useCallback, useSyncExternalStore } from "react";
import { clampSlide, parseSlideHash } from "../utils/keyboard";

/**
 * Current slide lives in the URL hash (#/7) — deep-linkable, survives reload, no hydration mismatch
 * (server snapshot is slide 1). Navigation uses location.replace so slides don't flood the history.
 */
const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

export function useDeckLocation(total: number) {
  const index = useSyncExternalStore(
    subscribe,
    () => parseSlideHash(window.location.hash, total),
    () => 0,
  );
  const go = useCallback((i: number) => {
    const next = clampSlide(i, total);
    window.location.replace(`#/${next + 1}`);
  }, [total]);
  return { index, go };
}
