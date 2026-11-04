/**
 * System-architecture content, migrated verbatim from original_prototype/gardentwin/GardenTwinArchitecture.jsx
 * (names, sub-lines, detail texts, edges, level labels). Positions are the original map coordinates on a
 * 1100 × 745 canvas; node boxes are 194 × 86. Only the colours were changed to match the deck.
 */

export type ArchLevel = 1 | 2 | 3;
export type ArchGroup = "input" | "core" | "cloud" | "output";

export type ArchNode = {
  id: string;
  name: string;
  sub: string;
  /** the level from which the node is part of the system */
  level: ArchLevel;
  x: number;
  y: number;
  group: ArchGroup;
  detail: string;
};

/** a data flow from → to, active from `level` on */
export type ArchEdge = { from: string; to: string; level: ArchLevel };

export const MAP = { width: 1100, height: 745, nodeWidth: 194, nodeHeight: 86 } as const;

export const ARCH_NODES: readonly ArchNode[] = [
  { id: "photo", name: "Gartenbilder", sub: "Upload · Kamera · Luftbild", level: 1, x: 25, y: 70, group: "input", detail: "Fotos werden hochgeladen, EXIF-Daten entfernt und als private Objekte gespeichert. Bilderkennung schlägt Beete, Wege und Pflanzen vor; Nutzer bestätigt." },
  { id: "editor", name: "Garten-Editor", sub: "Zonen · Pflanzen · Standort", level: 1, x: 25, y: 205, group: "input", detail: "Interaktiver 2D-Gartenplan. Pflanzenarten, Beetgrenzen, Lichtverhältnisse und Nutzereingaben werden im zentralen Gartenmodell gespeichert." },
  { id: "weather", name: "Wetter-API", sub: "Prognose · Regen · ET₀", level: 1, x: 25, y: 340, group: "input", detail: "Standortbasierte Wettervorhersagen und Niederschlagsdaten. Anbieter über austauschbare Adapter anbinden; Cache und Ausfallstrategie vorsehen." },
  { id: "api", name: "API + Auth", sub: "HTTPS · Nutzer · Rechte", level: 1, x: 310, y: 140, group: "core", detail: "React-Frontend spricht über HTTPS mit Backend-API. Nutzer-, Garten- und Geräteberechtigungen werden serverseitig geprüft." },
  { id: "twin", name: "Garden Digital Twin", sub: "Zonen · Pflanzen · Zustände", level: 1, x: 310, y: 285, group: "core", detail: "Zentrales Domänenmodell: Garden → Zone → Plant; Sensor → Zone; Valve → Irrigation Zone. Zustände sind zeitlich versioniert." },
  { id: "ai", name: "Analyse + KI", sub: "Vision · Regeln · Empfehlungen", level: 1, x: 595, y: 150, group: "cloud", detail: "Bildanalyse und Pflanzenklassifikation, deterministische Regeln, Wetter-basierte Pflegehinweise. KI-Ergebnisse mit Konfidenz und Quellen versehen." },
  { id: "db", name: "Datenplattform", sub: "Postgres · Timeseries · Bilder", level: 1, x: 595, y: 290, group: "cloud", detail: "PostgreSQL für Stammdaten, Zeitreihen für Messwerte, Object Storage für Bilder. Event-Protokoll und Monitoring ergänzen." },
  { id: "app", name: "React Web-App", sub: "Plan · Status · Aufgaben", level: 1, x: 880, y: 220, group: "output", detail: "Nutzer sieht Gartenkarte, erkannte Pflanzen, Pflegekalender, Wetterhinweise und nachvollziehbare Empfehlungen." },
  { id: "sensors", name: "Modulare Sensoren", sub: "Eigene · Drittanbieter · Zigbee", level: 2, x: 25, y: 490, group: "input", detail: "Geräteprofile und Adapter je Hersteller. WLAN-Sensoren, Zigbee/Thread über kompatible Bridge, BLE lokal, optional Modbus/LoRaWAN. Nicht jeder Hersteller ist offen integrierbar." },
  { id: "gateway", name: "Garden Gateway", sub: "Normalisierung · Offline-Puffer", level: 2, x: 310, y: 490, group: "core", detail: "Lokales Gateway sammelt Daten, übersetzt Herstellerprotokolle in ein einheitliches Schema, puffert offline und authentifiziert Geräte. WLAN oder LTE als Uplink." },
  { id: "mqtt", name: "IoT-Ingestion", sub: "MQTT/TLS · Validierung", level: 2, x: 595, y: 490, group: "cloud", detail: "MQTT-Broker und Ingestion-Service prüfen Geräteidentität, Datenformat, Zeitstempel und Qualität; persistieren Messwerte und aktualisieren den Zwilling." },
  { id: "engine", name: "Bewässerungs-Engine", sub: "Regeln · Prognosen · Freigabe", level: 3, x: 595, y: 635, group: "cloud", detail: "Erstellt Bewässerungspläne je Zone anhand Pflanzenart, Feuchte, Niederschlagsprognose und Grenzwerten. Jede Aktion wird protokolliert und ist widerrufbar." },
  { id: "control", name: "Lokaler Controller", sub: "Failsafe · Limits · Watchdog", level: 3, x: 310, y: 635, group: "core", detail: "Prüft signierte/authorisierte Befehle, maximale Laufzeit, Offline-Verhalten und Not-Aus. Bei Kommunikationsfehlern bleibt das Ventil standardmäßig geschlossen." },
  { id: "valves", name: "Ventile + Durchfluss", sub: "Zonenweise Bewässerung", level: 3, x: 25, y: 635, group: "input", detail: "Ventile/Pumpe schalten zonenweise. Durchflusssensor und Leckageerkennung sind für späteren Produktbetrieb empfehlenswert. Lokale manuelle Übersteuerung." },
];

