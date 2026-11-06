/**
 * The three hardware prototypes, from source_documents/GardenTwin_Prototyp_Level_Kostenvergleich.md.
 * Parts lists are copied line by line. Totals are NOT copied: they are computed from the lines
 * (utils/prototypeCosts.ts), because the document's total for prototype 3 is wrong (438 € stated, 398 € summed).
 *
 * Naming: the document calls them "Level 1–3". The deck already uses "Level" for the subscription tiers (slide 7)
 * and the architecture build-out (slide 8), so the slides say "Prototyp 1–3".
 */

export type CostCategory = "elektronik" | "kamera" | "konnektivitaet" | "bewaesserung" | "energie" | "gehaeuse";

export const CATEGORY_LABEL: Record<CostCategory, string> = {
  elektronik: "Controller + Sensorik",
  kamera: "Kamera",
  konnektivitaet: "LTE-Funk",
  bewaesserung: "Bewässerung",
  energie: "Stromversorgung",
  gehaeuse: "Gehäuse + Kleinmaterial",
};
export const CATEGORY_ORDER: readonly CostCategory[] = ["elektronik", "kamera", "konnektivitaet", "bewaesserung", "energie", "gehaeuse"];

export type BomLine = { part: string; qty: number; qtyLabel?: string; unit: number; category: CostCategory };

export type Prototype = {
  id: "p1" | "p2" | "p3";
  number: 1 | 2 | 3;
  name: string;
  goal: string;
  area: string;
  connection: string;
  power: string;
  development: string;
  /** rough market range from the document (not derived from the parts list) */
  range: [number, number];
  /** recommendation from section 6 */
  recommendation: string;
  sensors: string;
  functions: string;
  notes: string[];
  /** monthly running cost, if any */
  running?: string;
  /** what the document states as material total (kept to document the correction) */
  statedMaterial: number;
  bom: BomLine[];
};

export const RESERVE_RATE = 0.15;

