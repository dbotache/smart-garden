import { SlideLayout } from "../components/SlideLayout";
import { FinanceModel } from "@/business";

/**
 * NEW (not in the PPTX) — interactive financial model for the free tier and the three subscriptions
 * (source_documents/GardenTwin_Geschaeftsmodell_Finanzkalkulation.md, derived values recalculated).
 */
export default function Slide20() {
  return (
    <SlideLayout eyebrow="HOW · FINANZMODELL (PLANUNGSANNAHMEN)" title="Was ein zahlender Kunde bringt und ab wann es trägt" bodyTop={104} bodyHeight={388}>
      <FinanceModel />
    </SlideLayout>
  );
}
