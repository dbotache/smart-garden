"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { GardenScene, type GardenStage, type Locale } from "@/prototype";
import { useGardenHost } from "./GardenHost";

/**
 * Place the live 3D garden in a slide.
 *
 *   <PrototypeEmbed stage="planting" />
 *
 * Inside the deck it reserves a slot for the shared, persistent garden (see GardenHost).
 * Outside a deck (e.g. a slide rendered on its own) it falls back to a self-contained GardenScene.
 */
export function PrototypeEmbed({ stage, locale = "de", className = "" }: { stage: GardenStage; locale?: Locale; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const host = useGardenHost();
  const id = useId();

  useLayoutEffect(() => {
    if (!host || !ref.current) return;
    return host.register({ id, el: ref.current, stage });
  }, [host, id, stage]);

  return (
    <div ref={ref} className={`relative h-full w-full overflow-hidden u-r-10 bg-[#f3f2ec] ring-1 ring-pw-200 ${className}`} data-garden-slot={stage}>
      {!host && <GardenScene presentationMode initialStage={stage} locale={locale} />}
    </div>
  );
}
