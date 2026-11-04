"use client";

import type { GardenController } from "../hooks/useGardenController";
import type { Locale } from "../types";
import { getMessages, localizePlant } from "../data/i18n";
import { EXISTING_PLANTS, RECOMMENDED_PLANTS, getPlant } from "../data/plants";
import { PlantInfoPanel } from "../overlays/PlantInfoPanel";
import { Eyebrow, ListButton, Paragraph } from "../overlays/ui";

/** Stage 2 — recommended species per bed, plus existing trees recognised on site. */
export function PlantingStage({ garden, locale }: { garden: GardenController; locale: Locale }) {
  const t = getMessages(locale);
  const plant = garden.selection?.type === "plant" ? getPlant(garden.selection.id) : undefined;
  if (plant) return <PlantInfoPanel plant={plant} locale={locale} />;
  return (
    <div>
      <Paragraph>{t.planting.intro}</Paragraph>
      <div className="mt-3">
        <Eyebrow>{t.planting.recommended}</Eyebrow>
        <div className="mt-1 space-y-0.5">
          {[...RECOMMENDED_PLANTS].sort((a, b) => (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0)).map((p) => {
            const lp = localizePlant(p, locale);
            return (
              <ListButton key={p.id} onClick={() => garden.select({ type: "plant", id: p.id })} testId={`plant-${p.id}`}>
                <span>
                  <span className="text-[#1F2D26]">{lp.commonName}</span>
                  <span className="ml-1.5 text-[11px] italic text-[#56635C]">{lp.species}</span>
                </span>
                <span className="rounded-full bg-[#EEF8F1] px-2 text-[11px] font-semibold text-[#1B4332]">{p.recommendationScore}</span>
              </ListButton>
            );
          })}
        </div>
      </div>
      <div className="mt-3">
        <Eyebrow>{t.planting.existingRecognised}</Eyebrow>
        <div className="mt-1 space-y-0.5">
          {EXISTING_PLANTS.map((p) => (
            <ListButton key={p.id} onClick={() => garden.select({ type: "plant", id: p.id })} testId={`plant-${p.id}`}>
              <span className="text-[#1F2D26]">{localizePlant(p, locale).commonName}</span>
              <span className="text-[11px] italic text-[#56635C]">{p.species}</span>
            </ListButton>
          ))}
        </div>
      </div>
    </div>
  );
}
