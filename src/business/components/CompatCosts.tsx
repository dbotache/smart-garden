"use client";

import type { CompatSystem } from "../data/operatingCosts";
import { compatCosts } from "../utils/operatingCosts";
import { euro, num } from "../utils/money";
import { pt } from "./ui";

const STATUS: Record<CompatSystem["status"], { label: string; icon: string; cls: string }> = {
  ready: { label: "zuerst", icon: "✓", cls: "bg-pw-700 text-white" },
  check: { label: "prüfen", icon: "?", cls: "bg-[#fdf1dc] text-[#7a4b00] ring-1 ring-[#f2a93b]" },
  later: { label: "später", icon: "–", cls: "bg-white text-pw-muted ring-1 ring-pw-200" },
};

const tsd = (v: number) => `${num(Math.round(v / 100) / 10, 1)} T€`;

/**
 * Compatibility stage before own hardware: connect sensors customers already own (Expert tariff), no own device,
 * no certification. Figures from data/operatingCosts.ts (COMPAT_SYSTEMS) and the hardware calculation.
 */
export function CompatCosts() {
  const c = compatCosts();
  return (
    <div className="relative h-full w-full" data-testid="compat-costs" data-avoided-low={Math.round(c.avoided.low)} data-test-devices={Math.round(c.testDevicesKnownGross)}>
      {/* systems */}
      <section className="absolute left-0 top-0 flex flex-col u-r-10 bg-pw-50 u-px-12 u-py-10" style={{ width: pt(530), height: pt(306) }} aria-label="Anbindbare Systeme" data-testid="compat-systems">
        <p className="u-fs-10 font-bold uppercase tracking-[0.08em] text-pw-700">Was Kunden schon im Garten haben</p>
        <div className="u-mt-6 grid border-b border-pw-200 u-fs-8 font-bold uppercase tracking-[0.06em] text-pw-muted" style={{ gridTemplateColumns: `${pt(100)} 1fr ${pt(118)} ${pt(78)}`, columnGap: pt(8), paddingBottom: pt(2) }}>
          <span>System</span>
          <span>Schnittstelle · Bedingungen</span>
          <span>Testgerät (brutto)</span>
          <span>Status</span>
        </div>
        {c.systems.map((s) => {
          const st = STATUS[s.status];
          return (
            <div key={s.id} className="grid items-center border-b border-pw-200 u-py-4" style={{ gridTemplateColumns: `${pt(100)} 1fr ${pt(118)} ${pt(78)}`, columnGap: pt(8) }} data-testid={`compat-${s.id}`} data-status={s.status}>
              <span className="u-fs-11 font-bold leading-tight text-pw-900">{s.name}</span>
              <span className="u-fs-10 leading-tight text-pw-ink">
                {s.api}
                <span className="block u-fs-8 text-pw-muted">{s.terms}</span>
              </span>
              <span className="u-fs-10 leading-tight text-pw-ink">
                {s.deviceGross !== null && <b className="block tabular-nums">{euro(s.deviceGross)}</b>}
                <span className="block u-fs-8 text-pw-muted">{[s.device, s.extra].filter(Boolean).join(" ")}</span>
              </span>
              <span className={`inline-flex w-fit items-center u-gap-2 u-r-6 u-px-6 u-fs-8 font-bold leading-snug ${st.cls}`} style={{ paddingBlock: pt(2) }}>
                <span aria-hidden>{st.icon}</span>
                {st.label}
              </span>
            </div>
          );
        })}
        <p className="mt-auto u-fs-8 leading-snug text-pw-muted">
          Testgeräte mit bekanntem Preis zusammen {euro(c.testDevicesKnownGross, 0)} brutto, dazu Gateway/Zigbee-Stick. Vorhandene Sensoren sehen wir in der Phase-1-Warteliste.
        </p>
      </section>

      {/* avoided vs own hardware */}
      <section className="absolute right-0 top-0 flex flex-col u-r-10 bg-pw-900 u-px-12 u-py-10 text-white" style={{ width: pt(330), height: pt(156) }} data-testid="compat-avoided">
        <p className="u-fs-10 font-bold uppercase tracking-[0.08em] text-pw-200">Entfällt gegenüber eigener Hardware</p>
        <p className="font-serif u-fs-22 font-bold leading-tight text-[#95d5b2]">
          {num(Math.round(c.avoided.low / 100) / 10, 1)}–{tsd(c.avoided.high)} einmalig
        </p>
        <p className="u-fs-10 leading-snug text-pw-200">Pilotgeräte ({euro(c.avoided.pilot, 0)}), EMV-/Funkprüfung, Registrierung als Hersteller – dazu kein Lager, keine Garantie, keine Retouren.</p>
        <p className="mt-auto u-fs-10 leading-snug">
          <b>Aber:</b> kein Kit-Gewinn ({euro(c.kitDbForgone)} je Kit) und abhängig von fremden Schnittstellen.
        </p>
      </section>

      {/* what it costs / earns */}
      <section className="absolute right-0 flex flex-col u-r-10 border border-pw-200 u-px-12 u-py-8" style={{ width: pt(330), top: pt(166), height: pt(140) }} data-testid="compat-running">
        <p className="u-fs-10 font-bold uppercase tracking-[0.08em] text-pw-700">Laufend je Kunde</p>
        {[
          { k: "Daten abholen und speichern", v: `${euro(c.ingestPerDevice, 3)}`, sub: "je Gerät/Monat, eigener Server (Annahme)" },
          { k: "API-Gebühren", v: "0 €", sub: "Home Assistant, Netatmo; Gardena/Ecowitt klären" },
          { k: "Expert-Abo (14,99 €)", v: `+${euro(c.expert.db)}`, sub: "Deckungsbeitrag/Monat laut Plan" },
        ].map((r) => (
          <div key={r.k} className="grid items-baseline border-t border-pw-200 first-of-type:border-t-0 u-py-2" style={{ gridTemplateColumns: `1fr ${pt(60)}` }}>
            <span className="u-fs-10 leading-tight text-pw-ink">
              {r.k}
              <span className="block u-fs-8 text-pw-muted">{r.sub}</span>
            </span>
            <span className="text-right u-fs-11 font-bold tabular-nums text-pw-900">{r.v}</span>
          </div>
        ))}
        <p className="mt-auto u-fs-8 leading-snug text-pw-muted">Nicht beziffert: Entwicklungszeit je Anbindung (Personal) und Support für viele Gerätetypen.</p>
      </section>

      {/* what the stage answers */}
      <section className="absolute inset-x-0 bottom-0 flex items-center u-gap-14 u-r-10 bg-pw-50 u-px-14" style={{ top: pt(318) }} aria-label="Was die Vorstufe klärt">
        <div className="shrink-0" style={{ width: pt(200) }}>
          <p className="u-fs-10 font-bold uppercase tracking-[0.06em] text-pw-700">Was die Vorstufe klärt</p>
          <p className="font-serif u-fs-13 font-bold leading-tight text-pw-900">Lohnt sich ein eigenes Kit?</p>
        </div>
        <ul className="grid flex-1 grid-cols-3 u-gap-10 u-fs-10 leading-snug text-pw-ink">
          <li><b className="block text-pw-900">Verbreitung</b>Wie viele Nutzer haben schon Sensoren – und welche?</li>
          <li><b className="block text-pw-900">Zahlungsbereitschaft</b>Wer zahlt 14,99 € für Sensor-Empfehlungen?</li>
          <li><b className="block text-pw-900">Lücken</b>Was fehlt fremder Hardware? Das definiert unser Kit.</li>
        </ul>
      </section>
    </div>
  );
}
