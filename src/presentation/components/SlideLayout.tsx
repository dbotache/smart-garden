"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useSlideMeta } from "./SlideMeta";
import { pt } from "./SlidePrimitives";

type Props = {
  eyebrow?: string;
  title?: ReactNode;
  children: ReactNode;
  variant?: "light" | "dark" | "bare";
  /** content region; defaults to the PPTX body area (43 pt margins, starts at 144 pt) */
  bodyClassName?: string;
  /** body region top / height in pt (PPTX body: 144 / 340) */
  bodyTop?: number;
  bodyHeight?: number;
};

/**
 * Master layout of the original deck: eyebrow (13 pt, caps, accent) at 30 pt, serif title (32 pt) at 55 pt,
 * body from 144 pt, footer with the PlantWiz mark and the page number.
 */
export function SlideLayout({ eyebrow, title, children, variant = "light", bodyClassName = "", bodyTop = 144, bodyHeight = 340 }: Props) {
  const { number } = useSlideMeta();
  const dark = variant === "dark";
  return (
    <div className={`relative h-full w-full overflow-hidden ${dark ? "bg-pw-900 text-white" : "bg-white text-pw-ink"}`}>
      {variant !== "bare" && (
        <>
          {eyebrow && (
            <p className={`absolute u-fs-13 font-bold uppercase tracking-[0.12em] ${dark ? "text-pw-200" : "text-pw-700"}`} style={{ left: pt(43), top: pt(30), width: pt(873) }}>
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className={`absolute font-serif u-fs-32 font-bold leading-[1.12] ${dark ? "text-white" : "text-pw-900"}`} style={{ left: pt(43), top: pt(55), width: pt(873) }}>
              {title}
            </h2>
          )}
          <div className={`absolute ${bodyClassName}`} style={{ left: pt(43), top: pt(bodyTop), width: pt(873), height: pt(bodyHeight) }}>
            {children}
          </div>
          <footer className="absolute flex items-center u-gap-5" style={{ left: pt(43), top: pt(500), height: pt(16) }}>
            <Image src="/assets/images/plantwiz-logo.png" alt="" width={32} height={32} style={{ width: pt(13), height: pt(13) }} className="rounded-[3px]" />
            <span className={`u-fs-8 font-bold ${dark ? "text-white" : "text-pw-900"}`}>PlantWiz</span>
          </footer>
          <span className={`absolute text-right u-fs-9 ${dark ? "text-white" : "text-pw-900"}`} style={{ left: pt(873), top: pt(502), width: pt(43) }} data-testid="page-number">
            {number}
          </span>
        </>
      )}
      {variant === "bare" && children}
    </div>
  );
}
