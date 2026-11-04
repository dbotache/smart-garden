# GardenTwin – Geschäftsmodell und vollständige Finanzkalkulation

**Stand:** 4. November 2026  
**Zweck:** Diskussions- und Pitchgrundlage, keine validierte Marktprognose.  
**Währung:** EUR. B2C-Preise **brutto inklusive 19 % USt.**; betriebliche Umsätze und Deckungsbeiträge **netto**. Beträge gerundet, sofern nicht anders angegeben.

## 1. Executive Summary

GardenTwin kombiniert kostenlose digitale Gartenplanung mit kostenpflichtigen Empfehlungen, Sensorintegration und optionaler Hardware. Das empfohlene Einstiegsmodell ist **Hardwarekauf + Softwareabo**, nicht eine subventionierte Hardwaremiete. Der Hardwarevertrieb soll positive Deckungsbeiträge erwirtschaften, während Software wiederkehrende Erlöse generiert.

**Wichtig:** Alle Preise, Kosten, Conversion-Raten, Kundenmixe und Marktentwicklungen sind **Planungsannahmen**, keine gemessenen Ergebnisse oder zugesicherten Lieferantenpreise. Insbesondere CAC, Churn, Cloudkosten, Zahlungsbereitschaft, Hardwareausfälle und Supportbedarf müssen in Pilotprojekten erhoben werden.

## 2. Produkt- und Tarifmodelle

| Tarif | B2C-Preis brutto | Nettoumsatz/Monat bei Zahlung | Nutzen | Hardware |
|---|---:|---:|---|---|
| Free | 0 € | 0 € | 1 Garten mit bis zu 3 Zonen, Planung, manuelle Pflegeeinträge | Keine erforderlich |
| Basic | 4,99 €/Monat | 4,19 € | Wetterbasierte Empfehlungen, Pflegekalender, digitaler Gartenstatus | Optional, keine Sensorintegration im Grundtarif |
| Erweitert | 9,99 €/Monat | 8,39 € | Sensorintegration, Historie, Benachrichtigungen, später Bewässerung | GardenTwin-Kit separat |
| Expert | 14,99 €/Monat | 12,60 € | Eigene Sensoren, offene Schnittstellen, Regeln, Datenexport | Eigene oder GardenTwin-Hardware |

**Tariflogik:** Diese Bruttopreise gelten als **monatliche Äquivalente bei Jahreszahlung**; falls monatlich kündbare Abos angeboten werden, sind deren Preise gesondert zu definieren. Jahreszahlung reduziert Transaktionskosten und kann saisonale Kündigungen begrenzen, ersetzt aber keine belastbare Retention-Strategie.

**Empfohlene Vermarktung zu Beginn:** Free, Basic und Erweitert + Kaufkit. Expert als Beta-/Power-User-Tarif. Kamerafunktionen, LTE und aufwendige KI-Abfragen gegebenenfalls über faire Nutzungslimits oder Add-ons absichern.

## 3. Hardwaremodelle und Stückdeckungsbeitrag

### 3.1 Kaufmodell: Starterkit

| Position | Wert |
|---|---:|
| B2C-Verkaufspreis inkl. USt. | 149,00 € |
| Nettoumsatz = 149 / 1,19 | 125,21 € |
| Einkauf/Fertigung | −85,00 € |
| Versand, Verpackung, Zahlungsabwicklung | −10,00 € |
| **Hardware-Deckungsbeitrag** | **30,21 €** |
| **DB-Marge auf Nettoumsatz** | **24,13 %** |

Nicht enthalten: Garantierückstellungen, Retouren, Lagerhaltung, Entwicklung, Zertifizierung, Werkzeugkosten, Händlerabschläge. Für eine robustere Kalkulation kann zusätzlich eine Garantie-/Retourenreserve von z. B. 5 € pro Kit angesetzt werden; dann sinkt der DB auf **25,21 €**.

