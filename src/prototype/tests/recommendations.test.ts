import { describe, expect, it, vi } from "vitest";
import { RecommendationContractError, applyRecommendations, createHttpRecommendationProvider, demoRecommendationProvider, parseRecommendationResponse } from "../data/recommendations";
import { PLANTS } from "../data/plants";

const ids = ["tomato", "basil"];

describe("recommendation provider", () => {
  it("serves the demo fixture for requested zones only", async () => {
    const recs = await demoRecommendationProvider.getRecommendations(["bed-1", "bed-2"]);
    expect(recs.map((r) => r.plantId)).toEqual(["tomato", "basil"]);
    expect(recs.every((r) => r.source === "demo-fixture")).toBe(true);
  });

  it("parses a valid API payload", () => {
    const recs = parseRecommendationResponse({ recommendations: [{ plantId: "tomato", zoneId: "bed-1", score: 97.4, reason: "API says so" }] }, ids);
    expect(recs).toEqual([{ plantId: "tomato", plantingZoneId: "bed-1", score: 97, reason: "API says so", source: "api" }]);
  });

  it.each([
    [null],
    [{}],
    [{ recommendations: [{ plantId: "cactus", zoneId: "bed-1", score: 50, reason: "" }] }],
    [{ recommendations: [{ plantId: "tomato", zoneId: "bed-99", score: 50, reason: "" }] }],
    [{ recommendations: [{ plantId: "tomato", zoneId: "bed-1", score: 150, reason: "" }] }],
    [{ recommendations: [{ plantId: "tomato", zoneId: "bed-1", score: "high", reason: "" }] }],
    [{ recommendations: [{ plantId: "tomato", zoneId: "bed-1", score: 50 }] }],
  ])("rejects invalid payload %#", (payload) => {
    expect(() => parseRecommendationResponse(payload, ids)).toThrow(RecommendationContractError);
  });

  it("calls the HTTP endpoint and surfaces HTTP errors", async () => {
    const ok = vi.fn(async () => new Response(JSON.stringify({ recommendations: [] }), { status: 200 }));
    await expect(createHttpRecommendationProvider("https://api.example/", ok as unknown as typeof fetch, ids).getRecommendations(["bed-1"])).resolves.toEqual([]);
    expect(ok).toHaveBeenCalledWith("https://api.example/recommendations?zones=bed-1");
    const fail = vi.fn(async () => new Response("", { status: 503 }));
    await expect(createHttpRecommendationProvider("https://api.example", fail as unknown as typeof fetch, ids).getRecommendations(["bed-1"])).rejects.toThrow("503");
  });

  it("merges results into plant records without mutating the fixture", () => {
    const merged = applyRecommendations(PLANTS, [{ plantId: "tomato", plantingZoneId: "bed-1", score: 50, reason: "r", source: "api" }]);
    expect(merged.find((p) => p.id === "tomato")?.recommendationScore).toBe(50);
    expect(PLANTS.find((p) => p.id === "tomato")?.recommendationScore).toBe(94);
  });
});
