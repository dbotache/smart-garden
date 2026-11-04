"use client";

import type { SlideDefinition } from "../config/types";

/** Segmented progress bar; garden slides are marked in the accent colour. Each segment jumps to its slide. */
export function SlideProgress({ slides, index, onGo }: { slides: SlideDefinition[]; index: number; onGo: (i: number) => void }) {
  return (
    <ol className="flex min-w-0 flex-1 items-center gap-1" aria-label="Folienübersicht">
      {slides.map((s, i) => (
        <li key={s.id} className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onGo(i)}
            aria-label={`Folie ${i + 1}: ${s.title}`}
            aria-current={i === index ? "step" : undefined}
            title={`${i + 1}. ${s.title}`}
            className="group block w-full py-2 focus-visible:outline-2 focus-visible:outline-pw-700"
          >
            <span className={`block h-1.5 rounded-full transition-colors ${i === index ? "bg-pw-900" : i < index ? (s.garden ? "bg-pw-400" : "bg-pw-700/60") : s.garden ? "bg-pw-200" : "bg-[#d5dbd4]"} group-hover:bg-pw-700`} />
          </button>
        </li>
      ))}
    </ol>
  );
}