### 3.2 Preis-Sensitivität bei unveränderten 95 € direkten Kosten

| Bruttopreis | Nettoerlös | DB je Kit | DB-Marge netto |
|---:|---:|---:|---:|
| 129 € | 108,40 € | 13,40 € | 12,4 % |
| 149 € | 125,21 € | 30,21 € | 24,1 % |
| 179 € | 150,42 € | 55,42 € | 36,8 % |
| 199 € | 167,23 € | 72,23 € | 43,2 % |

**Interpretation:** 149 € ist bei 95 € direkten Kosten knapp; 179–199 € sollte als Zahlungsbereitschaftstest geprüft werden. Höhere Preise können die Nachfrage reduzieren; die Tabelle ist keine Absatzprognose.

### 3.3 Hardwaremiete / Hardware inklusive Abo

Annahme: Bereitstellungskosten **95 €** bei Übergabe; zusätzliche Hardwaregebühr **7,99 € brutto/Monat**, unabhängig vom separat kalkulierten Softwareabo; laufende Geräte-/Servicekosten **1 €/Monat**.

- Netto-Hardwaremiete: `7,99 / 1,19 = 6,71 €/Monat`.
- Hardware-DB je bezahltem Monat: `6,71 − 1,00 = 5,71 €`.
- Einfache Amortisationszeit: `95 / 5,71 = 16,6`, also **rund 17 bezahlte Monate**.
- Nach 12 bezahlten Monaten: `12 × 5,71 − 95 = −26,46 €`.
- Nach 24 bezahlten Monaten: `24 × 5,71 − 95 = +42,08 €`.

Diese Rechnung **ignoriert** Finanzierung, Zahlungsausfall, Churn, Rücksendung, Wiederaufbereitung und Defekte. Bei Kündigung vor Monat 17 ist die reine Hardwaremiete unter diesen Annahmen nicht amortisiert. Empfehlung: zunächst verkaufen; Mietmodell erst nach Pilotdaten und rechtlicher Prüfung einer Mindestlaufzeit anbieten.

### 3.4 Mögliche Angebotskombinationen

| Variante | Einmaliger Bruttopreis | Laufendes Bruttoabo | Empfehlung |
|---|---:|---:|---|
| App Free | 0 € | 0 € | Nutzerakquise |
| App Basic | 0 € | 4,99 € | Kern-SaaS |
| Sensor-Starterkit + Erweitert | 149–199 € | 9,99 € | **Bevorzugtes Kernangebot** |
| Kamera-Erweiterung | zusätzlich ca. 50–100 € (Testpreis) | ggf. Zusatzgebühr | Nach MVP |
| Bewässerungsmodul | zusätzlich ca. 69–129 € (Testpreis) | Erweitert/Expert | Nach sicherem Pilot |
| Eigene Sensorik + Expert | 0 € von GardenTwin | 14,99 € | Für technisch versierte Nutzer |
| Hardwaremiete + Erweitert | 0 € | 9,99 € + 7,99 € | Erst nach Validierung |

**Hinweis:** Erweiterungspreise sind hypothetische Endkunden-Testpreise, **ohne** hinterlegte BOM-/Margenkalkulation; nicht als profitable Produkte voraussetzen.

## 4. Monatliche SaaS-Unit-Economics

Annahmen für variable Kosten: Cloud, KI-Nutzung, Kundensupport und Zahlungsabwicklung; keine fixen Personal-/Entwicklungskosten. Bei Jahresabrechnung fallen Transaktionskosten seltener an. Eine konkrete Zahlungsanbieter-/App-Store-Kalkulation kann deutlich abweichen.

| Tarif | Bruttoabo | Nettoabo (÷ 1,19) | Variable Kosten | DB/Kunde/Monat | DB-Marge |
|---|---:|---:|---:|---:|---:|
| Basic | 4,99 € | 4,19 € | 0,80 € | 3,39 € | 80,9 % |
| Erweitert | 9,99 € | 8,39 € | 1,80 € | 6,59 € | 78,5 % |
| Expert | 14,99 € | 12,60 € | 2,80 € | 9,80 € | 77,8 % |

