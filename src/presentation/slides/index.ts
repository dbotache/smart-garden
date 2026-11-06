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
import Backup01 from "./Backup01";
import Backup02 from "./Backup02";
import Backup03 from "./Backup03";

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
  { id: "market", title: "Zielgruppe + Markt", section: "WHAT · ZIELGRUPPE + MARKT", Component: Slide04, source: { type: "pptx", slide: 5 },
    notes: "Quellen: KfW Research, Volkswirtschaft Kompakt Nr. 263 (Juni 2026), 60 % von 41 Mio. Haushalten. Bundesverband der Kleingartenvereine Deutschlands, Geschäftsbericht 2023. Destatis, Pressemitteilung Nr. 052 vom Februar 2026. Offen: Zahl der Kleingartenvereine in Nordhessen, dafür beim Landesverband Hessen nachfragen." },
  { id: "product-videos", title: "PlantWiz in Aktion", section: "VIDEO", Component: Slide05,
    source: { type: "new", reason: "Four short product clips on one slide, between market and vision." },
    notes: "[Neu] Die vier Clips laufen automatisch nacheinander mit doppelter Geschwindigkeit. Ein Durchlauf dauert 40 Sekunden. Danach beginnt die Reihenfolge wieder von vorn." },
  { id: "vision", title: "Vision", section: "WHAT · VISION", Component: Slide06, source: { type: "pptx", slide: 4 },
    notes: "Links der echte Kalender der App. Die linke Spalte läuft bereits, die rechte ist unser Weg dorthin. Wichtig für die Jury: Wir starten nicht bei null, die Software steht. Insektenfreundlichkeit: Jede Pflanze hat einen Wert von 1 bis 5, der Gartenplan kann ihn farbig anzeigen, und der Beet-Generator filtert danach. Das passt direkt zur Mission, blühende Gärten statt Steingärten." },
  { id: "business", title: "Geschäftsmodell", section: "HOW · GESCHÄFTSMODELL", Component: Slide07, source: { type: "pptx", slide: 7 },
    notes: `[Robin]

Wir wollen, dass man PlantWiz direkt am eigenen Garten ausprobieren kann. In Free kann ich einen Garten anlegen, Pflanzen erkennen und erste Krankheitsanalysen machen. Wer mehrere Gärten plant oder alle digitalen Funktionen wie Beetvorschläge und Pflegekalender nutzen möchte, wechselt zu Basic. Unser Preisvorschlag liegt bei 4,99 Euro im Monat bei Jahreszahlung. Sensoren und Benachrichtigungen sind für Erweitert geplant.

Zusätzlich wollen wir mit Affiliate-Marketing Geld verdienen. Wenn jemand über einen Link in PlantWiz Saatgut, Dünger, Gartenwerkzeug, Pflanzen oder Bäume bei einem Partner kauft, erhalten wir eine Provision.

In der Beta schauen wir, wie viele vom kostenlosen Einstieg zu Basic wechseln und was die KI-Nutzung pro aktivem Free-Konto kostet. Daraus leiten wir die Free-Kontingente ab.

[Für Rückfragen: Kosten und Erlöse stehen in den Backup-Folien (/presentation/backup). Der dort hinterlegte Tarifmix enthält auch spätere Tarife (Expert) und ist eine Planungsannahme.]` },
  { id: "roadmap", title: "Roadmap", section: "HOW · ROADMAP", Component: Slide08,
    source: { type: "new", reason: "Pitch roadmap for product, market research and scalability (from pitch/plantwiz-updates)." },
    notes: "[Neu] Das ist unser Vorschlag für die ersten sechs Monate ab Projektstart. Wir beginnen mit der mobilen Variante und der Marktrecherche. Ab dem zweiten Monat arbeiten wir daran, aus Fotos oder Videos einen digitalen Zwilling zu erstellen. Parallel verbessern wir die Bedienung. In der zweiten Hälfte bereiten wir die Technik auf mehr Nutzer und Gärten vor." },
  { id: "call", title: "Call + Outlook", section: "CALL · OUTLOOK", Component: Slide09, source: { type: "pptx", slide: 9 },
    notes: "Klare Ansage zum Schluss: Wer einen Garten, einen Verein oder Hardware-Erfahrung hat, soll uns direkt nach dem Pitch ansprechen. Die Vorlage war hier leer, der Punkt Pilotgärten ist ein Vorschlag. Rechts läuft das Abschlussvideo (stumm, in Schleife)." },
];

