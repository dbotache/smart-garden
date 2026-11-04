/** Public API of the business module (prototype costs + financial model). The deck imports only from here. */
export { PrototypeCosts } from "./components/PrototypeCosts";
export { FinanceModel } from "./components/FinanceModel";
export { PROTOTYPES, RESERVE_RATE, type Prototype } from "./data/prototypes";
export { TARIFFS, MIXES, KIT, RENTAL, PRESETS, BASE_PARAMS, type FinanceParams, type Tariff } from "./data/businessModel";
export { materialSum, reserve, planBudget, fleetBudget, byCategory } from "./utils/prototypeCosts";
export { monthlyModel, mixEconomics, tariffEconomics, kitEconomics, rentalEconomics, breakEven, customerEconomics, registrationsFor } from "./utils/finance";
export { euro, signedEuro, pct, num } from "./utils/money";
