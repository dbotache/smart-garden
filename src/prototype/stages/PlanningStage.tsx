"use client";

import type { GardenController } from "../hooks/useGardenController";
import type { Locale } from "../types";
import { getMessages, formatNumber } from "../data/i18n";
import { PLANTING_ZONES, getZone, rectArea } from "../data/site";
import { ZoneInfoPanel } from "../overlays/ZoneInfoPanel";
import { Eyebrow, ListButton, Paragraph } from "../overlays/ui";

/** Stage 1 — house, terrain, boundaries, paths and potential planting zones. */
export function PlanningStage({ garden, locale }: { garden: GardenController; locale: Locale }) {
  const t = getMessages(locale);
  const zone = garden.selection?.type === "zone" ? getZone(garden.selection.id) : undefined;
  if (zone) return <ZoneInfoPanel zone={zone} locale={locale} />;
  return (
    <div>
      <Paragraph>{t.planning.intro}</Paragraph>
      <div className="mt-3">
        <Eyebrow>{t.planning.zonesTitle}</Eyebrow>
        <div className="mt-1 space-y-0.5">
          {PLANTING_ZONES.map((z) => (
            <ListButton key={z.id} onClick={() => garden.select({ type: "zone", id: z.id })} testId={`zone-${z.id}`}>
              <span className="text-[#1F2D26]">{t.zoneLabel(z)}</span>
              <span className="text-[11px] text-[#56635C]">
                {formatNumber(rectArea(z.bounds), locale, 1)} m² · {t.sun[z.sunExposure]}
              </span>
            </ListButton>
          ))}
        </div>
      </div>
    </div>
  );
}
