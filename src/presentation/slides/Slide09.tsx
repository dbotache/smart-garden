import { SlideLayout } from "../components/SlideLayout";
import { PrototypeEmbed } from "../components/PrototypeEmbed";

/** NEW (not in the PPTX) — Stage 2 of the live garden: recommended species per bed with score and reason. */
export default function Slide09() {
  return (
    <SlideLayout eyebrow="DEMO 2/4 · PFLANZEMPFEHLUNGEN" title="Passende Arten je Beet – mit Begründung" bodyTop={104} bodyHeight={388}>
      <PrototypeEmbed stage="planting" />
    </SlideLayout>
  );
}
