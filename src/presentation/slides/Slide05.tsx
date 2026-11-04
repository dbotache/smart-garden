import { SlideLayout } from "../components/SlideLayout";
import { At, Card, IconBadge, type IconName } from "../components/SlidePrimitives";

const STATS: { icon: IconName; value: string; label: string; note: string; x: number }[] = [
  { icon: "house", value: "24,6 Mio.", label: "Haushalte mit Garten", note: "Hobbygärtner: 60 % von 41 Mio. Haushalten (eigene Rechnung auf Basis KfW, 2026)", x: 0 },
  { icon: "users", value: "13.155", label: "Kleingartenvereine", note: "mit zusammen 871.226 Kleingärten (BKD, Stand 03/2024)", x: 299 },
  { icon: "hammer", value: "44.500", label: "neue Einfamilienhäuser", note: "Privatgärten beim Neubau: genehmigt 2025, +17,2 % (Destatis, vorläufig)", x: 597 },
];

/** PPTX 5 — Target group + market. Figures and sources unchanged from the PPTX. */
export default function Slide05() {
  return (
    <SlideLayout eyebrow="WHAT · ZIELGRUPPE + MARKT" title="60 % der Haushalte in Deutschland haben einen Garten">
      {STATS.map((s) => (
        <At key={s.value} x={s.x} y={0} w={277} h={212}>
          <Card className="h-full u-px-18 u-py-14">
            <IconBadge icon={s.icon} size={36} />
            <p className="u-mt-6 font-serif u-fs-44 font-bold leading-tight text-pw-700">{s.value}</p>
            <p className="u-fs-15 font-bold text-pw-900">{s.label}</p>
            <p className="u-mt-4 u-fs-13 leading-snug text-pw-muted">{s.note}</p>
          </Card>
        </At>
      ))}
      <At x={0} y={230} w={873} h={94}>
        <Card dark className="flex h-full items-center u-gap-15 u-px-22">
          <IconBadge icon="tractor" size={42} tone="light" iconScale={0.52} />
          <div>
            <p className="u-fs-18 font-bold text-white">Skalierung in den Agrarsektor</p>
            <p className="u-mt-4 u-fs-15 text-pw-200">Später interessant für besonders volatile und pflegeintensive Pflanzenarten.</p>
          </div>
        </Card>
      </At>
    </SlideLayout>
  );
}
