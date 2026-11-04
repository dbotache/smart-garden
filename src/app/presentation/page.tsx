import type { Metadata } from "next";
import { Presentation } from "./Presentation";

export const metadata: Metadata = { title: "PlantWiz · Präsentation" };

export default function PresentationPage() {
  return <Presentation />;
}
