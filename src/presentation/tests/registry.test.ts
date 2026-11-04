import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { SLIDES } from "../slides";
import { GARDEN_STAGES } from "@/prototype";

describe("slide registry", () => {
  it("has unique ids", () => {
    expect(new Set(SLIDES.map((s) => s.id)).size).toBe(SLIDES.length);
  });

  it("keeps every one of the 9 PPTX slides exactly once and in the original order", () => {
    const pptx = SLIDES.flatMap((s) => (s.source.type === "pptx" ? [s.source.slide] : []));
    expect(pptx).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
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
    expect(garden.map((g) => g.i)).toEqual([6, 7, 8, 9]);
    expect(SLIDES[5]!.source).toEqual({ type: "pptx", slide: 6 }); // demo follows the "three layers" slide
  });

  it("places the architecture slide right after the last garden demo", () => {
    const i = SLIDES.findIndex((s) => s.id === "architecture");
    expect(SLIDES[i - 1]!.id).toBe("demo-irrigation");
    expect(SLIDES[i + 1]!.source).toEqual({ type: "pptx", slide: 7 });
  });

  it("has one SlideNN.tsx file per registered slide", () => {
    const dir = path.resolve(__dirname, "../slides");
    const files = fs.readdirSync(dir).filter((f) => /^Slide\d{2}\.tsx$/.test(f));
    expect(files).toHaveLength(SLIDES.length);
  });
});
