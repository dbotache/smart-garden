"use client";

import { PrintDeck } from "@/presentation/components/PrintDeck";
import { SLIDES } from "@/presentation/slides";

export function PrintPresentation() {
  return <PrintDeck slides={SLIDES} />;
}
