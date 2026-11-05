import { SlideLayout } from "../components/SlideLayout";
import { HardwareCosts } from "@/business";

/** NEW — costs of the sensor variants: pilot + certification, contribution per kit, running cost per device. */
export default function Slide17() {
  return (
    <SlideLayout eyebrow="HOW · PHASE 2 + 3: MIT SENSORIK" title="Hardware: erst Pilot und Zulassung, dann Gewinn" bodyTop={104} bodyHeight={388}>
      <HardwareCosts />
    </SlideLayout>
  );
}
