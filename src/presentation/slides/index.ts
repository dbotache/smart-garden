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
import Slide17 from "./Slide17";
import Slide18 from "./Slide18";
import Slide19 from "./Slide19";
import Slide20 from "./Slide20";
import Slide21 from "./Slide21";

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

[Für Rückfragen: Die Break-even-Szenarien stehen auf den Folien 10–15. Der dort hinterlegte Tarifmix enthält auch spätere Tarife und ist eine Planungsannahme.]` },
  { id: "architecture", title: "Systemarchitektur", section: "HOW · SYSTEMARCHITEKTUR", Component: Slide08,
    source: { type: "new", reason: "Interactive infrastructure diagram migrated from original_prototype/gardentwin; follows the tier slide." },
    notes: "[Neu] Die Infrastruktur hinter den drei Ebenen. Level 1 zeigt den digitalen Zwilling, Level 2 ergänzt Sensoren, Gateway und IoT-Ingestion, Level 3 die Bewässerungs-Engine mit lokalem Controller und Ventilen. Ein Modul anklicken zeigt Beschreibung, Eingänge und Ausgänge. Konzeptvisualisierung: Datenflüsse sind schematisch, kein laufendes Backend." },
  { id: "prototypes", title: "Prototypen + Kosten", section: "HOW · PROTOTYPEN + KOSTEN", Component: Slide09,
    source: { type: "new", reason: "Material budgets of the three hardware prototypes (source_documents/GardenTwin_Prototyp_Level_Kostenvergleich.md)." },
    notes: "[Neu] Drei Prototypen, jeweils Stückliste plus 15 % Reserve. Prototyp 1 (55 €) zuerst: Sensorik und Datenpipeline mit geringem Risiko. Prototyp 2 (178 €) für Demo und Pitch: messen, interpretieren, handeln mit einer Bewässerungszone. Prototyp 3 (458 €) erst nach Strommessungen: LTE und Solar sind eigene Projekte. Schalter oben rechts rechnet auf 5, 10 oder 25 Pilotgeräte hoch. Korrektur: Die Stückliste von Prototyp 3 ergibt 398 € Material, nicht 438 € wie in der Vorlage. Bezug zur Architektur: Prototyp 1 deckt Level 2 (Sensorik) ab, Prototyp 2 zusätzlich Level 3 (Bewässerung)." },
  { id: "finance-summary", title: "Finanzplan", section: "HOW · FINANZPLAN", Component: Slide10,
    source: { type: "new", reason: "Investor summary of the financial plan: three year-3 scenarios, unit economics, pilot metrics (source_documents/GardenTwin_Geschaeftsmodell_Finanzkalkulation.md, sections 4, 8, 11, 13; recalculated)." },
    notes: "[Neu] Die Kurzfassung für Investoren. Links drei Zustände am Ende von Jahr 3, alle mit 10 % zahlenden Nutzern; sie unterscheiden sich nur in Nutzerbasis und Fixkosten (laut Plan nicht aufgeschlüsselt, rechnerisch überwiegend Personal – Folie 14). Vorsichtig: 500 zahlende Kunden, −3.953 € im Monat. Realistisch: 2.500 Kunden, −1.765 €, 85 % des Break-even. Ambitioniert: 10.000 Kunden, +15.941 € im Monat. Rechts die Einheit dahinter: Ein zahlender Kunde bringt 6,29 € netto und 4,99 € Deckungsbeitrag, die Akquisekosten von 25 € sind nach 5 Monaten zurückverdient, das Kit wird mit Gewinn verkauft. Unten: Diese drei Werte misst der Pilot. Wichtig: Das sind Monatszustände, keine Umsatz- oder Cashflow-Prognose. Danach die Kostenfolien 11–14; für Rückfragen das interaktive Modell auf Folie 15." },
  { id: "phase1-costs", title: "Phase 1: Kosten digital", section: "HOW · PHASE 1: NUR DIGITAL", Component: Slide11,
    source: { type: "new", reason: "Running costs of the digital-only phase with researched prices (docs/operating-costs.md)." },
    notes: "[Neu] Phase 1 ist nur digital: viele Free-Nutzer, 5–10 % zahlen Basic für 4,99 €. Erweitert und Expert brauchen Hardware und kommen später. Oben umschalten: 2.000, 10.000, 50.000 Nutzer. Titel: Ab 140 zahlenden Kunden – das sind bei 5 % Conversion 2.800 aktive Nutzer, bei 10 % nur 1.300 – deckt die App ihre Betriebskosten; der Großteil der Kosten ist fix (rund 430 €). Bei 10.000 Nutzern und 5 % zahlend: rund 2.100 € Umsatz, knapp 1.000 € Betriebskosten, gut 1.100 € bleiben für Personal. Größter variabler Posten ist die Foto-Erkennung, nicht die Server. Die mit Stern markierten Werte sind unsere Nutzungsannahmen – genau die misst Phase 1, zusammen mit der Zahlungsbereitschaft und dem Interesse am Sensor-Kit." },
  { id: "compat-costs", title: "Vorstufe: kompatibel", section: "HOW · VORSTUFE: KOMPATIBEL", Component: Slide12,
    source: { type: "new", reason: "Variant of the hardware slide: connect third-party sensors instead of shipping own hardware (research in docs/operating-costs.md)." },
    notes: "[Neu] Vorstufe zwischen Phase 1 und eigener Hardware: Wir liefern kein Gerät, sondern binden an, was Kunden schon haben – Home Assistant mit Zigbee-Sensoren, Netatmo, später Ecowitt und Gardena, sobald deren Bedingungen geklärt sind. Das spart einmalig 3,5 bis 4,8 T€ für Pilotgeräte, Prüfung und Registrierung, und es gibt kein Lager und keine Garantie. Dafür fällt der Kit-Gewinn weg, und wir hängen an fremden Schnittstellen; bei Gardena nennt eine inoffizielle Quelle etwa 10.000 Anfragen im Monat je App. Erlös kommt über Expert für 14,99 €, laut Plan 9,80 € Deckungsbeitrag im Monat. Die Vorstufe beantwortet, ob sich ein eigenes Kit lohnt: wie verbreitet Sensoren sind, wer dafür zahlt und was fremder Hardware fehlt." },
  { id: "hardware-costs", title: "Phase 2+3: Kosten Sensorik", section: "HOW · PHASE 2 + 3: MIT SENSORIK", Component: Slide13,
    source: { type: "new", reason: "One-off, per-kit and running costs of the sensor variants (prototype document, business plan section 3, research)." },
    notes: "[Neu] Bis zum ersten verkauften Kit fallen einmalig etwa 3,5 bis 4,8 T€ an: Pilotgeräte für 5–10 Gärten plus EMV-/Funkprüfung und Registrierung als Elektrogeräte-Hersteller. Jedes Kit bringt danach rund 25 € Deckungsbeitrag, 30 € ohne Garantiereserve wie im Businessplan. Laufend kostet ein Gerät fast nichts; teuer wird Support. LTE nur für Prototyp 3, und dann ohne Kamerabilder – das Datenvolumen der SIM reicht nur für Sensordaten." },
  { id: "savings", title: "Kosten senken", section: "HOW · KOSTEN SENKEN", Component: Slide14,
    source: { type: "new", reason: "Savings levers computed from the phase-1 cost model; grants from EXIST and Hessen Ideen." },
    notes: "[Neu] Die Technik ist nicht das Problem: Server, Steuerberatung, Recht und Tools kosten zusammen rund 430 € im Monat. Von den 6.000 € Fixkosten im Plan ist also fast alles Personal. Größter Hebel: die ersten 12 Monate über ein Gründerstipendium finanzieren, EXIST oder Hessen Ideen, die Uni Kassel koordiniert. Dann die technischen Hebel: Abo im Web statt im Store, Foto-Erkennung nur im Bezahl-Abo, kleines KI-Modell. Bei der Hardware: vorzertifiziertes Funkmodul, Pilot mit Prototyp 1 und 2, Kauf statt Miete." },
  { id: "finance", title: "Finanzmodell", section: "HOW · FINANZMODELL", Component: Slide15,
    source: { type: "new", reason: "Interactive financial model: free tier + three subscriptions, kit, break-even, CAC, LTV (source_documents/GardenTwin_Geschaeftsmodell_Finanzkalkulation.md)." },
    notes: "[Neu] Startpunkt ist das Rechenbeispiel aus dem Businessplan: 2.000 aktive Nutzer, 5 % zahlend. Ein zahlender Kunde bringt im Mix 60/30/10 im Schnitt 6,29 € netto und 4,99 € Deckungsbeitrag pro Monat. Dann die Jahr-3-Szenarien zeigen: vorsichtig −3.953 €, Basis −1.765 €, ambitioniert +15.941 € pro Monat. Hebel live zeigen: Conversion, Churn, CAC, Tarifmix. Korrektur: Die Vorlage rechnet mit 6,53 € ARPU und 5,23 € DB; mit ihren eigenen Tarifpreisen ergeben sich 6,29 € und 4,99 €. Alle Werte sind Planungsannahmen, keine Prognose." },
  { id: "next-steps", title: "Nächste Schritte", section: "HOW · NÄCHSTE SCHRITTE", Component: Slide16, source: { type: "pptx", slide: 8 },
    notes: "[Ergänzt] Beta und Kampagne stammen aus unserem Launch-Plan, die Hardware-Schritte sind neu. Bitte vor dem Pitch mit Diego abstimmen, was bis wann realistisch ist. Neu unten: Kosten je Phase ohne Personal, aus den Kostenfolien 11–14. Bis Phase 3 zusammen 11,6 bis 28,9 T€ für Geräte, Zulassung und Werbung, dazu 0,5 bis 1 T€ Betrieb im Monat. Größter Posten ist die Werbung in Phase 1: Um 2.800 aktive Nutzer zu gewinnen, rechnen wir mit Anzeigen bei 3,33 € je Registrierung rund 9.300 €; zuerst ein Test mit 1.000 €, um den echten Wert zu messen. Ehrlich sagen: Nur über Anzeigen kostet ein zahlender Kunde so rund 67 €, nicht 25 € wie im Plan – Kleingartenvereine, Influencer und Weiterempfehlung müssen den Schnitt senken. Original-PPTX: nur Arbeitspakete und Zeitstrahl, Text unverändert." },
  { id: "call", title: "Call + Outlook", section: "CALL · OUTLOOK", Component: Slide17, source: { type: "pptx", slide: 9 },
    notes: "Klare Ansage zum Schluss: Wer einen Garten, einen Verein oder Hardware-Erfahrung hat, soll uns direkt nach dem Pitch ansprechen. Die Vorlage war hier leer, die drei Punkte sind ein Vorschlag." },
  { id: "demo-planning", title: "Live-Demo 1: Planung", section: "DEMO · DIGITALER ZWILLING", Component: Slide18, garden: { stage: "planning" },
    source: { type: "new", reason: "Interactive prototype at the end of the deck, after the call (layer 1: digital twin)." },
    notes: "[Neu] Live-Demo: Haus und Grundstück erscheinen als maßstabsgetreue Skizze. Garten drehen, eine markierte Fläche anklicken und Größe, Besonnung und Boden zeigen. Alle Werte sind Demo-Daten." },
  { id: "demo-planting", title: "Live-Demo 2: Empfehlungen", section: "DEMO · PFLANZEMPFEHLUNGEN", Component: Slide19, garden: { stage: "planting" },
    source: { type: "new", reason: "Shows bed generator / companion-planting hints (already in the app) on the 3D twin." },
    notes: "[Neu] Die Beete füllen sich mit empfohlenen Arten. Tomate anklicken: Wert, Begründung (Mischkultur mit Basilikum) und Ansprüche. Bestandsbäume wurden per Foto erkannt. Beispieldaten, noch nicht aus dem Framework." },
  { id: "demo-monitoring", title: "Live-Demo 3: Sensoren", section: "DEMO · IOT-SENSOREN", Component: Slide20, garden: { stage: "monitoring" },
    source: { type: "new", reason: "Visualises layer 2 (IoT sensors, planned) with simulated data." },
    notes: "[Neu] Ebene 2 ist geplant – hier simuliert. Ein Bodensensor je Beet plus Wetterstation. Tomatenbeet öffnen: Bodenfeuchte 18 % unter Zielbereich. Wichtig: Der Pflegezustand ist eine Schätzung, kein Messwert." },
  { id: "demo-irrigation", title: "Live-Demo 4: Bewässerung", section: "DEMO · TEILAUTOMATISIERUNG", Component: Slide21, garden: { stage: "irrigation" },
    source: { type: "new", reason: "Visualises layer 3 (partial automation, planned): per-bed valves, adaptive vs. fixed timer." },
    notes: "[Neu] Ebene 3 ist geplant – hier simuliert. „Bewässerung abspielen“: nur Tomate und Basilikum werden gegossen. Dann „Feste Zeitschaltuhr“ zeigen: 120 L, drei Beete überwässert. Mit „Regen erwartet“ wartet Basilikum auf den Regen." },
];
