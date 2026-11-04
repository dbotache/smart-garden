"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GardenScene, parseStage, type Locale } from "@/prototype";

/** Standalone route. Query params (?stage=monitoring&lang=de&intro=0) give stable deep links for demos and tests. */
export function PrototypeApp() {
  const params = useSearchParams();
  const [locale, setLocale] = useState<Locale>(params.get("lang") === "de" ? "de" : "en");
  const initialStage = parseStage(params.get("stage"));
  const intro = params.get("intro") !== "0";

  return (
    <main className="flex h-dvh flex-col bg-[#f3f2ec]">
      <header className="flex items-center justify-between gap-4 border-b border-pw-200/60 bg-white/70 px-5 py-2.5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/assets/images/plantwiz-logo.png" alt="" width={28} height={28} className="rounded-md" />
          <span className="font-serif text-lg font-bold text-pw-900">PlantWiz</span>
          <span className="hidden text-sm text-pw-muted sm:inline">· {locale === "de" ? "Smart-Garden-Prototyp" : "Smart garden prototype"}</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-pw-muted md:inline">{locale === "de" ? "Pfeiltasten wechseln die Phase" : "Arrow keys switch stages"}</span>
          <div role="group" aria-label="Language" className="flex rounded-lg bg-pw-50 p-0.5 ring-1 ring-pw-200">
            {(["en", "de"] as const).map((l) => (
              <button key={l} type="button" aria-pressed={locale === l} onClick={() => setLocale(l)} className={`rounded-md px-2 py-0.5 font-semibold uppercase ${locale === l ? "bg-white text-pw-900 shadow-sm" : "text-pw-muted"}`}>
                {l}
              </button>
            ))}
          </div>
          <Link href="/presentation" className="font-semibold text-pw-700 hover:underline">
            {locale === "de" ? "Präsentation →" : "Presentation →"}
          </Link>
        </div>
      </header>
      <div className="min-h-0 flex-1 p-3">
        <div className="h-full overflow-hidden rounded-2xl ring-1 ring-pw-200/70">
          <GardenScene initialStage={initialStage} locale={locale} intro={intro} />
        </div>
      </div>
    </main>
  );
}
