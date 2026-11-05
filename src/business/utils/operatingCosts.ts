/** Pure cost calculations for phase 1 (digital only), the hardware variants and the savings levers. */
import { KIT, TARIFFS } from "../data/businessModel";
import { PROTOTYPES } from "../data/prototypes";
import { ASSUMPTIONS as A, COMPAT_SYSTEMS, FOUNDERS, MARKETING as M, PHASE1_TARIFF, PRICES as P, type SourceId } from "../data/operatingCosts";
import { kitEconomics, net, tariffEconomics } from "./finance";
import { fleetBudget, planBudget } from "./prototypeCosts";

export type CostGroup = "server" | "ai" | "payment" | "office";
export const GROUP_LABEL: Record<CostGroup, string> = {
  server: "Server & Hosting",
  ai: "KI & Foto-Erkennung",
  payment: "Zahlung & App-Stores",
  office: "Steuer, Recht, Tools",
};
export const GROUP_ORDER: CostGroup[] = ["server", "ai", "payment", "office"];

export type CostLine = { id: string; group: CostGroup; label: string; eur: number; detail: string; sources: SourceId[]; assumption?: boolean };

export type Phase1Options = {
  users: number;
  paidShare: number;
  model?: "haiku" | "sonnet";
  storeShare?: number;
  freePhotoIds?: number;
  stagingServer?: boolean;
  taxAdvisorYear?: number;
};

const usd = (v: number) => v * A.usdToEur;
const basic = TARIFFS.find((t) => t.id === PHASE1_TARIFF)!;

export function chatCostPerMessage(model: "haiku" | "sonnet" = "haiku") {
  const p = model === "haiku" ? P.haiku : P.sonnet;
  return usd((A.chatTokens.input * p.inUsdPerM + A.chatTokens.output * p.outUsdPerM) / 1e6);
}

/** payment cost per paying customer and month (annual billing): web = card fee on the yearly amount; store = 15 % of the net price */
export function paymentPerPaying(storeShare: number = A.storeShare) {
  const yearlyGross = basic.gross * 12;
  const web = (P.stripeCard.pct * yearlyGross + P.stripeCard.fixedEur) / 12;
  const store = P.storeFee.pct * net(basic.gross);
  return { web, store, blended: storeShare * store + (1 - storeShare) * web };
}

