"use client";

import type { Locale, MetricSeries } from "../types";
import { TimeSeriesChart } from "./TimeSeriesChart";

/** Soil-moisture history with the plant's preferred range shaded. */
export function MoistureChart({ series, target, locale, title, targetLabel }: { series: MetricSeries; target: { min: number; max: number }; locale: Locale; title: string; targetLabel: string }) {
  return <TimeSeriesChart series={series} title={title} locale={locale} band={{ ...target, label: `${targetLabel} ${target.min}–${target.max} %` }} decimals={0} />;
}