Exakte Formel je Tarif: `Nettoerlös = Bruttopreis / 1,19`; `DB = Nettoerlös − variable Kosten`.

**Free:** Angenommene laufende variable Kosten: **0,10 €/aktivem Free-Nutzer/Monat**. Unregistrierte Webseitenbesucher werden hier nicht als aktive Free-Nutzer gezählt.

### 4.1 Durchschnittlicher zahlender Kunde (Tarifmix)

Annahme: 60 % Basic, 30 % Erweitert, 10 % Expert.

- Netto-ARPU = `0,60 × (4,99/1,19) + 0,30 × (9,99/1,19) + 0,10 × (14,99/1,19)` = **6,53 €/Monat**.
- Variable Kosten = `0,60 × 0,80 + 0,30 × 1,80 + 0,10 × 2,80` = **1,30 €/Monat**.
- Gewichteter DB = `6,53 − 1,30` = **5,23 €/Monat** (mit ungerundeten Werten ca. 5,23 €).
- Netto-ARR je durchgehend zahlendem Kunden = `6,53 × 12` = **78,36 €/Jahr**.
- DB je durchgehend zahlendem Kunden = `5,23 × 12` = **62,76 €/Jahr**.

Die Werte sind Mittelwerte **pro zahlendem Kunden**, nicht pro registriertem Nutzer.

## 5. Skalierung der zahlenden Kunden

Die folgenden Werte verwenden die gerundeten Modellwerte von **6,53 € Netto-ARPU** und **5,23 € DB** pro Monat.

| Zahlende Kunden | Netto-MRR | Monatlicher SaaS-DB | Netto-ARR (12 × MRR) |
|---:|---:|---:|---:|
| 100 | 653 € | 523 € | 7.836 € |
| 500 | 3.265 € | 2.615 € | 39.180 € |
| 1.000 | 6.530 € | 5.230 € | 78.360 € |
| 2.500 | 16.325 € | 13.075 € | 195.900 € |
| 5.000 | 32.650 € | 26.150 € | 391.800 € |
| 10.000 | 65.300 € | 52.300 € | 783.600 € |

**Formeln:** `MRR = Zahlende × 6,53`; `SaaS-DB = Zahlende × 5,23`; `ARR = MRR × 12`. Diese Tabelle ignoriert Free-Nutzer, Akquise, Fixkosten, Hardware und Churn.

### 5.1 Textgrafik: Monatlicher SaaS-DB

```text
  100   | ▏                           523 €
  500   | █                           2.615 €
1.000   | ██                          5.230 €
2.500   | █████                       13.075 €
5.000   | ██████████                  26.150 €
10.000  | ████████████████████        52.300 €
```

## 6. Break-even nach Fixkosten

**Vereinfachte Formel ohne Free-Nutzer und Neukundenakquise:** `notwendige zahlende Kunden = AUFRUNDEN(Fixkosten / 5,23)`.

| Monatliche Fixkosten | Break-even: Zahlende Kunden |
|---:|---:|
| 1.000 € | 192 |
| 6.000 € | 1.148 |
| 12.000 € | 2.295 |
| 25.000 € | 4.781 |

**Mit aktiven Free-Nutzern:** `Ergebnis/Monat = Zahlende × 5,23 − Free × 0,10 − Fixkosten`.

Wenn bei einer 5-%-Paid-Conversion auf jeden zahlenden Kunden **19 aktive Free-Nutzer** kommen, ist der Netto-DB pro zahlendem Kunden nach anteiligen Free-Kosten nur `5,23 − 19 × 0,10 = 3,33 €`. Bei 6.000 € Fixkosten benötigt man dann `AUFRUNDEN(6.000 / 3,33) = 1.802` zahlende Kunden (und ca. 34.238 Free-Nutzer), **vor Akquisekosten**.

