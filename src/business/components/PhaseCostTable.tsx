"use client";

import { phaseCosts, type Range } from "../utils/operatingCosts";
import { euro, num } from "../utils/money";
import { pt } from "./ui";

const fmt = (r: Range) => {
  if (r.low === 0 && r.high === 0) return "–";
  if (Math.round(r.low) === Math.round(r.high)) return euro(r.low, 0);
  const k = (v: number) => (v >= 1000 ? `${num(Math.round(v / 100) / 10, 1)} T€` : euro(v, 0));
  return r.low >= 1000 && r.high >= 1000 ? `${num(Math.round(r.low / 100) / 10, 1)}–${k(r.high)}` : `${euro(r.low, 0)}–${k(r.high)}`;
};

/** Costs per phase without staff: one-off, running, advertising. Figures from utils/operatingCosts.ts. */
export function PhaseCostTable() {
  const r = phaseCosts();
  return (
    <div className="flex h-full w-full flex-col" data-testid="phase-costs" data-total-low={Math.round(r.total.low)} data-total-high={Math.round(r.total.high)}>
      <div className="flex items-baseline justify-between">
        <p className="u-fs-11 font-bold uppercase tracking-[0.08em] text-pw-700">Kosten je Phase · ohne Personal</p>
        <p className="u-fs-9 text-pw-muted">Werbung: Annahmen aus Marktwerten 2026, im Test messen</p>
      </div>
      <div className="u-mt-4 grid flex-1 grid-cols-4 u-gap-8">
        {r.phases.map((p) => (
          <article key={p.id} className="flex min-w-0 flex-col u-r-8 bg-pw-50 u-px-10 u-py-6" data-testid={`phase-cost-${p.id}`} data-marketing-low={Math.round(p.marketing.low)}>
            <p className="u-fs-11 font-bold leading-tight text-pw-900">{p.phase}</p>
            <p className="truncate u-fs-8 text-pw-muted">{p.goal}</p>
            {[
              { k: "Einmalig", v: fmt(p.oneOff), sub: p.oneOffNote },
              { k: "Laufend", v: p.running, sub: "" },
              { k: "Werbung", v: p.marketing.base ? `${fmt({ low: p.marketing.base, high: p.marketing.base })}` : fmt(p.marketing), sub: p.marketing.base ? `${fmt(p.marketing)} · ${p.marketingNote}` : p.marketingNote },
            ].map((row) => (
              <div key={row.k} className="border-t border-pw-200 u-pt-2" style={{ marginTop: pt(3) }}>
                <div className="flex items-baseline justify-between u-gap-4">
                  <span className="u-fs-9 font-bold uppercase tracking-[0.05em] text-pw-muted">{row.k}</span>
                  <span className="text-right u-fs-11 font-bold tabular-nums text-pw-900">{row.v}</span>
                </div>
                {row.sub && <p className="u-fs-8 leading-tight text-pw-muted">{row.sub}</p>}
              </div>
            ))}
          </article>
        ))}
      </div>
      <p className="u-mt-4 u-fs-10 leading-snug text-pw-ink">
        <b>Bis Phase 3 zusammen {fmt(r.total)}</b> für Geräte, Zulassung und Werbung, dazu der Betrieb. Nur über Anzeigen kostet ein zahlender Kunde bei 5 % ca. {euro(r.cacPerPaying.base, 0)} – der Plan rechnet mit 25 €; günstigere Kanäle (Vereine, Influencer, Weiterempfehlung) müssen das senken.
      </p>
    </div>
  );
}
