# GardenTwin – Drei Prototyp-Level und Kostenschätzung

**Stand:** November 2026  
**Zweck:** Material- und Entwicklungsplanung für ein einzelnes Pilotgerät bzw. einen Pilotgarten.  
**Währung:** EUR; geschätzte Endkunden-Einzelstückpreise inkl. Umsatzsteuer. **Keine verbindlichen Händlerangebote.** Preise, Lieferumfang und Kompatibilität vor Bestellung prüfen.

## 1. Vergleich der Prototypen

| Eigenschaft | Level 1: Sensor-Basis | Level 2: Smart Garden | Level 3: Autarkes System |
|---|---|---|---|
| Ziel | Messwerte erfassen, Gartenkarte testen | Kamera, Empfehlungen und Bewässerung demonstrieren | Ohne Garten-WLAN/Netzstrom betreiben |
| Pilotfläche (Richtwert) | 10–25 m² | 25–75 m² | 50–150 m² |
| Controller | ESP32 DevKit | ESP32 DevKit + ESP32-CAM | ESP32 DevKit + ESP32-CAM + LTE-Modem |
| Bodenfeuchtesensoren | 2 | 3 | 4 |
| Lufttemperatur/-feuchte | 1 × BME280 | 1 × BME280 | 1 × BME280 |
| Bodentemperatur | – | 1 × DS18B20 | 1 × DS18B20 |
| Lichtmessung | – | 1 × BH1750 | 1 × BH1750 |
| Kamera | – | 1 × OV2640 | 1 × OV2640 |
| Bewässerungsventile | – | 1 | 2 |
| Datenverbindung | WLAN | WLAN | LTE + SIM |
| Strom | 5-V-Netzteil | Netzteil(e), 12-V-Ventilversorgung | Akku + Solar + geeignete Spannungswandler |
| **Materialbudget (gerundet)** | **45–75 €** | **140–220 €** | **320–550 €** |
| Entwicklung (Schätzung) | 1–3 Wochen | 4–8 Wochen | 8–16 Wochen |

Die Flächen sind **keine festen Abdeckungsgrenzen**: Entscheidend sind Pflanzenvielfalt, Bodenverhältnisse, Bewässerungszonen und Kamera-Sichtfeld.

## 2. Detaillierte Stücklisten – Beispielrechnung

### Level 1 – Sensor-Basis

| Bauteil | Anzahl | Ansatz/Stück | Summe |
|---|---:|---:|---:|
| ESP32 DevKit | 1 | 7,00 € | 7,00 € |
| Kapazitiver Bodenfeuchtesensor | 2 | 3,50 € | 7,00 € |
| BME280 Temperatur/Luftfeuchte | 1 | 6,00 € | 6,00 € |
| USB-Netzteil + Kabel | 1 | 9,00 € | 9,00 € |
| Leitungen, Stecker, Kleinmaterial | 1 Set | 7,00 € | 7,00 € |
| Einfaches wetterfestes Gehäuse | 1 | 12,00 € | 12,00 € |
| **Materialsumme** | | | **48,00 €** |
| Beschaffungs-/Ersatzteilreserve (ca. 15 %) | | | **7,20 €** |
| **Planbudget** | | | **55,20 €** |

**Funktionen:** Bodenfeuchte- und Luftmessung, WLAN-Datenübertragung, einfache Web-App. Keine Kamera oder Bewässerung. Für Außenbetrieb Sensoranschlüsse abdichten und BME280 in einem belüfteten Strahlungsschutz montieren.

### Level 2 – Smart Garden

| Bauteil | Anzahl | Ansatz/Stück | Summe |
|---|---:|---:|---:|
| ESP32 DevKit | 1 | 7,00 € | 7,00 € |
| ESP32-CAM inkl. Programmieradapter | 1 | 13,00 € | 13,00 € |
| Kapazitiver Bodenfeuchtesensor | 3 | 3,50 € | 10,50 € |
| BME280 | 1 | 6,00 € | 6,00 € |
| DS18B20 wasserdicht | 1 | 3,00 € | 3,00 € |
| BH1750 Lichtsensor | 1 | 3,00 € | 3,00 € |
| 12-V-Magnetventil (stromlos geschlossen) | 1 | 15,00 € | 15,00 € |
| MOSFET-Treiber + Freilauf-/Schutzbeschaltung | 1 | 7,00 € | 7,00 € |
| Tropfschlauch, Verbinder, Endstücke | 1 Set | 22,00 € | 22,00 € |
| Filter/Druckminderer/Anschluss | 1 Set | 18,00 € | 18,00 € |
| Geeignete 5-V- und 12-V-Versorgung | 1 Set | 18,00 € | 18,00 € |
| Wetterfeste Gehäuse/Kabelverschraubungen | 1 Set | 20,00 € | 20,00 € |
| Kabel, Stecker, Kleinmaterial | 1 Set | 12,00 € | 12,00 € |
| **Materialsumme** | | | **154,50 €** |
| Beschaffungs-/Ersatzteilreserve (ca. 15 %) | | | **23,18 €** |
| **Planbudget** | | | **177,68 €** |

