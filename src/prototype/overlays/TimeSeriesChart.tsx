"use client";

import { useId, useMemo, useState } from "react";
import type { Locale, MetricSeries } from "../types";
import { formatNumber } from "../data/i18n";
import { summarize } from "../utils/timeseries";
import { STATUS } from "../utils/palette";

type Props = {
  series: MetricSeries;
  title: string;
  locale: Locale;
  /** shaded preferred range, e.g. the plant's moisture target */
  band?: { min: number; max: number; label: string };
  height?: number;
  /** compact sparkline: no axes, no band label */
  compact?: boolean;
  decimals?: number;
};

const W = 300;

/**
 * Single-series SVG line chart (no chart library needed).
 * Measured = solid line, estimated = dashed line (secondary encoding besides colour).
 * Hover/focus shows a crosshair with the value; min/max/latest are always visible as text, and a
 * screen-reader table lists every sample, so the tooltip never gates a value.
 */
export function TimeSeriesChart({ series, title, locale, band, height = 112, compact = false, decimals = 1 }: Props) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const pts = series.points.filter((p) => Number.isFinite(p.value));
  const summary = summarize(pts);
  const pad = compact ? { l: 2, r: 2, t: 4, b: 4 } : { l: 30, r: 8, t: 8, b: 18 };
  const H = height;

  const scale = useMemo(() => {
    const values = pts.map((p) => p.value);
    let lo = Math.min(...values, band?.min ?? Infinity);
    let hi = Math.max(...values, band?.max ?? -Infinity);
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return null;
    if (hi - lo < 1e-6) {
      lo -= 1;
      hi += 1;
    }
    const span = hi - lo;
    lo -= span * 0.08;
    hi += span * 0.08;
    const x = (i: number) => pad.l + (i / Math.max(1, pts.length - 1)) * (W - pad.l - pad.r);
    const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
    return { x, y, lo, hi };
  }, [pts, band, pad.l, pad.r, pad.t, pad.b, H]);

  if (!summary || !scale || pts.length < 2) {
    return <p className="text-[12px] text-[#56635C]">—</p>;
  }

  const color = series.source === "measured" ? STATUS.measured : STATUS.estimated;
  const path = pts.map((p, i) => `${i ? "L" : "M"}${scale.x(i).toFixed(1)},${scale.y(p.value).toFixed(1)}`).join("");
  const last = pts[pts.length - 1]!;
  const ticks = compact ? [] : [scale.lo + (scale.hi - scale.lo) * 0.15, (scale.lo + scale.hi) / 2, scale.hi - (scale.hi - scale.lo) * 0.15];
  const fmt = (v: number) => formatNumber(v, locale, decimals);
  const label = `${title}: ${fmt(pts[0]!.value)} → ${fmt(last.value)} ${series.unit}`;

  const onMove = (clientX: number, rect: DOMRect) => {
    const rel = ((clientX - rect.left) / rect.width) * W;
    const i = Math.round(((rel - pad.l) / (W - pad.l - pad.r)) * (pts.length - 1));
    setHover(Math.max(0, Math.min(pts.length - 1, i)));
  };
  const hp = hover !== null ? pts[hover] : null;
  const date = (t: string) => new Date(t).toLocaleString(locale === "de" ? "de-DE" : "en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

  return (
    <figure className="relative m-0" data-testid={`chart-${series.metric}`}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
        role="img"
        aria-label={label}
        tabIndex={compact ? -1 : 0}
        onPointerMove={(e) => onMove(e.clientX, e.currentTarget.getBoundingClientRect())}
        onPointerLeave={() => setHover(null)}
        onFocus={() => setHover(pts.length - 1)}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            e.stopPropagation(); // keep slide navigation out of chart exploration
            setHover((h) => Math.max(0, Math.min(pts.length - 1, (h ?? pts.length - 1) + (e.key === "ArrowLeft" ? -1 : 1))));
          }
        }}
      >
        {band && (
          <g>
            <rect x={pad.l} width={W - pad.l - pad.r} y={scale.y(band.max)} height={Math.max(0, scale.y(band.min) - scale.y(band.max))} fill="#52B788" opacity={0.14} />
            {!compact && (
              <text x={W - pad.r - 2} y={scale.y(band.max) + 10} textAnchor="end" className="fill-[#2D6A4F] text-[9px]">
                {band.label}
              </text>
            )}
          </g>
        )}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={scale.y(t)} y2={scale.y(t)} stroke="#e3e8e2" strokeWidth={1} />
            <text x={pad.l - 4} y={scale.y(t) + 3} textAnchor="end" className="fill-[#6b776f] text-[9px]">
              {formatNumber(t, locale, 0)}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={series.source === "estimated" ? "5 3" : undefined} vectorEffect="non-scaling-stroke" />
        <circle cx={scale.x(pts.length - 1)} cy={scale.y(last.value)} r={4} fill={color} stroke="#fff" strokeWidth={2} />
        {hp && hover !== null && (
          <g pointerEvents="none">
            <line x1={scale.x(hover)} x2={scale.x(hover)} y1={pad.t} y2={H - pad.b} stroke="#1F2D26" strokeOpacity={0.35} strokeWidth={1} />
            <circle cx={scale.x(hover)} cy={scale.y(hp.value)} r={4} fill={color} stroke="#fff" strokeWidth={2} />
          </g>
        )}
        {!compact && (
          <g className="fill-[#6b776f] text-[9px]">
            <text x={pad.l} y={H - 4}>−7 d</text>
            <text x={W - pad.r} y={H - 4} textAnchor="end">{locale === "de" ? "jetzt" : "now"}</text>
          </g>
        )}
      </svg>
      {hp && !compact && (
        <div className="pointer-events-none absolute right-1 top-0 rounded-md bg-white/95 px-2 py-1 text-[11px] shadow-sm ring-1 ring-[#dfe5dd]" role="status">
          <strong className="text-[#1F2D26]">
            {fmt(hp.value)} {series.unit}
          </strong>
          <span className="ml-1.5 text-[#56635C]">{date(hp.t)}</span>
        </div>
      )}
      <table className="sr-only" id={id}>
        <caption>{title}</caption>
        <tbody>
          {pts.map((p) => (
            <tr key={p.t}>
              <th scope="row">{p.t}</th>
              <td>
                {fmt(p.value)} {series.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
