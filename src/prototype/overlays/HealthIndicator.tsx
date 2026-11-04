"use client";

import type { Locale, MetricSeries } from "../types";
import type { Messages } from "../data/i18n";
import { healthBand } from "../utils/health";
import { summarize } from "../utils/timeseries";
import { Badge, SourceBadge } from "./ui";
import { TimeSeriesChart } from "./TimeSeriesChart";

/**
 * ESTIMATED care status. Always shown with the "estimated" badge, a dashed line and the method note —
 * the system has no sensor that measures plant health directly.
 */
export function HealthIndicator({ series, locale, messages }: { series: MetricSeries; locale: Locale; messages: Messages }) {
  const s = summarize(series.points);
  if (!s) return null;
  const band = healthBand(s.latest);
  const tone = band === "good" ? "green" : band === "watch" ? "amber" : "red";
  return (
    <div className="rounded-lg border border-dashed border-[#e7c9a0] bg-[#fffaf3] p-2.5" data-testid="health-indicator">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold text-[#1F2D26]">{messages.monitoring.healthTitle}</span>
        <SourceBadge source="estimated" labels={messages.monitoring} />
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-[22px] font-semibold text-[#1F2D26]">{s.latest}</span>
        <span className="text-[11px] text-[#56635C]">/100</span>
        <Badge tone={tone}>{messages.monitoring.health[band]}</Badge>
      </div>
      <TimeSeriesChart series={series} title={messages.metrics["health-index"]} locale={locale} compact height={34} decimals={0} />
      <p className="mt-1 text-[11px] leading-snug text-[#6b5a3c]">{messages.monitoring.estimatedNote}</p>
    </div>
  );
}
