import { SlideLayout } from "../components/SlideLayout";
import { At, IconBadge, type IconName } from "../components/SlidePrimitives";

const ASKS: { icon: IconName; tone: "red" | "green"; title: string; text: string; x: number }[] = [
  { icon: "sprout", tone: "red", title: "Pilotgärten", text: "Kleingartenvereine und Hobbygärtner aus Nordhessen, die mit uns testen.", x: 0 },
  { icon: "tools", tone: "green", title: "Hardware-Partner", text: "Unterstützung bei Sensoren und Bewässerung für den Prototyp.", x: 299 },
  { icon: "handshake", tone: "green", title: "Kontakte + Förderung", text: "Mentoring und Förderprogramme für die erste Hardware-Runde.", x: 597 },
];
const OUTLOOK = ["Privatgarten", "Kleingartenverein", "Neubau", "Agrarbetrieb"];

/** PPTX 9 — Call to action + outlook (dark variant). */
export default function Slide22() {
  return (
    <SlideLayout variant="dark" eyebrow="CALL · OUTLOOK" title="Wir suchen Pilotgärten, Hardware-Partner und Förderung">
      {ASKS.map((a) => (
        <At key={a.title} x={a.x} y={0} w={277} h={166}>
          <div className="h-full bg-white u-r-10 u-px-18 u-py-14 text-pw-ink">
            <div className="flex items-center u-gap-10">
              <IconBadge icon={a.icon} size={40} tone={a.tone} />
              <h3 className="u-fs-18 font-bold text-pw-900">{a.title}</h3>
            </div>
            <p className="u-mt-14 u-fs-16 leading-snug">{a.text}</p>
          </div>
        </At>
      ))}
      <At x={0} y={186} w={288} h={22}>
        <p className="u-fs-13 font-bold tracking-[0.12em] text-pw-200">OUTLOOK</p>
      </At>
      {OUTLOOK.map((o, i) => (
        <At key={o} x={i * 220.3} y={211} w={213} h={50}>
          <div className={`grid h-full place-items-center u-fs-15 font-bold text-white ${i === 0 ? "bg-pw-400" : "bg-pw-700"}`} style={{ clipPath: i === 0 ? "polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%)" : "polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%, 12% 50%)" }}>
            {o}
          </div>
        </At>
      ))}
      <At x={0} y={281} w={873} h={29}>
        <p className="u-fs-18 font-bold text-white">Sprecht uns an: Diego Botache · Robin Steltmann</p>
      </At>
    </SlideLayout>
  );
}
