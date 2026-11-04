"use client";

import type { Locale, PlantingZone } from "../types";
import { getMessages, formatNumber } from "../data/i18n";
import { rectArea } from "../data/site";
import { Badge, Eyebrow, PanelTitle, Row } from "./ui";

/** Planning stage: what we know about a potential planting area. */
export function ZoneInfoPanel({ zone, locale }: { zone: PlantingZone; locale: Locale }) {
  const t = getMessages(locale);
  const [w, d] = [zone.bounds.maxX - zone.bounds.minX, zone.bounds.maxZ - zone.bounds.minZ];
  return (
    <div data-testid="zone-panel" data-zone-id={zone.id}>
      <div className="flex items-center justify-between gap-2">
        <Eyebrow>{t.planning.zonesTitle}</Eyebrow>
        <Badge tone="gray">{t.demoBadge}</Badge>
      </div>
      <PanelTitle>{t.zoneLabel(zone)}</PanelTitle>
      <div className="mt-2">
        <Row label={t.planning.area} value={`${formatNumber(w, locale, 1)} × ${formatNumber(d, locale, 1)} m = ${formatNumber(rectArea(zone.bounds), locale, 1)} m²`} />
        <Row label={t.planning.sun} value={t.sun[zone.sunExposure]} />
        <Row label={t.planning.soil} value={t.soil(zone)} />
        <Row label={t.planning.status} value={zone.kind === "raised-bed" ? t.planning.planned : t.planning.existing} />
      </div>
    </div>
  );
}
