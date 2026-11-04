/** German number formatting for the slides (1.234,56 €). */

const cache = new Map<string, Intl.NumberFormat>();
const nf = (min: number, max: number) => {
  const key = `${min}-${max}`;
  if (!cache.has(key)) cache.set(key, new Intl.NumberFormat("de-DE", { minimumFractionDigits: min, maximumFractionDigits: max }));
  return cache.get(key)!;
};

export const roundCents = (v: number) => Math.round(v * 100 + Number.EPSILON * Math.sign(v)) / 100;

/** 1234.5 → "1.234,50 €"; with digits 0 → "1.235 €" */
export function euro(v: number, digits = 2): string {
  const s = nf(digits, digits).format(Math.abs(v));
  return `${v < 0 ? "−" : ""}${s} €`;
}
/** like euro() but always with a sign: "+1.234 €" / "−1.234 €" */
export function signedEuro(v: number, digits = 0): string {
  const r = Number(v.toFixed(digits));
  return `${r > 0 ? "+" : r < 0 ? "−" : "±"}${nf(digits, digits).format(Math.abs(v))} €`;
}
export const num = (v: number, digits = 0) => nf(digits, digits).format(v);
export const pct = (v: number, digits = 0) => `${nf(digits, digits).format(v * 100)} %`;
/** compact euro for axis ticks: 12500 → "12,5 T€" */
export function euroShort(v: number): string {
  const a = Math.abs(v);
  const sign = v < 0 ? "−" : "";
  if (a >= 1000) return `${sign}${nf(0, 1).format(a / 1000)} T€`;
  return `${sign}${nf(0, 0).format(a)} €`;
}
