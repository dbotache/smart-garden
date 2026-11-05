import Image from "next/image";
import { SlideLayout } from "../components/SlideLayout";
import { At, Card, IconBadge, pt } from "../components/SlidePrimitives";

const TEAM = [
  { name: "Diego Botache", role: "Elektrotechnik und Computer Science", img: "/assets/images/team-diego-botache.jpg", y: 0 },
  { name: "Robin Steltmann", role: "Full-Stack-Entwicklung und KI", img: "/assets/images/team-robin-steltmann.jpg", y: 158 },
];

/** PPTX 2 — Team + Mission. */
export default function Slide02() {
  return (
    <SlideLayout eyebrow="WHO · TEAM + MISSION" title="Zwei Gründer bringen Software und Sensorik zusammen">
      {TEAM.map((m) => (
        <At key={m.name} x={0} y={m.y} w={396} h={144}>
          <Card className="flex h-full items-center u-gap-18 u-px-18">
            <Image src={m.img} alt={`Profilbild von ${m.name}`} width={240} height={240} className="shrink-0 rounded-full object-cover" style={{ width: pt(101), height: pt(101) }} />
            <div>
              <p className="font-serif u-fs-22 font-bold text-pw-900">{m.name}</p>
              <p className="u-mt-4 u-fs-16 text-pw-ink">{m.role}</p>
            </div>
          </Card>
        </At>
      ))}
      <At x={425} y={0} w={449} h={302}>
        <Card dark className="h-full u-p-25">
          <div className="flex items-center u-gap-13">
            <IconBadge icon="sprout" size={45} tone="light" iconScale={0.51} />
            <p className="u-fs-13 font-bold uppercase tracking-[0.12em] text-pw-200">Mission</p>
          </div>
          <p className="u-mt-24 font-serif u-fs-28 leading-[1.18] text-white">Blühende Gärten statt Steingärten: Mit digitalem Zwilling und Pflegeempfehlungen klappt es auch ohne grünen Daumen.</p>
        </Card>
      </At>
    </SlideLayout>
  );
}
