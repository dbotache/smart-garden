"use client";

import type { GardenController } from "../hooks/useGardenController";
import type { IrrigationMode, Locale, WeatherScenarioId } from "../types";
import { getMessages, formatNumber, localizePlant } from "../data/i18n";
import { getPlant, plantForZone } from "../data/plants";
import { deviceForSelection } from "../utils/selection";
import { IrrigationDecision } from "../overlays/IrrigationDecision";
import { Badge, Eyebrow, ListButton, Paragraph } from "../overlays/ui";

function Segmented<T extends string>({ value, options, onChange, label, testId }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; label: string; testId: string }) {
  return (
    <div role="group" aria-label={label} className="grid grid-flow-col gap-1 rounded-lg bg-[#f1f3ef] p-0.5" data-testid={testId}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-md px-2 py-1 text-[12px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#2D6A4F] ${value === o.id ? "bg-white text-[#1B4332] shadow-sm ring-1 ring-[#dfe6dd]" : "text-[#56635C] hover:text-[#1B4332]"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Stage 4 — decide per zone, compare with a fixed timer, then play the watering. */
export function IrrigationStage({ garden, locale }: { garden: GardenController; locale: Locale }) {
  const t = getMessages(locale);
  const { plan, comparison, demo, weather, mode } = garden;
  const device = deviceForSelection(garden.selection);
  const selectedPlantId = garden.selection?.type === "plant" ? garden.selection.id : device?.plantingZoneId ? plantForZone(device.plantingZoneId)?.id : undefined;
  const selected = plan.decisions.find((d) => d.plantId === selectedPlantId);
  const tone = { water: "blue", defer: "amber", skip: "gray" } as const;

  return (
    <div data-testid="irrigation-panel" data-demo-status={demo.status} data-mode={mode} data-weather={weather.id}>
      <Paragraph>{t.irrigation.intro}</Paragraph>

      <div className="mt-2.5 space-y-2">
        <div>
          <Eyebrow>{t.irrigation.weather}</Eyebrow>
          <Segmented<WeatherScenarioId> value={weather.id} onChange={garden.setWeatherId} label={t.irrigation.weather} testId="weather-toggle" options={[{ id: "dry-spell", label: t.irrigation.scenarios["dry-spell"] }, { id: "rain-expected", label: t.irrigation.scenarios["rain-expected"] }]} />
          <p className="mt-0.5 text-[10.5px] text-[#6b776f]">{t.irrigation.scenarioDetail(weather.forecastRainMm, weather.forecastProbability, locale)}</p>
        </div>
        <div>
          <Eyebrow>{t.irrigation.mode}</Eyebrow>
          <Segmented<IrrigationMode> value={mode} onChange={garden.setMode} label={t.irrigation.mode} testId="mode-toggle" options={[{ id: "adaptive", label: t.irrigation.modes.adaptive }, { id: "scheduled", label: t.irrigation.modes.scheduled }]} />
          <p className="mt-0.5 text-[10.5px] text-[#6b776f]">{t.irrigation.modeDetail[mode]}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={garden.runIrrigation}
        disabled={demo.status === "running"}
        data-testid="run-irrigation"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B4332] px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#2D6A4F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D6A4F] disabled:cursor-progress disabled:opacity-80"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M7 1C7 1 2.5 6.2 2.5 9a4.5 4.5 0 0 0 9 0C11.5 6.2 7 1 7 1Z" fill="#52B788" /></svg>
        {demo.status === "running" ? t.irrigation.running : demo.status === "done" ? t.irrigation.replay : t.irrigation.run}
      </button>

      <div className="mt-3 grid grid-cols-2 gap-2" data-testid="irrigation-summary">
        <div className="rounded-lg bg-[#f4f7f3] p-2">
          <p className="text-[10.5px] text-[#56635C]">{t.irrigation.total}</p>
          <p className="text-[19px] font-semibold text-[#1F2D26]" data-testid="total-liters">{formatNumber(plan.totalLiters, locale, 1)} L</p>
        </div>
        <div className="rounded-lg bg-[#f4f7f3] p-2">
          <p className="text-[10.5px] text-[#56635C]">{t.irrigation.zones}</p>
          <p className="text-[19px] font-semibold text-[#1F2D26]">{plan.zonesWatered} / {plan.decisions.length}</p>
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {plan.zonesOverWatered > 0 && <Badge tone="blue">{plan.zonesOverWatered} × {t.irrigation.overWatered}</Badge>}
        {plan.zonesStillDry > 0 && <Badge tone="red">{plan.zonesStillDry} × {t.irrigation.stillDry}</Badge>}
      </div>
      <p className="mt-1.5 text-[12px] font-semibold text-[#2D6A4F]" data-testid="savings">{t.irrigation.saved(comparison.savedLiters, comparison.savedPct, locale)}</p>

      <div className="mt-3 border-t border-[#e6ebe5] pt-2.5">
        {selected ? (
          <IrrigationDecision decision={selected} locale={locale} />
        ) : (
          <div className="space-y-0.5">
            {plan.decisions.map((d) => (
              <ListButton key={d.zoneId} onClick={() => garden.select({ type: "plant", id: d.plantId })} testId={`decision-${d.plantId}`}>
                <span className="text-[#1F2D26]">{localizePlant(getPlant(d.plantId)!, locale).commonName}</span>
                <Badge tone={tone[d.action]}>
                  {t.irrigation.actions[d.action]}
                  {d.volumeLiters > 0 ? ` · ${formatNumber(d.volumeLiters, locale, 0)} L` : ""}
                </Badge>
              </ListButton>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
