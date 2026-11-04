/**
 * Business-model inputs from source_documents/GardenTwin_Geschaeftsmodell_Finanzkalkulation.md.
 * Only inputs are stored here; every derived figure (net prices, ARPU, contribution, break-even …) is computed
 * in utils/finance.ts. The document's derived values for the tariff mix are wrong (ARPU 6,53 € instead of
 * 6,29 €), so nothing downstream is copied from it.
 */

export const VAT = 1.19;

export type TariffId = "free" | "basic" | "erweitert" | "expert";
export type Tariff = {
  id: TariffId;
  name: string;
  /** gross B2C price per month (monthly equivalent with annual billing) */
  gross: number;
  /** variable cost per customer and month (cloud, AI, support, payment) */
  variableCost: number;
  benefit: string;
  hardware: string;
};

export const TARIFFS: readonly Tariff[] = [
  { id: "free", name: "Free", gross: 0, variableCost: 0.1, benefit: "1 Garten mit bis zu 3 Zonen, Planung, manuelle Pflegeeinträge", hardware: "Keine erforderlich" },
  { id: "basic", name: "Basic", gross: 4.99, variableCost: 0.8, benefit: "Wetterbasierte Empfehlungen, Pflegekalender, digitaler Gartenstatus", hardware: "Keine Sensorintegration" },
  { id: "erweitert", name: "Erweitert", gross: 9.99, variableCost: 1.8, benefit: "Sensorintegration, Historie, Benachrichtigungen, später Bewässerung", hardware: "Sensor-Kit separat (Kauf)" },
  { id: "expert", name: "Expert", gross: 14.99, variableCost: 2.8, benefit: "Eigene Sensoren, offene Schnittstellen, Regeln, Datenexport", hardware: "Eigene oder unsere Hardware" },
];
export const PAID_TARIFFS = TARIFFS.filter((t) => t.id !== "free");

/** share of Basic / Erweitert / Expert among paying customers (scenario matrix, section 13) */
export type Mix = readonly [number, number, number];
export const MIXES: Record<"vorsichtig" | "basis" | "positiv", Mix> = {
  vorsichtig: [0.8, 0.15, 0.05],
  basis: [0.6, 0.3, 0.1],
  positiv: [0.4, 0.4, 0.2],
};

/** Sensor starter kit (purchase model, section 3.1) */
export const KIT = { prices: [129, 149, 179, 199] as const, basePrice: 149, cogs: 85, fulfilment: 10, warrantyReserve: 5 } as const;

/** Hardware rental (section 3.3) — recommended only after pilot data */
export const RENTAL = { upfrontCost: 95, feeGross: 7.99, serviceCost: 1 } as const;

export type FinanceParams = {
  /** active registered users */
  registered: number;
  /** registered → paying conversion */
  conversion: number;
  mix: Mix;
  /** fixed costs per month */
  fixedCosts: number;
  /** variable cost per active free user and month */
  freeCost: number;
  /** one-off acquisition cost per new paying customer */
  cac: number;
  /** monthly paid churn */
  churn: number;
  /** share of new paying customers who buy a kit */
  kitShare: number;
  /** gross kit price */
  kitPrice: number;
};

/** Worked example of section 10 (base assumptions) */
export const BASE_PARAMS: FinanceParams = {
  registered: 2000, conversion: 0.05, mix: MIXES.basis, fixedCosts: 6000, freeCost: 0.1, cac: 25, churn: 0.05, kitShare: 0.3, kitPrice: 149,
};

export type Preset = { id: string; label: string; hint: string; params: FinanceParams };

/**
 * Presets. "Beispiel" is the worked example (section 10.3). The three year-3 states are section 11:
 * paying/free customers 500/4.500, 2.500/22.500, 10.000/90.000 (= 10 % paying) with fixed costs 6/12/25 k€,
 * and otherwise the base assumptions.
 */
export const PRESETS: readonly Preset[] = [
  { id: "beispiel", label: "Beispiel", hint: "2.000 aktive Nutzer, 5 % zahlend (Kap. 10)", params: BASE_PARAMS },
  { id: "j3-vorsichtig", label: "Jahr 3 · vorsichtig", hint: "500 zahlend, 4.500 Free, 6.000 € Fixkosten", params: { ...BASE_PARAMS, registered: 5000, conversion: 0.1, fixedCosts: 6000 } },
  { id: "j3-basis", label: "Jahr 3 · Basis", hint: "2.500 zahlend, 22.500 Free, 12.000 € Fixkosten", params: { ...BASE_PARAMS, registered: 25000, conversion: 0.1, fixedCosts: 12000 } },
  { id: "j3-ambitioniert", label: "Jahr 3 · ambitioniert", hint: "10.000 zahlend, 90.000 Free, 25.000 € Fixkosten", params: { ...BASE_PARAMS, registered: 100000, conversion: 0.1, fixedCosts: 25000 } },
];

/** scenario matrix (section 13): cautious / base / positive marks shown on the sliders */
export const MARKS = {
  conversion: [0.02, 0.05, 0.1],
  cac: [50, 25, 15],
  churn: [0.08, 0.05, 0.02],
  freeCost: [0.2, 0.1, 0.05],
} as const;

/** churn values of the LTV table (section 8.2) */
export const CHURN_TABLE = [0.02, 0.05, 0.08, 0.12] as const;