## 7. Funnel: Anfragen, Registrierungen und zahlende Kunden

Nicht verwechseln:

1. **Reichweite/Impressionen** – Personen, die Werbung sehen.
2. **Leads/Anfragen** – Personen mit messbarem Interesse.
3. **Registrierte aktive Free-Nutzer** – Personen, die das Produkt verwenden.
4. **Zahlende Kunden** – abgeschlossene Abos.

Jede Stufe braucht eine **eigene** Conversion-Rate. Die bisherige 5-%-Annahme bezieht sich ausschließlich auf den Schritt **registriert → zahlend**.

### 7.1 Benötigte Registrierungen für 1.000 zahlende Kunden

| Paid-Conversion registriert → zahlend | Erforderliche Registrierungen |
|---:|---:|
| 1 % | 100.000 |
| 2 % | 50.000 |
| 5 % | 20.000 |
| 10 % | 10.000 |
| 15 % | 6.667 |

Formel: `Registrierungen = Zielzahl zahlend / Conversion` (auf ganze Personen aufrunden).

### 7.2 Vollständiger Beispiel-Funnel (hypothetisch)

Annahmen: 100.000 Werbeeinblendungen → 2 % Klickrate → 20 % Registrierung aus Klicks → 5 % Paid-Conversion aus Registrierungen.

| Funnel-Stufe | Rechnung | Ergebnis |
|---|---|---:|
| Impressionen | Vorgabe | 100.000 |
| Website-Klicks | 100.000 × 2 % | 2.000 |
| Registrierungen | 2.000 × 20 % | 400 |
| Zahlende Kunden | 400 × 5 % | 20 |
| Aktive Free-Nutzer | 400 − 20 | 380 |
| Netto-MRR | 20 × 6,53 € | 130,60 € |
| SaaS-DB | 20 × 5,23 € | 104,60 € |
| Free-Kosten | 380 × 0,10 € | 38,00 €/Monat |

**Werbekosten:** Bei angenommenen 10 € CPM kosten 100.000 Impressionen 1.000 €; **Werbe-CAC** = `1.000 / 20 = 50 € je zahlendem Neukunden`. Dies ist ein alternatives CAC-Szenario und **nicht** die 25-€-Annahme der nachfolgenden Kohortenrechnung.

## 8. Akquisekosten, Amortisation und Lifetime Value

### 8.1 CAC-Amortisation

Bei **25 € einmaligem CAC** und **5,23 € monatlichem DB**:

`Payback = 25 / 5,23 = 4,78 bezahlte Monate`.

Das ist **ohne** anteilige Free-Nutzer-Kosten, Fixkosten und Hardwarekosten. Bei **50 € CAC**: `50 / 5,23 = 9,56 bezahlte Monate`.

### 8.2 Churn-Sensitivität und vereinfachter Customer Lifetime Value

Bei konstanter monatlicher Kündigungswahrscheinlichkeit `c` und unverändertem DB kann man die erwartete bezahlte Lebensdauer näherungsweise mit `1/c` Monaten und den **undiskontierten SaaS-DB-LTV** mit `5,23/c` schätzen.

| Monatlicher Paid-Churn | Näherung Lebensdauer | SaaS-DB-LTV vor CAC |
|---:|---:|---:|
| 2 % | 50 Monate | 261,50 € |
| 5 % | 20 Monate | 104,60 € |
| 8 % | 12,5 Monate | 65,38 € |
| 12 % | 8,3 Monate | 43,58 € |

Das ist eine **vereinfachte stationäre Modellformel**; sie berücksichtigt keine Saisonalität, Rabatte, Zahlungsverzug, Expansion, Kohortenunterschiede, Diskontierung oder Free-Nutzer-Kosten. Ein LTV/CAC-Verhältnis ist nur aussagekräftig, wenn beide Kennzahlen gleichartig und mit realen Kohortendaten ermittelt werden.

