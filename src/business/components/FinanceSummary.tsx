"use client";

import { BASE_PARAMS, MARKS, MIXES, PRESETS, type FinanceParams } from "../data/businessModel";
import { breakEven, customerEconomics, kitEconomics, mixEconomics, monthlyModel } from "../utils/finance";
import { euro, num, signedEuro } from "../utils/money";
import { NEG, POS } from "./FinanceCharts";
import { AnimatedNumber, pt, useEntered } from "./ui";

/**
 * Investor summary of the financial plan: the three year-3 states of the business plan (section 11) side by side,
 * what one paying customer brings (sections 4 and 8), and what the pilot has to validate (section 13).
 * Static on purpose — every figure is computed from the plan's inputs, the interactive model is the next slide.
 */

const SCENARIOS = [
  { id: "vorsichtig", label: "Vorsichtig", preset: "j3-vorsichtig" },
  { id: "realistisch", label: "Realistisch", preset: "j3-basis", note: "Basisszenario" },
  { id: "ambitioniert", label: "Ambitioniert", preset: "j3-ambitioniert" },
] as const;

/** shared scale of the result bars (all three cards), in € per month */
const RESULT_MIN = -5000;
const RESULT_MAX = 20000;
const zeroAt = -RESULT_MIN / (RESULT_MAX - RESULT_MIN);

function scenario(presetId: string) {
  const params = PRESETS.find((p) => p.id === presetId)!.params as FinanceParams;
  const model = monthlyModel(params);
  const be = breakEven(params)!;
  return { params, model, breakEven: be, progress: model.paying / be.paying };
}

export function summaryFigures() {
  const scenarios = SCENARIOS.map((s) => ({ ...s, ...scenario(s.preset) }));
  const unit = mixEconomics(MIXES.basis);
  const customer = customerEconomics(BASE_PARAMS);
  const kit = kitEconomics(BASE_PARAMS.kitPrice);
  return { scenarios, unit, customer, kit };
}

function Row({ label, children, dark, sub }: { label: string; children: React.ReactNode; dark: boolean; sub?: string }) {
  return (
    <div className={`flex items-baseline justify-between u-gap-6 border-t ${dark ? "border-white/15" : "border-pw-200"} u-py-4`}>
      <span className={`u-fs-10 ${dark ? "text-pw-200" : "text-pw-muted"}`}>{label}</span>
      <span className={`text-right u-fs-12 font-bold tabular-nums ${dark ? "text-white" : "text-pw-900"}`}>
        {children}
        {sub && <span className={`block u-fs-8 font-normal ${dark ? "text-pw-200" : "text-pw-muted"}`}>{sub}</span>}
      </span>
    </div>
  );
}

