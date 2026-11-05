import Image from "next/image";
import { SlideLayout } from "../components/SlideLayout";
import { At, Card } from "../components/SlidePrimitives";

const LAYERS = [
  { n: 1, title: "Digitaler Zwilling", status: "läuft", live: true, text: "App und Weboberfläche mit Bilderkennung und Handlungsempfehlungen", y: 0, h: 94 },
  { n: 2, title: "IoT-Sensoren", status: "geplant", live: false, text: "Boden- und Luftfeuchte, Temperatur, Einstrahlung plus Wetterdaten für genauere Empfehlungen und Überwachung", y: 104, h: 112 },
  { n: 3, title: "Teilautomatisierung", status: "geplant", live: false, text: "Bewässerung für einzelne Pflanzenarten", y: 227, h: 79 },
];

/** PPTX 6 — Technical realisation: the three layers shown in the live demo. */
export default function Slide06() {
  return (
    <SlideLayout eyebrow="HOW · TECHNISCHE REALISIERUNG" title="Drei Ebenen, und die erste läuft bereits">
      {LAYERS.map((l) => (
        <At key={l.n} x={0} y={l.y} w={468} h={l.h}>
          <Card className="relative h-full u-py-12" >
            <span className={`absolute grid place-items-center rounded-full u-fs-20 font-bold text-white ${l.n === 1 ? "bg-pw-700" : "bg-pw-400"}`} style={{ left: "calc(var(--pt)*16)", top: "calc(var(--pt)*14)", width: "calc(var(--pt)*43)", height: "calc(var(--pt)*43)" }}>
              {l.n}
            </span>
            <span className={`absolute grid place-items-center rounded-full u-fs-11 font-bold ${l.live ? "bg-pw-700 text-white" : "bg-pw-200 text-pw-900"}`} style={{ left: "calc(var(--pt)*382)", top: "calc(var(--pt)*14)", width: "calc(var(--pt)*72)", height: "calc(var(--pt)*20)" }}>
              {l.status}
            </span>
            <div style={{ marginLeft: "calc(var(--pt)*72)", marginRight: "calc(var(--pt)*14)" }}>
              <h3 className="u-fs-18 font-bold text-pw-900">{l.title}</h3>
              <p className="u-mt-4 u-fs-14 leading-snug text-pw-ink">{l.text}</p>
            </div>
          </Card>
        </At>
      ))}
      <At x={490} y={0} w={384} h={211}>
        <Image src="/assets/images/tech-garden-plan.jpg" alt="Maßstabsgetreuer Gartenplan in PlantWiz mit Beeten, Pflanzen, Weg, Terrasse und Teich" fill sizes="40vw" className="object-cover" />
      </At>
      <At x={490} y={216} w={384} h={22}>
        <p className="u-fs-12 text-pw-muted">Gartenplan in PlantWiz (Demo-Garten)</p>
      </At>
      <At x={490} y={247} w={185} h={83}>
        <p className="font-serif u-fs-32 font-bold leading-tight text-pw-700">8.759</p>
        <p className="u-mt-4 u-fs-13 leading-snug text-pw-muted">Einträge im Pflanzenkatalog, 1.061 Arten</p>
      </At>
      <At x={689} y={247} w={185} h={83}>
        <p className="flex items-end font-serif u-fs-24 font-bold leading-tight text-pw-700" style={{ minHeight: "calc(var(--pt)*40)" }}>Web + Android</p>
        <p className="u-mt-4 u-fs-13 leading-snug text-pw-muted">PWA und Android-App aus einer Codebasis</p>
      </At>
    </SlideLayout>
  );
}
