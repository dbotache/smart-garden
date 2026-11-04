import type { GardenPlant } from "../types";
import { RECOMMENDED_PLANTS } from "./plants";
import { getZone } from "./site";

/**
 * Integration point for the real PlantWiz recommendation framework.
 *
 * The scene only consumes `Recommendation[]`. Today the data comes from the demo fixture
 * (`demoRecommendationProvider`). To connect the framework, implement the documented JSON
 * contract (see README → "Connect a recommendation API") and use `createHttpRecommendationProvider`.
 */

export type Recommendation = {
  plantId: string;
  plantingZoneId: string;
  score: number;
  reason: string;
  source: "demo-fixture" | "api";
};

export interface RecommendationProvider {
  getRecommendations(zoneIds: string[]): Promise<Recommendation[]>;
}

export const demoRecommendationProvider: RecommendationProvider = {
  async getRecommendations(zoneIds) {
    return RECOMMENDED_PLANTS.filter((p) => zoneIds.includes(p.plantingZoneId) && p.recommendationScore !== undefined).map((p) => ({
      plantId: p.id,
      plantingZoneId: p.plantingZoneId,
      score: p.recommendationScore!,
      reason: p.recommendationReason ?? "",
      source: "demo-fixture" as const,
    }));
  },
};

export class RecommendationContractError extends Error {}

/**
 * Validates an API payload of shape
 * `{ "recommendations": [{ "plantId": string, "zoneId": string, "score": 0..100, "reason": string }] }`.
 * Invalid entries are rejected rather than silently rendered.
 */
export function parseRecommendationResponse(payload: unknown, knownPlantIds: string[]): Recommendation[] {
  if (typeof payload !== "object" || payload === null || !Array.isArray((payload as { recommendations?: unknown }).recommendations)) {
    throw new RecommendationContractError("Expected an object with a `recommendations` array");
  }
  const items = (payload as { recommendations: unknown[] }).recommendations;
  return items.map((raw, i) => {
    const item = raw as Record<string, unknown>;
    const where = `recommendations[${i}]`;
    if (typeof item?.plantId !== "string" || !knownPlantIds.includes(item.plantId)) throw new RecommendationContractError(`${where}.plantId is missing or unknown`);
    if (typeof item.zoneId !== "string" || !getZone(item.zoneId)) throw new RecommendationContractError(`${where}.zoneId is missing or unknown`);
    if (typeof item.score !== "number" || !Number.isFinite(item.score) || item.score < 0 || item.score > 100) throw new RecommendationContractError(`${where}.score must be a number 0–100`);
    if (typeof item.reason !== "string") throw new RecommendationContractError(`${where}.reason must be a string`);
    return { plantId: item.plantId, plantingZoneId: item.zoneId, score: Math.round(item.score), reason: item.reason, source: "api" as const };
  });
}

export function createHttpRecommendationProvider(baseUrl: string, fetchImpl: typeof fetch = fetch, knownPlantIds = RECOMMENDED_PLANTS.map((p) => p.id)): RecommendationProvider {
  return {
    async getRecommendations(zoneIds) {
      const res = await fetchImpl(`${baseUrl.replace(/\/$/, "")}/recommendations?zones=${encodeURIComponent(zoneIds.join(","))}`);
      if (!res.ok) throw new Error(`Recommendation API responded ${res.status}`);
      return parseRecommendationResponse(await res.json(), knownPlantIds);
    },
  };
}

/** Merge provider results into plant records (score/reason override); plants without a result keep their fixture values. */
export function applyRecommendations(plants: GardenPlant[], recs: Recommendation[]): GardenPlant[] {
  return plants.map((p) => {
    const r = recs.find((x) => x.plantId === p.id && x.plantingZoneId === p.plantingZoneId);
    return r ? { ...p, recommendationScore: r.score, recommendationReason: r.reason } : p;
  });
}
