import { describe, expect, it } from "vitest";
import { PROTOTYPES } from "../data/prototypes";
import { byCategory, fleetBudget, materialSum, planBudget, prototypeById, reserve } from "../utils/prototypeCosts";

describe("prototype costs", () => {
  it("reproduces the document's totals for prototypes 1 and 2", () => {
    const p1 = prototypeById("p1");
    const p2 = prototypeById("p2");
    expect([materialSum(p1), reserve(p1), planBudget(p1)]).toEqual([48, 7.2, 55.2]);
    expect([materialSum(p2), reserve(p2), planBudget(p2)]).toEqual([154.5, 23.18, 177.68]);
  });

  it("corrects prototype 3: the 18 parts add up to 398 €, not the stated 438 €", () => {
    const p3 = prototypeById("p3");
    expect(p3.bom).toHaveLength(18);
    expect(p3.statedMaterial).toBe(438);
    expect(materialSum(p3)).toBe(398);
    expect(reserve(p3)).toBe(59.7);
    expect(planBudget(p3)).toBe(457.7);
  });

  it("keeps every plan budget inside the document's rough range", () => {
    for (const p of PROTOTYPES) {
      expect(planBudget(p), p.id).toBeGreaterThanOrEqual(p.range[0]);
      expect(planBudget(p), p.id).toBeLessThanOrEqual(p.range[1]);
    }
  });

  it("scales linearly to pilot fleets like the document (section 5)", () => {
    expect([1, 5, 10, 25].map((n) => fleetBudget(prototypeById("p1"), n))).toEqual([55.2, 276, 552, 1380]);
    expect([1, 5, 10, 25].map((n) => fleetBudget(prototypeById("p2"), n))).toEqual([177.68, 888.4, 1776.8, 4442]);
    expect([1, 5, 10, 25].map((n) => fleetBudget(prototypeById("p3"), n))).toEqual([457.7, 2288.5, 4577, 11442.5]);
  });

  it("splits every parts list into categories that add up to the material sum", () => {
    for (const p of PROTOTYPES) {
      const cats = byCategory(p);
      expect(cats.reduce((s, c) => s + c.sum, 0)).toBeCloseTo(materialSum(p), 6);
      expect(cats.reduce((s, c) => s + c.share, 0)).toBeCloseTo(1, 6);
    }
    // energy and LTE make prototype 3 expensive
    const p3 = Object.fromEntries(byCategory(prototypeById("p3")).map((c) => [c.category, c.sum]));
    expect(p3).toMatchObject({ energie: 135, konnektivitaet: 73, bewaesserung: 94 });
  });

  it("matches the component counts of the comparison table", () => {
    const soil = (id: "p1" | "p2" | "p3") => prototypeById(id).bom.find((l) => l.part.startsWith("Kapazitiver"))!.qty;
    expect([soil("p1"), soil("p2"), soil("p3")]).toEqual([2, 3, 4]);
    const valves = (id: "p2" | "p3") => prototypeById(id).bom.filter((l) => /ventil/i.test(l.part)).reduce((s, l) => s + l.qty, 0);
    expect([valves("p2"), valves("p3")]).toEqual([1, 2]);
  });
});
