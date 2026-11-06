import { SlideLayout } from "../components/SlideLayout";
import { At, Bullets, Card, IconBadge, type IconName } from "../components/SlidePrimitives";
import { PhaseCostTable } from "@/business";

const TRACKS: { icon: IconName; title: string; items: string[]; x: number; small?: boolean }[] = [
  { icon: "leaf", title: "Prototyp", items: ["Pilotgarten mit Sensoren in Nordhessen", "Private Beta mit 20 bis 50 Nutzenden"], x: 0 },
  { icon: "microchip", title: "Hardware", items: ["Sensor-Set für Boden, Luft, Temperatur und Licht festlegen", "Bewässerung für ein Beet testen"], x: 223 },
  { icon: "code", title: "Software", items: ["Sensordaten in die Empfehlungen einbinden", "Prognosen zum Pflegezustand"], x: 445 },
  { icon: "server", title: "Infrastruktur + Services", items: ["Bezahlung mit Stripe live schalten", "Monitoring und Backups prüfen"], x: 667, small: true },
];
const MILESTONES = [
  { when: "Jetzt", what: "Private Beta starten", x: 0, accent: false },
  { when: "Winter 2026/27", what: "Sensor-Prototyp bauen", x: 297, accent: false },
  { when: "Januar 2027", what: "Kampagne zur Anbauplanung", x: 594, accent: true },
];

/**
 * PPTX 8 — Next steps: four work streams and a three-step timeline (home-plate arrows), compacted (text unchanged)
 * to make room for the costs per phase (added; from the cost slides 11–14, no staff costs).
 */
export default function Slide16() {
  return (
    <SlideLayout eyebrow="HOW · NÄCHSTE SCHRITTE" title="Bis zur Anbausaison 2027 soll der Prototyp im Beet stehen">
      {TRACKS.map((t) => (
        <At key={t.title} x={t.x} y={0} w={206} h={112}>
          <Card className="h-full u-px-12 u-py-8">
            <div className="flex items-center u-gap-6">
              <IconBadge icon={t.icon} size={26} />
              <h3 className={`${t.small ? "u-fs-12" : "u-fs-14"} font-bold leading-tight text-pw-900`}>{t.title}</h3>
            </div>
            <Bullets items={t.items} className="u-mt-6 u-fs-11 leading-snug text-pw-ink" />
          </Card>
        </At>
      ))}
      {MILESTONES.map((m) => (
        <At key={m.when} x={m.x} y={120} w={279} h={36}>
          <div className={`flex h-full items-center u-gap-6 ${m.accent ? "bg-pw-700" : "bg-pw-900"}`} style={{ clipPath: "polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)", paddingLeft: "calc(var(--pt)*14)" }}>
            <p className="u-fs-12 font-bold text-pw-200">{m.when}</p>
            <p className="u-fs-12 text-white">{m.what}</p>
          </div>
        </At>
      ))}
      <At x={0} y={166} w={873} h={174}>
        <PhaseCostTable />
      </At>
    </SlideLayout>
  );
}