**Funktionen:** Sensorwerte, tägliche Bilder, digitale Gartenkarte, regelbasierte Empfehlungen und eine sicher gesteuerte Bewässerungszone. Ein vorhandener geeigneter Wasseranschluss wird vorausgesetzt. Optional: Pumpe und weitere Anschlüsse (+20–50 € oder mehr, abhängig von Förderhöhe und Durchfluss).

### Level 3 – Autarkes System

| Bauteil | Anzahl | Ansatz/Stück | Summe |
|---|---:|---:|---:|
| ESP32 DevKit | 1 | 7,00 € | 7,00 € |
| ESP32-CAM inkl. Programmieradapter | 1 | 13,00 € | 13,00 € |
| Kapazitiver Bodenfeuchtesensor | 4 | 3,50 € | 14,00 € |
| BME280 | 1 | 6,00 € | 6,00 € |
| DS18B20 | 1 | 3,00 € | 3,00 € |
| BH1750 | 1 | 3,00 € | 3,00 € |
| LTE-Modem (z. B. SIM7600-Klasse) | 1 | 65,00 € | 65,00 € |
| LTE-Antenne, falls nicht enthalten | 1 | 8,00 € | 8,00 € |
| Solarpanel, ca. 20 W | 1 | 40,00 € | 40,00 € |
| Passender Solarladeregler | 1 | 20,00 € | 20,00 € |
| Akku mit Schutzschaltung (z. B. 12,8 V / 6 Ah) | 1 | 55,00 € | 55,00 € |
| DC/DC-Wandler, Sicherungen, Energieverteilung | 1 Set | 20,00 € | 20,00 € |
| 12-V-Ventile | 2 | 15,00 € | 30,00 € |
| Treiber und Schutzbeschaltung | 2 | 7,00 € | 14,00 € |
| Tropfschlauch und Verteiler | 1 Set | 30,00 € | 30,00 € |
| Filter, Druckminderer, Anschlüsse | 1 Set | 20,00 € | 20,00 € |
| Wetterfeste Gehäuse/Kabelverschraubungen | 1 Set | 30,00 € | 30,00 € |
| Kabel, Halterungen, Kleinmaterial | 1 Set | 20,00 € | 20,00 € |
| **Materialsumme** | | | **438,00 €** |
| Beschaffungs-/Ersatzteilreserve (ca. 15 %) | | | **65,70 €** |
| **Planbudget** | | | **503,70 €** |

**Laufende Kosten:** Daten-SIM grob 3–8 €/Monat; Cloud und KI-Auswertung zusätzlich. **Wichtig:** 20-W-Panel und Akku sind zunächst Testdimensionierungen, keine nachgewiesene Ganzjahresversorgung. LTE-Sendespitzen, Kamera-Betriebszeiten, Ventil-Einschaltdauer, Winterertrag und Verschattung messen. Stromlos geschlossene Ventile mit geringem Energiebedarf bzw. bistabile Ventile prüfen. Pumpe ist **nicht enthalten**.

## 3. Vergleich der Materialkosten

| Kostenmodell | Level 1 | Level 2 | Level 3 |
|---|---:|---:|---:|
| Materialsumme | 48,00 € | 154,50 € | 438,00 € |
| Reserve 15 % | 7,20 € | 23,18 € | 65,70 € |
| **Planbudget je Prototyp** | **55,20 €** | **177,68 €** | **503,70 €** |
| Grobe Budgetspanne | 45–75 € | 140–220 € | 320–550 € |
| Wiederkehrende SIM-Kosten | – | – | 3–8 €/Monat |

**Formel:** `Planbudget = Materialsumme × 1,15` (auf Cent gerundet). Die Spannbreiten sind separate grobe Markt-/Beschaffungsannahmen; sie werden nicht aus der mittleren Stückliste mathematisch abgeleitet.

## 4. Sensorbedarf und Skalierung nach Fläche

