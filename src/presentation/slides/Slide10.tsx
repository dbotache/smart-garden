import { SlideLayout } from "../components/SlideLayout";
import { FinanceSummary } from "@/business";

/**
 * NEW (not in the PPTX) — investor summary of the financial plan: three year-3 scenarios, unit economics,
 * what the pilot validates. The cost slides (16–19) and the interactive model (20) follow.
 */
export default function Slide10() {
  return (
    <SlideLayout eyebrow="HOW · FINANZPLAN (PLANUNGSANNAHMEN)" title="Jahr 3: zwischen −4 T€ und +16 T€ pro Monat" bodyTop={104} bodyHeight={388}>
      <FinanceSummary />
    </SlideLayout>
  );
}
