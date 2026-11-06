import type { Metadata } from "next";
import { BackupPresentation } from "./BackupPresentation";

export const metadata: Metadata = { title: "PlantWiz · Backup-Folien" };

export default function BackupPage() {
  return <BackupPresentation />;
}
