/**
 * Keyboard rules for the slide deck (pure, unit-tested).
 *
 * - → / PageDown: next   ← / PageUp: previous   Home / End: first / last
 *   (PageUp/PageDown are what presenter clickers send.)
 * - Space: next (Shift+Space: previous) — except when an interactive element has focus,
 *   where Space must activate that element (buttons, links, controls inside the garden).
 * - F: toggle full screen, N: toggle speaker notes, Escape: leave full screen / close notes.
 * - Range sliders keep ←/→/Home/End, but PageUp/PageDown still navigate (a presenter clicker must always work).
 * - Ignored while typing, with modifier keys, or when a widget already handled the key (defaultPrevented),
 *   e.g. a chart that uses ←/→ to move its crosshair.
 */
export type DeckAction = "next" | "prev" | "first" | "last" | "fullscreen" | "notes" | "escape";

export type KeyLike = {
  key: string;
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  defaultPrevented?: boolean;
  target?: EventTarget | null;
};

const TYPING = "input, textarea, select, [contenteditable=''], [contenteditable='true']";
const INTERACTIVE = "button, a[href], summary, [role='button'], [role='tab'], [role='switch'], [tabindex]:not([tabindex='-1']), " + TYPING;

function closest(target: EventTarget | null | undefined, selector: string): Element | null {
  return target && typeof (target as Element).closest === "function" ? (target as Element).closest(selector) : null;
}

export function deckKeyAction(e: KeyLike): DeckAction | null {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return null;
  if (closest(e.target, TYPING)) {
    const isRange = closest(e.target, "input[type='range']") !== null;
    if (!(isRange && (e.key === "PageDown" || e.key === "PageUp"))) return null;
  }
  switch (e.key) {
    case "ArrowRight":
    case "PageDown":
      return "next";
    case "ArrowLeft":
    case "PageUp":
      return "prev";
    case "Home":
      return "first";
    case "End":
      return "last";
    case " ":
    case "Spacebar":
      if (closest(e.target, INTERACTIVE) || closest(e.target, "[data-garden-root]")) return null;
      return e.shiftKey ? "prev" : "next";
    case "f":
    case "F":
      return "fullscreen";
    case "n":
    case "N":
      return "notes";
    case "Escape":
      return "escape";
    default:
      return null;
  }
}

export const clampSlide = (index: number, total: number) => Math.min(Math.max(0, index), Math.max(0, total - 1));

/** "#/7" → 6 (1-based in the URL, 0-based internally). Invalid → 0. */
export function parseSlideHash(hash: string, total: number): number {
  const m = /^#\/?(\d+)$/.exec(hash.trim());
  return m ? clampSlide(Number(m[1]) - 1, total) : 0;
}
