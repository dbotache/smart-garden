import { describe, expect, it } from "vitest";
import { BASE_PARAMS, MIXES, PRESETS, TARIFFS } from "../data/businessModel";
import { breakEven, customerEconomics, kitEconomics, mixEconomics, monthlyModel, net, registrationsFor, rentalEconomics, tariffEconomics } from "../utils/finance";
import { euro, signedEuro } from "../utils/money";

const r2 = (v: number) => Math.round(v * 100) / 100;

describe("tariffs and kit (document values that are correct)", () => {
  it("per-tariff net price, contribution and margin (section 4)", () => {
    const rows = TARIFFS.slice(1).map((t) => tariffEconomics(t));
    expect(rows.map((r) => r2(r.net))).toEqual([4.19, 8.39, 12.6]);
    expect(rows.map((r) => r2(r.db))).toEqual([3.39, 6.59, 9.8]);
    expect(rows.map((r) => Math.round(r.margin! * 1000) / 10)).toEqual([80.9, 78.6, 77.8]); // the document shows 78,5 % for Erweitert, computed from rounded 6,59 / 8,39
  });

  it("starter kit and price sensitivity (sections 3.1, 3.2)", () => {
    expect(r2(kitEconomics(149).net)).toBe(125.21);
    expect(r2(kitEconomics(149).db)).toBe(30.21);
    expect(r2(kitEconomics(149, { warrantyReserve: true }).db)).toBe(25.21);
    expect([129, 149, 179, 199].map((p) => r2(kitEconomics(p).db))).toEqual([13.4, 30.21, 55.42, 72.23]);
    expect([129, 149, 179, 199].map((p) => Math.round(kitEconomics(p).margin * 1000) / 10)).toEqual([12.4, 24.1, 36.8, 43.2]);
  });

  it("hardware rental pays back after ~17 paid months (section 3.3)", () => {
    const r = rentalEconomics();
    expect(r2(r.netFee)).toBe(6.71);
    expect(Math.round(r.paybackMonths * 10) / 10).toBe(16.6);
    expect(Math.ceil(r.paybackMonths)).toBe(17);
    expect(r.cumulative(12)).toBeLessThan(0);
    expect(r.cumulative(24)).toBeGreaterThan(0);
  });

  it("registrations needed for 1.000 paying customers (section 7.1)", () => {
    expect([0.01, 0.02, 0.05, 0.1, 0.15].map((q) => registrationsFor(1000, q))).toEqual([100000, 50000, 20000, 10000, 6667]);
  });

  it("seasonality: Erweitert net revenue for 6 / 9 / 12 paid months (section 9)", () => {
    expect([6, 9, 12].map((m) => r2(m * net(9.99)))).toEqual([50.37, 75.55, 100.74]);
  });
});

describe("tariff mix (document error corrected)", () => {
  it("60/30/10 gives ARPU 6,29 € and contribution 4,99 € — the document states 6,53 € and 5,23 €", () => {
    const m = mixEconomics(MIXES.basis);
    expect(r2(m.arpu)).toBe(6.29);
    expect(r2(m.variableCost)).toBe(1.3);
    expect(r2(m.db)).toBe(4.99);
    // cross-check against the per-tariff contributions the document itself lists (3,39 / 6,59 / 9,80)
    expect(r2(0.6 * 3.39 + 0.3 * 6.59 + 0.1 * 9.8)).toBe(4.99);
  });

  it("rejects a mix that does not sum to 100 %", () => {
    expect(() => mixEconomics([0.5, 0.3, 0.1])).toThrow();
  });

  it("orders the scenario mixes from cautious to positive", () => {
    const db = (["vorsichtig", "basis", "positiv"] as const).map((k) => mixEconomics(MIXES[k]).db);
    expect(db[0]).toBeLessThan(db[1]!);
    expect(db[1]).toBeLessThan(db[2]!);
  });
});

describe("monthly model (section 10)", () => {
  it("worked example with corrected ARPU", () => {
    const m = monthlyModel(BASE_PARAMS);
    expect([m.paying, m.free]).toEqual([100, 1900]);
    expect(r2(m.mrr)).toBe(629.41);
    expect(r2(m.paidVariable)).toBe(130);
    expect(r2(m.freeCosts)).toBe(190);
    expect(r2(m.running)).toBe(-5690.59);
    expect(r2(m.hardwareDb)).toBe(906.3);
    expect(r2(m.acquisitionMonth)).toBe(-7284.29);
  });

  it("uses the same formulas as the document: fed the document's ARPU it yields the document's −5.667 € / −7.260,70 €", () => {
    const a = 6.53, v = 1.3, f = 0.1, K = 6000, P = 100, F = 1900;
    const running = P * (a - v) - F * f - K;
    expect(r2(running)).toBe(-5667);
    expect(r2(running - P * 25 + P * 0.3 * 30.21)).toBe(-7260.7);
  });

  it("year-3 states (section 11), recalculated", () => {
    const [, vorsichtig, basis, ambitioniert] = PRESETS.map((p) => monthlyModel(p.params));
    expect([vorsichtig!.paying, vorsichtig!.free]).toEqual([500, 4500]);
    expect([basis!.paying, basis!.free]).toEqual([2500, 22500]);
    expect([ambitioniert!.paying, ambitioniert!.free]).toEqual([10000, 90000]);
    expect([vorsichtig, basis, ambitioniert].map((m) => Math.round(m!.running))).toEqual([-3953, -1765, 15941]);
  });
});

describe("break-even, payback, LTV (sections 6, 8)", () => {
  it("without free users: ceil(K / DB)", () => {
    expect([1000, 6000, 12000, 25000].map((K) => breakEven({ ...BASE_PARAMS, fixedCosts: K }, { withFreeUsers: false })!.paying)).toEqual([201, 1202, 2403, 5006]);
  });

  it("with 19 free users per paying customer at 5 % conversion", () => {
    const be = breakEven(BASE_PARAMS)!;
    expect(r2(be.contributionPerPaying)).toBe(3.09);
    expect(be.paying).toBe(1940);
    expect(be.registered).toBe(38800);
    expect(monthlyModel({ ...BASE_PARAMS, registered: be.registered! }).running).toBeGreaterThanOrEqual(0);
    expect(monthlyModel({ ...BASE_PARAMS, registered: be.registered! - 20 }).running).toBeLessThan(0);
  });

  it("returns null when paying customers cannot carry their free users", () => {
    expect(breakEven({ ...BASE_PARAMS, conversion: 0.01, freeCost: 0.2 })).toBeNull();
  });

  it("CAC payback and LTV", () => {
    const c = customerEconomics(BASE_PARAMS);
    expect(r2(c.paybackMonths)).toBe(5.01);
    expect(r2(customerEconomics({ ...BASE_PARAMS, cac: 50 }).paybackMonths)).toBe(10.01);
    expect([0.02, 0.05, 0.08, 0.12].map((ch) => r2(customerEconomics({ ...BASE_PARAMS, churn: ch }).ltv))).toEqual([249.71, 99.88, 62.43, 41.62]);
    expect(r2(c.ltvToCac)).toBe(4);
    expect(c.paybackWithKit).toBeLessThan(c.paybackMonths);
  });
});

describe("formatting", () => {
  it("formats euros the German way", () => {
    expect(euro(1234.5)).toBe("1.234,50 €");
    expect(euro(-7284.288)).toBe("−7.284,29 €");
    expect(signedEuro(15941.2)).toBe("+15.941 €");
    expect(signedEuro(-1764.7)).toBe("−1.765 €");
  });
});
