import type { Metadata } from "next";
import { BackupPrintPresentation } from "./BackupPrintPresentation";

export const metadata: Metadata = { title: "PlantWiz – Backup-Folien (PDF)" };

export default function BackupPrintPage() {
  return <BackupPrintPresentation />;
}
