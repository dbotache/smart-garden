import type { GardenPlant } from "../types";
import { BED_SIZE, getZone, rectCenter } from "./site";

/**
 * DEMONSTRATION DATA — not output of the real PlantWiz recommendation framework.
 * Scores and reasons are illustrative. Replace via a RecommendationProvider
 * (see utils/recommendationProvider.ts) once real framework results are available.
 */

function bedTop(zoneId: string): [number, number, number] {
  const zone = getZone(zoneId);
  if (!zone) throw new Error(`Unknown planting zone ${zoneId}`);
  const [x, z] = rectCenter(zone.bounds);
  return [x, BED_SIZE.height, z];
}

export const PLANTS: GardenPlant[] = [
  {
    id: "tomato",
    species: "Solanum lycopersicum",
    commonName: "Tomato",
    position: bedTop("bed-1"),
    plantingZoneId: "bed-1",
    sunlightRequirement: "Full sun, at least 6–8 h per day",
    moistureTarget: { min: 25, max: 35 },
    recommendationScore: 94,
    recommendationReason:
      "Warmest, sunniest bed next to the terrace, with its companion plant basil in the neighbouring bed.",
    origin: "recommended",
    model: "tomato",
    layout: { columns: 2, rows: 2 },
  },
  {
    id: "basil",
    species: "Ocimum basilicum",
    commonName: "Basil",
    position: bedTop("bed-2"),
    plantingZoneId: "bed-2",
    sunlightRequirement: "Full sun, sheltered from wind",
    moistureTarget: { min: 25, max: 35 },
    recommendationScore: 91,
    recommendationReason:
      "Classic companion for tomatoes. Same moisture range, so both beds can follow a similar watering rhythm.",
    origin: "recommended",
    model: "basil",
    layout: { columns: 2, rows: 4 },
  },
  {
    id: "lavender",
    species: "Lavandula angustifolia",
    commonName: "Lavender",
    position: bedTop("bed-3"),
    plantingZoneId: "bed-3",
    sunlightRequirement: "Full sun, dry and well-drained",
    moistureTarget: { min: 10, max: 20 },
    recommendationScore: 88,
    recommendationReason:
      "Insect-friendly (rating 5/5) and drought-tolerant. Suits the sandy outer bed that dries out fastest.",
    origin: "recommended",
    model: "lavender",
    layout: { columns: 2, rows: 4 },
  },
  {
    id: "lettuce",
    species: "Lactuca sativa",
    commonName: "Lettuce",
    position: bedTop("bed-4"),
    plantingZoneId: "bed-4",
    sunlightRequirement: "Partial shade, 4–6 h of sun",
    moistureTarget: { min: 30, max: 40 },
    recommendationScore: 86,
    recommendationReason:
      "Bolts in strong midday heat; the afternoon shade from the house keeps this bed cooler.",
    origin: "recommended",
    model: "lettuce",
    layout: { columns: 2, rows: 4 },
  },
  {
    id: "kale",
    species: "Brassica oleracea var. sabellica",
    commonName: "Kale",
    position: bedTop("bed-5"),
    plantingZoneId: "bed-5",
    sunlightRequirement: "Full sun to partial shade",
    moistureTarget: { min: 28, max: 40 },
    recommendationScore: 82,
    recommendationReason:
      "Heavy feeder that follows last season's legumes in this bed (crop rotation) and is harvested into winter.",
    origin: "recommended",
    model: "kale",
    layout: { columns: 2, rows: 2 },
  },
  {
    id: "rosemary",
    species: "Salvia rosmarinus",
    commonName: "Rosemary",
    position: bedTop("bed-6"),
    plantingZoneId: "bed-6",
    sunlightRequirement: "Full sun, dry and well-drained",
    moistureTarget: { min: 10, max: 20 },
    recommendationScore: 84,
    recommendationReason:
      "Mediterranean herb for the sunny, sandy outer edge. Kept away from the moisture-loving lettuce.",
    origin: "recommended",
    model: "rosemary",
    layout: { columns: 2, rows: 2 },
  },
  {
    id: "apple-tree",
    species: "Malus domestica",
    commonName: "Apple tree",
    position: [2.6, 0, -6.6],
    plantingZoneId: "orchard",
    sunlightRequirement: "Full sun",
    moistureTarget: { min: 20, max: 35 },
    origin: "existing",
    model: "apple-tree",
  },
  {
    id: "pear-tree",
    species: "Pyrus communis",
    commonName: "Pear tree",
    position: [6.4, 0, -6.6],
    plantingZoneId: "orchard",
    sunlightRequirement: "Full sun",
    moistureTarget: { min: 20, max: 35 },
    origin: "existing",
    model: "pear-tree",
  },
  {
    id: "plum-tree",
    species: "Prunus domestica",
    commonName: "Plum tree",
    position: [10.2, 0, -6.6],
    plantingZoneId: "orchard",
    sunlightRequirement: "Full sun",
    moistureTarget: { min: 20, max: 35 },
    origin: "existing",
    model: "plum-tree",
  },
];

export const RECOMMENDED_PLANTS = PLANTS.filter((p) => p.origin !== "existing");
export const EXISTING_PLANTS = PLANTS.filter((p) => p.origin === "existing");

export function getPlant(id: string): GardenPlant | undefined {
  return PLANTS.find((p) => p.id === id);
}

export function plantForZone(zoneId: string): GardenPlant | undefined {
  return PLANTS.find((p) => p.plantingZoneId === zoneId && p.origin !== "existing");
}
