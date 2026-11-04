import { describe, expect, it } from "vitest";
import { EMPTY_LAYERS, layerTargets, layersSettled, parseStage, stepLayers, stepStage } from "../utils/stages";

describe("stage transitions", () => {
  it("steps forward and backward with clamping", () => {
    expect(stepStage("planning", 1)).toBe("planting");
    expect(stepStage("irrigation", 1)).toBe("irrigation");
    expect(stepStage("planning", -1)).toBe("planning");
    expect(stepStage("monitoring", -2)).toBe("planning");
  });

  it("parses unknown stages to a fallback", () => {
    expect(parseStage("monitoring")).toBe("monitoring");
    expect(parseStage("flying")).toBe("planning");
    expect(parseStage(undefined, "irrigation")).toBe("irrigation");
  });

  it("builds cumulatively: later stages keep earlier layers", () => {
    expect(layerTargets("planning")).toEqual({ build: 1, materialize: 0, planted: 0, sensors: 0, irrigation: 0 });
    expect(layerTargets("irrigation")).toEqual({ build: 1, materialize: 1, planted: 1, sensors: 1, irrigation: 1 });
  });

  it("cascades layers instead of switching everything at once", () => {
    const target = layerTargets("irrigation");
    let p = { ...EMPTY_LAYERS };
    p = stepLayers(p, target, 0.1);
    expect(p.build).toBeGreaterThan(0);
    expect(p.sensors).toBe(0); // must wait for earlier layers
    for (let i = 0; i < 200; i++) p = stepLayers(p, target, 0.05);
    expect(layersSettled(p, target)).toBe(true);
  });

  it("removes later layers before earlier ones when going back", () => {
    let p = layerTargets("irrigation");
    const target = layerTargets("planning");
    p = stepLayers(p, target, 0.1);
    expect(p.irrigation).toBeLessThan(1);
    expect(p.planted).toBe(1); // still waiting for sensors/irrigation to clear
    for (let i = 0; i < 200; i++) p = stepLayers(p, target, 0.05);
    expect(layersSettled(p, target)).toBe(true);
  });

  it("ignores negative time steps", () => {
    expect(stepLayers(EMPTY_LAYERS, layerTargets("planning"), -1)).toEqual(EMPTY_LAYERS);
  });
});

import { selectionForStage, deviceForSelection } from "../utils/selection";

describe("selection across stages", () => {
  it("maps a planned zone to its plant and to the plant's probe", () => {
    expect(selectionForStage({ type: "zone", id: "bed-1" }, "planting")).toEqual({ type: "plant", id: "tomato" });
    expect(deviceForSelection(selectionForStage({ type: "zone", id: "bed-1" }, "monitoring"))?.id).toBe("probe-1");
  });

  it("maps plants and sensors back to zones when returning to planning", () => {
    expect(selectionForStage({ type: "plant", id: "basil" }, "planning")).toEqual({ type: "zone", id: "bed-2" });
    expect(selectionForStage({ type: "sensor", id: "probe-4" }, "planning")).toEqual({ type: "zone", id: "bed-4" });
    expect(selectionForStage({ type: "plant", id: "apple-tree" }, "planning")).toEqual({ type: "zone", id: "orchard" });
  });

  it("drops selections that have no meaning in the target stage", () => {
    expect(selectionForStage({ type: "zone", id: "orchard" }, "planting")).toBeNull();
    expect(selectionForStage({ type: "sensor", id: "weather-station" }, "planting")).toBeNull();
    expect(selectionForStage({ type: "plant", id: "ghost" }, "monitoring")).toBeNull();
    expect(selectionForStage(null, "irrigation")).toBeNull();
  });
});
