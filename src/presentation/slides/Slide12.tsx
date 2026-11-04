import { SlideLayout } from "../components/SlideLayout";
import { At, Bullets, Card } from "../components/SlidePrimitives";

const TIERS = [
  { level: "LEVEL 1", name: "Free", price: "0 €", sub: "digital, eingeschränkte Funktionen", items: ["Garten auslegen und planen", "Bis zu 3 Gärten"], x: 0, dark: false },
  { level: "LEVEL 2", name: "Basic", price: "4,99 €", sub: "pro Monat, Preisvorschlag", items: ["Wetterbasierte Pflegeempfehlungen", "Basis ist der digitale Zwilling"], x: 223, dark: true },
  { level: "LEVEL 3", name: "Erweitert", price: "Preis offen", sub: "Abo inklusive Hardware", items: ["Sensoren werden mitgeliefert", "Nur von uns freigegebene Modelle"], x: 445, dark: false },
  { level: "LEVEL 4", name: "Expert", price: "Preis offen", sub: "Abo mit eigener Hardware", items: ["Eigene Sensoren einbinden", "Skalierungsmöglichkeiten"], x: 667, dark: false },
];

/** PPTX 7 — Business model: four tiers (Basic highlighted). */
export default function Slide12() {
  return (
    <SlideLayout eyebrow="HOW · GESCHÄFTSMODELL" title="Kostenlos einsteigen, mit Assistenz und Sensoren wachsen">
      {TIERS.map((t) => (
        <At key={t.level} x={t.x} y={0} w={206} h={284}>
          <Card dark={t.dark} className="h-full u-px-16 u-py-12">
            <p className={`u-fs-12 font-bold tracking-[0.08em] ${t.dark ? "text-pw-200" : "text-pw-muted"}`}>{t.level}</p>
            <p className={`font-serif u-fs-24 font-bold ${t.dark ? "text-white" : "text-pw-900"}`}>{t.name}</p>
            <p className={`u-mt-6 u-fs-22 font-bold ${t.dark ? "text-pw-200" : "text-pw-700"}`}>{t.price}</p>
            <p className={`u-fs-12 ${t.dark ? "text-pw-200" : "text-pw-muted"}`}>{t.sub}</p>
            <Bullets items={t.items} className={`u-mt-14 u-fs-14 leading-snug ${t.dark ? "text-white" : "text-pw-ink"}`} />
          </Card>
        </At>
      ))}
      <At x={0} y={297} w={873} h={43}>
        <p className="u-fs-13 leading-snug text-pw-muted">Basic-Preis laut Launch-Plan: 4,99 €/Monat oder 29,99 €/Jahr. Die App kennt heute die Stufen Free und Pro. Zusätzlich möglich: Affiliate-Links zu Saatgut und Werkzeug.</p>
      </At>
    </SlideLayout>
  );
}
