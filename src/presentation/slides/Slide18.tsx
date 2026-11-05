import { SlideLayout } from "../components/SlideLayout";
import { SavingsLevers } from "@/business";

/** NEW — where the plan can save: staff via grants, technical levers in € per month, hardware levers. */
export default function Slide18() {
  return (
    <SlideLayout eyebrow="HOW · KOSTEN SENKEN" title="Größter Sparhebel: Personal, nicht die Technik" bodyTop={104} bodyHeight={388}>
      <SavingsLevers />
    </SlideLayout>
  );
}
