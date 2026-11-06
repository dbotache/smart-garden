"use client";

import { SlideDeck } from "@/presentation/components/SlideDeck";
import { SLIDES } from "@/presentation/slides";

export function Presentation() {
  return <SlideDeck slides={SLIDES} switchTo={{ href: "/presentation/backup", label: "Backup", title: "Backup-Folien für Rückfragen" }} />;
}
