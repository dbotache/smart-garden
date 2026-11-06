"use client";

import type { SlideDefinition } from "../config/types";
import { SlideProgress } from "./SlideProgress";

type Props = {
  slides: SlideDefinition[];
  index: number;
  onGo: (i: number) => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  notesOpen: boolean;
  onToggleNotes: () => void;
  /** export view of this deck */
  pdfHref?: string;
  /** link to the other deck (main ↔ backup) */
  switchTo?: { href: string; label: string; title: string };
};

const btn = "grid h-9 min-w-9 place-items-center rounded-lg px-2 text-pw-900 ring-1 ring-pw-200 bg-white hover:bg-pw-50 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-pw-700";

export function SlideNavigation({ slides, index, onGo, fullscreen, onToggleFullscreen, notesOpen, onToggleNotes, pdfHref = "/presentation/print?download", switchTo }: Props) {
  return (
    <nav aria-label="Foliennavigation" className="flex items-center gap-2 text-sm" data-testid="deck-nav">
      <button type="button" className={btn} onClick={() => onGo(index - 1)} disabled={index === 0} aria-label="Vorherige Folie" data-testid="deck-prev">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <span className="min-w-[4.5rem] text-center font-semibold tabular-nums text-pw-900" aria-live="polite" data-testid="deck-counter">
        {index + 1} / {slides.length}
      </span>
      <button type="button" className={btn} onClick={() => onGo(index + 1)} disabled={index === slides.length - 1} aria-label="Nächste Folie" data-testid="deck-next">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <SlideProgress slides={slides} index={index} onGo={onGo} />
      <button type="button" className={btn} onClick={onToggleNotes} aria-pressed={notesOpen} title="Sprechernotizen (N)" data-testid="deck-notes">
        Notizen
      </button>
      {switchTo && (
        <a href={switchTo.href} className={`${btn} font-semibold`} title={switchTo.title} data-testid="deck-switch">
          {switchTo.label}
        </a>
      )}
      <a href={pdfHref} target="_blank" rel="noopener" className={`${btn} grid-flow-col gap-1.5 font-semibold`} title="Alle Folien als PDF herunterladen (öffnet die Exportansicht)" data-testid="deck-pdf">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M8 2v8m0 0 3-3m-3 3L5 7M3 12v2h10v-2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        PDF
      </a>
      <button type="button" className={btn} onClick={onToggleFullscreen} aria-pressed={fullscreen} title="Vollbild (F)" aria-label={fullscreen ? "Vollbild beenden" : "Vollbild"} data-testid="deck-fullscreen">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
          {fullscreen ? <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /> : <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
        </svg>
      </button>
    </nav>
  );
}
