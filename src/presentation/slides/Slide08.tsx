import { SlideLayout } from "../components/SlideLayout";
import { ArchitectureDiagram, ARCH_TEXT } from "@/architecture";

/**
 * NEW (not in the PPTX) — interactive system architecture, migrated from original_prototype/gardentwin.
 * Follows the live garden demo: the same three levels, now as the infrastructure behind them.
 */
export default function Slide08() {
  return (
    <SlideLayout eyebrow="HOW · SYSTEMARCHITEKTUR (KONZEPT)" title={ARCH_TEXT.title} bodyTop={104} bodyHeight={388}>
      <ArchitectureDiagram fit="slide" />
    </SlideLayout>
  );
}