/** Backup slides for questions: own deck at /presentation/backup (not part of the talk). */
export const BACKUP_SLIDES: SlideDefinition[] = [
  { id: "phase1-costs", title: "Phase 1: Kosten digital", section: "HOW · PHASE 1: NUR DIGITAL", Component: Backup01,
    source: { type: "new", reason: "Running costs of the digital-only phase with researched prices (docs/operating-costs.md)." },
    notes: "[Neu] Phase 1 ist nur digital: viele Free-Nutzer, 5–10 % zahlen Basic für 4,99 €. Erweitert und Expert brauchen Hardware und kommen später. Oben umschalten: 2.000, 10.000, 50.000 Nutzer. Titel: Ab 140 zahlenden Kunden – das sind bei 5 % Conversion 2.800 aktive Nutzer, bei 10 % nur 1.300 – deckt die App ihre Betriebskosten; der Großteil der Kosten ist fix (rund 430 €). Bei 10.000 Nutzern und 5 % zahlend: rund 2.100 € Umsatz, knapp 1.000 € Betriebskosten, gut 1.100 € bleiben für Personal. Größter variabler Posten ist die Foto-Erkennung, nicht die Server. Die mit Stern markierten Werte sind unsere Nutzungsannahmen – genau die misst Phase 1, zusammen mit der Zahlungsbereitschaft und dem Interesse am Sensor-Kit." },
  { id: "prototypes", title: "Prototypen + Kosten", section: "HOW · PROTOTYPEN + KOSTEN", Component: Backup02,
    source: { type: "new", reason: "Material budgets of the three hardware prototypes (source_documents/GardenTwin_Prototyp_Level_Kostenvergleich.md)." },
    notes: "[Neu] Drei Prototypen, jeweils Stückliste plus 15 % Reserve. Prototyp 1 (55 €) zuerst: Sensorik und Datenpipeline mit geringem Risiko. Prototyp 2 (178 €) für Demo und Pitch: messen, interpretieren, handeln mit einer Bewässerungszone. Prototyp 3 (458 €) erst nach Strommessungen: LTE und Solar sind eigene Projekte. Schalter oben rechts rechnet auf 5, 10 oder 25 Pilotgeräte hoch. Korrektur: Die Stückliste von Prototyp 3 ergibt 398 € Material, nicht 438 € wie in der Vorlage. Bezug zur Architektur: Prototyp 1 deckt Level 2 (Sensorik) ab, Prototyp 2 zusätzlich Level 3 (Bewässerung)." },
  { id: "compat-costs", title: "Vorstufe: kompatibel", section: "HOW · VORSTUFE: KOMPATIBEL", Component: Backup03,
    source: { type: "new", reason: "Variant of the hardware slide: connect third-party sensors instead of shipping own hardware (research in docs/operating-costs.md)." },
    notes: "[Neu] Vorstufe zwischen Phase 1 und eigener Hardware: Wir liefern kein Gerät, sondern binden an, was Kunden schon haben – Home Assistant mit Zigbee-Sensoren, Netatmo, später Ecowitt und Gardena, sobald deren Bedingungen geklärt sind. Das spart einmalig 3,5 bis 4,8 T€ für Pilotgeräte, Prüfung und Registrierung, und es gibt kein Lager und keine Garantie. Dafür fällt der Kit-Gewinn weg, und wir hängen an fremden Schnittstellen; bei Gardena nennt eine inoffizielle Quelle etwa 10.000 Anfragen im Monat je App. Erlös kommt über Expert für 14,99 €, laut Plan 9,80 € Deckungsbeitrag im Monat. Die Vorstufe beantwortet, ob sich ein eigenes Kit lohnt: wie verbreitet Sensoren sind, wer dafür zahlt und was fremder Hardware fehlt." },
];
