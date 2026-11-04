"use client";

import { SlideDeck } from "@/presentation/components/SlideDeck";
import { SLIDES } from "@/presentation/slides";

export function Presentation() {
  return <SlideDeck slides={SLIDES} />;
}
