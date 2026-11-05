import { SlideLayout } from "../components/SlideLayout";
import { At, Bullets, Card } from "../components/SlidePrimitives";

export default function Slide12() {
  return (
    <SlideLayout eyebrow="HOW · GESCHÄFTSMODELL" title="Kostenlos starten, mit Basic planen und pflegen">
      <At x={0} y={0} w={279} h={254}>
        <Card className="h-full u-px-18 u-py-16">
          <h3 className="font-serif u-fs-24 font-bold text-pw-900">Free</h3>
          <p className="u-mt-6 u-fs-22 font-bold text-pw-700">0 €</p>
          <p className="u-fs-14 text-pw-muted">Zum Ausprobieren</p>
          <Bullets className="u-mt-18 u-fs-16 leading-snug" items={[
            "1 Garten anlegen",
            "Begrenzte Pflanzen­erkennungen",
            "Begrenzte Krankheitsanalysen",
          ]} />
        </Card>
      </At>

      <At x={297} y={0} w={279} h={254}>
        <Card dark className="h-full u-px-18 u-py-16">
          <h3 className="font-serif u-fs-24 font-bold">Basic</h3>
          <p className="u-mt-6 u-fs-22 font-bold text-pw-200">4,99 € <span className="u-fs-14 font-normal">pro Monat*</span></p>
          <p className="u-fs-14 text-pw-200">Alle digitalen Funktionen</p>
          <Bullets className="u-mt-18 u-fs-16 leading-snug" items={[
            "Mehrere Gärten planen",
            "Pflanzenerkennung und Diagnose",
            "Beetvorschläge & Pflegekalender",
          ]} />
        </Card>
      </At>

      <At x={594} y={0} w={279} h={254}>
        <Card className="h-full bg-[#eef0ee]! u-px-18 u-py-16 text-[#515952]">
          <h3 className="font-serif u-fs-24 font-bold">Erweitert</h3>
          <p className="u-mt-6 u-fs-22 font-bold">Geplant</p>
          <p className="u-fs-14">Für vernetzte Gärten</p>
          <Bullets className="u-mt-18 u-fs-16 leading-snug" items={[
            "Sensor-Kit und Messverlauf",
            "Benachrichtigungen bei Pflegebedarf",
            "Später automatische Bewässerung",
          ]} />
        </Card>
      </At>

      <At x={0} y={270} w={873}>
        <p className="u-fs-16 font-bold text-pw-900">Geplante Affiliate-Provisionen für Saatgut, Dünger, Gartenwerkzeug, Pflanzen und Bäume.</p>
        <p className="u-mt-6 u-fs-12 text-pw-muted">In der Beta messen wir die Upgrade-Quote und KI-Kosten. * Preisvorschlag bei Jahreszahlung, KI-Kontingente noch offen.</p>
      </At>
    </SlideLayout>
  );
}