export const ARCH_EDGES: readonly ArchEdge[] = (
  [
    ["photo", "api", 1], ["editor", "api", 1], ["weather", "api", 1], ["api", "twin", 1], ["twin", "ai", 1], ["twin", "db", 1], ["ai", "app", 1], ["db", "app", 1],
    ["sensors", "gateway", 2], ["gateway", "mqtt", 2], ["mqtt", "db", 2], ["mqtt", "twin", 2],
    ["ai", "engine", 3], ["twin", "engine", 3], ["engine", "control", 3], ["control", "valves", 3], ["valves", "gateway", 3],
  ] as const
).map(([from, to, level]) => ({ from, to, level }));

export const ARCH_LEVELS: readonly { level: ArchLevel; button: string; band: string; bandY: number; defaultNode: string }[] = [
  { level: 1, button: "01 · Digital", band: "Level 1 · Digital", bandY: 13, defaultNode: "twin" },
  { level: 2, button: "02 · Sensorik", band: "Level 2 · Sensorik", bandY: 450, defaultNode: "gateway" },
  { level: 3, button: "03 · Automatisierung", band: "Level 3 · Automatisierung", bandY: 595, defaultNode: "engine" },
];

export const ARCH_GROUP_LABEL: Record<ArchGroup, string> = {
  input: "Garten / Geräte",
  core: "Backend / Gateway",
  cloud: "Cloud / KI",
  output: "Nutzeroberfläche",
};

export const ARCH_TEXT = {
  title: "GardenTwin · Systemarchitektur",
  subtitle: "Interaktive modulare Infrastruktur · Konzeptvisualisierung",
  pause: "⏸ Animation pausieren",
  play: "▶ Animation starten",
  footnote: (level: ArchLevel) => `Aktiv: Level 1–${level} · Datenflüsse sind schematisch, nicht maßstabsgetreu.`,
  // added in the migration (derived from the edges, not new content)
  incoming: "Eingang",
  outgoing: "Ausgang",
  none: "—",
} as const;
