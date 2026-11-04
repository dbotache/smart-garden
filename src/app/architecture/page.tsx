import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArchitectureDiagram } from "@/architecture";

export const metadata: Metadata = { title: "PlantWiz · Systemarchitektur" };

/** Standalone route for the architecture diagram (the same component as slide 11). */
export default function ArchitecturePage() {
  return (
    <main className="min-h-dvh bg-[#e9ece7]">
      <header className="flex items-center justify-between gap-4 border-b border-pw-200/60 bg-white/70 px-5 py-2.5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/assets/images/plantwiz-logo.png" alt="" width={28} height={28} className="rounded-md" />
          <span className="font-serif text-lg font-bold text-pw-900">PlantWiz</span>
          <span className="hidden text-sm text-pw-muted sm:inline">· Systemarchitektur</span>
        </Link>
        <Link href="/presentation#/11" className="text-sm font-semibold text-pw-700 hover:underline">
          Präsentation →
        </Link>
      </header>
      <div className="mx-auto max-w-[1400px] p-3 sm:p-6">
        <div className="rounded-2xl bg-white p-4 shadow-[0_10px_40px_rgba(27,67,50,0.12)] sm:p-6">
          <ArchitectureDiagram showHeader />
        </div>
      </div>
    </main>
  );
}
