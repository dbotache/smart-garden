"use client";

import { useMemo, useState } from "react";
import { BASE_PARAMS, CHURN_TABLE, KIT, MARKS, MIXES, PRESETS, RENTAL, TARIFFS, type FinanceParams, type Mix } from "../data/businessModel";
import { PROTOTYPES } from "../data/prototypes";
import { breakEven, customerEconomics, kitEconomics, monthlyModel, registrationsFor, rentalEconomics, runningAt, tariffEconomics } from "../utils/finance";
import { planBudget } from "../utils/prototypeCosts";
import { euro, num, pct, signedEuro } from "../utils/money";
import { BreakEvenChart, NEG, POS, RentalChart, Waterfall } from "./FinanceCharts";
import { AnimatedNumber, Segmented, Slider, Tile, pt } from "./ui";

const USER_STEPS = [1000, 2000, 5000, 10000, 20000, 25000, 40000, 50000, 75000, 100000] as const;
const MIX_KEYS = ["vorsichtig", "basis", "positiv"] as const;
const mixLabel = (m: Mix) => m.map((v) => Math.round(v * 100)).join("/");
const sameParams = (a: FinanceParams, b: FinanceParams) => (Object.keys(a) as (keyof FinanceParams)[]).every((k) => (k === "mix" ? mixLabel(a.mix) === mixLabel(b.mix) : a[k] === b[k]));

type Tab = "ergebnis" | "tarife" | "kunde" | "hardware";
const TABS: { id: Tab; label: string }[] = [
  { id: "ergebnis", label: "Monatsergebnis" },
  { id: "tarife", label: "Free + 3 Abos" },
  { id: "kunde", label: "Kunde + Akquise" },
  { id: "hardware", label: "Hardware-Kit" },
];

/**
 * Slide 14 body (873 × 388 pt): an interactive version of the business-model calculation. Left: assumptions
 * (presets from the plan, sliders with the plan's cautious / base / positive marks). Right: KPIs and four views.
 */