export const PROTOTYPES: readonly Prototype[] = [
  {
    id: "p1", number: 1, name: "Sensor-Basis",
    goal: "Messwerte erfassen, Gartenkarte testen",
    area: "10–25 m²", connection: "WLAN", power: "5-V-Netzteil", development: "1–3 Wochen",
    range: [45, 75], recommendation: "Zuerst",
    sensors: "2 × Bodenfeuchte · BME280",
    functions: "Bodenfeuchte- und Luftmessung, WLAN-Datenübertragung, einfache Web-App. Keine Kamera oder Bewässerung.",
    notes: ["Sensoranschlüsse abdichten, BME280 im belüfteten Strahlungsschutz montieren"],
    statedMaterial: 48,
    bom: [
      { part: "ESP32 DevKit", qty: 1, unit: 7, category: "elektronik" },
      { part: "Kapazitiver Bodenfeuchtesensor", qty: 2, unit: 3.5, category: "elektronik" },
      { part: "BME280 Temperatur/Luftfeuchte", qty: 1, unit: 6, category: "elektronik" },
      { part: "USB-Netzteil + Kabel", qty: 1, unit: 9, category: "energie" },
      { part: "Leitungen, Stecker, Kleinmaterial", qty: 1, qtyLabel: "1 Set", unit: 7, category: "gehaeuse" },
      { part: "Einfaches wetterfestes Gehäuse", qty: 1, unit: 12, category: "gehaeuse" },
    ],
  },
  {
    id: "p2", number: 2, name: "Smart Garden",
    goal: "Kamera, Empfehlungen und Bewässerung demonstrieren",
    area: "25–75 m²", connection: "WLAN", power: "Netzteil(e), 12-V-Ventilversorgung", development: "4–8 Wochen",
    range: [140, 220], recommendation: "Für Demo + Pitch",
    sensors: "3 × Bodenfeuchte · BME280 · DS18B20 · BH1750 · Kamera · 1 Ventil",
    functions: "Sensorwerte, tägliche Bilder, digitale Gartenkarte, regelbasierte Empfehlungen und eine sicher gesteuerte Bewässerungszone.",
    notes: ["Vorhandener Wasseranschluss vorausgesetzt", "Optional Pumpe: +20–50 € oder mehr"],
    statedMaterial: 154.5,
    bom: [
      { part: "ESP32 DevKit", qty: 1, unit: 7, category: "elektronik" },
      { part: "ESP32-CAM inkl. Programmieradapter", qty: 1, unit: 13, category: "kamera" },
      { part: "Kapazitiver Bodenfeuchtesensor", qty: 3, unit: 3.5, category: "elektronik" },
      { part: "BME280", qty: 1, unit: 6, category: "elektronik" },
      { part: "DS18B20 wasserdicht", qty: 1, unit: 3, category: "elektronik" },
      { part: "BH1750 Lichtsensor", qty: 1, unit: 3, category: "elektronik" },
      { part: "12-V-Magnetventil (stromlos geschlossen)", qty: 1, unit: 15, category: "bewaesserung" },
      { part: "MOSFET-Treiber + Freilauf-/Schutzbeschaltung", qty: 1, unit: 7, category: "bewaesserung" },
      { part: "Tropfschlauch, Verbinder, Endstücke", qty: 1, qtyLabel: "1 Set", unit: 22, category: "bewaesserung" },
      { part: "Filter/Druckminderer/Anschluss", qty: 1, qtyLabel: "1 Set", unit: 18, category: "bewaesserung" },
      { part: "Geeignete 5-V- und 12-V-Versorgung", qty: 1, qtyLabel: "1 Set", unit: 18, category: "energie" },
      { part: "Wetterfeste Gehäuse/Kabelverschraubungen", qty: 1, qtyLabel: "1 Set", unit: 20, category: "gehaeuse" },
      { part: "Kabel, Stecker, Kleinmaterial", qty: 1, qtyLabel: "1 Set", unit: 12, category: "gehaeuse" },
    ],
  },
  {
    id: "p3", number: 3, name: "Autarkes System",
    goal: "Ohne Garten-WLAN und Netzstrom betreiben",
    area: "50–150 m²", connection: "LTE + SIM", power: "Akku + Solar + Spannungswandler", development: "8–16 Wochen",
    range: [320, 550], recommendation: "Nach Strommessungen",
    sensors: "4 × Bodenfeuchte · BME280 · DS18B20 · BH1750 · Kamera · 2 Ventile",
    functions: "Wie Prototyp 2, aber mit LTE statt Garten-WLAN und Solarstrom statt Netzteil; zwei Bewässerungszonen.",
    notes: ["20-W-Panel und Akku sind Testdimensionierungen, keine nachgewiesene Ganzjahresversorgung", "Pumpe nicht enthalten"],
    running: "Daten-SIM 3–8 €/Monat",
    statedMaterial: 438,
    bom: [
      { part: "ESP32 DevKit", qty: 1, unit: 7, category: "elektronik" },
      { part: "ESP32-CAM inkl. Programmieradapter", qty: 1, unit: 13, category: "kamera" },
      { part: "Kapazitiver Bodenfeuchtesensor", qty: 4, unit: 3.5, category: "elektronik" },
      { part: "BME280", qty: 1, unit: 6, category: "elektronik" },
      { part: "DS18B20", qty: 1, unit: 3, category: "elektronik" },
      { part: "BH1750", qty: 1, unit: 3, category: "elektronik" },
      { part: "LTE-Modem (z. B. SIM7600-Klasse)", qty: 1, unit: 65, category: "konnektivitaet" },
      { part: "LTE-Antenne, falls nicht enthalten", qty: 1, unit: 8, category: "konnektivitaet" },
      { part: "Solarpanel, ca. 20 W", qty: 1, unit: 40, category: "energie" },
      { part: "Passender Solarladeregler", qty: 1, unit: 20, category: "energie" },
      { part: "Akku mit Schutzschaltung (z. B. 12,8 V / 6 Ah)", qty: 1, unit: 55, category: "energie" },
      { part: "DC/DC-Wandler, Sicherungen, Energieverteilung", qty: 1, qtyLabel: "1 Set", unit: 20, category: "energie" },
      { part: "12-V-Ventile", qty: 2, unit: 15, category: "bewaesserung" },
      { part: "Treiber und Schutzbeschaltung", qty: 2, unit: 7, category: "bewaesserung" },
      { part: "Tropfschlauch und Verteiler", qty: 1, qtyLabel: "1 Set", unit: 30, category: "bewaesserung" },
      { part: "Filter, Druckminderer, Anschlüsse", qty: 1, qtyLabel: "1 Set", unit: 20, category: "bewaesserung" },
      { part: "Wetterfeste Gehäuse/Kabelverschraubungen", qty: 1, qtyLabel: "1 Set", unit: 30, category: "gehaeuse" },
      { part: "Kabel, Halterungen, Kleinmaterial", qty: 1, qtyLabel: "1 Set", unit: 20, category: "gehaeuse" },
    ],
  },
];

/** section 5 of the document: pilot fleet sizes */
export const FLEET_SIZES = [1, 5, 10, 25] as const;

export const NOT_INCLUDED =
  "Nicht enthalten: Entwicklungszeit, Cloud/KI, Pumpe, Wassertank, Installation, Zertifizierung, Wartung.";
