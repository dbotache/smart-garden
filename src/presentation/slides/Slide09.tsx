import { SlideLayout } from "../components/SlideLayout";
import { At, IconBadge } from "../components/SlidePrimitives";
import { VideoSlide } from "../components/VideoSlide";

const OUTLOOK = ["Privatgarten", "Kleingartenverein", "Neubau", "Agrarbetrieb"];

/** PPTX 9 — Call to action + outlook (dark variant), with the closing video in place of two ask cards. */
export default function Slide09() {
  return (
    <SlideLayout variant="dark" eyebrow="CALL · OUTLOOK" title="Wir suchen Pilotgärten und Förderung" bodyTop={112} bodyHeight={375}>
      <At x={0} y={0} w={353} h={160}>
        <div className="h-full bg-white u-r-10 u-px-18 u-py-14 text-pw-ink">
          <div className="flex items-center u-gap-10">
            <IconBadge icon="sprout" size={40} tone="red" />
            <h3 className="u-fs-18 font-bold text-pw-900">Pilotgärten</h3>
          </div>
          <p className="u-mt-14 u-fs-16 leading-snug">Kleingartenvereine und Hobbygärtner aus Nordhessen, die mit uns testen.</p>
        </div>
      </At>
      <At x={0} y={184} w={353} h={97} className="flex flex-col justify-end">
        <p className="u-fs-13 font-bold tracking-[0.12em] text-pw-200">SPRECHT UNS AN</p>
        <p className="u-mt-6 u-fs-18 font-bold leading-snug text-white">Diego Botache · Robin Steltmann</p>
      </At>
      <At x={373} y={0} w={500} h={281} className="overflow-hidden u-r-10 bg-black">
        <VideoSlide clip="plantwiz-abschluss" title="PlantWiz-Abschlussvideo" />
      </At>
      <At x={0} y={303} w={288} h={22}>
        <p className="u-fs-13 font-bold tracking-[0.12em] text-pw-200">OUTLOOK</p>
      </At>
      {OUTLOOK.map((o, i) => (
        <At key={o} x={i * 220.3} y={327} w={213} h={46}>
          <div className={`grid h-full place-items-center u-fs-15 font-bold text-white ${i === 0 ? "bg-pw-400" : "bg-pw-700"}`} style={{ clipPath: i === 0 ? "polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%)" : "polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%, 12% 50%)" }}>
            {o}
          </div>
        </At>
      ))}
    </SlideLayout>
  );
}
