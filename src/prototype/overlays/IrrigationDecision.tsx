"use client";

import type { IrrigationDecision as Decision, Locale } from "../types";
import { getMessages, formatNumber, localizePlant } from "../data/i18n";
import { getPlant } from "../data/plants";
import { Badge, Eyebrow, PanelTitle, Paragraph, Row } from "./ui";

const TONE = { water: "blue", defer: "amber", skip: "gray" } as const;

/** Plain-language explanation of one zone's decision (replaces the original's window.alert, audit #14). */
export function IrrigationDecision({ decision, locale }: { decision: Decision; locale: Locale }) {
  const t = getMessages(locale);
  const plant = getPlant(decision.plantId);
  if (!plant) return null;
  const name = localizePlant(plant, locale).commonName;
  return (
    <div data-testid="decision-panel" data-plant-id={plant.id}>
      <div className="flex items-center justify-between gap-2">
        <Eyebrow>{t.irrigation.decisionTitle}</Eyebrow>
        <Badge tone={TONE[decision.action]}>{t.irrigation.actions[decision.action]}</Badge>
      </div>
      <PanelTitle>{name}</PanelTitle>
      <div className="mt-1.5">
        <Paragraph>{t.irrigation.explain(decision, name, locale)}</Paragraph>
      </div>
      <div className="mt-2">
        <Row label={t.metrics["soil-moisture"]} value={`${formatNumber(decision.moistureBefore, locale)} %`} />
        <Row label={t.monitoring.target} value={`${decision.target.min}–${decision.target.max} %`} />
        {decision.volumeLiters > 0 && (
          <>
            <Row label={t.irrigation.volume} value={`${formatNumber(decision.volumeLiters, locale, 1)} L`} />
            <Row label={t.irrigation.duration} value={`${decision.durationMinutes} min`} />
            <Row label={t.irrigation.after} value={`${formatNumber(decision.moistureAfter, locale)} %`} />
          </>
        )}
      </div>
    </div>
  );
}
