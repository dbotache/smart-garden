import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { BACKUP_SLIDES, SLIDES } from "../slides";

describe("slide registry", () => {
  it("has unique ids", () => {
    expect(new Set(SLIDES.map((s) => s.id)).size).toBe(SLIDES.length);
  });

  it("keeps every PPTX slide at most once; PPTX 6 (technical layers) and 8 (next steps) were removed on purpose", () => {
    const pptx = SLIDES.flatMap((s) => (s.source.type === "pptx" ? [s.source.slide] : []));
    expect(pptx.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 7, 9]);
  });

  it("carries speaker notes for every PPTX slide and marks notes of new slides", () => {
    for (const s of SLIDES) {
      expect(s.notes?.length, s.id).toBeGreaterThan(20);
      if (s.source.type === "new") expect(s.notes).toMatch(/^\[Neu\]/);
    }
  });

  it("keeps the presenter's order", () => {
    expect(SLIDES.map((s) => s.id)).toEqual(["title", "team", "problem", "market", "product-videos", "vision", "business", "roadmap", "call"]);
    expect(BACKUP_SLIDES.map((s) => s.id)).toEqual(["phase1-costs", "prototypes", "compat-costs"]);
    expect(new Set([...SLIDES, ...BACKUP_SLIDES].map((s) => s.id)).size).toBe(SLIDES.length + BACKUP_SLIDES.length);
  });

  it("has no live-demo slides (the 3D garden runs at /prototype)", () => {
    expect(SLIDES.some((s) => s.garden)).toBe(false);
  });

  it("has one SlideNN.tsx / BackupNN.tsx file per registered slide", () => {
    const dir = path.resolve(__dirname, "../slides");
    expect(fs.readdirSync(dir).filter((f) => /^Slide\d{2}\.tsx$/.test(f))).toHaveLength(SLIDES.length);
    expect(fs.readdirSync(dir).filter((f) => /^Backup\d{2}\.tsx$/.test(f))).toHaveLength(BACKUP_SLIDES.length);
  });
});
