import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { GardenScene } from "../components/GardenScene";
import type { GardenStage } from "../types";

// The WebGL canvas cannot run in jsdom; the experience must still work (overlays, state) without it.
vi.mock("next/dynamic", () => ({ default: () => () => null }));

const stageTitle = () => screen.getByTestId("garden-stage-title").textContent;
const stageButton = (s: GardenStage) => document.querySelector(`[data-stage-button="${s}"]`) as HTMLButtonElement;

afterEach(() => vi.useRealTimers());

describe("GardenScene (uncontrolled)", () => {
  it("starts in the initial stage and switches stages from the controls", () => {
    render(<GardenScene initialStage="planning" />);
    expect(stageTitle()).toBe("Architectural planning");
    fireEvent.click(stageButton("planting"));
    expect(stageTitle()).toBe("Plant recommendations");
    expect(screen.getByTestId("plant-tomato")).toBeInTheDocument();
  });

  it("opens plant details and carries a planned zone into later stages", () => {
    render(<GardenScene initialStage="planning" />);
    fireEvent.click(screen.getByTestId("zone-bed-1"));
    expect(screen.getByTestId("zone-panel")).toHaveAttribute("data-zone-id", "bed-1");
    fireEvent.click(stageButton("planting"));
    expect(screen.getByTestId("plant-panel")).toHaveAttribute("data-plant-id", "tomato");
    fireEvent.click(stageButton("monitoring"));
    expect(screen.getByTestId("sensor-panel")).toHaveAttribute("data-device-id", "probe-1");
    fireEvent.click(screen.getByTestId("panel-back"));
    expect(screen.queryByTestId("sensor-panel")).toBeNull();
  });

  it("uses arrow keys for stages standalone, but never in presentation mode", () => {
    const { unmount } = render(<GardenScene initialStage="planning" />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(stageTitle()).toBe("Plant recommendations");
    unmount();
    render(<GardenScene initialStage="planning" presentationMode />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(stageTitle()).toBe("Architectural planning");
  });

  it("shows the fallback message instead of crashing without WebGL", () => {
    render(<GardenScene />);
    expect(screen.getByTestId("garden-fallback")).toBeInTheDocument();
  });
});

describe("GardenScene (controlled)", () => {
  it("only changes stage when the parent updates currentStage", () => {
    const onStageChange = vi.fn();
    const { rerender } = render(<GardenScene currentStage="planning" onStageChange={onStageChange} />);
    fireEvent.click(stageButton("irrigation"));
    expect(onStageChange).toHaveBeenCalledWith("irrigation");
    expect(stageTitle()).toBe("Architectural planning");
    rerender(<GardenScene currentStage="monitoring" onStageChange={onStageChange} />);
    expect(stageTitle()).toBe("Sensor monitoring");
  });

  it("works with a parent that holds the state", () => {
    function Parent() {
      const [s, setS] = useState<GardenStage>("planting");
      return <GardenScene currentStage={s} onStageChange={setS} locale="de" />;
    }
    render(<Parent />);
    fireEvent.click(stageButton("irrigation"));
    expect(stageTitle()).toBe("Adaptive Bewässerung");
  });
});

describe("irrigation demo", () => {
  it("switches weather and strategy, and runs the watering timeline to completion", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    render(<GardenScene initialStage="irrigation" />);
    const panel = () => screen.getByTestId("irrigation-panel");
    expect(screen.getByTestId("total-liters")).toHaveTextContent("57.5 L");
    expect(screen.getByTestId("savings")).toHaveTextContent("Adaptive saves 63 L (52 %)");

    fireEvent.click(screen.getByRole("button", { name: "Rain expected" }));
    expect(screen.getByTestId("decision-basil")).toHaveTextContent("Wait for rain");
    fireEvent.click(screen.getByRole("button", { name: "Fixed timer" }));
    expect(screen.getByTestId("total-liters")).toHaveTextContent("120.0 L");
    expect(panel()).toHaveTextContent("3 × over-watered");

    fireEvent.click(screen.getByRole("button", { name: "Adaptive" }));
    fireEvent.click(screen.getByTestId("run-irrigation"));
    expect(panel()).toHaveAttribute("data-demo-status", "running");
    act(() => vi.advanceTimersByTime(7000));
    expect(panel()).toHaveAttribute("data-demo-status", "done");
    // changing the scenario resets the demo
    fireEvent.click(screen.getByRole("button", { name: "Dry spell" }));
    expect(panel()).toHaveAttribute("data-demo-status", "idle");
  });
});
