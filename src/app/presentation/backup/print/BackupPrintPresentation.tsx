"use client";

import { PrintDeck } from "@/presentation/components/PrintDeck";
import { BACKUP_SLIDES } from "@/presentation/slides";

export function BackupPrintPresentation() {
  return <PrintDeck slides={BACKUP_SLIDES} fileName="PlantWiz-Backup.pdf" backHref="/presentation/backup" />;
}
