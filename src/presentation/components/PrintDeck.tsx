"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { StaticMotionContext } from "@/business";
import type { SlideDefinition } from "../config/types";
import { SlideMetaContext } from "./SlideMeta";
import { GardenHost } from "./GardenHost";

/** Page size of the export: 16:9, 1 slide point = 4/3 px (960 × 540 pt). Must match `@page` in globals.css. */
export const PRINT_PAGE = { width: 1280, height: 720 } as const;
const GARDEN_TIMEOUT_MS = 20_000;
export const PDF_FILE_NAME = "PlantWiz-Praesentation.pdf";

declare global {
  interface Window {
    /** last generated PDF (test bridge: lets E2E tests read the bytes without a download dialog) */
    __plantwizPdf?: Blob;
  }
}

function PrintPage({ slide, number, total }: { slide: SlideDefinition; number: number; total: number }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const Slide = slide.Component;
  return (
    <section
      ref={frameRef}
      className="deck-frame print-page relative shrink-0 overflow-hidden bg-white shadow-[0_6px_24px_rgba(27,67,50,0.16)]"
      style={{ width: PRINT_PAGE.width, height: PRINT_PAGE.height }}
      aria-label={`Folie ${number} von ${total}: ${slide.title}`}
      data-testid={`print-${slide.id}`}
    >
      <GardenHost frameRef={frameRef} printable>
        <SlideMetaContext.Provider value={{ number, total, printable: true }}>
          <div className="absolute inset-0">
            <Slide />
          </div>
        </SlideMetaContext.Provider>
      </GardenHost>
    </section>
  );
}

/**
 * Wait until the export looks like the deck: fonts loaded, every image decoded (next/image is lazy by default,
 * so force eager), every 3D garden settled. Then copy each WebGL canvas into an <img> that only shows in print,
 * so the PDF never gets an empty canvas.
 */
async function prepare(root: HTMLElement, isCancelled: () => boolean) {
  await document.fonts.ready;
  const images = [...root.querySelectorAll("img")].filter((img) => !img.classList.contains("print-snapshot"));
  for (const img of images) img.loading = "eager";
  await Promise.all(images.map((img) => img.decode().catch(() => undefined)));

  const gardens = root.querySelectorAll("[data-garden-slot]").length;
  const start = performance.now();
  while (!isCancelled()) {
    const roots = [...root.querySelectorAll<HTMLElement>("[data-garden-root]")];
    const done = roots.filter((r) => r.dataset.settled === "true" || r.querySelector("[data-testid='garden-fallback']")).length;
    if (roots.length >= gardens && done >= gardens) break;
    if (performance.now() - start > GARDEN_TIMEOUT_MS) break;
    await new Promise((r) => setTimeout(r, 150));
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  for (const canvas of root.querySelectorAll("canvas")) {
    const parent = canvas.parentElement;
    if (!parent) continue;
    parent.querySelector(":scope > .print-snapshot")?.remove();
    try {
      const img = document.createElement("img");
      img.className = "print-snapshot";
      img.alt = canvas.getAttribute("aria-label") ?? "";
      img.src = canvas.toDataURL("image/png");
      parent.appendChild(img);
      await img.decode().catch(() => undefined);
    } catch {
      // tainted / lost context: the live canvas is printed as is
    }
  }
}

/**
 * Build the PDF in the browser: every page is rendered to a 2560 × 1440 JPEG (modern-screenshot) and placed on a
 * 960 × 540 pt page (jsPDF). Independent of the browser's print dialog, so Firefox, Safari and Chrome produce
 * the same file. Libraries are loaded only when exporting.
 */
const BASE_RESET = `*,::before,::after{box-sizing:border-box;margin:0;padding:0;border:0 solid}
h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}
ol,ul,menu{list-style:none}
img,svg,video,canvas{display:block;vertical-align:middle}
img,video{max-width:100%;height:auto}
a{color:inherit;text-decoration:inherit}
button,input,select{font:inherit;color:inherit;background-color:transparent;border-radius:0}`;

async function buildPdf(root: HTMLElement, onPage: (done: number, total: number) => void) {
  const [{ domToJpeg }, { jsPDF }] = await Promise.all([import("modern-screenshot"), import("jspdf")]);
  const pages = [...root.querySelectorAll<HTMLElement>(".print-page")];
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: [960, 540], compress: true });
  // modern-screenshot writes only styles that differ from browser defaults; the page's base reset (Tailwind
  // preflight: no margins, border-box …) must therefore be present in the image as well.
  const cssText = `${BASE_RESET}\n${await embedFonts()}`;
  const options = {
    width: PRINT_PAGE.width,
    height: PRINT_PAGE.height,
    scale: 2,
    quality: 0.92,
    backgroundColor: "#ffffff",
    font: { cssText },
    style: { boxShadow: "none" },
    // the live canvas is copied directly; its print-only snapshot would be a duplicate
    filter: (node: Node) => !(node instanceof HTMLImageElement && node.classList.contains("print-snapshot")),
  };
  for (const [i, page] of pages.entries()) {
    const jpeg = await domToJpeg(page, options);
    if (i > 0) doc.addPage([960, 540], "landscape");
    doc.addImage(jpeg, "JPEG", 0, 0, 960, 540, undefined, "FAST");
    onPage(i + 1, pages.length);
  }
  doc.setProperties({ title: "PlantWiz – Präsentation", creator: "PlantWiz" });
  return doc.output("blob");
}

