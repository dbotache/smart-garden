"use client";

import type { Messages } from "../data/i18n";

export function CameraTools({ onZoomIn, onZoomOut, onReset, messages }: { onZoomIn: () => void; onZoomOut: () => void; onReset: () => void; messages: Messages }) {
  const btn = "grid h-9 w-9 place-items-center rounded-lg bg-white/92 text-[#1B4332] ring-1 ring-[#dfe6dd] shadow-sm hover:bg-[#EEF8F1] focus-visible:outline-2 focus-visible:outline-[#2D6A4F]";
  return (
    <div className="pointer-events-auto flex gap-1">
      <button type="button" className={btn} onClick={onZoomOut} aria-label={messages.zoomOut} title={messages.zoomOut}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </button>
      <button type="button" className={btn} onClick={onZoomIn} aria-label={messages.zoomIn} title={messages.zoomIn}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
      </button>
      <button type="button" className={btn} onClick={onReset} aria-label={messages.resetView} title={messages.resetView}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><circle cx="8" cy="8" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M8 1v3M8 12v3M1 8h3M12 8h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      </button>
    </div>
  );
}
