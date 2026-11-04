"use client";

import type { Locale, MetricKind, SensorDevice } from "../types";
import { getMessages, formatNumber, localizePlant } from "../data/i18n";
import { DEMO_TIMESTAMP_LABEL, getDeviceSeries } from "../data/sensors";
import { plantForZone } from "../data/plants";
import { moistureStatus, summarize } from "../utils/timeseries";
import { Badge, Eyebrow, PanelTitle, SourceBadge } from "./ui";
import { MoistureChart } from "./MoistureChart";
import { TimeSeriesChart } from "./TimeSeriesChart";
import { HealthIndicator } from "./HealthIndicator";

const DECIMALS: Partial<Record<MetricKind, number>> = { "relative-humidity": 0, light: 0, "soil-moisture": 0 };

/** Detail view for one device: primary chart, compact rows for the other metrics, estimate kept separate. */
export function SensorDashboard({ device, locale }: { device: SensorDevice; locale: Locale }) {
  const t = getMessages(locale);
  const series = getDeviceSeries(device.id);
  const measured = series.filter((s) => s.source === "measured");
  const health = series.find((s) => s.metric === "health-index");
  const plant = device.plantingZoneId ? plantForZone(device.plantingZoneId) : undefined;
  const primary = measured[0];
  const rest = measured.slice(1);

  const title = device.kind === "soil-probe" ? `${t.monitoring.probe} · ${plant ? localizePlant(plant, locale).commonName : ""}` : t.monitoring.station;
  const moisture = measured.find((s) => s.metric === "soil-moisture");
  const latest = moisture ? summarize(moisture.points)?.latest : undefined;
  const status = plant && latest !== undefined ? moistureStatus(latest, plant.moistureTarget) : undefined;
  const statusLabel = status === "below" ? t.monitoring.statusBelow : status === "above" ? t.monitoring.statusAbove : t.monitoring.statusWithin;

  return (
    <div data-testid="sensor-panel" data-device-id={device.id}>
      <div className="flex items-center justify-between gap-2">
        <Eyebrow>{DEMO_TIMESTAMP_LABEL}</Eyebrow>
        <Badge tone="gray">{t.demoBadge}</Badge>
      </div>
      <PanelTitle>{title}</PanelTitle>

      {primary && (
        <div className="mt-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[12px] font-semibold text-[#1F2D26]">{t.metrics[primary.metric]}</span>
            <SourceBadge source="measured" labels={t.monitoring} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-semibold leading-tight text-[#1F2D26]" data-testid="primary-value">
              {formatNumber(summarize(primary.points)!.latest, locale, DECIMALS[primary.metric] ?? 1)} {primary.unit}
            </span>
            {status && <Badge tone={status === "within" ? "green" : status === "below" ? "red" : "blue"}>{statusLabel}</Badge>}
          </div>
          <p className="text-[10.5px] text-[#6b776f]">{t.monitoring.sevenDays}</p>
          {primary.metric === "soil-moisture" && plant ? (
            <MoistureChart series={primary} target={plant.moistureTarget} locale={locale} title={t.metrics[primary.metric]} targetLabel={t.monitoring.target} />
          ) : (
            <TimeSeriesChart series={primary} title={t.metrics[primary.metric]} locale={locale} decimals={DECIMALS[primary.metric] ?? 1} />
          )}
        </div>
      )}

      <ul className="mt-2 space-y-1">
        {rest.map((s) => {
          const sum = summarize(s.points)!;
          const d = DECIMALS[s.metric] ?? 1;
          return (
            <li key={s.metric} className="grid grid-cols-[1fr_auto_88px] items-center gap-2 border-t border-[#e6ebe5] pt-1 text-[12px]">
              <span className="text-[#56635C]">{t.metrics[s.metric]}</span>
              <span className="font-semibold text-[#1F2D26]">
                {formatNumber(sum.latest, locale, d)} {s.unit}
              </span>
              <TimeSeriesChart series={s} title={t.metrics[s.metric]} locale={locale} compact height={26} decimals={d} />
            </li>
          );
        })}
      </ul>

      {health && (
        <div className="mt-3">
          <HealthIndicator series={health} locale={locale} messages={t} />
        </div>
      )}
    </div>
  );
}