export function phase1(o: Phase1Options) {
  const model = o.model ?? "haiku";
  const storeShare = o.storeShare ?? A.storeShare;
  const freePhotoIds = o.freePhotoIds ?? A.free.photoIds;
  const staging = o.stagingServer ?? true;
  const taxYear = o.taxAdvisorYear ?? P.taxAdvisorYear.high;

  const paying = Math.round(o.users * o.paidShare);
  const free = o.users - paying;
  const revenue = paying * net(basic.gross);

  const appNodes = Math.max(1, Math.ceil(o.users / A.usersPerAppNode));
  const dbNodes = o.users >= A.dbReplicaFrom ? 2 : 1;
  const storageTb = (o.users * A.photoStorageMbPerUser) / 1e6;
  const extraTb = Math.max(0, Math.ceil(storageTb - P.objectStorageBase.includedTb));
  const emails = o.users * A.emailsPerUserMonth;
  const credits = free * (freePhotoIds + 2 * A.free.healthChecks) + paying * (A.paid.photoIds + 2 * A.paid.healthChecks);
  const messages = free * A.free.chatMessages + paying * A.paid.chatMessages;
  const pay = paymentPerPaying(storeShare);

  const lines: CostLine[] = [
    { id: "app", group: "server", label: "App-Server", eur: appNodes * P.cpx22.eur, detail: `${appNodes} × Hetzner CPX22 (1 je ${(A.usersPerAppNode / 1000).toFixed(0)}.000 Nutzer)`, sources: ["hetznerJune2026"], assumption: true },
    { id: "db", group: "server", label: "Datenbank", eur: dbNodes * P.ccx13.eur, detail: `${dbNodes} × CCX13 (dedizierte vCPU${dbNodes > 1 ? ", mit Replikat" : ""})`, sources: ["hetznerJune2026"] },
    { id: "auth", group: "server", label: staging ? "Login (Keycloak) + Testsystem" : "Login (Keycloak)", eur: (staging ? 2 : 1) * P.cpx22.eur, detail: `${staging ? 2 : 1} × CPX22`, sources: ["hetznerJune2026"] },
    { id: "storage", group: "server", label: "Speicher für Fotos + Backups", eur: P.objectStorageBase.eur + extraTb * P.objectStorageExtraTb.eur, detail: `${storageTb.toLocaleString("de-DE", { maximumFractionDigits: 2 })} TB (${A.photoStorageMbPerUser} MB je Nutzer)`, sources: ["hetznerObject"], assumption: true },
    { id: "mail", group: "server", label: "E-Mail-Versand", eur: usd((emails / 1000) * P.sesPer1000Usd.usd), detail: `${emails.toLocaleString("de-DE")} Mails (${A.emailsPerUserMonth} je Nutzer), Amazon SES`, sources: ["ses"], assumption: true },
    { id: "photo", group: "ai", label: "Foto-Erkennung", eur: credits * P.plantIdCredit.eur, detail: `${Math.round(credits).toLocaleString("de-DE")} Plant.id-Credits à 0,05 €`, sources: ["plantId"], assumption: true },
    { id: "chat", group: "ai", label: `KI-Chat (${model === "haiku" ? "kleines" : "großes"} Modell)`, eur: messages * chatCostPerMessage(model), detail: `${Math.round(messages).toLocaleString("de-DE")} Fragen, Claude ${model === "haiku" ? "Haiku" : "Sonnet"} 5.5`, sources: ["claude"], assumption: true },
    { id: "pay", group: "payment", label: "Zahlungs- und Store-Gebühren", eur: paying * pay.blended, detail: `${Math.round(storeShare * 100)} % via App-Store (15 %)`, sources: ["stores", "stripe"], assumption: true },
    { id: "tax", group: "office", label: "Steuerberatung + Buchhaltung", eur: taxYear / 12, detail: `${taxYear.toLocaleString("de-DE")} €/Jahr (UG)`, sources: ["taxAdvisor"] },
    { id: "legal", group: "office", label: "Rechtstexte (AGB, Datenschutz)", eur: P.legalTexts.eur, detail: "Abo inkl. Abmahnschutz", sources: ["legalTexts"] },
    { id: "insurance", group: "office", label: "Betriebshaftpflicht", eur: P.insuranceYear.high / 12, detail: `${P.insuranceYear.high} €/Jahr`, sources: ["insurance"] },
    { id: "tools", group: "office", label: "Büro-Tools + Entwicklerkonten", eur: FOUNDERS * P.workspacePerUser.eur + usd(P.appleDevYearUsd.usd) / 12 + (o.users > P.sentryTeamUsd.freeUpToUsers ? usd(P.sentryTeamUsd.usd) : 0), detail: `Workspace ${FOUNDERS} Nutzer, Apple-Konto${o.users > P.sentryTeamUsd.freeUpToUsers ? ", Fehler-Monitoring" : ""}`, sources: ["workspace", "devAccounts", "sentry"] },
  ];

  const total = lines.reduce((s, l) => s + l.eur, 0);
  const byGroup = GROUP_ORDER.map((g) => ({ group: g, eur: lines.filter((l) => l.group === g).reduce((s, l) => s + l.eur, 0) }));
  const chat = chatCostPerMessage(model);
  const variablePerFree = (freePhotoIds + 2 * A.free.healthChecks) * P.plantIdCredit.eur + A.free.chatMessages * chat;
  const variablePerPaying = (A.paid.photoIds + 2 * A.paid.healthChecks) * P.plantIdCredit.eur + A.paid.chatMessages * chat + pay.blended;
  return {
    paying, free, revenue, lines, byGroup, total,
    resultBeforeStaff: revenue - total,
    variablePerFree, variablePerPaying,
    /** the business plan's lump sums for the same users (Basic tariff) */
    plan: { perFree: TARIFFS[0]!.variableCost, perPaying: basic.variableCost, variable: free * TARIFFS[0]!.variableCost + paying * basic.variableCost },
  };
}

