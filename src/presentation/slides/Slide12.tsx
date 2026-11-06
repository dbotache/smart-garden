import { SlideLayout } from "../components/SlideLayout";
import { CompatCosts } from "@/business";

/**
 * NEW — compatibility stage before own hardware: connect third-party sensors (Expert tariff), no own device.
 * Sources in docs/operating-costs.md.
 */
export default function Slide12() {
  return (
    <SlideLayout eyebrow="HOW · VORSTUFE: KOMPATIBEL STATT EIGENE HARDWARE" title="Vorstufe: fremde Sensoren statt eigenes Gerät" bodyTop={104} bodyHeight={388}>
      <CompatCosts />
    </SlideLayout>
  );
}