## 9. Saisonalität und Zahlungsmonate

Beispiel Erweitert: 9,99 € brutto pro tatsächlich bezahltem Monat; Nettoumsatz = `9,99 / 1,19 = 8,39496 €`.

| Bezahlte Monate/Jahr | Jährlicher Netto-Abo-Umsatz |
|---:|---:|
| 6 | 50,37 € |
| 9 | 75,55 € |
| 12 | 100,74 € |

Das sind **Umsätze, keine Deckungsbeiträge**. Die variable Kostenstruktur bei Saisonpause muss gesondert bestimmt werden. Jahresabos können den Umsatz glätten, aber ihr müsst tatsächliche Verlängerungsraten messen.

## 10. Kombinierter Kohortenrechner (Formeln und Beispiel)

### 10.1 Parameter

| Parameter | Basisannahme |
|---|---:|
| Registrierte aktive Nutzer `R` | 2.000 |
| Paid-Conversion `q` | 5 % |
| Zahlende Nutzer `P = R × q` | 100 |
| Free-Nutzer `F = R − P` | 1.900 |
| Netto-ARPU zahlend `a` | 6,53 €/Monat |
| Variable Kosten zahlend `v` | 1,30 €/Monat |
| Variable Kosten Free `f` | 0,10 €/Monat |
| Monatliche Fixkosten `K` | 6.000 € |
| Einmaliger CAC pro zahlendem Neukunden `CAC` | 25 € |
| Hardwarekäufer-Anteil unter zahlenden Neukunden `h` | 30 % |
| Hardware-DB pro Kit `H` | 30,21 € |

### 10.2 Formeln

- `P = R × q`
- `F = R − P`
- `Netto-MRR = P × a`
- `Monatlicher SaaS-DB = P × (a − v)`
- `Laufendes Monatsergebnis = P × (a − v) − F × f − K`
- `Einmalige Neukundenakquise = P × CAC`
- `Einmaliger Hardware-DB = P × h × H`
- `Ergebnis im Akquisemonat = Laufendes Monatsergebnis − P × CAC + P × h × H`

**Wichtig:** Der Hardwarebeitrag entsteht nur bei **neuen Kitverkäufen**. Er darf nicht monatlich für den gesamten Bestandskundenstamm angesetzt werden. Ebenso fällt CAC nur für tatsächlich neu akquirierte Kunden an, nicht jeden Monat für alle Bestandskunden.

### 10.3 Durchgerechnetes Beispiel

| Position | Rechnung | Ergebnis |
|---|---|---:|
| Zahlende Kunden | 2.000 × 5 % | 100 |
| Free-Nutzer | 2.000 − 100 | 1.900 |
| Netto-MRR | 100 × 6,53 | 653,00 € |
| Variable Paid-Kosten | 100 × 1,30 | −130,00 € |
| Free-Kosten | 1.900 × 0,10 | −190,00 € |
| Fixkosten | Vorgabe | −6.000,00 € |
| **Laufendes Monatsergebnis** | 653 − 130 − 190 − 6.000 | **−5.667,00 €** |
| Einmaliger CAC | 100 × 25 | −2.500,00 € |
| Einmaliger Hardware-DB | 100 × 30 % × 30,21 | +906,30 € |
| **Ergebnis im Akquisemonat** | −5.667 − 2.500 + 906,30 | **−7.260,70 €** |

### 10.4 Vergleich bei 5 % Paid-Conversion und 6.000 € Fixkosten

| Aktive Registrierungen | Zahlende | Free | Netto-MRR | Laufendes Monatsergebnis |
|---:|---:|---:|---:|---:|
| 2.000 | 100 | 1.900 | 653 € | −5.667 € |
| 10.000 | 500 | 9.500 | 3.265 € | −4.335 € |
| 20.000 | 1.000 | 19.000 | 6.530 € | −2.670 € |
| 40.000 | 2.000 | 38.000 | 13.060 € | +660 € |
| 100.000 | 5.000 | 95.000 | 32.650 € | +10.650 € |