/** hardware variants: pilot budgets, certification before selling, per-kit and per-device running costs */
export function hardwareCosts() {
  const [p1, p2, p3] = PROTOTYPES;
  const kit = kitEconomics(KIT.basePrice, { warrantyReserve: true });
  const sensorMb10y = (A.sensorBytesPerDay * 3650) / 1e6;
  const photoMb10y = (A.photoBytesPerDay * 3650) / 1e6;
  return {
    pilot: [
      { id: p1!.id, label: `Prototyp 1 · ${p1!.name}`, units: 5, eur: fleetBudget(p1!, 5), unit: planBudget(p1!) },
      { id: p2!.id, label: `Prototyp 2 · ${p2!.name}`, units: 10, eur: fleetBudget(p2!, 10), unit: planBudget(p2!) },
      { id: p3!.id, label: `Prototyp 3 · ${p3!.name}`, units: 0, eur: 0, unit: planBudget(p3!) },
    ],
    certification: { emcLow: P.emcTest.low, emcHigh: P.emcTest.high, weee: P.weeeRegistration.eur },
    kit,
    perDeviceMonth: {
      ingest: P.cpx22.eur / A.devicesPerIngestNode,
      sim: (P.simTenYears.eur + P.simTenYears.card) / 120,
    },
    lte: { sensorMb10y, photoMb10y, limitMb: P.simTenYears.mb, sensorFits: sensorMb10y <= P.simTenYears.mb, photoFits: photoMb10y <= P.simTenYears.mb },
  };
}

/** reference scenario for the savings slide */
export const REFERENCE = { users: 10_000, paidShare: 0.05 } as const;

export function savingsLevers() {
  const base = phase1(REFERENCE);
  const delta = (o: Partial<Phase1Options>) => base.total - phase1({ ...REFERENCE, ...o }).total;
  const funding = FOUNDERS * P.exist.perPersonMonth;
  return {
    base,
    funding: { perMonth: funding, months: P.exist.months, material: P.exist.materialTeam, hessenMonths: P.hessenIdeen.months },
    levers: [
      { id: "web", label: "Abo im Web statt im App-Store abschließen", eur: delta({ storeShare: 0.1 }), detail: "Store 15 %, Web-Jahresabo unter 2 %" },
      { id: "photo", label: "Foto-Erkennung nur im Bezahl-Abo", eur: delta({ freePhotoIds: 0 }), detail: "0,05 € je Erkennung; Free-Nutzer sind die Masse" },
      { id: "tax", label: "Steuerberatung zum Festpreis (digital)", eur: delta({ taxAdvisorYear: P.taxAdvisorYear.low }), detail: "1.200 statt 2.500 € im Jahr für eine UG." },
      { id: "staging", label: "Testsystem nur bei Bedarf starten", eur: delta({ stagingServer: false }), detail: "Stündlich abgerechnet; nur vor Releases laufen lassen." },
      { id: "model", label: "Kleines KI-Modell für den Chat behalten", eur: phase1({ ...REFERENCE, model: "sonnet" }).total - base.total, detail: "Großes Modell kostet ca. 20× mehr je Frage" },
    ],
  };
}

/** Compatibility stage: test devices, own-hardware costs that do not arise, and the Expert tariff that fits. */
export function compatCosts() {
  const h = hardwareCosts();
  const pilot = h.pilot.reduce((s, p) => s + p.eur, 0);
  const testDevices = COMPAT_SYSTEMS.reduce((s, x) => s + (x.deviceGross ?? 0), 0);
  const expert = tariffEconomics(TARIFFS.find((t) => t.id === "expert")!);
  return {
    systems: COMPAT_SYSTEMS,
    testDevicesKnownGross: testDevices,
    avoided: { pilot, low: pilot + h.certification.emcLow + h.certification.weee, high: pilot + h.certification.emcHigh + h.certification.weee },
    kitDbForgone: h.kit.db,
    ingestPerDevice: h.perDeviceMonth.ingest,
    expert,
  };
}

/** cost per registration from the ad funnel (CPM → clicks → registrations) */
export const costPerRegistration = (f: { cpm: number; ctr: number }) => f.cpm / 1000 / f.ctr / M.funnel.registrationFromClick;

