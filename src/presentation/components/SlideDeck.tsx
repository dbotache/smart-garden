"use client";

import { useEffect, useRef, useState } from "react";
import type { SlideDefinition } from "../config/types";
import { deckKeyAction } from "../utils/keyboard";
import { useDeckLocation } from "../hooks/useDeckLocation";
import { useFullscreen } from "../hooks/useFullscreen";
import { SlideMetaContext } from "./SlideMeta";
import { SlideNavigation } from "./SlideNavigation";
import { GardenHost } from "./GardenHost";

/**
 * 16:9 slide deck. Renders only the current slide (each slide is its own component/file), keeps one
 * persistent garden for all garden slides, and owns keyboard navigation. The deck never navigates on
 * pointer or wheel input, so dragging/zooming/clicking the garden can't change slides.
 */
export function SlideDeck({ slides, pdfHref, switchTo }: { slides: SlideDefinition[]; pdfHref?: string; switchTo?: { href: string; label: string; title: string } }) {
  const { index, go, step } = useDeckLocation(slides.length);
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const fullscreen = useFullscreen(rootRef);
  const [notesOpen, setNotesOpen] = useState(false);
  const slide = slides[index]!;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const action = deckKeyAction(e);
      if (!action) return;
      switch (action) {
        case "next":
          step(1);
          break;
        case "prev":
          step(-1);
          break;
        case "first":
          go(0);
          break;
        case "last":
          go(slides.length - 1);
          break;
        case "fullscreen":
          void fullscreen.toggle();
          break;
        case "notes":
          setNotesOpen((o) => !o);
          break;
        case "escape":
          if (notesOpen) setNotesOpen(false);
          else void fullscreen.exit();
          (document.activeElement as HTMLElement | null)?.blur?.();
          return;
      }
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    rootRef.current?.setAttribute("data-keys", "ready"); // tests wait for this before pressing keys
    return () => window.removeEventListener("keydown", onKey);
  }, [go, step, slides.length, fullscreen, notesOpen]);

  // Warm the 3D bundle one slide before the first garden slide.
  useEffect(() => {
    if (slides[index + 1]?.garden || slide.garden) void import("@/prototype/components/GardenCanvas");
  }, [index, slide, slides]);

  useEffect(() => {
    document.title = `${index + 1}/${slides.length} · ${slide.title} · PlantWiz`;
  }, [index, slide, slides.length]);

  const Slide = slide.Component;
  const fs = fullscreen.active;

  return (
    <div ref={rootRef} className={`flex h-dvh w-full flex-col ${fs ? "bg-black" : "bg-[#e9ece7]"}`} data-testid="deck" data-slide-id={slide.id} data-slide-index={index}>
      <div className={`flex min-h-0 flex-1 items-center justify-center ${fs ? "p-0" : "p-3 sm:p-5"}`}>
        <div
          ref={frameRef}
          className={`deck-frame relative aspect-video overflow-hidden bg-white ${fs ? "" : "rounded-lg shadow-[0_10px_40px_rgba(27,67,50,0.18)]"}`}
          style={{ width: fs ? "min(100vw, 100dvh * 16 / 9)" : `min(100%, (100dvh - ${notesOpen ? 220 : 90}px) * 16 / 9)` }}
          role="region"
          aria-roledescription="Folie"
          aria-label={`Folie ${index + 1} von ${slides.length}: ${slide.title}`}
        >
          <GardenHost frameRef={frameRef}>
            <SlideMetaContext.Provider value={{ number: index + 1, total: slides.length }}>
              <div key={slide.id} className="slide-enter absolute inset-0" data-testid={`slide-${slide.id}`}>
                <Slide />
              </div>
            </SlideMetaContext.Provider>
          </GardenHost>
        </div>
      </div>

      <div className={fs ? "group fixed inset-x-0 bottom-0 z-50 px-4 pb-3 opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100" : "px-3 pb-3 sm:px-5"}>
        <div className={fs ? "rounded-xl bg-white/95 p-2 shadow-lg" : ""}>
          <SlideNavigation slides={slides} index={index} onGo={go} fullscreen={fs} onToggleFullscreen={() => void fullscreen.toggle()} notesOpen={notesOpen} onToggleNotes={() => setNotesOpen((o) => !o)} pdfHref={pdfHref} switchTo={switchTo} />
        </div>
      </div>

      {notesOpen && !fs && (
        <aside className="mx-3 mb-3 max-h-[120px] overflow-y-auto rounded-lg bg-white p-3 text-sm leading-relaxed text-pw-ink ring-1 ring-pw-200 sm:mx-5" aria-label="Sprechernotizen" data-testid="speaker-notes">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-pw-700">Sprechernotizen · {slide.source.type === "pptx" ? `PPTX-Folie ${slide.source.slide}` : "neue Folie"}</p>
          <p className="whitespace-pre-line">{slide.notes ?? "—"}</p>
        </aside>
      )}
    </div>
  );
}
