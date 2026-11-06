"use client";

import { SlideDeck } from "@/presentation/components/SlideDeck";
import { BACKUP_SLIDES } from "@/presentation/slides";

/** Backup slides for questions after the talk (not part of the main deck). */
export function BackupPresentation() {
  return <SlideDeck slides={BACKUP_SLIDES} pdfHref="/presentation/backup/print?download" switchTo={{ href: "/presentation#/9", label: "Zurück zum Pitch", title: "Zurück zur Hauptpräsentation (Call)" }} />;
}
