"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export const pt = (n: number) => `calc(var(--pt) * ${n})`;

function prefersReducedMotion() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Tween a number towards `target` (from 0 on first render). Instant with reduced motion. */
export function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const from = useRef(0);
  const current = useRef(0);
  useEffect(() => {
    if (prefersReducedMotion() || typeof requestAnimationFrame !== "function") {
      current.current = target;
      setValue(target);
      return;
    }
    from.current = current.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      current.current = from.current + (target - from.current) * eased;
      setValue(current.current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/** A number that counts up. Screen readers and tests get the final value (data-value), not the tween. */
export function AnimatedNumber({ value, format, className = "", testId }: { value: number; format: (v: number) => string; className?: string; testId?: string }) {
  const shown = useCountUp(value);
  return (
    <span className={`tabular-nums ${className}`} data-value={value} data-testid={testId}>
      <span aria-hidden>{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  );
}

/** true one frame after mount: lets CSS transitions grow bars from zero on slide entry */
export function useEntered() {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    if (typeof requestAnimationFrame !== "function") {
      setEntered(true);
      return;
    }
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return entered;
}

export function Segmented<T extends string | number>({ label, options, value, onChange, format = String, testId }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; format?: (v: T) => string; testId?: string }) {
  return (
    <div>
      <p className="u-fs-10 font-bold uppercase tracking-[0.06em] text-pw-muted">{label}</p>
      <div role="group" aria-label={label} className="mt-[calc(var(--pt)*3)] flex u-gap-2 u-r-6 bg-white u-p-2 ring-1 ring-pw-200" data-testid={testId}>
        {options.map((o) => (
          <button key={String(o)} type="button" aria-pressed={o === value} onClick={() => onChange(o)} className={`flex-1 u-r-4 py-[calc(var(--pt)*3)] u-fs-11 font-bold tabular-nums transition-colors ${o === value ? "bg-pw-700 text-white" : "text-pw-900 hover:bg-pw-50"}`}>
            {format(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Range input with the scenario marks (vorsichtig / Basis / positiv) of the business plan drawn under the track.
 * The deck ignores ←/→ while a range has focus; PageUp/PageDown still change slides (presenter clickers).
 */
export function Slider({ label, value, min, max, step, onChange, format, marks, testId }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string; marks?: readonly { value: number; label: string }[]; testId?: string }) {
  const pos = (v: number) => `${((v - min) / (max - min)) * 100}%`;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="u-fs-10 font-bold uppercase tracking-[0.06em] text-pw-muted">{label}</span>
        <span className="u-fs-13 font-bold tabular-nums text-pw-900">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="block w-full accent-[#2d6a4f]" style={{ height: pt(14) }} data-testid={testId} aria-valuetext={format(value)} />
      {marks && (
        <span className="relative block" style={{ height: pt(11) }} aria-hidden>
          {marks.map((m) => (
            <span key={m.label} className="absolute -translate-x-1/2 whitespace-nowrap text-pw-muted" style={{ left: pos(m.value), fontSize: pt(8), top: 0 }}>
              <span className="mx-auto block bg-pw-200" style={{ width: 1, height: pt(3) }} />
              {m.label}
            </span>
          ))}
        </span>
      )}
    </label>
  );
}

export function Tile({ label, children, sub, tone = "plain", testId }: { label: string; children: ReactNode; sub?: ReactNode; tone?: "plain" | "good" | "bad"; testId?: string }) {
  const bg = tone === "good" ? "bg-[#e3f2e8]" : tone === "bad" ? "bg-[#fbe9e4]" : "bg-pw-50";
  return (
    <div className={`${bg} u-r-8 u-px-10 u-py-6 transition-colors`} data-testid={testId} data-tone={tone}>
      <p className="u-fs-9 font-bold uppercase tracking-[0.06em] text-pw-muted">{label}</p>
      <div className="font-serif u-fs-20 font-bold leading-tight text-pw-900">{children}</div>
      {sub && <p className="u-fs-10 leading-tight text-pw-muted">{sub}</p>}
    </div>
  );
}
