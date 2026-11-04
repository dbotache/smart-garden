export { BRAND } from "@/shared/brand";
// measured/estimated pair validated with the dataviz palette checker (chroma, normal-vision ΔE 19.4); the
// protan ΔE 6.3 warning is covered by secondary encoding: estimated series are always dashed and text-labelled.

/** Status colours used by overlays and in-scene chips (chosen for contrast on white and on the paper background). */
export const STATUS = {
  below: "#B4532A",
  within: "#2D6A4F",
  above: "#2E6F9E",
  water: "#2B7DB8",
  measured: "#287a52",
  estimated: "#b5630b",
} as const;
