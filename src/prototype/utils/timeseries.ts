import type { MetricSeries, Reading } from "../types";
import { mulberry32 } from "./random";

export const DEMO_NOW = "2026-07-15T10:00:00Z";
const HOUR = 3_600_000;

export type SeriesSpec = {
  seed: number;
  /** value of the most recent sample */
  current: number;
  /** total change over the window (positive = value has been rising towards `current`) */
  drift: number;
  /** amplitude of the daily cycle */
  daily: number;
  noise: number;
  days?: number;
  samplesPerDay?: number;
  min?: number;
  max?: number;
  decimals?: number;
};

/**
 * Deterministic synthetic history that ends exactly at `current`.
 * Used for demo charts only; tests depend on its stability.
 */
export function generateSeries(spec: SeriesSpec, end = DEMO_NOW): Reading[] {
  const { seed, current, drift, daily, noise, days = 7, samplesPerDay = 6, min = -Infinity, max = Infinity, decimals = 1 } = spec;
  const rand = mulberry32(seed);
  const n = days * samplesPerDay;
  const endMs = Date.parse(end);
  const step = (24 * HOUR) / samplesPerDay;
  const round = (v: number) => Number(v.toFixed(decimals));
  const points: Reading[] = [];
  for (let i = 0; i < n; i++) {
    const age = n - 1 - i; // samples before "now"
    const t = new Date(endMs - age * step);
    const hour = t.getUTCHours() + t.getUTCMinutes() / 60;
    const cycle = Math.sin(((hour - 9) / 24) * Math.PI * 2) * daily;
    const trend = -drift * (age / (n - 1));
    const jitter = age === 0 ? 0 : (rand() - 0.5) * 2 * noise;
    const cycleNow = Math.sin(((new Date(endMs).getUTCHours() - 9) / 24) * Math.PI * 2) * daily;
    const value = current + trend + (cycle - cycleNow) + jitter;
    points.push({ t: t.toISOString(), value: round(Math.min(max, Math.max(min, value))) });
  }
  return points;
}

export type SeriesSummary = { latest: number; min: number; max: number; mean: number; change: number; count: number };

export function summarize(points: Reading[]): SeriesSummary | null {
  const values = points.map((p) => p.value).filter((v) => Number.isFinite(v));
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  const latest = values[values.length - 1]!;
  return {
    latest,
    min: Math.min(...values),
    max: Math.max(...values),
    mean: Number((sum / values.length).toFixed(2)),
    change: Number((latest - values[0]!).toFixed(2)),
    count: values.length,
  };
}

/** Daily means, oldest first. Ignores non-finite values; days without samples are omitted. */
export function dailyMeans(points: Reading[]): Reading[] {
  const byDay = new Map<string, number[]>();
  for (const p of points) {
    if (!Number.isFinite(p.value)) continue;
    const day = p.t.slice(0, 10);
    byDay.set(day, [...(byDay.get(day) ?? []), p.value]);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, vs]) => ({ t: `${day}T00:00:00Z`, value: Number((vs.reduce((a, b) => a + b, 0) / vs.length).toFixed(2)) }));
}

export type TrendDirection = "rising" | "falling" | "stable";
export function trendDirection(series: MetricSeries, threshold = 1): TrendDirection {
  const s = summarize(series.points);
  if (!s) return "stable";
  if (s.change > threshold) return "rising";
  if (s.change < -threshold) return "falling";
  return "stable";
}

export type MoistureStatus = "below" | "within" | "above";
export function moistureStatus(value: number, target: { min: number; max: number }): MoistureStatus {
  if (value < target.min) return "below";
  if (value > target.max) return "above";
  return "within";
}
