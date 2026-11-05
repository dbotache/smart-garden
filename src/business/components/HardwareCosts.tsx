"use client";

import { KIT } from "../data/businessModel";
import { kitEconomics } from "../utils/finance";
import { hardwareCosts } from "../utils/operatingCosts";
import { euro, num } from "../utils/money";
import { pt } from "./ui";

function Row({ label, value, sub, strong }: { label: string; value: string; sub?: string; strong?: boolean }) {
  return (
    <div className={`grid items-baseline u-gap-6 border-t border-pw-200 u-py-4 ${strong ? "border-t-2 border-pw-900" : ""}`} style={{ gridTemplateColumns: `1fr ${pt(78)}` }}>
      <span className={`u-fs-11 leading-tight ${strong ? "font-bold text-pw-900" : "text-pw-ink"}`}>
        {label}
        {sub && <span className="block u-fs-9 font-normal text-pw-muted">{sub}</span>}
      </span>
      <span className={`text-right u-fs-11 tabular-nums ${strong ? "font-bold text-pw-900" : "font-bold text-pw-ink"}`}>{value}</span>
    </div>
  );
}

function Card({ title, kicker, children, testId, dark }: { title: string; kicker: string; children: React.ReactNode; testId: string; dark?: boolean }) {
  return (
    <article className={`flex min-w-0 flex-col u-r-10 u-px-12 u-py-10 ${dark ? "bg-pw-900 text-white" : "bg-pw-50"}`} data-testid={testId}>
      <p className={`u-fs-10 font-bold uppercase tracking-[0.08em] ${dark ? "text-pw-200" : "text-pw-700"}`}>{kicker}</p>
      <p className={`font-serif u-fs-15 font-bold leading-tight ${dark ? "text-white" : "text-pw-900"}`}>{title}</p>
      <div className="u-mt-6 flex flex-1 flex-col">{children}</div>
    </article>
  );
}

/** One-off costs until the first kit is sold, the contribution per kit, and the running costs per device. */
export function hardwareSummary() {
  const h = hardwareCosts();
  const pilot = h.pilot.reduce((s, p) => s + p.eur, 0);
  const oneOffLow = pilot + h.certification.emcLow + h.certification.weee;
  const oneOffHigh = pilot + h.certification.emcHigh + h.certification.weee;
  return { h, pilot, oneOffLow, oneOffHigh, planKit: kitEconomics(KIT.basePrice) };
}

