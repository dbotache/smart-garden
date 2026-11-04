import Image from "next/image";
import { SlideLayout } from "../components/SlideLayout";
import { At } from "../components/SlidePrimitives";

/** PPTX 1 — Title. Green panel left (0–504 pt), photo right (504–960 pt). */
export default function Slide01() {
  return (
    <SlideLayout variant="bare">
      <div className="absolute inset-y-0 left-0 bg-pw-900" style={{ width: "52.5%" }} />
      <At x={43} y={104} w={58} h={58}>
        <Image src="/assets/images/plantwiz-logo.png" alt="PlantWiz-Logo" width={256} height={256} priority className="h-full w-full rounded-[18%]" />
      </At>
      <At x={43} y={169} w={432} h={86} className="flex items-center">
        <h1 className="font-serif u-fs-66 font-bold leading-none text-white">PlantWiz</h1>
      </At>
      <At x={43} y={259} w={432} h={43} className="flex items-center">
        <p className="u-fs-26 text-pw-200">Dein Garten, dein Plan.</p>
      </At>
      <At x={43} y={454} w={432} h={29} className="flex items-center">
        <p className="u-fs-16 text-white">StartUp Hack Nordhessen</p>
      </At>
      <At x={504} y={0} w={456} h={540}>
        <Image src="/assets/images/title-raised-beds.jpg" alt="Hochbeete mit Gemüse in einem angelegten Garten" fill priority sizes="50vw" className="object-cover" />
      </At>
    </SlideLayout>
  );
}
