"use client";

import type { ReactNode } from "react";
import type { DataSource } from "../types";

/** Small presentational primitives shared by all garden panels. */

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#56635C]">{children}</p>;
}

export function PanelTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mt-1">
      <h3 className="font-serif text-[19px] leading-tight text-[#1B4332]">{children}</h3>
      {sub && <p className="mt-0.5 text-[12px] italic text-[#56635C]">{sub}</p>}
    </div>
  );
}

export function Row({ label, value, hint }: { label: ReactNode; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-[#e6ebe5] py-1.5 text-[12.5px] first:border-t-0">
      <span className="text-[#56635C]">
        {label}
        {hint && <span className="ml-1 text-[10.5px] text-[#7b877f]">{hint}</span>}
      </span>
      <span className="text-right font-semibold text-[#1F2D26]">{value}</span>
    </div>
  );
}

export function Badge({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "amber" | "blue" | "red" | "gray" }) {
  const tones = {
    green: "bg-[#EEF8F1] text-[#1B4332] ring-[#B7E4C7]",
    amber: "bg-[#fdf3e3] text-[#7a4407] ring-[#f1d3a6]",
    blue: "bg-[#eaf3fa] text-[#1d4f74] ring-[#bcd8ec]",
    red: "bg-[#fbece7] text-[#8a2f17] ring-[#efc2b4]",
    gray: "bg-[#f1f2ef] text-[#45504a] ring-[#dfe3dd]",
  } as const;
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1 ${tones[tone]}`}>{children}</span>;
}

export function SourceBadge({ source, labels }: { source: DataSource; labels: { measured: string; estimated: string } }) {
  return source === "measured" ? (
    <Badge tone="green">
      <svg width="14" height="6" aria-hidden><line x1="0" y1="3" x2="14" y2="3" stroke="#287a52" strokeWidth="2" /></svg>
      {labels.measured}
    </Badge>
  ) : (
    <Badge tone="amber">
      <svg width="14" height="6" aria-hidden><line x1="0" y1="3" x2="14" y2="3" stroke="#b5630b" strokeWidth="2" strokeDasharray="3 2" /></svg>
      {labels.estimated}
    </Badge>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <p className="text-[12.5px] leading-relaxed text-[#3d4a43]">{children}</p>;
}

export function ListButton({ onClick, children, active, testId }: { onClick: () => void; children: ReactNode; active?: boolean; testId?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      aria-pressed={active}
      className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12.5px] transition-colors hover:bg-[#EEF8F1] focus-visible:outline-2 focus-visible:outline-[#2D6A4F] ${active ? "bg-[#EEF8F1] ring-1 ring-[#B7E4C7]" : ""}`}
    >
      {children}
    </button>
  );
}
