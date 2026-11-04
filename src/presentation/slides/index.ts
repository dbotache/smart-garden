import type { SlideDefinition } from "../config/types";
import Slide01 from "./Slide01";
import Slide02 from "./Slide02";
import Slide03 from "./Slide03";
import Slide04 from "./Slide04";
import Slide05 from "./Slide05";
import Slide06 from "./Slide06";
import Slide07 from "./Slide07";
import Slide08 from "./Slide08";
import Slide09 from "./Slide09";
import Slide10 from "./Slide10";
import Slide11 from "./Slide11";
import Slide12 from "./Slide12";
import Slide13 from "./Slide13";
import Slide14 from "./Slide14";
import Slide15 from "./Slide15";
import Slide16 from "./Slide16";

/**
 * Central slide registry — the ONLY place that defines order. Notes for PPTX slides are copied verbatim
 * from the PPTX notes pages; notes for the new demo slides are marked as new.
 */
export const SLIDES: SlideDefinition[] = [
  { id: "title", title: "PlantWiz – Dein Garten, dein Plan.", section: "Titel", Component: Slide01, source: { type: "pptx", slide: 1 },
    notes: "Einstieg: PlantWiz plant den Garten maßstabsgetreu und sagt danach, was er braucht. Wir zeigen heute, was schon läuft und wofür wir Unterstützung suchen." },
  { id: "team", title: "Team + Mission", section: "WHO · TEAM + MISSION", Component: Slide02, source: { type: "pptx", slide: 2 },
    notes: "Diego bringt IoT und KI mit, Robin Full-Stack-Entwicklung und KI. Das deckt beide Seiten des Produkts ab: App und Sensorik. Mission: Wer aus Unsicherheit zum Steingarten greift, soll mit PlantWiz einen blühenden Garten schaffen." },
  { id: "problem", title: "Problem + Challenges", section: "WHY · PROBLEM + CHALLENGES", Component: Slide03, source: { type: "pptx", slide: 3 },
    notes: "Peter steht für viele Einsteiger: Lust auf den eigenen Garten, aber wenig Wissen und wenig Zeit. Dazu kommt, dass der Markt aus Einzellösungen besteht. Wer plant, merkt oft erst im Beet, dass sich Arten nicht vertragen." },
  { id: "vision", title: "Vision", section: "WHAT · VISION", Component: Slide04, source: { type: "pptx", slide: 4 },
    notes: "Links der echte Kalender der App. Die linke Spalte läuft bereits, die rechte ist unser Weg dorthin. Wichtig für die Jury: Wir starten nicht bei null, die Software steht. Insektenfreundlichkeit: Jede Pflanze hat einen Wert von 1 bis 5, der Gartenplan kann ihn farbig anzeigen, und der Beet-Generator filtert danach. Das passt direkt zur Mission, blühende Gärten statt Steingärten." },
  { id: "market", title: "Zielgruppe + Markt", section: "WHAT · ZIELGRUPPE + MARKT", Component: Slide05, source: { type: "pptx", slide: 5 },
    notes: "Quellen: KfW Research, Volkswirtschaft Kompakt Nr. 263 (Juni 2026), 60 % von 41 Mio. Haushalten. Bundesverband der Kleingartenvereine Deutschlands, Geschäftsbericht 2023. Destatis, Pressemitteilung Nr. 052 vom Februar 2026. Offen: Zahl der Kleingartenvereine in Nordhessen, dafür beim Landesverband Hessen nachfragen." },
  { id: "tech", title: "Technische Realisierung", section: "HOW · TECHNISCHE REALISIERUNG", Component: Slide06, source: { type: "pptx", slide: 6 },
    notes: "Ebene 1 funktioniert ohne Hardware und ist der Einstieg für alle. Ebene 2 ergänzt Sensoren, damit Empfehlungen zum tatsächlichen Zustand passen. Ebene 3 steuert die Bewässerung für einzelne Arten. Stack heute: Vue, Express, MySQL, Keycloak, Android über Capacitor." },
  { id: "demo-planning", title: "Live-Demo 1: Planung", section: "DEMO · DIGITALER ZWILLING", Component: Slide07, garden: { stage: "planning" },
    source: { type: "new", reason: "Interactive prototype embedded after the three-layer slide (layer 1: digital twin)." },
    notes: "[Neu] Live-Demo: Haus und Grundstück erscheinen als maßstabsgetreue Skizze. Garten drehen, eine markierte Fläche anklicken und Größe, Besonnung und Boden zeigen. Alle Werte sind Demo-Daten." },
  { id: "demo-planting", title: "Live-Demo 2: Empfehlungen", section: "DEMO · PFLANZEMPFEHLUNGEN", Component: Slide08, garden: { stage: "planting" },
    source: { type: "new", reason: "Shows bed generator / companion-planting hints (already in the app) on the 3D twin." },
    notes: "[Neu] Die Beete füllen sich mit empfohlenen Arten. Tomate anklicken: Wert, Begründung (Mischkultur mit Basilikum) und Ansprüche. Bestandsbäume wurden per Foto erkannt. Beispieldaten, noch nicht aus dem Framework." },
  { id: "demo-monitoring", title: "Live-Demo 3: Sensoren", section: "DEMO · IOT-SENSOREN", Component: Slide09, garden: { stage: "monitoring" },
    source: { type: "new", reason: "Visualises layer 2 (IoT sensors, planned) with simulated data." },
    notes: "[Neu] Ebene 2 ist geplant – hier simuliert. Ein Bodensensor je Beet plus Wetterstation. Tomatenbeet öffnen: Bodenfeuchte 18 % unter Zielbereich. Wichtig: Der Pflegezustand ist eine Schätzung, kein Messwert." },
  { id: "demo-irrigation", title: "Live-Demo 4: Bewässerung", section: "DEMO · TEILAUTOMATISIERUNG", Component: Slide10, garden: { stage: "irrigation" },
    source: { type: "new", reason: "Visualises layer 3 (partial automation, planned): per-bed valves, adaptive vs. fixed timer." },
    notes: "[Neu] Ebene 3 ist geplant – hier simuliert. „Bewässerung abspielen“: nur Tomate und Basilikum werden gegossen. Dann „Feste Zeitschaltuhr“ zeigen: 120 L, drei Beete überwässert. Mit „Regen erwartet“ wartet Basilikum auf den Regen." },
  { id: "architecture", title: "Systemarchitektur", section: "HOW · SYSTEMARCHITEKTUR", Component: Slide11,
    source: { type: "new", reason: "Interactive infrastructure diagram migrated from original_prototype/gardentwin; follows the live demo." },
    notes: "[Neu] Die Infrastruktur hinter den drei Ebenen. Level 1 zeigt den digitalen Zwilling, Level 2 ergänzt Sensoren, Gateway und IoT-Ingestion, Level 3 die Bewässerungs-Engine mit lokalem Controller und Ventilen. Ein Modul anklicken zeigt Beschreibung, Eingänge und Ausgänge. Konzeptvisualisierung: Datenflüsse sind schematisch, kein laufendes Backend." },
  { id: "prototypes", title: "Prototypen + Kosten", section: "HOW · PROTOTYPEN + KOSTEN", Component: Slide12,
    source: { type: "new", reason: "Material budgets of the three hardware prototypes (source_documents/GardenTwin_Prototyp_Level_Kostenvergleich.md)." },
    notes: "[Neu] Drei Prototypen, jeweils Stückliste plus 15 % Reserve. Prototyp 1 (55 €) zuerst: Sensorik und Datenpipeline mit geringem Risiko. Prototyp 2 (178 €) für Demo und Pitch: messen, interpretieren, handeln mit einer Bewässerungszone. Prototyp 3 (458 €) erst nach Strommessungen: LTE und Solar sind eigene Projekte. Schalter oben rechts rechnet auf 5, 10 oder 25 Pilotgeräte hoch. Korrektur: Die Stückliste von Prototyp 3 ergibt 398 € Material, nicht 438 € wie in der Vorlage. Bezug zur Architektur: Prototyp 1 deckt Level 2 (Sensorik) ab, Prototyp 2 zusätzlich Level 3 (Bewässerung)." },
  { id: "business", title: "Geschäftsmodell", section: "HOW · GESCHÄFTSMODELL", Component: Slide13, source: { type: "pptx", slide: 7 },
    notes: "[Aktualisiert] Einstieg ohne Kosten, Geld verdienen wir mit dem Abo. Preise jetzt als Planungsannahme: Erweitert 9,99 €, Expert 14,99 € pro Monat bei Jahreszahlung. Das Sensor-Kit wird gekauft (149–199 €), nicht im Abo mitgeliefert; Miete erst nach Pilotdaten. Benchmark für die Conversion von Free zu Abo aus unserem Launch-Plan: 2 bis 5 %. Original-PPTX: Erweitert/Expert \"Preis offen\", Erweitert \"Abo inklusive Hardware\", Free \"Bis zu 3 Gärten\", Basic 29,99 €/Jahr." },
  { id: "finance", title: "Finanzmodell", section: "HOW · FINANZMODELL", Component: Slide14,
    source: { type: "new", reason: "Interactive financial model: free tier + three subscriptions, kit, break-even, CAC, LTV (source_documents/GardenTwin_Geschaeftsmodell_Finanzkalkulation.md)." },
    notes: "[Neu] Startpunkt ist das Rechenbeispiel aus dem Businessplan: 2.000 aktive Nutzer, 5 % zahlend. Ein zahlender Kunde bringt im Mix 60/30/10 im Schnitt 6,29 € netto und 4,99 € Deckungsbeitrag pro Monat. Dann die Jahr-3-Szenarien zeigen: vorsichtig −3.953 €, Basis −1.765 €, ambitioniert +15.941 € pro Monat. Hebel live zeigen: Conversion, Churn, CAC, Tarifmix. Korrektur: Die Vorlage rechnet mit 6,53 € ARPU und 5,23 € DB; mit ihren eigenen Tarifpreisen ergeben sich 6,29 € und 4,99 €. Alle Werte sind Planungsannahmen, keine Prognose." },
  { id: "next-steps", title: "Nächste Schritte", section: "HOW · NÄCHSTE SCHRITTE", Component: Slide15, source: { type: "pptx", slide: 8 },
    notes: "Beta und Kampagne stammen aus unserem Launch-Plan, die Hardware-Schritte sind neu. Bitte vor dem Pitch mit Diego abstimmen, was bis wann realistisch ist." },
  { id: "call", title: "Call + Outlook", section: "CALL · OUTLOOK", Component: Slide16, source: { type: "pptx", slide: 9 },
    notes: "Klare Ansage zum Schluss: Wer einen Garten, einen Verein oder Hardware-Erfahrung hat, soll uns direkt nach dem Pitch ansprechen. Die Vorlage war hier leer, die drei Punkte sind ein Vorschlag." },
];