| Gemischte Gartenfläche | Bodenfeuchtesensoren | Luftsensoren | Kameras | Bewässerungszonen |
|---|---:|---:|---:|---:|
| 10–25 m² | 1–2 | 1 | 0–1 | 0–1 |
| 25–50 m² | 2–3 | 1 | 1 | 1–2 |
| 50–100 m² | 3–5 | 1 | 1–2 | 2–3 |
| 100–250 m² | 5–8 | 1–2 | 2–3 | 3–5 |
| 250–500 m² | 8–12 | 2–3 | 3–5 | 5–8 |
| 500–1.000 m² | 12–20 | 3–4 | 4–8 | 6–12 |

**Faustregel:** Mindestens ein Bodenfeuchtesensor pro möglichst homogener Bewässerungszone; zusätzliche Sensoren bei unterschiedlichen Böden, Pflanzen und Expositionen. Eine Kamera benötigt freie Sicht auf den gewünschten Bereich. Mehrere weit entfernte Sensorknoten können nötig sein; lange analoge Kabel vermeiden.

### Beispielhafte Mehrkosten je zusätzlicher Zone

| Erweiterung | Grobe Zusatzkosten |
|---|---:|
| 1 Bodenfeuchtesensor inkl. Kleinmaterial | 4–8 € |
| 1 zusätzlicher ESP32-Funkknoten mit Gehäuse/Strom | 20–45 € |
| 1 zusätzliche Kamera mit Gehäuse/Strom | 15–40 € |
| 1 Bewässerungsventil mit Treiber und Anschlüssen | 20–45 € |
| 10–20 m Schlauch/Verbinder | 10–30 € |

Die tatsächlichen Kosten hängen stark von Wasserleitungen, Kabelwegen, Netzabdeckung und der Anzahl der getrennten Bewässerungszonen ab.

## 5. Skalierung auf mehrere Pilotgeräte

Nur als **Materialbudget ohne Mengenrabatte, Arbeitszeit, Versand, Qualitätskontrolle und Serienzulassung**:

| Anzahl Prototypen | Level 1 (55,20 €) | Level 2 (177,68 €) | Level 3 (503,70 €) |
|---:|---:|---:|---:|
| 1 | 55,20 € | 177,68 € | 503,70 € |
| 5 | 276,00 € | 888,40 € | 2.518,50 € |
| 10 | 552,00 € | 1.776,80 € | 5.037,00 € |
| 25 | 1.380,00 € | 4.442,00 € | 12.592,50 € |

**Formel:** `Gesamtes Materialbudget = Anzahl × Planbudget je Gerät`. Diese lineare Hochrechnung ist **keine Serienfertigungskalkulation**. Für einen Verkauf müssen u. a. Entwicklung, Montage, Tests, CE-/Funk-/EMV-Anforderungen, Verpackung, Gewährleistung, Retouren, Vertrieb und Umsatzsteuer separat modelliert werden.

## 6. Empfehlung und Entscheidungskriterien

1. **Level 1 zuerst:** Sensorik und Datenpipeline zuverlässig zum Laufen bringen. Geringes finanzielles Risiko.
2. **Level 2 für Demo und Pitch:** Zeigt den Kundennutzen von Messen → Interpretieren → Handeln. Vor jeder unbeaufsichtigten Bewässerung Ausfallsicherung und Laufzeitlimits implementieren.
3. **Level 3 erst nach Strommessungen:** LTE und Solar sind zusätzliche technische Projekte. Für echte Autarkie müssen Energie- und Wasserbedarf gesondert ausgelegt werden.

### Nicht in den Kosten enthalten

Entwicklungszeit, Software-/Cloudbetrieb, KI-API, Domain, Montagewerkzeug, Labormessgeräte, SIM-Tarif (außer Hinweis oben), Pumpe, Wassertank, Wasserverbrauch, Installationsdienstleistungen, Zertifizierung, Ersatzteile über die Reserve hinaus sowie langfristige Wartung.

### Annahmen und Validierungsbedarf

- Günstige kapazitive Bodenfeuchtesensoren liefern ohne Kalibrierung keine zuverlässigen absoluten Prozentwerte.
- Der BME280 benötigt Strahlungs-/Wetterschutz; wetterfeste Gehäuse dürfen die Luftmessung nicht verfälschen.
- LTE-Modem, SIM, Antennen und Kamera sind vor der Beschaffung auf Versorgung, Schnittstellen und Netzbänder zu prüfen.
- Bei Wasser aus einer Regentonne sind Ventile für niedrigen Druck oder eine passende Pumpe erforderlich.
- Für die Produktentwicklung ist ein Pilot über mehrere Wochen sinnvoll, bevor Preis- und Skalierungsversprechen gemacht werden.
