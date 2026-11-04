import type { ComponentType } from "react";
import type { GardenStage } from "@/prototype";

export type SlideSource =
  | { type: "pptx"; slide: number }
  | { type: "new"; reason: string };

export type SlideDefinition = {
  /** stable id used in tests and deep links */
  id: string;
  /** short title for navigation, progress and the migration map */
  title: string;
  /** eyebrow / section label as in the PPTX */
  section: string;
  Component: ComponentType;
  /** speaker notes (from the PPTX notes pages where available) */
  notes?: string;
  source: SlideSource;
  /** set when the slide embeds the live garden; lets the deck prefetch the 3D bundle one slide ahead */
  garden?: { stage: GardenStage };
};