export function HardwareCosts() {
  const { h, oneOffLow, oneOffHigh, planKit } = hardwareSummary();
  const [p1, p2, p3] = h.pilot;
  return (
    <div className="relative h-full w-full" data-testid="hardware-costs" data-oneoff-low={Math.round(oneOffLow)} data-oneoff-high={Math.round(oneOffHigh)}>
      <div className="absolute inset-x-0 top-0 grid u-gap-10" style={{ height: pt(306), gridTemplateColumns: "1.15fr 1fr 1fr" }}>
        <Card kicker="Einmalig · Phase 2 + 3" title="Pilot und Zulassung" testId="hardware-oneoff">
          <Row label={`Pilot: ${p1!.units} × ${p1!.label}`} sub={`je ${euro(p1!.unit)} inkl. 15 % Reserve`} value={euro(p1!.eur, 0)} />
          <Row label={`Pilot: ${p2!.units} × ${p2!.label}`} sub={`je ${euro(p2!.unit)}, für Demo und Pilotgärten`} value={euro(p2!.eur, 0)} />
          <Row label="EMV- und Funkprüfung vor Verkauf" sub="Erfahrungswerte; mit vorzertifiziertem WLAN-Modul eher unten" value={`${num(h.certification.emcLow)}–${num(h.certification.emcHigh)} €`} />
          <Row label="Registrierung Elektrogeräte (stiftung ear)" sub="je Hersteller, Marke und Geräteart, zzgl. Garantie" value={`ab ${euro(h.certification.weee, 0)}`} />
          <Row label="Summe bis zum ersten Verkauf" value={`${num(Math.round(oneOffLow / 100) / 10, 1)}–${num(Math.round(oneOffHigh / 100) / 10, 1)} T€`} strong />
          <p className="mt-auto u-fs-9 leading-snug text-pw-muted">
            Prototyp 3 ({euro(p3!.unit, 0)} je Gerät) erst nach Strommessungen. Förderprogramme decken Sachkosten (z. B. EXIST bis 30.000 € je Team; Förderfähigkeit prüfen).
          </p>
        </Card>

        <Card kicker="Je verkauftem Kit" title={`Sensor-Kit zu ${euro(KIT.basePrice, 0)}`} testId="hardware-kit" dark>
          {[
            { k: "Verkaufspreis netto", v: euro(h.kit.net) },
            { k: "Einkauf / Fertigung", v: `−${euro(KIT.cogs)}` },
            { k: "Versand, Verpackung, Zahlung", v: `−${euro(KIT.fulfilment)}` },
            { k: "Garantie- und Retourenreserve", v: `−${euro(KIT.warrantyReserve)}` },
          ].map((r) => (
            <div key={r.k} className="grid items-baseline border-t border-white/15 u-py-4" style={{ gridTemplateColumns: `1fr ${pt(66)}` }}>
              <span className="u-fs-11 text-pw-200">{r.k}</span>
              <span className="text-right u-fs-11 font-bold tabular-nums">{r.v}</span>
            </div>
          ))}
          <div className="grid items-baseline border-t-2 border-white u-pt-4" style={{ gridTemplateColumns: `1fr ${pt(66)}` }}>
            <span className="u-fs-12 font-bold">Deckungsbeitrag</span>
            <span className="text-right font-serif u-fs-18 font-bold tabular-nums text-[#95d5b2]" data-testid="hardware-kit-db">{euro(h.kit.db)}</span>
          </div>
          <p className="mt-auto u-fs-9 leading-snug text-pw-200">
            Ohne Reserve {euro(planKit.db)} wie im Businessplan. Lager, Werkzeug und Händlerabschläge sind nicht enthalten.
          </p>
        </Card>

        <Card kicker="Laufend je Gerät" title="Betrieb ist günstig, Support nicht" testId="hardware-running">
          <Row label="Sensordaten empfangen und speichern" sub="eigener Server, 1 × CPX22 je 5.000 Geräte (Annahme)" value={`${euro(h.perDeviceMonth.ingest, 3)}/Mon.`} />
          <Row label="Mobilfunk nur bei Prototyp 3 (LTE)" sub="IoT-SIM 13 € für 10 Jahre" value={`${euro(h.perDeviceMonth.sim)}/Mon.`} />
          <div className="u-mt-6 u-r-6 bg-white u-px-8 u-py-6 u-fs-10 leading-snug text-pw-ink" data-testid="hardware-lte">
            <b>LTE-Datenvolumen:</b> 500 MB reichen für Sensordaten ({num(h.lte.sensorMb10y)} MB in 10 Jahren), aber nicht für ein Kamerabild pro Tag ({num(h.lte.photoMb10y)} MB). Kamera daher nur über WLAN.
          </div>
          <p className="mt-auto u-fs-9 leading-snug text-pw-muted">Nicht beziffert: Support (Installation, WLAN, Kalibrierung) und Produkthaftpflicht – Angebote einholen; im Pilot messen.</p>
        </Card>
      </div>

      <section className="absolute inset-x-0 bottom-0 flex items-center u-gap-12 u-r-10 border border-pw-200 u-px-14" style={{ top: pt(318) }} aria-label="Reihenfolge">
        {[
          { k: "Phase 1", v: "nur digital: Markt testen" },
          { k: "Vorstufe", v: "fremde Sensoren anbinden (Expert)" },
          { k: "Phase 2", v: "5–10 Pilotgärten mit Prototyp 1 und 2" },
          { k: "Phase 3", v: "Zulassung, dann Kit-Verkauf" },
        ].map((s, i) => (
          <div key={s.k} className="flex min-w-0 flex-1 items-center u-gap-8">
            <span className="grid shrink-0 place-items-center rounded-full bg-pw-700 font-bold text-white u-fs-11" style={{ width: pt(22), height: pt(22) }}>{i + 1}</span>
            <p className="u-fs-10 leading-snug text-pw-ink"><b className="text-pw-900">{s.k}:</b> {s.v}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
