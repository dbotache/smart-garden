import type { Metadata } from "next";
import { PrintPresentation } from "./PrintPresentation";

export const metadata: Metadata = { title: "PlantWiz – Präsentation (PDF)" };

export default function PrintPage() {
  return <PrintPresentation />;
}