const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

/**
 * The page's @font-face rules with every font file inlined as a data URL. Passed explicitly so the export uses exactly the
 * fonts on screen, including the next/font subsets.
 */
async function embedFonts() {
  const rules: { css: string; base: string }[] = [];
  for (const sheet of document.styleSheets) {
    let list: CSSRuleList;
    try {
      list = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet
    }
    for (const rule of list) if (rule instanceof CSSFontFaceRule) rules.push({ css: rule.cssText, base: sheet.href ?? location.href });
  }
  const cache = new Map<string, Promise<string>>();
  const inline = (url: string) => {
    if (!cache.has(url)) cache.set(url, fetch(url).then((r) => (r.ok ? r.blob() : Promise.reject(new Error(`${r.status} ${url}`)))).then(toDataUrl));
    return cache.get(url)!;
  };
  const out = await Promise.all(
    rules.map(async ({ css, base }) => {
      let result = css;
      for (const m of css.matchAll(/url\((["']?)([^"')]+)\1\)/g)) {
        if (m[2]!.startsWith("data:")) continue;
        result = result.replace(m[0], `url("${await inline(new URL(m[2]!, base).href)}")`);
      }
      return result;
    }),
  );
  return out.join("\n");
}

function download(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = PDF_FILE_NAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

type ExportState = { kind: "idle" } | { kind: "running"; done: number; total: number } | { kind: "done" } | { kind: "error"; message: string };

/**
 * All slides one below the other at a fixed 1280 × 720 px. "PDF herunterladen" builds the file in the browser;
 * "Drucken …" uses the print dialog (vector text, but page size depends on the browser).
 * Interactive slides are printed in their opening state; animations render their final values.
 */
export function PrintDeck({ slides }: { slides: SlideDefinition[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<ExportState>({ kind: "idle" });

  const exportPdf = useCallback(async () => {
    if (!rootRef.current) return;
    setState({ kind: "running", done: 0, total: slides.length });
    try {
      const blob = await buildPdf(rootRef.current, (done, total) => setState({ kind: "running", done, total }));
      window.__plantwizPdf = blob;
      download(blob);
      setState({ kind: "done" });
    } catch (e) {
      console.error("[pdf] export failed", e);
      setState({ kind: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }, [slides.length]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    void prepare(rootRef.current!, () => cancelled).then(() => {
      if (cancelled) return;
      setReady(true);
      if (params.has("download")) void exportPdf();
      else if (params.has("auto")) setTimeout(() => window.print(), 50);
    });
    return () => {
      cancelled = true;
    };
  }, [exportPdf]);

  useEffect(() => {
    document.title = "PlantWiz – Präsentation";
  }, []);

  const running = state.kind === "running";
  const status = !ready
    ? "Folien und 3D-Ansichten werden vorbereitet …"
    : state.kind === "running"
      ? `PDF wird erstellt … Folie ${state.done} von ${state.total}`
      : state.kind === "done"
        ? `Fertig: ${PDF_FILE_NAME} wurde heruntergeladen.`
        : state.kind === "error"
          ? `Export fehlgeschlagen (${state.message}). Alternative: „Drucken …“ und „Als PDF speichern“.`
          : "Bereit.";

  return (
    <div className="print-deck min-h-dvh bg-[#e9ece7]" data-testid="print-deck" data-ready={ready} data-export={state.kind}>
      <header className="print-toolbar sticky top-0 z-50 flex flex-wrap items-center gap-3 border-b border-pw-200 bg-white/95 px-4 py-3 text-sm text-pw-ink backdrop-blur">
        <Link href="/presentation" className="rounded-lg px-3 py-2 font-semibold text-pw-900 ring-1 ring-pw-200 hover:bg-pw-50">
          ← Zur Präsentation
        </Link>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-pw-900">PDF-Export · {slides.length} Folien · 16:9</p>
          <p className={state.kind === "error" ? "text-[#b3261e]" : "text-pw-muted"} aria-live="polite" data-testid="print-status">
            {status}
          </p>
        </div>
        <button type="button" onClick={() => window.print()} disabled={!ready || running} className="rounded-lg px-3 py-2 font-semibold text-pw-900 ring-1 ring-pw-200 hover:bg-pw-50 disabled:opacity-50" title="Druckdialog des Browsers (Text bleibt durchsuchbar; Seitengröße hängt vom Browser ab)" data-testid="print-dialog">
          Drucken …
        </button>
        <button type="button" onClick={() => void exportPdf()} disabled={!ready || running} className="rounded-lg bg-pw-700 px-4 py-2 font-bold text-white hover:bg-pw-900 disabled:opacity-50" data-testid="print-save">
          {running ? "Erstelle PDF …" : "PDF herunterladen"}
        </button>
      </header>
      <StaticMotionContext.Provider value={true}>
        <div ref={rootRef} className="flex flex-col items-center gap-6 overflow-x-auto p-6">
          {slides.map((slide, i) => (
            <PrintPage key={slide.id} slide={slide} number={i + 1} total={slides.length} />
          ))}
        </div>
      </StaticMotionContext.Provider>
    </div>
  );
}
