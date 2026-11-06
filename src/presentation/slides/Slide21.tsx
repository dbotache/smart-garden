import { SlideLayout } from "../components/SlideLayout";
import { PrototypeEmbed } from "../components/PrototypeEmbed";

/** NEW (not in the PPTX) — Stage 4 of the live garden: adaptive irrigation per bed vs. a fixed timer. */
export default function Slide21() {
  return (
    <SlideLayout eyebrow="DEMO 4/4 · TEILAUTOMATISIERUNG (GEPLANT)" title="Gießen nur dort, wo es nötig ist" bodyTop={104} bodyHeight={388}>
      <PrototypeEmbed stage="irrigation" />
    </SlideLayout>
  );
}
