"use client";

import { BASE_PARAMS } from "../data/businessModel";
import { FOUNDERS, PRICES } from "../data/operatingCosts";
import { REFERENCE, savingsLevers } from "../utils/operatingCosts";
import { euro, num } from "../utils/money";
import { POS } from "./FinanceCharts";
import { pt, useEntered } from "./ui";

/** Where the plan can save: staff financed by grants first, then the technical levers ranked by € per month. */
export function savingsSummary() {
  const s = savingsLevers();
  const fixedNonStaff = s.base.byGroup.filter((g) => g.group === "server" || g.group === "office").reduce((a, g) => a + g.eur, 0);
  const planFixed = BASE_PARAMS.fixedCosts;
  const reducing = s.levers.filter((l) => l.id !== "model");
  return { ...s, fixedNonStaff, planFixed, staffInPlan: planFixed - fixedNonStaff, techSaving: reducing.reduce((a, l) => a + l.eur, 0) };
}

export function SavingsLevers() {
  const entered = useEntered();
  const s = savingsSummary();
  const ranked = [...s.levers].sort((a, b) => b.eur - a.eur);
  const max = Math.max(...ranked.map((l) => l.eur));
  return (
    <div className="relative h-full w-full" data-testid="savings-levers" data-tech-saving={Math.round(s.techSaving)}>
      {/* staff */}
      <section className="absolute left-0 top-0 flex flex-col u-r-10 bg-pw-900 u-px-14 u-py-12 text-white" style={{ width: pt(330), height: pt(388) }} data-testid="savings-staff">
        <p className="u-fs-10 font-bold uppercase tracking-[0.08em] text-pw-200">Hebel 1 · Personal</p>
        <p className="font-serif u-fs-17 font-bold leading-tight">Gehälter sind fast die gesamten Fixkosten</p>
        <div className="u-mt-10 flex flex-col">
          {[
            { k: "Fixkosten im Businessplan", v: euro(s.planFixed, 0), sub: "Beispiel und Jahr 3 vorsichtig" },
            { k: "davon Server, Steuer, Recht, Tools", v: euro(s.fixedNonStaff, 0), sub: "recherchiert, Phase 1 mit 10.000 Nutzern" },
            { k: "rechnerisch für Personal", v: euro(s.staffInPlan, 0), sub: "Rest – der Plan schlüsselt das nicht auf", strong: true },
          ].map((r) => (
            <div key={r.k} className={`grid items-baseline border-t ${r.strong ? "border-t-2 border-white" : "border-white/15"} u-py-4`} style={{ gridTemplateColumns: `1fr ${pt(70)}` }}>
              <span className={`u-fs-11 leading-tight ${r.strong ? "font-bold" : "text-pw-200"}`}>
                {r.k}
                <span className="block u-fs-8 text-pw-200/80">{r.sub}</span>
              </span>
              <span className="text-right u-fs-12 font-bold tabular-nums">{r.v}</span>
            </div>
          ))}
        </div>
        <div className="u-mt-10 u-r-8 bg-white/10 u-px-10 u-py-8">
          <p className="u-fs-11 font-bold text-[#95d5b2]">Gründerstipendium statt Gehalt</p>
          <p className="u-mt-2 u-fs-10 leading-snug">
            <b>EXIST:</b> {num(FOUNDERS)} × {euro(PRICES.exist.perPersonMonth, 0)} = {euro(s.funding.perMonth, 0)} im Monat für {s.funding.months} Monate, dazu bis {euro(s.funding.material, 0)} Sachkosten (Pilot-Hardware, Prüfungen).
          </p>
          <p className="u-mt-4 u-fs-10 leading-snug">
            <b>Hessen Ideen:</b> {euro(PRICES.hessenIdeen.perPersonMonth, 0)} je Person für {s.funding.hessenMonths} Monate – Uni Kassel koordiniert.
          </p>
        </div>
        <p className="mt-auto u-fs-8 leading-snug text-pw-200">Bedingungen (Hochschulbezug, Innovationsgrad) vor Antrag prüfen. Stipendium ist für die Gründer steuerpflichtig.</p>
      </section>

      {/* technical levers */}
      <section className="absolute right-0 top-0 flex flex-col u-r-10 bg-pw-50 u-px-14 u-py-12" style={{ width: pt(530), height: pt(250) }} data-testid="savings-tech">
        <div className="flex items-baseline justify-between">
          <p className="u-fs-10 font-bold uppercase tracking-[0.08em] text-pw-700">Hebel 2 · Technik und Betrieb</p>
          <p className="u-fs-9 text-pw-muted">pro Monat bei {num(REFERENCE.users)} Nutzern, {num(REFERENCE.paidShare * 100)} % zahlend</p>
        </div>
        <div className="u-mt-8 flex flex-col u-gap-6">
          {ranked.map((l) => (
            <div key={l.id} className="grid items-center u-gap-8" style={{ gridTemplateColumns: `${pt(210)} 1fr ${pt(92)}` }} title={l.detail} data-testid={`lever-${l.id}`} data-eur={Math.round(l.eur)}>
              <span className="u-fs-11 leading-tight text-pw-ink">
                {l.label}
                <span className="block truncate u-fs-8 text-pw-muted">{l.detail}</span>
              </span>
              <span className="relative bg-white u-r-4" style={{ height: pt(10) }}>
                <span className="absolute inset-y-0 left-0 u-r-4 motion-safe:transition-all motion-safe:duration-700" style={{ width: `${entered ? (l.eur / max) * 100 : 0}%`, background: l.id === "model" ? "#52b788" : POS }} />
              </span>
              <span className="text-right u-fs-11 font-bold tabular-nums text-pw-900">
                {l.id === "model" ? "vermeidet " : "−"}
                {euro(l.eur, 0)}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-auto u-fs-10 leading-snug text-pw-ink">
          Zusammen <b>−{euro(s.techSaving, 0)}</b> von {euro(s.base.total, 0)} Betriebskosten – spürbar, aber klein gegen Hebel 1.
        </p>
      </section>

      {/* hardware levers */}
      <section className="absolute bottom-0 right-0 u-r-10 border border-pw-200 u-px-14 u-py-8" style={{ width: pt(530), top: pt(262) }} data-testid="savings-hardware">
        <p className="u-fs-10 font-bold uppercase tracking-[0.08em] text-pw-700">Hebel 3 · Hardware</p>
        <ul className="u-mt-4 grid grid-cols-2 gap-x-[calc(var(--pt)*12)] gap-y-[calc(var(--pt)*4)] u-fs-10 leading-snug text-pw-ink">
          <li>• Vorzertifiziertes WLAN-Modul: weniger Funkprüfung</li>
          <li>• Pilot mit Prototyp 1 und 2; Prototyp 3 erst nach Strommessungen</li>
          <li>• Kit verkaufen statt vermieten: keine Vorfinanzierung</li>
          <li>• Kamera nur über WLAN: kein teures Mobilfunk-Datenvolumen</li>
        </ul>
      </section>
    </div>
  );
}
