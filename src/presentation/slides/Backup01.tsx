import { SlideLayout } from "../components/SlideLayout";
import { Phase1Costs, phase1BreakEvenUsers } from "@/business";

/**
 * NEW — phase 1 (digital only): running costs with researched prices and marked assumptions
 * (src/business/data/operatingCosts.ts, docs/operating-costs.md).
 */
export default function Backup01() {
  const users = phase1BreakEvenUsers(0.05) ?? 0;
  const paying = Math.round(users * 0.05);
  return (
    <SlideLayout eyebrow="HOW · PHASE 1: NUR DIGITAL" title={`${paying.toLocaleString("de-DE")} Zahlende (${users.toLocaleString("de-DE")} Nutzer) decken den Betrieb`} bodyTop={104} bodyHeight={388}>
      <Phase1Costs />
    </SlideLayout>
  );
}