Die Tabelle betrachtet einen **Bestand**, nicht die Kosten für dessen Aufbau.

## 11. Drei Zielzustände am Ende von Geschäftsjahr 3

**Keine echten Dreijahres-Cashflow-Prognosen:** Die Werte sind drei alternative **Monatszustände am Ende von Jahr 3**. Sie unterstellen den oben beschriebenen Tarifmix, konstante variable Kosten und keinen zusätzlichen Hardware-DB oder CAC im betrachteten Bestandsmonat.

| Kennzahl | Vorsichtig | Basis | Ambitioniert |
|---|---:|---:|---:|
| Zahlende Kunden | 500 | 2.500 | 10.000 |
| Aktive Free-Nutzer | 4.500 | 22.500 | 90.000 |
| Netto-MRR | 3.265 € | 16.325 € | 65.300 € |
| SaaS-DB vor Free-Kosten | 2.615 € | 13.075 € | 52.300 € |
| Free-Kosten | −450 € | −2.250 € | −9.000 € |
| Fixkosten | −6.000 € | −12.000 € | −25.000 € |
| **Laufendes Monatsergebnis** | **−3.835 €** | **−1.175 €** | **+18.300 €** |

```text
Laufendes Monatsergebnis (Monatszustand am Ende von Jahr 3)
Vorsichtig   −3.835 €  ◀████
Basis        −1.175 €  ◀█
Ambitioniert +18.300 €         ██████████████████▶
```

**Nicht daraus ableiten:** Jahresumsatz, Liquiditätsbedarf, Finanzierungslücke oder Gewinn über drei Jahre. Dafür braucht man einen **monatlichen Kohortenplan** mit Neukunden, Churn, Zahlungen, Hardwarebeschaffung, Personal, Steuern und Zahlungszielen.

## 12. Ergänzendes Modell: monatlicher Kundenbestand mit Churn

Für einen belastbaren 36-Monats-Plan sollten folgende Gleichungen für jeden Monat `t` verwendet werden:

- `Paid_end_t = Paid_start_t × (1 − churn_t) + New_paid_t`
- `Free_end_t = Free_start_t + New_free_t − Free_to_paid_t − Free_churn_t`
- `New_paid_t = Direct_paid_t + Free_to_paid_t`
- `Average_paid_t ≈ (Paid_start_t + Paid_end_t) / 2` (vereinfachte untermonatige Umsatzabgrenzung)
- `SaaS_revenue_t = Average_paid_t × Netto-ARPU_t`
- `Paid_variable_cost_t = Average_paid_t × Variable_cost_paid_t`
- `Free_variable_cost_t = Average_free_t × Cost_free_t`
- `Hardware_DB_t = New_kits_t × DB_kit_t`
- `CAC_spend_t = New_paid_t × CAC_t` **nur**, wenn CAC als vollständig zurechenbarer Neukunden-CAC definiert ist; bei freemium-lastigem Vertrieb Akquisekosten aller Leads/Free-Nutzer gesondert erfassen.
- `Operating_contribution_t = SaaS_revenue_t − Paid_variable_cost_t − Free_variable_cost_t + Hardware_DB_t − CAC_spend_t − Fixed_cost_t`

Für **Liquidität** zusätzlich: tatsächliche Ein- und Auszahlungen, USt.-Zahlungen, jährliche Vorauszahlungen, Hardwarelager, Zahlungsziele, Investitionen, Darlehen und Finanzierung. `Operating_contribution` ist **nicht** gleich Cashflow oder Jahresüberschuss.

## 13. Szenario-Matrix: Was muss getestet werden?

