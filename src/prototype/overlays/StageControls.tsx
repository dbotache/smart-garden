"use client";

import { GARDEN_STAGES, type GardenStage } from "../types";
import type { Messages } from "../data/i18n";

/**
 * Stage switcher. Plain toggle buttons (not an arrow-key tablist) so arrow keys / presenter clickers
 * keep navigating slides when the garden is embedded in the presentation.
 */
export function StageControls({ stage, onChange, messages }: { stage: GardenStage; onChange: (s: GardenStage) => void; messages: Messages }) {
  return (
    <nav aria-label={messages.stageNav} className="pointer-events-auto">
      <ol className="flex gap-1 rounded-xl bg-white/92 p-1 shadow-[0_6px_24px_rgba(27,67,50,0.12)] ring-1 ring-[#dfe6dd] backdrop-blur">
        {GARDEN_STAGES.map((s, i) => {
          const active = s === stage;
          const copy = messages.stages[s];
          return (
            <li key={s}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(s);
                }}
                aria-pressed={active}
                aria-label={`${i + 1}. ${copy.title}`}
                data-stage-button={s}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2D6A4F] ${active ? "bg-[#1B4332] text-white" : "text-[#1B4332] hover:bg-[#EEF8F1]"}`}
              >
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10.5px] font-bold ${active ? "bg-[#52B788] text-[#1B4332]" : "bg-[#EEF8F1] text-[#2D6A4F]"}`}>{i + 1}</span>
                <span className="leading-tight">
                  {/* container queries: full titles on wide gardens, short labels when embedded small */}
                  <span className="block whitespace-nowrap text-[12.5px] font-semibold">
                    <span className="@max-[78rem]:hidden">{copy.title}</span>
                    <span className="hidden @max-[78rem]:inline">{copy.short}</span>
                  </span>
                  <span className={`block whitespace-nowrap text-[10.5px] @max-[96rem]:hidden ${active ? "text-[#B7E4C7]" : "text-[#56635C]"}`}>{copy.detail}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
