/**
 * Financial model (pure). Formulas follow sections 3, 4, 6, 8 and 10.2 of the business-model document;
 * all values are computed unrounded and only rounded for display.
 *
 *   P = round(R × q)            F = R − P
 *   MRR = P × ARPU              SaaS-DB = P × (ARPU − v)
 *   running result = SaaS-DB − F × f − K
 *   acquisition month = running result − P × CAC + P × h × kit-DB
 */
import { KIT, PAID_TARIFFS, RENTAL, TARIFFS, VAT, type FinanceParams, type Mix, type Tariff } from "../data/businessModel";

export const net = (gross: number) => gross / VAT;

export function tariffEconomics(t: Tariff) {
  const n = net(t.gross);
  const db = n - t.variableCost;
  return { net: n, variableCost: t.variableCost, db, margin: n > 0 ? db / n : null };
}

/** weighted values per paying customer and month for a tariff mix (Basic / Erweitert / Expert) */
export function mixEconomics(mix: Mix) {
  const total = mix[0] + mix[1] + mix[2];
  if (Math.abs(total - 1) > 1e-9) throw new Error(`tariff mix must sum to 100 %, got ${total}`);
  let arpu = 0;
  let variableCost = 0;
  PAID_TARIFFS.forEach((t, i) => {
    arpu += mix[i]! * net(t.gross);
    variableCost += mix[i]! * t.variableCost;
  });
  return { arpu, variableCost, db: arpu - variableCost };
}

export function kitEconomics(grossPrice: number, opts: { warrantyReserve?: boolean } = {}) {
  const n = net(grossPrice);
  const direct = KIT.cogs + KIT.fulfilment + (opts.warrantyReserve ? KIT.warrantyReserve : 0);
  const db = n - direct;
  return { net: n, directCosts: direct, db, margin: db / n };
}

export function rentalEconomics() {
  const netFee = net(RENTAL.feeGross);
  const dbPerMonth = netFee - RENTAL.serviceCost;
  return {
    netFee,
    dbPerMonth,
    paybackMonths: RENTAL.upfrontCost / dbPerMonth,
    cumulative: (months: number) => months * dbPerMonth - RENTAL.upfrontCost,
  };
}

/** the free tariff's variable cost per active free user and month */
export const FREE_COST_DEFAULT = TARIFFS[0]!.variableCost;

export function monthlyModel(p: FinanceParams) {
  if (p.registered < 0 || p.conversion < 0 || p.conversion > 1) throw new Error("invalid users or conversion");
  const unit = mixEconomics(p.mix);
  const paying = Math.round(p.registered * p.conversion);
  const free = p.registered - paying;
  const mrr = paying * unit.arpu;
  const paidVariable = paying * unit.variableCost;
  const saasDb = paying * unit.db;
  const freeCosts = free * p.freeCost;
  const running = saasDb - freeCosts - p.fixedCosts;
  const kit = kitEconomics(p.kitPrice);
  const acquisition = paying * p.cac;
  const hardwareDb = paying * p.kitShare * kit.db;
  return {
    unit, kit, paying, free, mrr, arr: mrr * 12, paidVariable, saasDb, freeCosts, fixedCosts: p.fixedCosts, running,
    acquisition, hardwareDb, acquisitionMonth: running - acquisition + hardwareDb,
  };
}

/**
 * Paying customers needed so the running monthly result is ≥ 0 at the given conversion (free users grow with
 * paying ones: (1 − q)/q free users per paying customer). Without free users: ceil(K / DB) (section 6).
 * Returns null when each paying customer does not even cover the free users that come with them.
 */
export function breakEven(p: Pick<FinanceParams, "fixedCosts" | "conversion" | "freeCost" | "mix">, opts: { withFreeUsers?: boolean } = { withFreeUsers: true }) {
  const { db } = mixEconomics(p.mix);
  const freePerPaying = opts.withFreeUsers && p.conversion > 0 ? (1 - p.conversion) / p.conversion : 0;
  const perPaying = db - freePerPaying * p.freeCost;
  if (perPaying <= 0) return null;
  const paying = Math.ceil(p.fixedCosts / perPaying - 1e-9);
  return { paying, contributionPerPaying: perPaying, registered: p.conversion > 0 ? Math.ceil(paying / p.conversion - 1e-9) : null };
}

/** section 8: CAC payback in paid months, and the simplified undiscounted LTV = DB / churn */
export function customerEconomics(p: Pick<FinanceParams, "mix" | "cac" | "churn" | "kitShare" | "kitPrice">) {
  const { db } = mixEconomics(p.mix);
  const lifetime = p.churn > 0 ? 1 / p.churn : Infinity;
  const ltv = p.churn > 0 ? db / p.churn : Infinity;
  const kitDb = kitEconomics(p.kitPrice).db;
  return {
    db,
    paybackMonths: p.cac / db,
    /** payback when the expected kit contribution of a new customer offsets part of the CAC */
    paybackWithKit: Math.max(0, p.cac - p.kitShare * kitDb) / db,
    lifetime,
    ltv,
    ltvToCac: p.cac > 0 ? ltv / p.cac : Infinity,
  };
}

/** section 7.1: registrations needed for a target number of paying customers */
export const registrationsFor = (targetPaying: number, conversion: number) => Math.ceil(targetPaying / conversion - 1e-9);

/** running result as a function of registered users (for the break-even chart) */
export const runningAt = (p: FinanceParams, registered: number) => monthlyModel({ ...p, registered }).running;
