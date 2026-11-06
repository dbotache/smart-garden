"use client";

import { useState } from "react";
import { CATEGORY_LABEL, FLEET_SIZES, NOT_INCLUDED, PROTOTYPES, RESERVE_RATE, type Prototype } from "../data/prototypes";
import { byCategory, fleetBudget, lineTotal, materialSum, planBudget, reserve } from "../utils/prototypeCosts";
import { euro, num } from "../utils/money";
import { AnimatedNumber, Segmented, pt, useEntered } from "./ui";

const fmt = (v: number) => euro(v, 2);
const fmt0 = (v: number) => euro(v, 0);

/** Nice axis maximum (1, 2, 2.5, 5 × 10^n) above v */
function niceMax(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

/**
 * Slide 9 body (873 × 388 pt): three prototypes with animated budgets, a shared-scale comparison that scales to
 * pilot fleets, and the cost breakdown / parts list of the selected prototype.
 */
export function PrototypeCosts({ initial = "p2" }: { initial?: Prototype["id"] }) {
  const [selectedId, setSelectedId] = useState<Prototype["id"]>(initial);
  const [units, setUnits] = useState<(typeof FLEET_SIZES)[number]>(1);
  const [showBom, setShowBom] = useState(false);
  const entered = useEntered();
  const selected = PROTOTYPES.find((p) => p.id === selectedId)!;
  const axisMax = niceMax(Math.max(...PROTOTYPES.map((p) => Math.max(p.range[1], planBudget(p)) * units)));
  const w = (v: number) => (entered ? `${(v / axisMax) * 100}%` : "0%");

  return (
    <div className="relative h-full w-full" data-testid="prototype-costs" data-selected={selectedId} data-units={units}>
      {/* three prototypes */}
      <div className="grid grid-cols-3 u-gap-9" style={{ height: pt(150) }}>
        {PROTOTYPES.map((p) => {
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={active}
              data-testid={`prototype-${p.number}`}
              onClick={() => {
                setSelectedId(p.id);
                setShowBom(false);
              }}
              className={`flex flex-col u-r-10 u-px-14 u-py-10 text-left transition-[background-color,transform,box-shadow] duration-300 hover:-translate-y-px ${active ? "bg-pw-900 text-white shadow-[0_6px_18px_rgba(27,67,50,0.25)]" : "bg-pw-50 text-pw-ink"}`}
            >
              <span className="flex items-center justify-between">
                <span className={`u-fs-11 font-bold tracking-[0.08em] ${active ? "text-pw-200" : "text-pw-muted"}`}>PROTOTYP {p.number}</span>
                <span className={`u-r-10 u-px-8 u-fs-10 font-bold ${active ? "bg-pw-400 text-pw-900" : "bg-pw-200 text-pw-900"}`} style={{ paddingBlock: pt(1) }}>
                  {p.recommendation}
                </span>
              </span>
              <span className="flex items-start justify-between u-gap-8">
                <span className="min-w-0">
                  <span className={`block whitespace-nowrap font-serif u-fs-17 font-bold leading-tight ${active ? "text-white" : "text-pw-900"}`}>{p.name}</span>
                  <span className={`block u-fs-11 leading-snug ${active ? "text-pw-200" : "text-pw-muted"}`}>{p.goal}</span>
                </span>
                <span className="shrink-0 text-right">
                  <AnimatedNumber value={planBudget(p)} format={fmt} testId={`budget-${p.number}`} className={`block font-serif u-fs-20 font-bold leading-none ${active ? "text-white" : "text-pw-700"}`} />
                  <span className={`block u-mt-2 u-fs-9 ${active ? "text-pw-200" : "text-pw-muted"}`}>Planbudget · Spanne {p.range[0]}–{p.range[1]} €</span>
                </span>
              </span>
              <span className="mt-auto grid grid-cols-3 gap-x-[calc(var(--pt)*8)] gap-y-[calc(var(--pt)*2)] u-fs-11 leading-tight">
                {[
                  ["Fläche", p.area],
                  ["Verbindung", p.connection],
                  ["Entwicklung", p.development],
                  ["Strom", p.power],
                ].map(([k, v]) => (
                  <span key={k} className={`min-w-0 ${k === "Strom" ? "col-span-3" : ""}`}>
                    <span className={`block u-fs-9 font-bold uppercase tracking-[0.05em] ${active ? "text-pw-200" : "text-pw-muted"}`}>{k}</span>
                    <span className="block truncate" title={v}>{v}</span>
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* comparison on one scale */}
      <div className="absolute left-0 flex flex-col u-r-10 bg-pw-50 u-px-14 u-py-8" style={{ top: pt(160), width: pt(530), height: pt(228) }}>
        <div className="flex items-end justify-between">
          <h3 className="u-fs-14 font-bold text-pw-900">Materialbudget im Vergleich</h3>
          <div style={{ width: pt(190) }}>
            <Segmented label="Anzahl Pilotgeräte" options={FLEET_SIZES} value={units} onChange={setUnits} format={(v) => `${v}×`} testId="fleet-size" />
          </div>
        </div>
        <div className="u-mt-10 flex flex-col u-gap-8" role="img" aria-label={PROTOTYPES.map((p) => `Prototyp ${p.number}: ${fmt(fleetBudget(p, units))}`).join(", ")}>
          {PROTOTYPES.map((p) => {
            const mat = materialSum(p) * units;
            const res = reserve(p) * units;
            return (
              <div key={p.id} className="flex items-center u-gap-8" style={{ height: pt(26) }}>
                <span className={`shrink-0 u-fs-11 font-bold ${p.id === selectedId ? "text-pw-900" : "text-pw-muted"}`} style={{ width: pt(64) }}>
                  Prototyp {p.number}
                </span>
                <span className="relative h-full flex-1">
                  {/* rough range of the document, shown as a whisker behind the bar */}
                  <span className="absolute top-1/2 border-t border-pw-muted/60 motion-safe:transition-[left,width] motion-safe:duration-700" style={{ left: w(p.range[0] * units), width: entered ? `${((p.range[1] - p.range[0]) * units / axisMax) * 100}%` : "0%" }} aria-hidden>
                    <span className="absolute -top-[calc(var(--pt)*5)] left-0 h-[calc(var(--pt)*9)] border-l border-pw-muted/60" />
                    <span className="absolute -top-[calc(var(--pt)*5)] right-0 h-[calc(var(--pt)*9)] border-r border-pw-muted/60" />
                  </span>
                  <span className="absolute inset-y-[calc(var(--pt)*5)] left-0 flex overflow-hidden motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out" aria-hidden style={{ width: w(mat + res), borderTopRightRadius: pt(4), borderBottomRightRadius: pt(4) }}>
                    <span className={`h-full ${p.id === selectedId ? "bg-pw-900" : "bg-pw-700"}`} style={{ width: `${(mat / (mat + res)) * 100}%` }} />
                    <span className="h-full flex-1 border-l-2 border-pw-50 bg-pw-400" />
                  </span>
                </span>
                <AnimatedNumber value={fleetBudget(p, units)} format={fmt0} className="shrink-0 text-right u-fs-13 font-bold text-pw-900" testId={`fleet-${p.number}`} />
              </div>
            );
          })}
          <div className="flex items-center u-gap-8" aria-hidden>
            <span style={{ width: pt(64) }} />
            <span className="relative flex-1 u-fs-8 text-pw-muted" style={{ height: pt(10) }}>
              {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <span key={t} className="absolute -translate-x-1/2 whitespace-nowrap tabular-nums" style={{ left: `${t * 100}%` }}>
                  {num(axisMax * t)} €
                </span>
              ))}
            </span>
            <span style={{ width: pt(64) }} />
          </div>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-x-[calc(var(--pt)*12)] u-fs-10 text-pw-muted">
          <span className="flex items-center u-gap-4"><i className="inline-block bg-pw-700" style={{ width: pt(10), height: pt(8) }} />Material (Stückliste)</span>
          <span className="flex items-center u-gap-4"><i className="inline-block bg-pw-400" style={{ width: pt(10), height: pt(8) }} />Reserve {RESERVE_RATE * 100} %</span>
          <span className="flex items-center u-gap-4"><i className="inline-block border-x border-t border-pw-muted/60" style={{ width: pt(12), height: pt(4) }} />grobe Budgetspanne</span>
        </div>
        <p className="u-mt-2 u-fs-9 leading-snug text-pw-muted">Endkunden-Einzelpreise inkl. USt., keine Händlerangebote. {NOT_INCLUDED}</p>
      </div>

      {/* breakdown of the selected prototype */}
      <div className="absolute right-0 flex flex-col u-r-10 bg-pw-50 u-px-14 u-py-8" style={{ top: pt(160), width: pt(334), height: pt(228) }} data-testid="prototype-breakdown">
        <div className="flex items-baseline justify-between">
          <h3 className="u-fs-14 font-bold text-pw-900">Prototyp {selected.number}: wofür das Geld ist</h3>
          <button type="button" onClick={() => setShowBom(true)} className="u-fs-10 font-bold text-pw-700 underline-offset-2 hover:underline" data-testid="show-bom">
            Stückliste ({selected.bom.length})
          </button>
        </div>
        <ul className="u-mt-4 flex flex-col u-gap-2">
          {byCategory(selected).map((c) => (
            <li key={c.category} className="flex items-center u-gap-6 u-fs-11">
              <span className="shrink-0 truncate text-pw-ink" style={{ width: pt(118) }}>{CATEGORY_LABEL[c.category]}</span>
              <span className="relative flex-1 bg-white" style={{ height: pt(7), borderRadius: pt(2) }} aria-hidden>
                <span className="absolute inset-y-0 left-0 bg-pw-700 motion-safe:transition-[width] motion-safe:duration-700" style={{ width: entered ? `${c.share * 100}%` : "0%", borderRadius: pt(2) }} />
              </span>
              <span className="shrink-0 text-right tabular-nums font-bold text-pw-900" style={{ width: pt(54) }}>{euro(c.sum, 2)}</span>
            </li>
          ))}
        </ul>
        <dl className="u-mt-6 grid grid-cols-[1fr_auto] gap-y-[calc(var(--pt)*1)] border-t border-pw-200 pt-[calc(var(--pt)*4)] u-fs-11 tabular-nums">
          <dt>Materialsumme</dt><dd className="text-right">{fmt(materialSum(selected))}</dd>
          <dt>+ Reserve {RESERVE_RATE * 100} %</dt><dd className="text-right">{fmt(reserve(selected))}</dd>
          <dt className="font-bold text-pw-900">Planbudget</dt><dd className="text-right font-bold text-pw-900" data-testid="breakdown-budget">{fmt(planBudget(selected))}</dd>
        </dl>
        <p className="mt-auto u-fs-9 leading-snug text-pw-muted">{[selected.running, ...selected.notes].filter(Boolean).join(" · ")}</p>
      </div>

      {showBom && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col u-r-10 bg-white u-px-14 u-py-8 shadow-[0_8px_30px_rgba(27,67,50,0.22)] ring-1 ring-pw-200" style={{ top: pt(160) }} role="dialog" aria-label={`Stückliste Prototyp ${selected.number}`} data-testid="bom">
          <div className="flex items-baseline justify-between">
            <h3 className="u-fs-14 font-bold text-pw-900">Stückliste Prototyp {selected.number} · {selected.name}</h3>
            <button type="button" onClick={() => setShowBom(false)} className="u-fs-11 font-bold text-pw-700 hover:underline" data-testid="close-bom">Schließen ✕</button>
          </div>
          <div className="u-mt-4 columns-2 gap-x-[calc(var(--pt)*20)] u-fs-10 leading-snug">
            {selected.bom.map((l) => (
              <div key={l.part} className="grid break-inside-avoid items-baseline u-gap-6 border-b border-pw-50 py-[calc(var(--pt)*1.5)]" style={{ gridTemplateColumns: `1fr ${pt(60)} ${pt(46)}` }}>
                <span className="min-w-0 truncate" title={l.part}>{l.part}</span>
                <span className="tabular-nums text-pw-muted">{l.qtyLabel ?? `${l.qty} ×`}{l.qty > 1 ? ` ${euro(l.unit)}` : ""}</span>
                <span className="text-right tabular-nums font-bold">{euro(lineTotal(l))}</span>
              </div>
            ))}
          </div>
          <p className="mt-auto u-fs-10 tabular-nums text-pw-ink">
            Materialsumme <b>{fmt(materialSum(selected))}</b> · Reserve {fmt(reserve(selected))} · Planbudget <b>{fmt(planBudget(selected))}</b>
            {selected.statedMaterial !== materialSum(selected) && <span className="text-pw-muted"> · nachgerechnet (Vorlage nannte {fmt(selected.statedMaterial)} Material)</span>}
          </p>
        </div>
      )}
    </div>
  );
}
