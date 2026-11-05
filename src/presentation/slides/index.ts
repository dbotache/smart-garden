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

/**
 * Central slide registry — the ONLY place that defines order. Notes for PPTX slides are copied verbatim
 * from the PPTX notes pages; notes for the new demo slides are marked as new.
 */
export const SLIDES: SlideDefinition[] = [
  { id: "title", title: "PlantWiz – Dein Garten, dein Plan.", section: "Titel", Component: Slide01, source: { type: "pptx", slide: 1 },
    notes: `Hallo, ich bin Robin und vor vier Jahren habe ich mir einen Traum erfüllt und ein Haus gebaut. Dazu sollte natürlich auch ein schöner Garten gehören. Aus anderen Gärten haben wir schnell die ersten Ableger bekommen. Auf einmal hatten wir rund 50 Pflanzen und standen vor der Frage: Was davon kommt eigentlich wohin?

Erst mal mussten wir herausfinden, was wir da überhaupt hatten. Wie groß wird die Pflanze? Wann blüht sie? Und in welcher Farbe?

Ein Jahr später haben wir angefangen umzupflanzen. Manche Pflanzen waren viel größer geworden als gedacht, andere sind daneben komplett untergegangen. Und als wir endlich einen besseren Platz gefunden hatten, merkten wir: Da hatten wir schon Tulpen gepflanzt.

[Kurz pausieren.]

Nach ein paar Runden Umpflanzen wollte ich das vorher sehen können. Also habe ich angefangen, einen digitalen Zwilling von unserem Garten zu bauen. Einen Plan, auf dem ich sehe, was wo schon wächst und wie sich das Beet entwickeln kann. Daraus ist PlantWiz entstanden.

Wir zeigen heute, was schon läuft und wofür wir Unterstützung suchen.` },
  { id: "team", title: "Team + Mission", section: "WHO · TEAM + MISSION", Component: Slide02, source: { type: "pptx", slide: 2 },
    notes: `Hallo, ich bin Diego. Robin habe ich hier beim StartUp Hack kennengelernt. Wir sind beide von KI begeistert und bringen jahrelange Erfahrung in der Softwareentwicklung und im IoT mit. Deshalb hat PlantWiz für uns beide sofort gepasst.

Mit PlantWiz wollen wir es Menschen leichter machen, einen Garten anzulegen und zu pflegen. Wir wollen weniger Steingärten und mehr blühende Gärten.` },
  { id: "pitch-video", title: "PlantWiz-Video", section: "VIDEO", Component: Slide17,
    source: { type: "new", reason: "Short video after the team and mission slide." },
    notes: "[Neu] Das Video startet automatisch und wiederholt sich alle 10 Sekunden. Zur Problemfolie weitergehen, sobald der Clip einmal durchgelaufen ist." },
  { id: "problem", title: "Problem + Challenges", section: "WHY · PROBLEM + CHALLENGES", Component: Slide03, source: { type: "pptx", slide: 3 },
    notes: `[Diego]

Peter steht für viele Menschen, die Lust auf einen eigenen Garten haben. Was sich wie ein fehlender grüner Daumen anfühlt, sind oft ganz konkrete Wissenslücken. Welche Pflanzen passen zusammen? Und was brauchen sie, damit sie gut wachsen?

Bei der Suche nach Antworten landet man schnell bei mehreren Einzellösungen. Ob sich zwei Pflanzen tatsächlich vertragen, merkt man dann oft erst im Beet.` },
  { id: "vision", title: "Vision", section: "WHAT · VISION", Component: Slide04, source: { type: "pptx", slide: 4 },
    notes: `[Robin]

Schauen wir uns an, was PlantWiz heute schon kann. Der digitale Zwilling zeigt eure Beete in 2D und 3D. Im Kalender seht ihr, wann es Zeit ist zu gießen, zu düngen, zu ernten oder zurückzuschneiden. PlantWiz hilft euch auch bei Mischkultur und Fruchtfolge und zeigt euch, wie insektenfreundlich die einzelnen Pflanzen sind.

Wenn ihr ein Beet planen wollt, könnt ihr einfach sagen, was euch wichtig ist. Zum Beispiel: Ich möchte niedrige, insektenfreundliche Pflanzen, die gelb und rot blühen. Aus diesen Kriterien erstellt PlantWiz einen passenden Beetvorschlag. Die KI hilft euch außerdem, Pflanzenarten und Krankheiten zu erkennen, und beantwortet Fragen rund um den Garten.

Als Nächstes wollen wir den Pflegezustand der Pflanzen vorhersagen, den Garten mit Sensoren überwachen und die Bewässerung automatisieren.` },
  { id: "product-videos", title: "PlantWiz in Aktion", section: "VIDEO", Component: Slide19,
    source: { type: "new", reason: "Four short product clips on one slide after the vision." },
    notes: "[Neu] Die vier Clips laufen automatisch nacheinander mit doppelter Geschwindigkeit. Ein Durchlauf dauert 40 Sekunden. Danach beginnt die Reihenfolge wieder von vorn." },
  { id: "market", title: "Zielgruppe + Markt", section: "WHAT · ZIELGRUPPE + MARKT", Component: Slide05, source: { type: "pptx", slide: 5 },
    notes: `[Diego]

Ein paar nackte Zahlen: Rund 60 Prozent der Haushalte in Deutschland haben einen Garten. Dazu kommen gut 13.000 Kleingartenvereine. Und allein 2025 wurden rund 44.500 neue Einfamilienhäuser genehmigt. Für PlantWiz steckt da Potenzial, vom bestehenden Kleingarten bis zum ersten Beet am neuen Haus.

Quellen: KfW Research, Volkswirtschaft Kompakt Nr. 263 (Juni 2026), 60 % von 41 Mio. Haushalten. Bundesverband der Kleingartenvereine Deutschlands, Geschäftsbericht 2023. Destatis, Pressemitteilung Nr. 052 vom Februar 2026. Offen: Zahl der Kleingartenvereine in Nordhessen, dafür beim Landesverband Hessen nachfragen.` },
  { id: "demo-planning", title: "Live-Demo 1: Planung", section: "DEMO · DIGITALER ZWILLING", Component: Slide07, garden: { stage: "planning" },
    source: { type: "new", reason: "Interactive prototype of the digital twin (layer 1)." },
    notes: "[Neu] Live-Demo: Haus und Grundstück erscheinen als maßstabsgetreue Skizze. Garten drehen, eine markierte Fläche anklicken und Größe, Besonnung und Boden zeigen. Alle Werte sind Demo-Daten." },
  { id: "demo-planting", title: "Live-Demo 2: Empfehlungen", section: "DEMO · PFLANZEMPFEHLUNGEN", Component: Slide08, garden: { stage: "planting" },
    source: { type: "new", reason: "Shows bed generator / companion-planting hints (already in the app) on the 3D twin." },
    notes: `[Neu] [Diego]

Bevor PlantWiz ein Beet vorschlägt, könnt ihr angeben, was euch wichtig ist. Welche Farben sollen blühen? Wie hoch dürfen die Pflanzen werden? Gibt es Arten, die ihr gern im Beet hättet? PlantWiz berücksichtigt diese Wünsche zusammen mit den Bedingungen am Standort.

[Tomate anklicken und auf die Begründung zur Mischkultur zeigen.]

Für dieses Beet seht ihr hier als Beispiel Tomate und Basilikum. Wenn ich die Tomate anklicke, sehe ich, was sie zum Wachsen braucht und warum Basilikum als Nachbar empfohlen wird. So kann ich den Vorschlag nachvollziehen und selbst entscheiden, was ich pflanzen möchte. Und sobald das Beet angelegt ist, stellt sich die nächste Frage: Muss ich heute überhaupt gießen?

[Demo-Hinweis: Beispieldaten. Die Bestandsbäume wurden per Foto erkannt.]` },
  { id: "demo-monitoring", title: "Live-Demo 3: Sensoren", section: "DEMO · IOT-SENSOREN", Component: Slide09, garden: { stage: "monitoring" },
    source: { type: "new", reason: "Visualises layer 2 (IoT sensors, planned) with simulated data." },
    notes: "[Neu] Ebene 2 ist geplant – hier simuliert. Ein Bodensensor je Beet plus Wetterstation. Tomatenbeet öffnen: Bodenfeuchte 18 % unter Zielbereich. Wichtig: Der Pflegezustand ist eine Schätzung, kein Messwert." },
  { id: "demo-irrigation", title: "Live-Demo 4: Bewässerung", section: "DEMO · TEILAUTOMATISIERUNG", Component: Slide10, garden: { stage: "irrigation" },
    source: { type: "new", reason: "Visualises layer 3 (partial automation, planned): per-bed valves, adaptive vs. fixed timer." },
    notes: "[Neu] Ebene 3 ist geplant – hier simuliert. „Bewässerung abspielen“: nur Tomate und Basilikum werden gegossen. Dann „Feste Zeitschaltuhr“ zeigen: 120 L, drei Beete überwässert. Mit „Regen erwartet“ wartet Basilikum auf den Regen." },
  { id: "business", title: "Geschäftsmodell", section: "HOW · GESCHÄFTSMODELL", Component: Slide13, source: { type: "pptx", slide: 7 },
    notes: `[Robin]

Wir wollen, dass man PlantWiz direkt am eigenen Garten ausprobieren kann. In Free kann ich einen Garten anlegen, Pflanzen erkennen und erste Krankheitsanalysen machen. Wer mehrere Gärten plant oder alle digitalen Funktionen wie Beetvorschläge und Pflegekalender nutzen möchte, wechselt zu Basic. Unser Preisvorschlag liegt bei 4,99 Euro im Monat bei Jahreszahlung. Sensoren und Benachrichtigungen sind für Erweitert geplant.

Zusätzlich wollen wir mit Affiliate-Marketing Geld verdienen. Wenn jemand über einen Link in PlantWiz Saatgut, Dünger, Gartenwerkzeug, Pflanzen oder Bäume bei einem Partner kauft, erhalten wir eine Provision.

In der Beta schauen wir, wie viele vom kostenlosen Einstieg zu Basic wechseln und was die KI-Nutzung pro aktivem Free-Konto kostet. Daraus leiten wir die Free-Kontingente ab.

[Für Rückfragen: Die Break-even-Szenarien stehen im Anhang. Der dort hinterlegte Tarifmix enthält auch spätere Tarife und ist eine Planungsannahme.]` },
  { id: "roadmap", title: "Roadmap", section: "HOW · ROADMAP", Component: Slide18,
    source: { type: "new", reason: "Pitch roadmap for product, market research and scalability." },
    notes: "[Neu] Das ist unser Vorschlag für die ersten sechs Monate ab Projektstart. Wir beginnen mit der mobilen Variante und der Marktrecherche. Ab dem zweiten Monat arbeiten wir daran, aus Fotos oder Videos einen digitalen Zwilling zu erstellen. Parallel verbessern wir die Bedienung. In der zweiten Hälfte bereiten wir die Technik auf mehr Nutzer und Gärten vor." },
  { id: "next-steps", title: "Nächste Schritte", section: "HOW · NÄCHSTE SCHRITTE", Component: Slide15, source: { type: "pptx", slide: 8 },
    notes: "Beta und Kampagne stammen aus unserem Launch-Plan, die Hardware-Schritte sind neu. Bitte vor dem Pitch mit Diego abstimmen, was bis wann realistisch ist." },
  { id: "call", title: "Call + Outlook", section: "CALL · OUTLOOK", Component: Slide16, source: { type: "pptx", slide: 9 },
    notes: "Klare Ansage zum Schluss: Wer einen Garten, einen Verein oder Hardware-Erfahrung hat, soll uns direkt nach dem Pitch ansprechen. Die Vorlage war hier leer, die drei Punkte sind ein Vorschlag." },
  { id: "tech", title: "Anhang · Technische Realisierung", section: "ANHANG", Component: Slide06, source: { type: "pptx", slide: 6 },
    notes: "Ebene 1 funktioniert ohne Hardware und ist der Einstieg für alle. Ebene 2 ergänzt Sensoren, damit Empfehlungen zum tatsächlichen Zustand passen. Ebene 3 steuert die Bewässerung für einzelne Arten. Stack heute: Vue, Express, MySQL, Keycloak, Android über Capacitor." },
  { id: "architecture", title: "Anhang · Systemarchitektur", section: "ANHANG", Component: Slide11,
    source: { type: "new", reason: "Interactive infrastructure diagram migrated from original_prototype/gardentwin." },
    notes: "[Neu] Die Infrastruktur hinter den drei Ebenen. Level 1 zeigt den digitalen Zwilling, Level 2 ergänzt Sensoren, Gateway und IoT-Ingestion, Level 3 die Bewässerungs-Engine mit lokalem Controller und Ventilen. Ein Modul anklicken zeigt Beschreibung, Eingänge und Ausgänge. Konzeptvisualisierung: Datenflüsse sind schematisch, kein laufendes Backend." },
  { id: "prototypes", title: "Anhang · Prototypen + Kosten", section: "ANHANG", Component: Slide12,
    source: { type: "new", reason: "Material budgets of the three hardware prototypes (source_documents/GardenTwin_Prototyp_Level_Kostenvergleich.md)." },
    notes: "[Neu] Drei Prototypen, jeweils Stückliste plus 15 % Reserve. Prototyp 1 (55 €) zuerst: Sensorik und Datenpipeline mit geringem Risiko. Prototyp 2 (178 €) für Demo und Pitch: messen, interpretieren, handeln mit einer Bewässerungszone. Prototyp 3 (458 €) erst nach Strommessungen: LTE und Solar sind eigene Projekte. Schalter oben rechts rechnet auf 5, 10 oder 25 Pilotgeräte hoch. Korrektur: Die Stückliste von Prototyp 3 ergibt 398 € Material, nicht 438 € wie in der Vorlage. Bezug zur Architektur: Prototyp 1 deckt Level 2 (Sensorik) ab, Prototyp 2 zusätzlich Level 3 (Bewässerung)." },
  { id: "finance", title: "Anhang · Finanzmodell", section: "ANHANG", Component: Slide14,
    source: { type: "new", reason: "Interactive financial model: free tier + three subscriptions, kit, break-even, CAC, LTV (source_documents/GardenTwin_Geschaeftsmodell_Finanzkalkulation.md)." },
    notes: "[Neu] Startpunkt ist das Rechenbeispiel aus dem Businessplan: 2.000 aktive Nutzer, 5 % zahlend. Ein zahlender Kunde bringt im Mix 60/30/10 im Schnitt 6,29 € netto und 4,99 € Deckungsbeitrag pro Monat. Dann die Jahr-3-Szenarien zeigen: vorsichtig −3.953 €, Basis −1.765 €, ambitioniert +15.941 € pro Monat. Hebel live zeigen: Conversion, Churn, CAC, Tarifmix. Korrektur: Die Vorlage rechnet mit 6,53 € ARPU und 5,23 € DB; mit ihren eigenen Tarifpreisen ergeben sich 6,29 € und 4,99 €. Alle Werte sind Planungsannahmen, keine Prognose." },
];
