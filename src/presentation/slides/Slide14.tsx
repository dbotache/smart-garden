import { SlideLayout } from "../components/SlideLayout";
import { PrototypeCosts } from "@/business";

/**
 * NEW (not in the PPTX) — the three hardware prototypes and their material budgets
 * (source_documents/GardenTwin_Prototyp_Level_Kostenvergleich.md, totals recalculated from the parts lists).
 */
export default function Slide14() {
  return (
    <SlideLayout eyebrow="HOW · PROTOTYPEN + KOSTEN" title="Drei Prototypen: von 55 € bis 458 € Material" bodyTop={104} bodyHeight={388}>
      <PrototypeCosts />
    </SlideLayout>
  );
}
