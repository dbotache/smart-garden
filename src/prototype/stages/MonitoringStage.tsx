"use client";

import type { GardenController } from "../hooks/useGardenController";
import type { Locale } from "../types";
import { getMessages, formatNumber, localizePlant } from "../data/i18n";
import { CURRENT_SOIL_MOISTURE, CURRENT_WEATHER, SENSOR_DEVICES } from "../data/sensors";
import { getPlant, plantForZone } from "../data/plants";
import { deviceForSelection } from "../utils/selection";
import { moistureStatus } from "../utils/timeseries";
import { SensorDashboard } from "../overlays/SensorDashboard";
import { PlantInfoPanel } from "../overlays/PlantInfoPanel";
import { Eyebrow, ListButton, Paragraph, SourceBadge } from "../overlays/ui";
import { STATUS } from "../utils/palette";

/** Stage 3 — measured soil + weather data per bed; health only as an explicit estimate. */
export function MonitoringStage({ garden, locale }: { garden: GardenController; locale: Locale }) {
  const t = getMessages(locale);
  const device = deviceForSelection(garden.selection);
  if (device) return <SensorDashboard device={device} locale={locale} />;
  if (garden.selection?.type === "plant") {
    const plant = getPlant(garden.selection.id);
    if (plant)
      return (
        <div>
          <PlantInfoPanel plant={plant} locale={locale} />
          <p className="mt-3 rounded-lg bg-[#f6f6f2] p-2 text-[11.5px] text-[#56635C]" data-testid="no-sensor">{t.monitoring.noSensor}</p>
        </div>
      );
  }
  const statusLabel = { below: t.monitoring.statusBelow, within: t.monitoring.statusWithin, above: t.monitoring.statusAbove };
  return (
    <div>
      <Paragraph>{t.monitoring.intro}</Paragraph>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <SourceBadge source="measured" labels={t.monitoring} />
        <SourceBadge source="estimated" labels={t.monitoring} />
      </div>
      <div className="mt-3">
        <Eyebrow>{t.metrics["soil-moisture"]}</Eyebrow>
        <div className="mt-1 space-y-0.5">
          {SENSOR_DEVICES.filter((d) => d.kind === "soil-probe").map((d) => {
            const plant = plantForZone(d.plantingZoneId!)!;
            const v = CURRENT_SOIL_MOISTURE[d.plantingZoneId!]!;
            const s = moistureStatus(v, plant.moistureTarget);
            return (
              <ListButton key={d.id} onClick={() => garden.select({ type: "sensor", id: d.id })} testId={`sensor-${d.id}`}>
                <span className="text-[#1F2D26]">{localizePlant(plant, locale).commonName}</span>
                <span className="flex items-center gap-1.5 text-[11.5px]">
                  <span className="h-2 w-2 rounded-full" style={{ background: STATUS[s] }} aria-hidden />
                  <span className="font-semibold text-[#1F2D26]">{v} %</span>
                  <span className="text-[#56635C]">{statusLabel[s]}</span>
                </span>
              </ListButton>
            );
          })}
          <ListButton onClick={() => garden.select({ type: "sensor", id: "weather-station" })} testId="sensor-weather-station">
            <span className="text-[#1F2D26]">{t.monitoring.station}</span>
            <span className="text-[11.5px] font-semibold text-[#1F2D26]">
              {formatNumber(CURRENT_WEATHER.airTemperatureC, locale, 1)} °C · {CURRENT_WEATHER.relativeHumidity} % · {CURRENT_WEATHER.lightKlx} klx
            </span>
          </ListButton>
        </div>
      </div>
    </div>
  );
}
