"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";
import { ARCH_GROUP_LABEL, ARCH_LEVELS, ARCH_NODES, ARCH_TEXT, MAP, type ArchGroup, type ArchLevel } from "../data/architecture";
import { connections, defaultNodeFor, isNodeActive, nodeById, routeEdges } from "../utils/layout";

/** Deck palette (src/app/globals.css): four groups that differ clearly in lightness as well as hue. */
export const GROUP_COLOR: Record<ArchGroup, string> = { input: "#52b788", core: "#1b4332", cloud: "#56635c", output: "#f2a93b" };
export const LEVEL_COLOR: Record<ArchLevel, string> = { 1: "#2d6a4f", 2: "#52b788", 3: "#c98516" };

export type ArchitectureDiagramProps = {
  /** uncontrolled start level (default 3: the full system) */
  initialLevel?: ArchLevel;
  /** controlled level */
  level?: ArchLevel;
  onLevelChange?: (level: ArchLevel) => void;
  /** show the title block (the slide uses its own title instead) */
  showHeader?: boolean;
  /** "slide": fixed 873 × 388 pt proportions; "responsive": stacks below 720 px and scrolls the map horizontally */
  fit?: "slide" | "responsive";
  className?: string;
};

const ROUTES = routeEdges();
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/**
 * GardenTwin system architecture (migrated from original_prototype/gardentwin). Three build-out levels,
 * 14 modules, 17 data flows. Clicking a module shows its description and its connections.
 */
export function ArchitectureDiagram({ initialLevel = 3, level: controlled, onLevelChange, showHeader = false, fit = "responsive", className = "" }: ArchitectureDiagramProps) {
  const [internal, setInternal] = useState<ArchLevel>(initialLevel);
  const level = controlled ?? internal;
  const [selected, setSelected] = useState<string>(() => defaultNodeFor(controlled ?? initialLevel));
  const [animated, setAnimated] = useState(true);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  // a selection that is not part of the current level falls back to the level's default module
  const selectedNode = isNodeActive(nodeById(selected), level) ? nodeById(selected) : nodeById(defaultNodeFor(level));
  const links = useMemo(() => connections(selectedNode.id, level), [selectedNode.id, level]);

  const changeLevel = (l: ArchLevel) => {
    if (controlled === undefined) setInternal(l);
    onLevelChange?.(l);
    setSelected(defaultNodeFor(l));
  };

  return (
    <div className={`arch ${className}`} data-testid="architecture" data-level={level} data-fit={fit}>
      <div className="arch-body">
        {showHeader && (
          <header className="arch-header">
            <h2 className="font-serif">{ARCH_TEXT.title}</h2>
            <p>{ARCH_TEXT.subtitle}</p>
          </header>
        )}

        <div className="arch-scroll">
          <div className="arch-map" data-testid="architecture-map">
            {ARCH_LEVELS.slice(1).map((l) => (
              <div key={l.level} className="arch-band-line" style={{ top: pct(l.bandY - 8, MAP.height) }} aria-hidden />
            ))}
            {ARCH_LEVELS.map((l) => (
              <div key={l.level} className={`arch-band ${l.level <= level ? "" : "is-off"}`} style={{ top: pct(l.bandY, MAP.height) }} aria-hidden>
                {l.band}
              </div>
            ))}

            <svg className="arch-svg" viewBox={`0 0 ${MAP.width} ${MAP.height}`} aria-hidden>
              <defs>
                {([1, 2, 3] as const).map((l) => (
                  <marker key={l} id={`${uid}-arrow-${l}`} markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto" markerUnits="userSpaceOnUse">
                    <path d="M0.5 0.8 L6.8 4 L0.5 7.2" fill="none" stroke={LEVEL_COLOR[l]} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </marker>
                ))}
              </defs>
              {ROUTES.filter((e) => e.level <= level).map((e) => {
                const focus = e.from === selectedNode.id || e.to === selectedNode.id;
                return (
                  <path
                    key={e.key}
                    d={e.d}
                    data-edge={e.key}
                    stroke={LEVEL_COLOR[e.level]}
                    strokeWidth={focus ? 2.6 : 1.8}
                    opacity={focus ? 1 : 0.55}
                    fill="none"
                    markerEnd={`url(#${uid}-arrow-${e.level})`}
                    className={animated ? "arch-flow" : ""}
                  />
                );
              })}
            </svg>

            {ARCH_NODES.map((n) => {
              const active = isNodeActive(n, level);
              return (
                <button
                  key={n.id}
                  type="button"
                  className="arch-node"
                  data-node={n.id}
                  style={{ left: pct(n.x, MAP.width), top: pct(n.y, MAP.height), width: pct(MAP.nodeWidth, MAP.width), height: pct(MAP.nodeHeight, MAP.height), "--c": GROUP_COLOR[n.group] } as CSSProperties}
                  disabled={!active}
                  aria-pressed={selectedNode.id === n.id}
                  aria-label={`${n.name} – ${n.sub}${active ? "" : ` (ab Level ${n.level})`}`}
                  onClick={() => setSelected(n.id)}
                >
                  <b>{n.name}</b>
                  <small>{n.sub}</small>
                </button>
              );
            })}

            <ul className="arch-legend" aria-label="Legende">
              {(Object.keys(ARCH_GROUP_LABEL) as ArchGroup[]).map((g) => (
                <li key={g}>
                  <i style={{ background: GROUP_COLOR[g] }} />
                  {ARCH_GROUP_LABEL[g]}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="arch-panel">
          <div className="arch-levels" role="group" aria-label="Ausbaustufe">
            {ARCH_LEVELS.map((l) => (
              <button key={l.level} type="button" className="arch-btn" aria-pressed={level === l.level} data-testid={`arch-level-${l.level}`} onClick={() => changeLevel(l.level)}>
                <span className="arch-swatch" style={{ background: LEVEL_COLOR[l.level] }} aria-hidden />
                {l.button}
              </button>
            ))}
          </div>

          <section className="arch-detail" aria-live="polite" data-testid="arch-detail" data-node={selectedNode.id}>
            <p className="arch-chip">
              <i style={{ background: GROUP_COLOR[selectedNode.group] }} />
              {ARCH_GROUP_LABEL[selectedNode.group]} · Level {selectedNode.level}
            </p>
            <h3 className="font-serif">{selectedNode.name}</h3>
            <p className="arch-text">{selectedNode.detail}</p>
            <dl className="arch-links">
              <dt>{ARCH_TEXT.incoming}</dt>
              <dd>{links.incoming.map((n) => n.name).join(", ") || ARCH_TEXT.none}</dd>
              <dt>{ARCH_TEXT.outgoing}</dt>
              <dd>{links.outgoing.map((n) => n.name).join(", ") || ARCH_TEXT.none}</dd>
            </dl>
          </section>

          <div className="arch-foot">
            <button type="button" className="arch-btn arch-btn-quiet" aria-pressed={animated} data-testid="arch-animation" onClick={() => setAnimated((v) => !v)}>
              {animated ? ARCH_TEXT.pause : ARCH_TEXT.play}
            </button>
            <p>{ARCH_TEXT.footnote(level)}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