export function FinanceModel({ initialPreset = "beispiel" }: { initialPreset?: string }) {
  const [params, setParams] = useState<FinanceParams>(() => PRESETS.find((p) => p.id === initialPreset)?.params ?? BASE_PARAMS);
  const [tab, setTab] = useState<Tab>("ergebnis");
  const [withAcquisition, setWithAcquisition] = useState(false);
  const set = <K extends keyof FinanceParams>(k: K, v: FinanceParams[K]) => setParams((p) => ({ ...p, [k]: v }));

  const model = useMemo(() => monthlyModel(params), [params]);
  const be = useMemo(() => breakEven(params), [params]);
  const cust = useMemo(() => customerEconomics(params), [params]);
  const activePreset = PRESETS.find((p) => sameParams(p.params, params));
  const userIndex = Math.max(0, USER_STEPS.findIndex((s) => s >= params.registered));

  return (
    <div className="relative h-full w-full" data-testid="finance-model" data-preset={activePreset?.id ?? "custom"}>
      {/* assumptions */}
      <aside className="absolute inset-y-0 left-0 flex flex-col u-gap-3 u-r-10 bg-pw-50 u-px-12 u-py-8" style={{ width: pt(262) }} aria-label="Annahmen">
        <div>
          <p className="u-fs-10 font-bold uppercase tracking-[0.06em] text-pw-muted">Szenario aus dem Businessplan</p>
          <div className="mt-[calc(var(--pt)*3)] grid grid-cols-2 u-gap-4">
            {PRESETS.map((p) => (
              <button key={p.id} type="button" aria-pressed={activePreset?.id === p.id} onClick={() => setParams(p.params)} data-testid={`preset-${p.id}`} className={`u-r-6 u-px-6 py-[calc(var(--pt)*2)] u-fs-11 font-bold ${activePreset?.id === p.id ? "bg-pw-700 text-white" : "bg-white text-pw-900 ring-1 ring-pw-200 hover:bg-pw-50"}`}>
                {p.label}
              </button>
            ))}
          </div>
          <p className="u-mt-2 u-fs-9 leading-tight text-pw-muted" style={{ minHeight: pt(11) }}>{activePreset ? activePreset.hint : "Eigene Annahmen"}</p>
        </div>
        <Slider label="Aktive registrierte Nutzer" value={userIndex} min={0} max={USER_STEPS.length - 1} step={1} onChange={(i) => set("registered", USER_STEPS[i]!)} format={(i) => num(USER_STEPS[i]!)} testId="slider-users" />
        <Slider label="Conversion registriert → zahlend" value={params.conversion * 100} min={1} max={15} step={0.5} onChange={(v) => set("conversion", v / 100)} format={(v) => `${num(v, v % 1 ? 1 : 0)} %`} marks={MARKS.conversion.map((v, i) => ({ value: v * 100, label: ["vors.", "Basis", "pos."][i]! }))} testId="slider-conversion" />
        <Segmented label="Tarifmix Basic / Erweitert / Expert" options={MIX_KEYS} value={MIX_KEYS.find((k) => mixLabel(MIXES[k]) === mixLabel(params.mix)) ?? "basis"} onChange={(k) => set("mix", MIXES[k])} format={(k) => mixLabel(MIXES[k])} testId="mix" />
        <Slider label="Fixkosten pro Monat" value={params.fixedCosts} min={1000} max={30000} step={500} onChange={(v) => set("fixedCosts", v)} format={(v) => euro(v, 0)} marks={[6000, 12000, 25000].map((v) => ({ value: v, label: `${v / 1000} T€` }))} testId="slider-fixed" />
        <Slider label="CAC je zahlendem Neukunden" value={params.cac} min={5} max={60} step={1} onChange={(v) => set("cac", v)} format={(v) => euro(v, 0)} marks={MARKS.cac.map((v, i) => ({ value: v, label: ["vors.", "Basis", "pos."][i]! }))} testId="slider-cac" />
        <Slider label="Kündigungen pro Monat (Churn)" value={params.churn * 100} min={1} max={12} step={0.5} onChange={(v) => set("churn", v / 100)} format={(v) => `${num(v, v % 1 ? 1 : 0)} %`} marks={MARKS.churn.map((v, i) => ({ value: v * 100, label: ["vors.", "Basis", "pos."][i]! }))} testId="slider-churn" />
      </aside>

      {/* KPIs */}
      <div className="absolute right-0 top-0 grid grid-cols-4 u-gap-8" style={{ left: pt(276), height: pt(64) }}>
        <Tile label="Zahlende Kunden" sub={`+ ${num(model.free)} Free-Nutzer`}>
          <AnimatedNumber value={model.paying} format={(v) => num(v)} testId="kpi-paying" />
        </Tile>
        <Tile label="Netto-MRR" sub={<>ARR {euro(model.arr, 0)}</>}>
          <AnimatedNumber value={model.mrr} format={(v) => euro(v, 0)} testId="kpi-mrr" />
        </Tile>
        <Tile label="Monatsergebnis" tone={model.running >= 0 ? "good" : "bad"} sub="laufend, nach Fixkosten" testId="kpi-result-tile">
          <span className="flex items-baseline u-gap-4">
            <span aria-hidden className="u-fs-13" style={{ color: model.running >= 0 ? POS : NEG }}>{model.running >= 0 ? "▲" : "▼"}</span>
            <AnimatedNumber value={model.running} format={(v) => signedEuro(v)} testId="kpi-result" />
          </span>
        </Tile>
        <Tile label="Break-even ab" sub={be?.registered ? `≙ ${num(be.registered)} aktive Nutzer` : "nicht erreichbar: Free-Kosten > DB"}>
          {be ? (
            <span className="flex items-baseline u-gap-4">
              <AnimatedNumber value={be.paying} format={(v) => num(v)} testId="kpi-break-even" />
              <span className="font-sans u-fs-12 font-bold text-pw-muted">zahlend</span>
            </span>
          ) : (
            <span data-testid="kpi-break-even" data-value="none">—</span>
          )}
        </Tile>
      </div>

      {/* views */}
      <div role="tablist" aria-label="Ansicht" className="absolute right-0 flex u-gap-4" style={{ left: pt(276), top: pt(72), height: pt(22) }}>
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} data-testid={`tab-${t.id}`} className={`u-r-6 u-px-10 u-fs-12 font-bold ${tab === t.id ? "bg-pw-900 text-white" : "text-pw-700 hover:bg-pw-50"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <section role="tabpanel" className="absolute bottom-0 right-0 u-r-10 bg-white u-px-12 u-py-8 ring-1 ring-pw-200" style={{ left: pt(276), top: pt(100) }} data-testid={`panel-${tab}`}>
        {tab === "ergebnis" && <ResultView params={params} model={model} breakEvenUsers={be?.registered ?? null} withAcquisition={withAcquisition} onToggle={setWithAcquisition} />}
        {tab === "tarife" && <TariffView params={params} model={model} set={set} />}
        {tab === "kunde" && <CustomerView params={params} cust={cust} />}
        {tab === "hardware" && <HardwareView params={params} set={set} model={model} />}
      </section>
    </div>
  );
}

type Model = ReturnType<typeof monthlyModel>;

function ResultView({ params, model, breakEvenUsers, withAcquisition, onToggle }: { params: FinanceParams; model: Model; breakEvenUsers: number | null; withAcquisition: boolean; onToggle: (v: boolean) => void }) {
  const steps = [
    { label: "Netto-\nMRR", value: model.mrr, formula: `${num(model.paying)} × ${euro(model.unit.arpu)} ARPU` },
    { label: "Variable\nKosten Abo", value: -model.paidVariable, formula: `${num(model.paying)} × ${euro(model.unit.variableCost)}` },
    { label: "Free-\nNutzer", value: -model.freeCosts, formula: `${num(model.free)} × ${euro(params.freeCost)}` },
    { label: "Fix-\nkosten", value: -model.fixedCosts },
    { label: "Laufendes\nErgebnis", value: model.running, total: true },
    ...(withAcquisition
      ? [
          { label: "CAC\nNeukunden", value: -model.acquisition, formula: `${num(model.paying)} × ${euro(params.cac, 0)}` },
          { label: "Kit-DB\n(Neukäufe)", value: model.hardwareDb, formula: `${num(model.paying)} × ${pct(params.kitShare)} × ${euro(model.kit.db)}` },
          { label: "Akquise-\nmonat", value: model.acquisitionMonth, total: true },
        ]
      : []),
  ];
  const xMax = Math.max(params.registered * 1.25, (breakEvenUsers ?? 0) * 1.25, 4000);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <h3 className="u-fs-13 font-bold text-pw-900">Vom Umsatz zum Monatsergebnis</h3>
        <label className="flex items-center u-gap-4 u-fs-11 text-pw-ink">
          <input type="checkbox" checked={withAcquisition} onChange={(e) => onToggle(e.target.checked)} className="accent-[#2d6a4f]" data-testid="toggle-acquisition" />
          Monat, in dem alle Kunden neu gewonnen werden
        </label>
      </div>
      <div className="flex min-h-0 flex-1 u-gap-10">
        <div className="min-w-0 flex-[1.5]"><Waterfall steps={steps} testId="waterfall" /></div>
        <div className="min-w-0 flex-1 border-l border-pw-50 pl-[calc(var(--pt)*6)]">
          <BreakEvenChart at={(u) => runningAt(params, u)} current={params.registered} breakEvenUsers={breakEvenUsers} xMax={xMax} testId="break-even-chart" />
        </div>
      </div>
      <p className="u-fs-9 leading-snug text-pw-muted">
        Ø zahlender Kunde: {euro(model.unit.arpu)} netto, {euro(model.unit.variableCost)} variable Kosten, <b className="text-pw-ink">{euro(model.unit.db)} Deckungsbeitrag</b> pro Monat (Mix {mixLabel(params.mix)}). Laufendes Ergebnis = Bestandsmonat; CAC und Kit-Verkäufe fallen nur bei Neukunden an. Planungsannahmen, keine Prognose; Preise brutto inkl. 19 % USt., Ergebnisse netto.
      </p>
    </div>
  );
}

function TariffView({ params, model, set }: { params: FinanceParams; model: Model; set: <K extends keyof FinanceParams>(k: K, v: FinanceParams[K]) => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-4 u-gap-8">
        {TARIFFS.map((t, i) => {
          const e = tariffEconomics(t);
          const share = i === 0 ? null : params.mix[i - 1]!;
          return (
            <div key={t.id} className={`flex flex-col u-r-8 u-px-10 u-py-6 ${t.id === "basic" ? "bg-pw-900 text-white" : "bg-pw-50"}`} data-testid={`tariff-${t.id}`}>
              <p className={`font-serif u-fs-15 font-bold leading-tight ${t.id === "basic" ? "text-white" : "text-pw-900"}`}>{t.name}</p>
              <p className={`u-fs-16 font-bold leading-tight tabular-nums ${t.id === "basic" ? "text-pw-200" : "text-pw-700"}`}>{euro(t.gross)}</p>
              <p className={`u-fs-9 ${t.id === "basic" ? "text-pw-200" : "text-pw-muted"}`}>{t.gross ? "pro Monat bei Jahreszahlung" : "für immer"}</p>
              <dl className="u-mt-4 grid grid-cols-[1fr_auto] u-fs-10 tabular-nums leading-snug">
                <dt>Netto</dt><dd className="text-right">{euro(e.net)}</dd>
                <dt>Variable Kosten</dt><dd className="text-right">−{euro(t.id === "free" ? params.freeCost : e.variableCost)}</dd>
                <dt className="font-bold">DB / Monat</dt><dd className="text-right font-bold">{signedEuro(t.id === "free" ? -params.freeCost : e.db, 2)}</dd>
                <dt>DB-Marge</dt><dd className="text-right">{e.margin === null ? "—" : pct(e.margin, 1)}</dd>
              </dl>
              {share === null ? (
                <div className="u-mt-4">
                  <Segmented label="Kosten je Nutzer" options={[0.2, 0.1, 0.05] as const} value={params.freeCost as 0.2 | 0.1 | 0.05} onChange={(v) => set("freeCost", v)} format={(v) => euro(v, 2)} testId="free-cost" />
                </div>
              ) : (
                <>
                <p className="u-mt-4 u-fs-9 font-bold uppercase tracking-[0.05em] opacity-80">Anteil im Mix</p>
                <div className="flex items-center u-gap-4 u-fs-11 tabular-nums">
                  <span className={`relative flex-1 overflow-hidden ${t.id === "basic" ? "bg-pw-700" : "bg-white"}`} style={{ height: pt(6), borderRadius: pt(2) }}>
                    <span className={`absolute inset-y-0 left-0 motion-safe:transition-[width] motion-safe:duration-500 ${t.id === "basic" ? "bg-pw-200" : "bg-pw-700"}`} style={{ width: `${share * 100}%` }} />
                  </span>
                  {pct(share)}
                </div>
                </>
              )}
              <p className={`u-mt-4 u-fs-9 leading-snug ${t.id === "basic" ? "text-pw-200" : "text-pw-muted"}`}>{t.benefit}</p>
              <p className={`mt-auto u-fs-9 font-bold ${t.id === "basic" ? "text-white" : "text-pw-900"}`}>Hardware: {t.hardware}</p>
            </div>
          );
        })}
      </div>
      <p className="u-mt-4 u-fs-10 leading-snug text-pw-ink">
        Ø zahlender Kunde bei Mix {mixLabel(params.mix)}: <b>{euro(model.unit.arpu)}</b> netto − {euro(model.unit.variableCost)} = <b>{euro(model.unit.db)} DB/Monat</b>, {euro(model.unit.db * 12)} pro Jahr. Netto = brutto ÷ 1,19.
      </p>
    </div>
  );
}

function CustomerView({ params, cust }: { params: FinanceParams; cust: ReturnType<typeof customerEconomics> }) {
  const funnelPaying = 400 * params.conversion;
  const months = 24;
  return (
    <div className="grid h-full grid-cols-2 u-gap-14">
      <div className="flex flex-col u-gap-6">
        <div>
          <h3 className="u-fs-13 font-bold text-pw-900">CAC-Amortisation</h3>
          <p className="u-fs-11 text-pw-ink">
            {euro(params.cac, 0)} Akquisekosten sind nach <b data-testid="payback">{num(cust.paybackMonths, 1)} bezahlten Monaten</b> verdient; mit dem Kit-Beitrag ({pct(params.kitShare)} kaufen ein Kit) nach {num(cust.paybackWithKit, 1)}.
          </p>
          <div className="relative u-mt-6 bg-pw-50" style={{ height: pt(14), borderRadius: pt(3) }} role="img" aria-label={`Amortisation nach ${num(cust.paybackMonths, 1)} Monaten`}>
            <span className="absolute inset-y-0 left-0 motion-safe:transition-[width] motion-safe:duration-700" style={{ width: `${Math.min(1, cust.paybackMonths / months) * 100}%`, background: NEG, opacity: 0.85, borderRadius: pt(3) }} />
            <span className="absolute inset-y-0 right-0 motion-safe:transition-[width] motion-safe:duration-700" style={{ width: `${Math.max(0, 1 - cust.paybackMonths / months) * 100}%`, background: POS, borderRadius: pt(3) }} />
          </div>
          <div className="flex justify-between u-fs-8 text-pw-muted"><span>0</span><span>12</span><span>24 Monate</span></div>
        </div>
        <div>
          <h3 className="u-fs-13 font-bold text-pw-900">Lifetime Value (vereinfacht)</h3>
          <p className="u-fs-10 text-pw-muted">LTV = DB ÷ Churn, undiskontiert, vor CAC</p>
          <table className="u-mt-2 w-full u-fs-11 tabular-nums" data-testid="ltv-table">
            <thead>
              <tr className="text-left u-fs-9 uppercase tracking-[0.05em] text-pw-muted">
                <th className="font-bold">Churn/Monat</th><th className="font-bold">Lebensdauer</th><th className="text-right font-bold">LTV</th><th className="text-right font-bold">LTV/CAC</th>
              </tr>
            </thead>
            <tbody>
              {[...new Set([...CHURN_TABLE, params.churn])].sort((a, b) => a - b).map((c) => {
                const e = customerEconomics({ ...params, churn: c });
                const current = c === params.churn;
                return (
                  <tr key={c} className={current ? "bg-pw-50 font-bold text-pw-900" : ""}>
                    <td>{pct(c, c * 100 % 1 ? 1 : 0)}{current ? " ◀" : ""}</td>
                    <td>{num(e.lifetime, 1)} Mon.</td>
                    <td className="text-right">{euro(e.ltv)}</td>
                    <td className="text-right">{num(e.ltvToCac, 1)}×</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex flex-col u-gap-6">
        <h3 className="u-fs-13 font-bold text-pw-900">Funnel: woher zahlende Kunden kommen</h3>
        <ol className="flex flex-col u-gap-3 u-fs-11 tabular-nums" data-testid="funnel">
          {[
            { label: "Werbeeinblendungen", value: 100000, note: "Annahme" },
            { label: "Website-Klicks", value: 2000, note: "2 % Klickrate" },
            { label: "Registrierungen", value: 400, note: "20 % der Klicks" },
            { label: "Zahlende Kunden", value: funnelPaying, note: `${pct(params.conversion, params.conversion * 1000 % 10 ? 1 : 0)} Conversion` },
          ].map((s) => (
            <li key={s.label} className="flex items-center u-gap-6">
              <span className="shrink-0" style={{ width: pt(110) }}>{s.label}</span>
              <span className="relative flex-1 bg-pw-50" style={{ height: pt(10), borderRadius: pt(2) }}>
                <span className="absolute inset-y-0 left-0 bg-pw-700 motion-safe:transition-[width] motion-safe:duration-500" style={{ width: `${Math.max(1.5, (Math.log10(Math.max(1, s.value)) / 5) * 100)}%`, borderRadius: pt(2) }} />
              </span>
              <span className="shrink-0 text-right font-bold" style={{ width: pt(48) }}>{num(s.value, s.value % 1 ? 1 : 0)}</span>
            </li>
          ))}
        </ol>
        <p className="u-fs-9 text-pw-muted">Balken logarithmisch. Bei 10 € pro 1.000 Einblendungen kosten 100.000 Einblendungen 1.000 €.</p>
        <dl className="grid grid-cols-[1fr_auto] u-gap-2 border-t border-pw-200 pt-[calc(var(--pt)*4)] u-fs-11 tabular-nums">
          <dt>Werbe-CAC in diesem Funnel</dt><dd className="text-right font-bold" data-testid="ad-cac">{funnelPaying > 0 ? euro(1000 / funnelPaying) : "—"}</dd>
          <dt>Registrierungen für 1.000 zahlende Kunden</dt><dd className="text-right font-bold">{num(registrationsFor(1000, params.conversion))}</dd>
        </dl>
        <p className="mt-auto u-fs-9 leading-snug text-pw-muted">Jede Funnel-Stufe hat eine eigene Rate; die Conversion links gilt nur für registriert → zahlend.</p>
      </div>
    </div>
  );
}

function HardwareView({ params, set, model }: { params: FinanceParams; set: <K extends keyof FinanceParams>(k: K, v: FinanceParams[K]) => void; model: Model }) {
  const kit = kitEconomics(params.kitPrice);
  const rent = rentalEconomics();
  const maxDb = kitEconomics(KIT.prices[KIT.prices.length - 1]!).db;
  return (
    <div className="grid h-full grid-cols-2 u-gap-14">
      <div className="flex flex-col u-gap-6">
        <div className="grid grid-cols-2 u-gap-8">
          <Segmented label="Kit-Preis (brutto)" options={KIT.prices} value={params.kitPrice as (typeof KIT.prices)[number]} onChange={(v) => set("kitPrice", v)} format={(v) => `${v} €`} testId="kit-price" />
          <Slider label="Neukunden mit Kit" value={params.kitShare * 100} min={0} max={100} step={5} onChange={(v) => set("kitShare", v / 100)} format={(v) => `${v} %`} testId="slider-kit-share" />
        </div>
        <dl className="grid grid-cols-[1fr_auto] u-fs-11 tabular-nums leading-snug" data-testid="kit-economics">
          <dt>Nettoerlös ({params.kitPrice} € ÷ 1,19)</dt><dd className="text-right">{euro(kit.net)}</dd>
          <dt>Einkauf/Fertigung</dt><dd className="text-right">−{euro(KIT.cogs)}</dd>
          <dt>Versand, Verpackung, Zahlung</dt><dd className="text-right">−{euro(KIT.fulfilment)}</dd>
          <dt className="font-bold text-pw-900">Deckungsbeitrag je Kit</dt><dd className="text-right font-bold text-pw-900" data-testid="kit-db">{signedEuro(kit.db, 2)} ({pct(kit.margin, 1)})</dd>
        </dl>
        <div>
          <p className="u-fs-10 font-bold uppercase tracking-[0.06em] text-pw-muted">DB je Kit nach Preis</p>
          <ul className="u-mt-2 flex flex-col u-gap-2 u-fs-10 tabular-nums">
            {KIT.prices.map((p) => {
              const e = kitEconomics(p);
              return (
                <li key={p} className={`flex items-center u-gap-6 ${p === params.kitPrice ? "font-bold text-pw-900" : "text-pw-muted"}`}>
                  <span style={{ width: pt(34) }}>{p} €</span>
                  <span className="relative flex-1 bg-pw-50" style={{ height: pt(7), borderRadius: pt(2) }}>
                    <span className="absolute inset-y-0 left-0 motion-safe:transition-[width] motion-safe:duration-500" style={{ width: `${(e.db / maxDb) * 100}%`, background: p === params.kitPrice ? POS : "#52b788", borderRadius: pt(2) }} />
                  </span>
                  <span className="text-right" style={{ width: pt(44) }}>{euro(e.db)}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="mt-auto u-fs-9 leading-snug text-pw-muted">
          Bei {pct(params.kitShare)} Kit-Käufern bringen {num(model.paying)} Neukunden einmalig {euro(model.hardwareDb, 0)}. Nicht enthalten: Garantie, Retouren, Lager, Zertifizierung (mit 5 € Reserve: {euro(kitEconomics(params.kitPrice, { warrantyReserve: true }).db)} je Kit).
        </p>
      </div>
      <div className="flex flex-col u-gap-4">
        <h3 className="u-fs-13 font-bold text-pw-900">Kaufen statt mieten</h3>
        <p className="u-fs-11 leading-snug text-pw-ink">
          Miete ({euro(RENTAL.feeGross)}/Monat brutto, {euro(RENTAL.upfrontCost, 0)} Bereitstellung): {euro(rent.dbPerMonth)} DB pro Monat, amortisiert erst nach <b>{num(rent.paybackMonths, 1)} bezahlten Monaten</b>. Kündigt ein Kunde früher, bleibt ein Verlust.
        </p>
        <div style={{ height: pt(118) }}><RentalChart cumulative={rent.cumulative} payback={rent.paybackMonths} /></div>
        <p className="u-fs-10 leading-snug text-pw-ink"><b>Empfehlung des Plans:</b> Kit verkaufen; Miete erst nach Pilotdaten und rechtlicher Prüfung einer Mindestlaufzeit.</p>
        <p className="mt-auto u-fs-9 leading-snug text-pw-muted">
          Zum Vergleich (Folie 14): Prototyp 1 kostet als Einzelstück {euro(planBudget(PROTOTYPES[0]!))}, Prototyp 2 {euro(planBudget(PROTOTYPES[1]!))}. Die 85 € Herstellkosten des Kits sind eine Annahme für Serienware und noch durch Lieferantenangebote zu belegen.
        </p>
      </div>
    </div>
  );
}
