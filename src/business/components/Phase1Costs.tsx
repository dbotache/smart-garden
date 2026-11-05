"use client";

import { useState } from "react";
import { PHASE1_PAID_SHARES, PHASE1_USERS } from "../data/operatingCosts";
import { GROUP_LABEL, GROUP_ORDER, phase1 } from "../utils/operatingCosts";
import { euro, num, signedEuro } from "../utils/money";
import { POS } from "./FinanceCharts";
import { AnimatedNumber, Segmented, Tile, pt, useEntered } from "./ui";

/** smallest number of active users (in steps of 100) from which phase 1 covers its running costs, before staff */
export function phase1BreakEvenUsers(paidShare: number) {
  for (let users = 100; users <= 100_000; users += 100) if (phase1({ users, paidShare }).resultBeforeStaff >= 0) return users;
  return null;
}

/**
 * Phase 1 = digital only: many free users, 5–10 % on Basic (4,99 €). What running the app costs per month
 * (researched prices + marked assumptions, see data/operatingCosts.ts), and what is left for staff.
 */
export function Phase1Costs() {
  const [users, setUsers] = useState<number>(10_000);
  const [share, setShare] = useState<number>(0.05);
  const entered = useEntered();
  const r = phase1({ users, paidShare: share });
  const maxGroup = Math.max(...r.byGroup.map((g) => g.eur), 1);
  const positive = r.resultBeforeStaff >= 0;

  return (
    <div className="relative h-full w-full" data-testid="phase1-costs" data-total={Math.round(r.total)} data-result={Math.round(r.resultBeforeStaff)}>
      {/* left: controls, KPIs, cost blocks */}
      <section className="absolute left-0 top-0 flex flex-col u-gap-8" style={{ width: pt(512), height: pt(300) }}>
        <div className="grid grid-cols-2 u-gap-10">
          <Segmented label="Aktive Nutzer" options={PHASE1_USERS} value={users as (typeof PHASE1_USERS)[number]} onChange={setUsers} format={(v) => num(v)} testId="phase1-users" />
          <Segmented label="davon zahlend (Basic 4,99 €)" options={PHASE1_PAID_SHARES} value={share as (typeof PHASE1_PAID_SHARES)[number]} onChange={setShare} format={(v) => `${num(v * 100)} %`} testId="phase1-share" />
        </div>
        <div className="grid grid-cols-3 u-gap-8">
          <Tile label="Umsatz netto" sub={`${num(r.paying)} zahlende Kunden`}>
            <AnimatedNumber value={r.revenue} format={(v) => euro(v, 0)} testId="phase1-revenue" />
          </Tile>
          <Tile label="Betriebskosten" sub="ohne Personal, pro Monat">
            <AnimatedNumber value={r.total} format={(v) => euro(v, 0)} testId="phase1-total" />
          </Tile>
          <Tile label="Übrig für Personal" sub={positive ? "Betrieb trägt sich" : "Betrieb noch nicht gedeckt"} tone={positive ? "good" : "bad"}>
            <AnimatedNumber value={r.resultBeforeStaff} format={(v) => signedEuro(v, 0)} testId="phase1-result" />
          </Tile>
        </div>
        <div className="flex-1 u-r-10 bg-pw-50 u-px-12 u-py-8">
          <p className="u-fs-10 font-bold uppercase tracking-[0.06em] text-pw-700">Kostenblöcke pro Monat</p>
          <div className="u-mt-6 flex flex-col u-gap-6">
            {GROUP_ORDER.map((g) => {
              const eur = r.byGroup.find((x) => x.group === g)!.eur;
              return (
                <div key={g} className="grid items-center u-gap-8" style={{ gridTemplateColumns: `${pt(128)} 1fr ${pt(58)}` }} data-testid={`phase1-group-${g}`}>
                  <span className="u-fs-11 text-pw-ink">{GROUP_LABEL[g]}</span>
                  <span className="relative bg-white u-r-4" style={{ height: pt(10) }}>
                    <span className="absolute inset-y-0 left-0 u-r-4 motion-safe:transition-all motion-safe:duration-700" style={{ width: `${entered ? (eur / maxGroup) * 100 : 0}%`, background: POS }} />
                  </span>
                  <span className="text-right u-fs-11 font-bold tabular-nums text-pw-900">{euro(eur, 0)}</span>
                </div>
              );
            })}
          </div>
          <p className="u-mt-8 u-fs-9 leading-snug text-pw-muted">
            Je Nutzer und Monat: Free {euro(r.variablePerFree)} · Basic-Kunde {euro(r.variablePerPaying)} (KI, Fotos, Zahlung). Der Businessplan rechnet pauschal mit {euro(r.plan.perFree)} und {euro(r.plan.perPaying)}.
          </p>
          <p className="u-mt-6 u-fs-10 leading-snug text-pw-ink" data-testid="phase1-breakeven">
            <b>Betriebskosten gedeckt</b> ab {num(Math.round((phase1BreakEvenUsers(0.05) ?? 0) * 0.05))} zahlenden Kunden ({num(phase1BreakEvenUsers(0.05) ?? 0)} aktive Nutzer bei 5 %) bzw. {num(Math.round((phase1BreakEvenUsers(0.1) ?? 0) * 0.1))} ({num(phase1BreakEvenUsers(0.1) ?? 0)} bei 10 %) – Personal noch nicht eingerechnet.
          </p>
        </div>
      </section>

      {/* right: every cost line */}
      <section className="absolute right-0 top-0 flex flex-col u-r-10 border border-pw-200 u-px-12 u-py-8" style={{ width: pt(350), height: pt(300) }} aria-label="Alle Kostenpositionen" data-testid="phase1-lines">
        <p className="u-fs-10 font-bold uppercase tracking-[0.06em] text-pw-700">Was drinsteckt</p>
        <div className="u-mt-4 flex flex-col">
          {GROUP_ORDER.map((g) => (
            <div key={g} className="border-t border-pw-200 first:border-t-0">
              {r.lines.filter((l) => l.group === g).map((l) => (
                <div key={l.id} className="grid items-baseline u-gap-6 u-py-2" style={{ gridTemplateColumns: `1fr ${pt(52)}` }} title={l.detail}>
                  <span className="min-w-0 truncate u-fs-10 text-pw-ink">
                    {l.label}
                    {l.assumption && <span className="text-pw-muted">*</span>}
                    <span className="u-fs-8 text-pw-muted"> · {l.detail}</span>
                  </span>
                  <span className="text-right u-fs-10 font-bold tabular-nums text-pw-900">{euro(l.eur, 0)}</span>
                </div>
              ))}
            </div>
          ))}
          <div className="grid items-baseline border-t-2 border-pw-900 u-pt-4" style={{ gridTemplateColumns: `1fr ${pt(52)}` }}>
            <span className="u-fs-11 font-bold text-pw-900">Summe pro Monat</span>
            <span className="text-right u-fs-11 font-bold tabular-nums text-pw-900">{euro(r.total, 0)}</span>
          </div>
        </div>
        <p className="mt-auto u-fs-8 leading-snug text-pw-muted">* mit Nutzungsannahme · netto, Stand 05.11.2026 · ohne Personal, Marketing</p>
      </section>

      {/* bottom: purpose of phase 1 */}
      <section className="absolute inset-x-0 bottom-0 flex items-center u-gap-14 u-r-10 bg-pw-900 u-px-14 text-white" style={{ top: pt(312) }}>
        <div className="shrink-0" style={{ width: pt(230) }}>
          <p className="u-fs-10 font-bold uppercase tracking-[0.06em] text-pw-200">Ziel von Phase 1</p>
          <p className="font-serif u-fs-15 font-bold leading-tight">Markt testen, bevor wir Hardware bauen</p>
        </div>
        <ul className="grid flex-1 grid-cols-3 u-gap-10 u-fs-10 leading-snug">
          <li><b className="block text-pw-200">Zahlungsbereitschaft</b>Wie viele Free-Nutzer wechseln zu Basic?</li>
          <li><b className="block text-pw-200">Nutzung</b>Fotos und KI-Fragen pro Nutzer, damit die * Annahmen echte Werte werden</li>
          <li><b className="block text-pw-200">Interesse an Sensorik</b>Vorschlag: Warteliste für das Sensor-Kit in der App</li>
        </ul>
      </section>
    </div>
  );
}
