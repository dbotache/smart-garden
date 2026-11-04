"use client";

import type { GardenPlant, Locale } from "../types";
import { getMessages, localizePlant } from "../data/i18n";
import { getZone } from "../data/site";
import { Badge, Eyebrow, PanelTitle, Paragraph, Row } from "./ui";

/** Plant name, species, score, reason and requirements. */
export function PlantInfoPanel({ plant, locale }: { plant: GardenPlant; locale: Locale }) {
  const t = getMessages(locale);
  const p = localizePlant(plant, locale);
  const zone = getZone(plant.plantingZoneId);
  const existing = plant.origin === "existing";
  return (
    <div data-testid="plant-panel" data-plant-id={plant.id}>
      <div className="flex items-center justify-between gap-2">
        <Eyebrow>{existing ? t.planting.existingRecognised : t.planting.recommended}</Eyebrow>
        <Badge tone="gray">{t.demoBadge}</Badge>
      </div>
      <PanelTitle sub={p.species}>{p.commonName}</PanelTitle>

      {p.recommendationScore !== undefined ? (
        <div className="mt-3 flex items-center gap-3">
          <ScoreRing score={p.recommendationScore} />
          <div className="text-[12px] text-[#56635C]">{t.planting.score}</div>
        </div>
      ) : (
        <p className="mt-2 text-[12px] text-[#56635C]">{t.planting.noScore}</p>
      )}

      {p.recommendationReason && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2D6A4F]">{t.planting.why}</p>
          <Paragraph>{p.recommendationReason}</Paragraph>
        </div>
      )}

      <div className="mt-3">
        <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#2D6A4F]">{t.planting.requirements}</p>
        <Row label={t.planting.sunlight} value={p.sunlightRequirement} />
        <Row label={t.planting.moistureTarget} value={`${p.moistureTarget.min}–${p.moistureTarget.max} %`} />
        {zone && <Row label={t.planting.zone} value={`${t.zoneLabel(zone)} · ${t.sun[zone.sunExposure]}`} />}
      </div>
      {!existing && <p className="mt-2 text-[10.5px] text-[#7b877f]">{t.planting.exampleData}</p>}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" role="img" aria-label={`${score}/100`}>
      <circle cx="23" cy="23" r={r} fill="none" stroke="#e3ebe4" strokeWidth="5" />
      <circle cx="23" cy="23" r={r} fill="none" stroke="#2D6A4F" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} transform="rotate(-90 23 23)" />
      <text x="23" y="27" textAnchor="middle" className="fill-[#1F2D26] text-[12px] font-semibold">
        {score}
      </text>
    </svg>
  );
}
