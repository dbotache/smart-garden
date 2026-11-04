import Image from "next/image";
import { SlideLayout } from "../components/SlideLayout";
import { At, Card, IconBadge, type IconName } from "../components/SlidePrimitives";

const TODAY: { icon: IconName; text: string }[] = [
  { icon: "cube", text: "Digitaler Zwilling in 2D und 3D" },
  { icon: "drop", text: "Gießempfehlung, Aufgaben und Pflegetipps" },
  { icon: "leaf", text: "Mischkultur- und Fruchtfolge-Hinweise" },
  { icon: "bee", text: "Insektenfreundlichkeit je Pflanze und im Plan" },
  { icon: "wand", text: "Beet-Generator für passende Bepflanzung" },
  { icon: "microscope", text: "KI-Chat, Foto-Check für Krankheiten und Arten" },
];
const NEXT: { icon: IconName; text: string }[] = [
  { icon: "chart", text: "Prognosen zum Pflegezustand" },
  { icon: "wifi", text: "Überwachung mit modularen Sensoren" },
  { icon: "faucet", text: "Bewässerung für einzelne Arten" },
  { icon: "exchange", text: "Vernetzte Gärten, z. B. Tauschbörse" },
];

function Column({ x, title, items, tone }: { x: number; title: string; items: { icon: IconName; text: string }[]; tone: "green" | "muted" }) {
  return (
    <At x={x} y={0} w={204} h={331}>
      <Card className="flex h-full flex-col u-px-13 u-py-9">
        <h3 className="u-fs-15 font-bold text-pw-900 u-mb-4" style={{ minHeight: "calc(var(--pt) * 32)", display: "flex", alignItems: "center" }}>
          {title}
        </h3>
        <ul className={`flex flex-1 flex-col ${tone === "green" ? "justify-between" : "justify-around"} u-pb-4`}>
          {items.map((i) => (
            <li key={i.text} className="flex items-center u-gap-8">
              <IconBadge icon={i.icon} size={29} tone={tone} />
              <span className="u-fs-13 leading-tight text-pw-ink">{i.text}</span>
            </li>
          ))}
        </ul>
      </Card>
    </At>
  );
}

/** PPTX 4 — Vision: app screenshot, target vision, "runs today" vs "coming next". */
export default function Slide04() {
  return (
    <SlideLayout eyebrow="WHAT · VISION" title="Ein Assistent, der sagt, was der Garten heute braucht">
      <At x={0} y={0} w={425} h={216}>
        <Image src="/assets/images/vision-season-calendar.jpg" alt="PlantWiz-Kalender mit Pflanz-, Blüte- und Erntezeiten je Beet" fill sizes="45vw" className="object-contain object-left-top" />
      </At>
      <At x={0} y={222} w={425} h={22}>
        <p className="u-fs-12 text-pw-muted">Saisonkalender in PlantWiz, hier mit einem Demo-Garten</p>
      </At>
      <At x={0} y={252} w={425} h={79}>
        <Card dark className="flex h-full items-center u-px-18">
          <p className="u-fs-15 leading-snug text-white">Zielbild: vorausschauende, wetterbasierte Pflege, die mit Sensoren immer genauer wird.</p>
        </Card>
      </At>
      <Column x={450} title="Läuft heute in der App" items={TODAY} tone="green" />
      <Column x={669} title="Kommt als Nächstes" items={NEXT} tone="muted" />
    </SlideLayout>
  );
}