| Unsicherheit | Vorsichtig | Basisannahme | Positiv | Wie validieren? |
|---|---:|---:|---:|---|
| Free → Paid | 2 % | 5 % | 10 % | Landingpage und Beta-Kohorten |
| CAC zahlender Neukunde | 50 € | 25 € | 15 € | Tatsächliche Kampagnenkosten / Neukunden |
| Paid-Churn pro Monat | 8 % | 5 % | 2 % | 6–12 Monate Retention messen |
| Hardware-DB/Kit | 13 € | 30 € | 55 € | Verbindliche BOM, Lieferanten, Retouren |
| Variable Free-Kosten/Monat | 0,20 € | 0,10 € | 0,05 € | Infrastruktur-Monitoring |
| Tarifmix Basic/Erweitert/Expert | 80/15/5 | 60/30/10 | 40/40/20 | Zahlungsbereitschaft / Bestandsdaten |

**Achtung:** Der Tarifmix verändert ARPU und DB. Bei Änderungen müssen die gewichteten Werte neu berechnet werden; die Tabelle ist keine vollständig verknüpfte Simulation.

## 14. Offene Kostenpositionen und Risiken

- **Hardware:** Prototyp ≠ zertifizierte Serienhardware. Zusätzliche Kosten für Gehäuse, Dichtigkeit, CE-/EMV-Prüfung, Funkzulassungskonformität, WEEE-/ElektroG-Pflichten, Gewährleistung, Retouren und Lager.
- **Cloud und KI:** Kamerabilder, Langzeitspeicherung, Bildanalysen, Benachrichtigungen und Datenexport können die angenommene variable Kostenbasis überschreiten.
- **Support:** Installation, WLAN-Probleme, Kalibrierung, Batteriewechsel und Bewässerungsfehler verursachen Aufwand.
- **Datenschutz:** Kameras möglichst auf das eigene Grundstück beschränken, lokale Verarbeitung und Löschfristen prüfen.
- **Vertrieb:** Händler- oder Marktplatzprovisionen reduzieren Hardwaremargen; direkte Verkäufe erfordern Marketing und Support.
- **Saisonalität:** Winterpausen, Jahresverlängerungen, aktive Nutzer und Churn getrennt auswerten.
- **Preisdarstellung:** Jahresabrechnung, Mindestlaufzeit, Kündigung und Funktionsumfang transparent ausweisen.

## 15. Empfohlene Pilot-Meilensteine

1. **20–30 strukturierte Interviews** mit Hobbygärtnern; wichtigste Probleme und Zahlungsbereitschaft verstehen.
2. **5–10 Pilotgärten** mit Sensorik, Wetterintegration und digitalem Gartenmodell ausstatten.
3. **Landingpage-Test** mit mindestens zwei Tarifangeboten und realem Conversion-Tracking.
4. **Hardware-Stückkosten** mit mindestens zwei Lieferantenangeboten, Versand, Ausfällen und Garantie kalkulieren.
5. **Abo-Kohorten** beobachten: Aktivierung, Retention, Paid-Conversion, CAC, Supportstunden und Cloudkosten.
6. **Erst dann** Hardwaremiete, große Serienbestellung und einen verbindlichen Dreijahresfinanzplan entscheiden.

## 16. Pitch-Kernaussage

> GardenTwin gewinnt Hobbygärtner mit einer kostenlosen digitalen Gartenplattform, monetarisiert datenbasierte Pflegeempfehlungen über Softwareabos und bietet Sensorik sowie Bewässerungsautomatisierung als optionale, positiv kalkulierte Hardwaremodule an. Das Kaufmodell begrenzt Vorfinanzierungsrisiken; offene Integrationen erschließen technikaffine Kunden.

**Bewertung:** Ein interessantes, aber noch unvalidiertes Freemium-/Hardware-SaaS-Modell. Die wichtigsten wirtschaftlichen Hebel sind **Paid-Conversion, CAC, Retention, Tarifmix, Hardwaremarge und Supportkosten** – nicht die Zahl kostenloser Registrierungen allein.
