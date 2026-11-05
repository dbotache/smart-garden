/** Public API of the business module (prototype costs + financial model). The deck imports only from here. */
export { PrototypeCosts } from "./components/PrototypeCosts";
export { FinanceModel } from "./components/FinanceModel";
export { FinanceSummary, summaryFigures } from "./components/FinanceSummary";
export { Phase1Costs, phase1BreakEvenUsers } from "./components/Phase1Costs";
export { HardwareCosts, hardwareSummary } from "./components/HardwareCosts";
export { CompatCosts } from "./components/CompatCosts";
export { PhaseCostTable } from "./components/PhaseCostTable";
export { SavingsLevers, savingsSummary } from "./components/SavingsLevers";
export { phase1, hardwareCosts, savingsLevers, compatCosts, phaseCosts } from "./utils/operatingCosts";
export { PROTOTYPES, RESERVE_RATE, type Prototype } from "./data/prototypes";
export { TARIFFS, MIXES, KIT, RENTAL, PRESETS, BASE_PARAMS, type FinanceParams, type Tariff } from "./data/businessModel";
export { materialSum, reserve, planBudget, fleetBudget, byCategory } from "./utils/prototypeCosts";
export { monthlyModel, mixEconomics, tariffEconomics, kitEconomics, rentalEconomics, breakEven, customerEconomics, registrationsFor } from "./utils/finance";
export { euro, signedEuro, pct, num } from "./utils/money";
export { StaticMotionContext } from "./components/ui";
