import { SlideLayout } from "../components/SlideLayout";
import { PrototypeEmbed } from "../components/PrototypeEmbed";

/** NEW (not in the PPTX) — Stage 1 of the live garden: building, terrain and potential planting zones. */
export default function Slide08() {
  return (
    <SlideLayout eyebrow="DEMO 1/4 · DIGITALER ZWILLING" title="Vom Grundriss zum maßstabsgetreuen Gartenplan" bodyTop={104} bodyHeight={388}>
      <PrototypeEmbed stage="planning" />
    </SlideLayout>
  );
}
