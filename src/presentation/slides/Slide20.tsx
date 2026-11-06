import { SlideLayout } from "../components/SlideLayout";
import { PrototypeEmbed } from "../components/PrototypeEmbed";

/** NEW (not in the PPTX) — Stage 3 of the live garden: measured soil and weather data; health only as an estimate. */
export default function Slide20() {
  return (
    <SlideLayout eyebrow="DEMO 3/4 · IOT-SENSOREN (GEPLANT)" title="Sensoren zeigen, was der Garten gerade braucht" bodyTop={104} bodyHeight={388}>
      <PrototypeEmbed stage="monitoring" />
    </SlideLayout>
  );
}
