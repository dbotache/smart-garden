"use client";

import { euroShort, num, signedEuro } from "../utils/money";

/** Polarity colours (validated: CVD ΔE 15.7, contrast ≥ 3:1); sign is also carried by direction and "+/−" labels. */
export const POS = "#1b4332";
export const NEG = "#d9482b";
const INK = "#1f2d26";
const MUTED = "#56635c";
const GRID = "#b7e4c7";

export type WaterfallStep = { label: string; value: number; total?: boolean; formula?: string };

/** deltas float from the running sum; totals stand on zero (pure) */
export function layoutWaterfall(steps: WaterfallStep[]) {
  const out: (WaterfallStep & { from: number; to: number })[] = [];
  let run = 0;
  for (const s of steps) {
    const from = s.total ? 0 : run;
    const to = s.total ? s.value : run + s.value;
    if (!s.total) run = to;
    out.push({ ...s, from, to });
  }
  return out;
}

/** Waterfall: deltas float from the running sum; totals stand on the zero line. */
export function Waterfall({ steps, width = 360, height = 210, testId }: { steps: WaterfallStep[]; width?: number; height?: number; testId?: string }) {
  const m = { t: 16, b: 34, l: 4, r: 4 };
  const bars = layoutWaterfall(steps);
  const values = bars.flatMap((b) => [b.from, b.to, 0]);
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  const pad = (hi - lo || 1) * 0.12;
  hi += hi > 0 ? pad : 0;
  lo -= lo < 0 ? pad : 0;
  const y = (v: number) => m.t + ((hi - v) / (hi - lo)) * (height - m.t - m.b);
  const band = (width - m.l - m.r) / bars.length;
  const bw = band * 0.62;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block h-full w-full" role="img" aria-label={bars.map((b) => `${b.label.replace("\n", " ")}: ${signedEuro(b.total ? b.value : b.value)}`).join("; ")} data-testid={testId}>
      <line x1={m.l} x2={width - m.r} y1={y(0)} y2={y(0)} stroke={MUTED} strokeWidth={1} />
      {bars.map((b, i) => {
        const x = m.l + band * i + (band - bw) / 2;
        const top = y(Math.max(b.from, b.to));
        const h = Math.max(1, Math.abs(y(b.from) - y(b.to)));
        const positive = b.total ? b.value >= 0 : b.value >= 0;
        const labelY = positive ? top - 4 : top + h + 10;
        const next = bars[i + 1];
        return (
          <g key={b.label}>
            <title>{`${b.label.replace("\n", " ")}: ${signedEuro(b.value)}${b.formula ? ` · ${b.formula}` : ""}`}</title>
            <rect x={x} y={top} width={bw} height={h} rx={2.5} fill={positive ? POS : NEG} opacity={b.total ? 1 : 0.88} className="motion-safe:transition-all motion-safe:duration-500" />
            {b.total && <rect x={x} y={top} width={bw} height={h} rx={2.5} fill="none" stroke={INK} strokeWidth={1.2} />}
            {next && !next.total && <line x1={x + bw} x2={x + band} y1={y(b.to)} y2={y(b.to)} stroke={MUTED} strokeDasharray="2 2" strokeWidth={0.8} />}
            <text x={x + bw / 2} y={labelY} textAnchor="middle" fontSize={10} fontWeight={700} fill={INK} className="tabular-nums">
              {signedEuro(b.value)}
            </text>
            {b.label.split("\n").map((line, k) => (
              <text key={k} x={x + bw / 2} y={height - m.b + 13 + k * 10} textAnchor="middle" fontSize={8.5} fill={b.total ? INK : MUTED} fontWeight={b.total ? 700 : 400}>
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

/** Running monthly result over active users, with the break-even point and the current scenario. */
export function BreakEvenChart({ at, current, breakEvenUsers, xMax, width = 230, height = 210, testId }: { at: (users: number) => number; current: number; breakEvenUsers: number | null; xMax: number; width?: number; height?: number; testId?: string }) {
  const m = { t: 14, b: 26, l: 40, r: 8 };
  const n = 48;
  const pts = Array.from({ length: n + 1 }, (_, i) => (xMax * i) / n).map((u) => ({ u, v: at(u) }));
  const vs = pts.map((p) => p.v).concat(0);
  let lo = Math.min(...vs);
  let hi = Math.max(...vs);
  const pad = (hi - lo || 1) * 0.1;
  lo -= pad;
  hi += pad;
  const x = (u: number) => m.l + (u / xMax) * (width - m.l - m.r);
  const y = (v: number) => m.t + ((hi - v) / (hi - lo)) * (height - m.t - m.b);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${x(p.u).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
  const cur = Math.min(current, xMax);
  const curV = at(cur);
  const ticksX = [0, xMax / 2, xMax];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block h-full w-full" role="img" aria-label={`Laufendes Monatsergebnis nach aktiven Nutzern. Break-even ${breakEvenUsers ? `bei ${num(breakEvenUsers)} aktiven Nutzern` : "nicht erreichbar"}.`} data-testid={testId}>
      {[lo + pad, 0, hi - pad].map((v, i) => (
        <g key={i}>
          <line x1={m.l} x2={width - m.r} y1={y(v)} y2={y(v)} stroke={v === 0 ? MUTED : GRID} strokeWidth={v === 0 ? 1 : 0.6} />
          <text x={m.l - 4} y={y(v) + 3} textAnchor="end" fontSize={8} fill={MUTED}>{euroShort(v)}</text>
        </g>
      ))}
      {ticksX.map((u) => (
        <text key={u} x={x(u)} y={height - m.b + 11} textAnchor={u === 0 ? "start" : u === xMax ? "end" : "middle"} fontSize={8} fill={MUTED}>{num(u)}</text>
      ))}
      <text x={(m.l + width - m.r) / 2} y={height - 3} textAnchor="middle" fontSize={8} fill={MUTED}>aktive registrierte Nutzer</text>
      <path d={d} fill="none" stroke={POS} strokeWidth={2} />
      {breakEvenUsers !== null && breakEvenUsers <= xMax && (
        <g data-testid="break-even-marker">
          <line x1={x(breakEvenUsers)} x2={x(breakEvenUsers)} y1={m.t} y2={height - m.b} stroke={INK} strokeDasharray="3 3" strokeWidth={0.8} />
          <text x={x(breakEvenUsers) + (x(breakEvenUsers) > width * 0.7 ? -3 : 3)} y={m.t + 8} textAnchor={x(breakEvenUsers) > width * 0.7 ? "end" : "start"} fontSize={8.5} fontWeight={700} fill={INK}>
            Break-even {num(breakEvenUsers)}
          </text>
        </g>
      )}
      <circle cx={x(cur)} cy={y(curV)} r={4} fill={curV >= 0 ? POS : NEG} stroke="#fff" strokeWidth={1.5} />
      <text x={x(cur) + (x(cur) > width * 0.6 ? -7 : 7)} y={y(curV) + (curV >= 0 ? 12 : -7)} textAnchor={x(cur) > width * 0.6 ? "end" : "start"} fontSize={8.5} fontWeight={700} fill={INK}>
        Szenario {signedEuro(curV)}
      </text>
    </svg>
  );
}

/** Cumulative contribution of a rented kit over paid months (crosses zero at the payback month). */
export function RentalChart({ cumulative, payback, months = 24, width = 260, height = 120 }: { cumulative: (m: number) => number; payback: number; months?: number; width?: number; height?: number }) {
  const m = { t: 10, b: 18, l: 34, r: 8 };
  const lo = cumulative(0);
  const hi = cumulative(months);
  const x = (t: number) => m.l + (t / months) * (width - m.l - m.r);
  const y = (v: number) => m.t + ((hi - v) / (hi - lo)) * (height - m.t - m.b);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block h-full w-full" role="img" aria-label={`Hardwaremiete: amortisiert nach ${num(payback, 1)} bezahlten Monaten`}>
      <line x1={m.l} x2={width - m.r} y1={y(0)} y2={y(0)} stroke={MUTED} strokeWidth={1} />
      {[lo, hi].map((v) => (
        <text key={v} x={m.l - 4} y={y(v) + 3} textAnchor="end" fontSize={8} fill={MUTED}>{euroShort(v)}</text>
      ))}
      {[0, 12, 24].map((t) => (
        <text key={t} x={x(t)} y={height - 5} textAnchor={t === 0 ? "start" : t === months ? "end" : "middle"} fontSize={8} fill={MUTED}>{t} Mon.</text>
      ))}
      <line x1={x(0)} y1={y(lo)} x2={x(payback)} y2={y(0)} stroke={NEG} strokeWidth={2} />
      <line x1={x(payback)} y1={y(0)} x2={x(months)} y2={y(hi)} stroke={POS} strokeWidth={2} />
      <line x1={x(payback)} x2={x(payback)} y1={m.t} y2={height - m.b} stroke={INK} strokeDasharray="3 3" strokeWidth={0.8} />
      <text x={x(payback) - 3} y={m.t + 7} textAnchor="end" fontSize={8.5} fontWeight={700} fill={INK}>amortisiert nach {num(payback, 1)} Mon.</text>
    </svg>
  );
}
