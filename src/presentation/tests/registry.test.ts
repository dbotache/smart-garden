import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { SLIDES } from "../slides";
import { GARDEN_STAGES } from "@/prototype";

describe("slide registry", () => {
  it("has unique ids", () => {
    expect(new Set(SLIDES.map((s) => s.id)).size).toBe(SLIDES.length);
  });

  it("keeps every PPTX slide at most once; PPTX 6 (technical layers) was removed on purpose", () => {
    const pptx = SLIDES.flatMap((s) => (s.source.type === "pptx" ? [s.source.slide] : []));
    expect(pptx.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 7, 8, 9]);
  });

  it("carries speaker notes for every PPTX slide and marks notes of new slides", () => {
    for (const s of SLIDES) {
      expect(s.notes?.length, s.id).toBeGreaterThan(20);
      if (s.source.type === "new") expect(s.notes).toMatch(/^\[Neu\]/);
    }
  });

  it("walks through all four garden stages in order on consecutive slides", () => {
    const garden = SLIDES.map((s, i) => ({ i, stage: s.garden?.stage })).filter((x) => x.stage);
    expect(garden.map((g) => g.stage)).toEqual([...GARDEN_STAGES]);
    expect(garden.map((g) => g.i)).toEqual([7, 8, 9, 10]);
  });

  it("puts the videos after team and vision, and the tiers right after the live demo", () => {
    const ids = SLIDES.map((s) => s.id);
    expect(ids.slice(0, 7)).toEqual(["title", "team", "pitch-video", "problem", "vision", "product-videos", "market"]);
    expect(ids.slice(ids.indexOf("demo-irrigation"))).toEqual(["demo-irrigation", "business", "architecture", "prototypes", "finance-summary", "phase1-costs", "compat-costs", "hardware-costs", "savings", "finance", "next-steps", "call"]);
  });

  it("has one SlideNN.tsx file per registered slide", () => {
    const dir = path.resolve(__dirname, "../slides");
    const files = fs.readdirSync(dir).filter((f) => /^Slide\d{2}\.tsx$/.test(f));
    expect(files).toHaveLength(SLIDES.length);
  });
});
