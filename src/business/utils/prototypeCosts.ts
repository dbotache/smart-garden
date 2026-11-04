/** Pure cost calculations for the prototypes (formula from the document: Planbudget = Materialsumme × 1,15, rounded to cents). */
import { CATEGORY_ORDER, PROTOTYPES, RESERVE_RATE, type CostCategory, type Prototype } from "../data/prototypes";
import { roundCents } from "./money";

export const lineTotal = (l: { qty: number; unit: number }) => roundCents(l.qty * l.unit);
export const materialSum = (p: Prototype) => roundCents(p.bom.reduce((s, l) => s + lineTotal(l), 0));
export const reserve = (p: Prototype) => roundCents(materialSum(p) * RESERVE_RATE);
export const planBudget = (p: Prototype) => roundCents(materialSum(p) + reserve(p));
/** fleet budget: the document multiplies the rounded unit budget */
export const fleetBudget = (p: Prototype, units: number) => roundCents(planBudget(p) * units);

export function byCategory(p: Prototype): { category: CostCategory; sum: number; share: number }[] {
  const total = materialSum(p);
  return CATEGORY_ORDER.map((category) => {
    const sum = roundCents(p.bom.filter((l) => l.category === category).reduce((s, l) => s + lineTotal(l), 0));
    return { category, sum, share: total ? sum / total : 0 };
  }).filter((c) => c.sum > 0);
}

export const prototypeById = (id: Prototype["id"]) => PROTOTYPES.find((p) => p.id === id)!;