export type Range = { low: number; high: number; base?: number };
export type PhaseCost = { id: string; phase: string; goal: string; oneOff: Range; oneOffNote: string; running: string; marketing: Range; marketingNote: string };

/** Costs per phase without staff: one-off, running and advertising (see docs/operating-costs.md). */
export function phaseCosts() {
  const cpr = { low: costPerRegistration(M.funnel.optimistic), base: costPerRegistration(M.funnel.base), high: costPerRegistration(M.funnel.cautious) };
  const target = M.phase1TargetUsers;
  const p1Small = phase1({ users: 2000, paidShare: 0.05 }).total;
  const p1Ref = phase1({ users: 10000, paidShare: 0.05 }).total;
  const c = compatCosts();
  const h = hardwareCosts();
  const pilot = h.pilot.reduce((s, p) => s + p.eur, 0);
  const cert = { low: h.certification.emcLow + h.certification.weee, high: h.certification.emcHigh + h.certification.weee };
  const flyers = { low: (M.pilotFlyers / 1000) * M.flyerA5Per1000.low, high: (M.pilotFlyers / 1000) * M.flyerA5Per1000.high };
  const influencer = { low: M.kitInfluencerPosts * M.influencerPost.low, high: M.kitInfluencerPosts * M.influencerPost.high };

  const phases: PhaseCost[] = [
    {
      id: "phase1", phase: "Phase 1 · digital", goal: `${target.toLocaleString("de-DE")} Nutzer, ${Math.round(target * 0.05).toLocaleString("de-DE")} zahlend (Betrieb gedeckt)`,
      oneOff: { low: 0, high: 0 }, oneOffNote: "keine Hardware",
      running: `${Math.round(p1Small).toLocaleString("de-DE")}–${Math.round(p1Ref).toLocaleString("de-DE")} €/Monat`,
      marketing: { low: target * cpr.low, base: target * cpr.base, high: target * cpr.high },
      marketingNote: `Anzeigen, ${euroText(cpr.base)} je Registrierung; erst ${M.phase1TestBudget.toLocaleString("de-DE")} € Test`,
    },
    {
      id: "compat", phase: "Vorstufe · kompatibel", goal: "Expert-Kunden mit eigenen Sensoren",
      oneOff: { low: c.testDevicesKnownGross, high: c.testDevicesKnownGross }, oneOffNote: "Testgeräte",
      running: "+0,004 € je Gerät/Monat",
      marketing: { low: M.compatSearchBudget, high: M.compatSearchBudget }, marketingNote: `Suchanzeigen-Test, ca. ${Math.round(M.compatSearchBudget / M.googleCpc.eur)} Klicks`,
    },
    {
      id: "pilot", phase: "Phase 2 · Pilot", goal: "5–10 Pilotgärten in Nordhessen",
      oneOff: { low: pilot, high: pilot }, oneOffNote: "5 × Prototyp 1, 10 × Prototyp 2",
      running: "ca. 0 € (eigener Server)",
      marketing: flyers, marketingNote: `${M.pilotFlyers.toLocaleString("de-DE")} Flyer für Kleingartenvereine`,
    },
    {
      id: "kit", phase: "Phase 3 · Kit-Verkauf", goal: "Zulassung, dann Verkauf",
      oneOff: cert, oneOffNote: "EMV-/Funkprüfung, Registrierung",
      running: `+${euroText(h.kit.db)} je Kit`,
      marketing: influencer, marketingNote: `${M.kitInfluencerPosts} Micro-Influencer-Posts; max. ${Math.floor(h.kit.db)} € Werbung je Kit`,
    },
  ];
  const sum = (k: "oneOff" | "marketing", side: "low" | "high") => phases.reduce((s, p) => s + p[k][side], 0);
  return {
    phases, cpr,
    cacPerPaying: { base: cpr.base / 0.05, low: cpr.low / 0.1, high: cpr.high / 0.05 },
    total: { low: sum("oneOff", "low") + sum("marketing", "low"), high: sum("oneOff", "high") + sum("marketing", "high") },
  };
}

function euroText(v: number) {
  return `${v.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}