function ScenarioCard({ s, entered }: { s: ReturnType<typeof summaryFigures>["scenarios"][number]; entered: boolean }) {
  const dark = s.id === "realistisch";
  const { model, breakEven: be, progress } = s;
  const positive = model.running >= 0;
  const frac = (Math.min(RESULT_MAX, Math.max(RESULT_MIN, model.running)) - RESULT_MIN) / (RESULT_MAX - RESULT_MIN);
  const barLeft = Math.min(frac, zeroAt);
  const barWidth = Math.abs(frac - zeroAt);
  const reached = progress >= 1;
  const muted = dark ? "text-pw-200" : "text-pw-muted";
  return (
    <article
      className={`relative flex min-w-0 flex-col u-r-10 u-px-12 u-py-10 ${dark ? "bg-pw-900 text-white" : "bg-pw-50 text-pw-ink"}`}
      data-testid={`summary-${s.id}`}
      data-result={Math.round(model.running)}
      aria-label={`${s.label}: ${num(model.paying)} zahlende Kunden, Monatsergebnis ${signedEuro(model.running, 0)}`}
    >
      <div className="flex items-baseline justify-between">
        <p className={`u-fs-11 font-bold uppercase tracking-[0.1em] ${dark ? "text-pw-200" : "text-pw-700"}`}>{s.label}</p>
        {"note" in s && <span className="u-r-6 bg-pw-400 u-px-6 u-fs-8 font-bold text-pw-900">{s.note}</span>}
      </div>

      <p className={`u-mt-6 u-fs-9 font-bold uppercase tracking-[0.06em] ${muted}`}>Zahlende Kunden</p>
      <p className="font-serif u-fs-26 font-bold leading-none">
        <AnimatedNumber value={model.paying} format={(v) => num(v)} />
      </p>
      <p className={`u-mb-6 u-fs-9 ${muted}`}>von {num(model.paying + model.free)} aktiven Nutzern</p>

      <Row label="Netto-Umsatz (MRR)" dark={dark}>{euro(model.mrr, 0)}</Row>
      <Row label="Kosten" dark={dark} sub={`davon Fixkosten ${euro(model.fixedCosts, 0)}`}>
        −{euro(model.fixedCosts + model.freeCosts + model.paidVariable, 0)}
      </Row>

      <div className={`border-t ${dark ? "border-white/15" : "border-pw-200"} u-pt-6`}>
        <p className={`u-fs-9 font-bold uppercase tracking-[0.06em] ${muted}`}>Monatsergebnis</p>
        <p className="font-serif u-fs-22 font-bold leading-tight tabular-nums" style={{ color: positive ? (dark ? "#95d5b2" : POS) : dark ? "#ff9b85" : NEG }}>
          <AnimatedNumber value={model.running} format={(v) => signedEuro(v, 0)} testId={`summary-result-${s.id}`} />
        </p>
        <div className={`relative u-mt-4 ${dark ? "bg-white/10" : "bg-white"} u-r-4`} style={{ height: pt(9) }} title={`Monatsergebnis ${signedEuro(model.running, 0)} (Skala −5 T€ bis +20 T€, gleich für alle Szenarien)`}>
          <div
            className="absolute inset-y-0 u-r-4 motion-safe:transition-all motion-safe:duration-700"
            style={{ left: `${(entered ? barLeft : zeroAt) * 100}%`, width: `${(entered ? barWidth : 0) * 100}%`, background: positive ? (dark ? "#95d5b2" : POS) : NEG }}
          />
          <div className={`absolute ${dark ? "bg-white" : "bg-pw-ink"}`} style={{ left: `${zeroAt * 100}%`, top: pt(-2), bottom: pt(-2), width: 1 }} aria-hidden />
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-baseline justify-between">
          <p className={`u-fs-9 font-bold uppercase tracking-[0.06em] ${muted}`}>Weg zum Break-even</p>
          <p className="u-fs-11 font-bold tabular-nums">{reached ? "erreicht" : `${num(Math.round(progress * 100))} %`}</p>
        </div>
        <div className={`relative u-mt-4 overflow-hidden ${dark ? "bg-white/10" : "bg-white"} u-r-4`} style={{ height: pt(6) }}>
          <div className="absolute inset-y-0 left-0 u-r-4 motion-safe:transition-all motion-safe:duration-700" style={{ width: `${entered ? Math.min(1, progress) * 100 : 0}%`, background: dark ? "#52b788" : "#2d6a4f" }} />
        </div>
        <p className={`u-mt-4 u-fs-9 leading-snug ${muted}`}>
          Break-even ab {num(be.paying)} zahlenden Kunden{reached ? ` – ${num(model.paying - be.paying)} darüber` : ` – noch ${num(be.paying - model.paying)}`}
        </p>
      </div>
    </article>
  );
}

function UnitStep({ label, value, frac, tone, entered, bold }: { label: string; value: string; frac: number; tone: string; entered: boolean; bold?: boolean }) {
  return (
    <div className="grid items-center u-gap-6" style={{ gridTemplateColumns: `${pt(104)} 1fr ${pt(44)}` }}>
      <span className={`u-fs-10 leading-tight ${bold ? "font-bold text-pw-900" : "text-pw-muted"}`}>{label}</span>
      <span className="relative bg-white u-r-4" style={{ height: pt(9) }}>
        <span className="absolute inset-y-0 left-0 u-r-4 motion-safe:transition-all motion-safe:duration-700" style={{ width: `${entered ? frac * 100 : 0}%`, background: tone }} />
      </span>
      <span className={`text-right u-fs-11 tabular-nums ${bold ? "font-bold text-pw-900" : "text-pw-ink"}`}>{value}</span>
    </div>
  );
}

