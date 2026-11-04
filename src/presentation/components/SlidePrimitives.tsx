import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

/**
 * Building blocks transcribed from the PPTX. Sizes use `--pt` (1 PowerPoint point on the 960 × 540 pt slide),
 * so the slide scales with the frame without CSS transforms.
 */

export const pt = (n: number) => `calc(var(--pt) * ${n})`;

/** Absolutely positioned box using PPTX coordinates (x, y, w, h in pt). */
export function At({ x, y, w, h, children, className = "", style }: { x: number; y: number; w?: number; h?: number; children?: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`absolute ${className}`} style={{ left: pt(x), top: pt(y), width: w !== undefined ? pt(w) : undefined, height: h !== undefined ? pt(h) : undefined, ...style }}>
      {children}
    </div>
  );
}

export type IconName =
  | "sprout" | "book" | "puzzle" | "eye-slash" | "ruler" | "cube" | "drop" | "leaf" | "bee" | "wand" | "microscope"
  | "chart" | "wifi" | "faucet" | "exchange" | "house" | "users" | "hammer" | "tractor" | "microchip" | "code" | "server" | "tools" | "handshake";

const BADGE = { green: "bg-pw-700", light: "bg-pw-400", muted: "bg-pw-muted", red: "bg-pw-red" } as const;

/** Round coloured badge with one of the original (white) PPTX icons. */
export function IconBadge({ icon, size, tone = "green", iconScale = 0.53 }: { icon: IconName; size: number; tone?: keyof typeof BADGE; iconScale?: number }) {
  return (
    <span className={`inline-grid shrink-0 place-items-center rounded-full ${BADGE[tone]}`} style={{ width: pt(size), height: pt(size) }}>
      <Image src={`/assets/icons/${icon}.png`} alt="" width={64} height={64} style={{ width: pt(size * iconScale), height: pt(size * iconScale) }} />
    </span>
  );
}

export function Card({ children, className = "", dark = false }: { children: ReactNode; className?: string; dark?: boolean }) {
  return <div className={`${dark ? "bg-pw-900 text-white" : "bg-pw-50"} u-r-10 ${className}`}>{children}</div>;
}

export function Bullets({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`list-disc space-y-[calc(var(--pt)*6)] pl-[calc(var(--pt)*16)] marker:text-current ${className}`}>
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}
