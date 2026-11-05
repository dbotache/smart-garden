import { describe, expect, it } from "vitest";
import { chatCostPerMessage, compatCosts, costPerRegistration, hardwareCosts, paymentPerPaying, phase1, phaseCosts, savingsLevers } from "../utils/operatingCosts";
import { phase1BreakEvenUsers } from "../components/Phase1Costs";
import { savingsSummary } from "../components/SavingsLevers";
import { hardwareSummary } from "../components/HardwareCosts";

const r0 = (v: number) => Math.round(v);

describe("phase 1 (digital only, Basic tariff)", () => {
  it("matches the table in docs/operating-costs.md", () => {
    const cases: [number, number, number, number, number][] = [
      [2000, 0.05, 419, 538, -118],
      [10000, 0.05, 2097, 987, 1110],
      [10000, 0.1, 4193, 1285, 2908],
      [50000, 0.1, 20966, 4868, 16098],
    ];
    for (const [users, share, revenue, total, result] of cases) {
      const r = phase1({ users, paidShare: share });
      expect([r0(r.revenue), r0(r.total), r0(r.resultBeforeStaff)]).toEqual([revenue, total, result]);
    }
  });

  it("finds where running costs are covered (before staff)", () => {
    expect(phase1BreakEvenUsers(0.05)).toBe(2800);
    expect(phase1BreakEvenUsers(0.1)).toBe(1300);
  });

  it("uses the researched unit prices", () => {
    expect(chatCostPerMessage("haiku")).toBeCloseTo(0.00036, 6);
    expect(chatCostPerMessage("sonnet") / chatCostPerMessage("haiku")).toBeCloseTo(20, 6);
    const pay = paymentPerPaying(0.5);
    expect(pay.store).toBeCloseTo(0.629, 3); // 15 % of 4,19 €
    expect(pay.web).toBeCloseTo(0.096, 3); // (1,5 % × 59,88 € + 0,25 €) / 12
    const r = phase1({ users: 10000, paidShare: 0.05 });
    expect(r.variablePerFree).toBeCloseTo(0.026, 3);
    expect(r.variablePerPaying).toBeCloseTo(0.62, 2);
    expect(r.plan).toMatchObject({ perFree: 0.1, perPaying: 0.8 });
    expect(r.lines.reduce((s, l) => s + l.eur, 0)).toBeCloseTo(r.total, 9);
  });

  it("scales servers with users", () => {
    const small = phase1({ users: 2000, paidShare: 0.05 }).lines;
    const big = phase1({ users: 50000, paidShare: 0.05 }).lines;
    expect(small.find((l) => l.id === "app")!.eur).toBeCloseTo(19.49, 2);
    expect(big.find((l) => l.id === "app")!.eur).toBeCloseTo(5 * 19.49, 2);
    expect(big.find((l) => l.id === "db")!.eur).toBeCloseTo(2 * 42.99, 2);
  });
});

describe("hardware variants", () => {
  it("computes pilot, certification, kit and LTE feasibility", () => {
    const { h, oneOffLow, oneOffHigh, planKit } = hardwareSummary();
    expect(h.pilot.map((p) => p.eur)).toEqual([276, 1776.8, 0]);
    expect(oneOffLow).toBeCloseTo(3463.3, 2);
    expect(oneOffHigh).toBeCloseTo(4763.3, 2);
    expect(h.kit.db).toBeCloseTo(25.21, 2);
    expect(planKit.db).toBeCloseTo(30.21, 2);
    expect(h.lte).toMatchObject({ sensorFits: true, photoFits: false });
    expect(hardwareCosts().perDeviceMonth.sim).toBeCloseTo(13 / 120, 6);
  });
});

describe("savings levers", () => {
  it("ranks the technical levers and derives the staff share of the plan's fixed costs", () => {
    const s = savingsSummary();
    const byId = Object.fromEntries(savingsLevers().levers.map((l) => [l.id, r0(l.eur)]));
    expect(byId).toEqual({ web: 107, photo: 238, tax: 108, staging: 19, model: 298 });
    expect(r0(s.techSaving)).toBe(472);
    expect(r0(s.fixedNonStaff)).toBe(427);
    expect(r0(s.staffInPlan)).toBe(5573);
    expect(s.funding.perMonth).toBe(5000);
  });
});

describe("compatibility stage (third-party sensors, no own hardware)", () => {
  it("avoids the own-hardware one-off costs, forgoes the kit contribution and earns via Expert", () => {
    const c = compatCosts();
    expect(c.avoided.low).toBeCloseTo(3463.3, 2);
    expect(c.avoided.high).toBeCloseTo(4763.3, 2);
    expect(c.testDevicesKnownGross).toBeCloseTo(19.99 + 17.99 + 48.42 + 55.79, 2);
    expect(c.kitDbForgone).toBeCloseTo(25.21, 2);
    expect(c.expert.db).toBeCloseTo(9.8, 2);
    expect(Object.fromEntries(c.systems.map((s) => [s.id, s.status]))).toEqual({ ha: "ready", ecowitt: "check", gardena: "check", netatmo: "ready", tuya: "later" });
    for (const s of c.systems) expect(s.sources.length).toBeGreaterThan(0);
  });
});

describe("costs per phase incl. advertising (slide 20)", () => {
  it("derives the cost per registration from the ad funnel", () => {
    expect(costPerRegistration({ cpm: 10, ctr: 0.02 })).toBeCloseTo(2.5, 6); // business plan section 7.2
    expect(costPerRegistration({ cpm: 10, ctr: 0.015 })).toBeCloseTo(3.33, 2);
    expect(costPerRegistration({ cpm: 15, ctr: 0.01 })).toBeCloseTo(7.5, 6);
  });

  it("sums one-off and advertising costs per phase, without staff", () => {
    const r = phaseCosts();
    const byId = Object.fromEntries(r.phases.map((p) => [p.id, p]));
    expect(byId.phase1!.marketing).toMatchObject({ low: 7000, high: 21000 });
    expect(r0(byId.phase1!.marketing.base!)).toBe(9333);
    expect(byId.phase1!.running).toBe("538–987 €/Monat");
    expect(byId.compat!.oneOff.low).toBeCloseTo(142.19, 2);
    expect(byId.pilot!.oneOff.low).toBeCloseTo(2052.8, 2);
    expect(byId.pilot!.marketing).toMatchObject({ low: 32, high: 35 });
    expect(byId.kit!.oneOff).toMatchObject({ low: 1410.5, high: 2710.5 });
    expect(byId.kit!.marketing).toMatchObject({ low: 500, high: 2500 });
    expect(r0(r.total.low)).toBe(11637);
    expect(r0(r.total.high)).toBe(28940);
    expect(r0(r.cacPerPaying.base)).toBe(67);
  });
});