export function FinanceSummary() {
  const entered = useEntered();
  const { scenarios, unit, customer, kit } = summaryFigures();
  const margin = unit.db / unit.arpu;
  const pct = (v: number) => `${num(Math.round(v * 100))} %`;

  return (
    <div className="relative h-full w-full" data-testid="finance-summary">
      {/* three year-3 states */}
      <section className="absolute left-0 top-0 grid u-gap-8" style={{ width: pt(588), height: pt(304), gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }} aria-label="Drei Szenarien, Monat am Ende von Jahr 3">
        {scenarios.map((s) => (
          <ScenarioCard key={s.id} s={s} entered={entered} />
        ))}
      </section>

      {/* one paying customer */}
      <section className="absolute right-0 top-0 flex flex-col u-r-10 bg-pw-50 u-px-12 u-py-10" style={{ width: pt(274), height: pt(304) }} aria-label="Ein zahlender Kunde pro Monat" data-testid="summary-unit">
        <p className="u-fs-11 font-bold uppercase tracking-[0.1em] text-pw-700">Ein zahlender Kunde</p>
        <p className="u-fs-9 text-pw-muted">pro Monat, Tarifmix Basic/Erweitert/Expert 60/30/10</p>
        <div className="u-mt-10 flex flex-col u-gap-6">
          <UnitStep label="Abo-Umsatz netto" value={euro(unit.arpu)} frac={1} tone="#52b788" entered={entered} />
          <UnitStep label="− variable Kosten" value={`−${euro(unit.variableCost)}`} frac={unit.variableCost / unit.arpu} tone={NEG} entered={entered} />
          <UnitStep label="= Deckungsbeitrag" value={euro(unit.db)} frac={unit.db / unit.arpu} tone={POS} entered={entered} bold />
        </div>
        <p className="u-mt-4 text-right u-fs-9 text-pw-muted">{pct(margin)} Marge · variable Kosten = Cloud, KI, Support, Zahlung</p>

        <dl className="u-mt-8 flex flex-col">
          {[
            { k: `${euro(BASE_PARAMS.cac, 0)} CAC`, v: `Akquisekosten, nach ${num(customer.paybackMonths, 0)} Monaten zurückverdient` },
            { k: `${num(customer.lifetime, 0)} Mon.`, v: `Ø Kundenlaufzeit bei ${pct(BASE_PARAMS.churn)} Kündigung/Monat` },
            { k: `${euro(customer.ltv, 0)} LTV`, v: `Kundenwert = ${num(customer.ltvToCac, 0)}× Akquisekosten` },
            { k: `+${euro(kit.db, 0)}/Kit`, v: `Sensor-Kit zu ${euro(BASE_PARAMS.kitPrice, 0)} wird mit Gewinn verkauft` },
          ].map((r) => (
            <div key={r.k} className="grid items-baseline border-t border-pw-200 u-py-4 u-gap-6" style={{ gridTemplateColumns: `${pt(86)} 1fr` }}>
              <dt className="font-serif u-fs-13 font-bold tabular-nums text-pw-900">{r.k}</dt>
              <dd className="u-fs-10 leading-snug text-pw-muted">{r.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* assumptions + what the pilot validates */}
      <section className="absolute inset-x-0 bottom-0 flex items-center u-gap-14 u-r-10 border border-pw-200 u-px-12" style={{ top: pt(314) }} aria-label="Annahmen und Validierung">
        <div className="min-w-0 flex-1">
          <p className="u-fs-10 font-bold uppercase tracking-[0.06em] text-pw-700">Gleiche Annahmen in allen Szenarien</p>
          <p className="u-fs-10 leading-snug text-pw-ink">
            10 % der aktiven Nutzer zahlen · Tarifmix 60/30/10 · {euro(BASE_PARAMS.freeCost)} Kosten je Free-Nutzer. Unterschied: Größe der Nutzerbasis und Höhe der Fixkosten (laut Plan nicht aufgeschlüsselt, überwiegend Personal – siehe Folie 19).
          </p>
          <p className="u-fs-8 leading-snug text-pw-muted">
            Laufender Monat am Ende von Geschäftsjahr 3, ohne Akquisekosten und Kit-Verkäufe – keine Umsatz- oder Cashflow-Prognose. Planungsannahmen, Businessplan Kap. 4, 8, 11, nachgerechnet.
          </p>
        </div>
        <div className="shrink-0" style={{ width: pt(300) }}>
          <p className="u-fs-10 font-bold uppercase tracking-[0.06em] text-pw-700">Was der Pilot messen muss</p>
          <div className="u-mt-4 grid grid-cols-3 u-gap-6">
            {[
              { k: "Zahlende Nutzer", v: MARKS.conversion, f: (x: number) => pct(x) },
              { k: "Kündigung/Monat", v: MARKS.churn, f: (x: number) => pct(x) },
              { k: "Akquise/Kunde", v: MARKS.cac, f: (x: number) => euro(x, 0) },
            ].map((m) => {
              const vals: number[] = [...m.v];
              return (
                <div key={m.k} className="u-r-6 bg-pw-50 u-px-6 u-py-4">
                  <p className="u-fs-8 text-pw-muted">{m.k}</p>
                  <p className="u-fs-11 font-bold tabular-nums text-pw-900">
                    {m.f(Math.min(...vals))}–{m.f(Math.max(...vals))}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
