import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { StageControls } from "../overlays/StageControls";
import { PlantInfoPanel } from "../overlays/PlantInfoPanel";
import { SensorDashboard } from "../overlays/SensorDashboard";
import { TimeSeriesChart } from "../overlays/TimeSeriesChart";
import { IrrigationDecision } from "../overlays/IrrigationDecision";
import { getMessages } from "../data/i18n";
import { getPlant } from "../data/plants";
import { SENSOR_DEVICES, getDeviceSeries } from "../data/sensors";
import { planIrrigation } from "../utils/irrigationLogic";
import { WEATHER_SCENARIOS } from "../data/irrigation";

describe("StageControls", () => {
  it("renders four stages, marks the active one and reports clicks", () => {
    const onChange = vi.fn();
    const outer = vi.fn();
    render(
      <div onClick={outer}>
        <StageControls stage="monitoring" onChange={onChange} messages={getMessages("en")} />
      </div>,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
    expect(buttons[2]).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(buttons[3]!);
    expect(onChange).toHaveBeenCalledWith("irrigation");
    expect(outer).not.toHaveBeenCalled(); // clicks never bubble to the slide deck
  });
});

describe("PlantInfoPanel", () => {
  it("shows name, species, score, reason and requirements", () => {
    render(<PlantInfoPanel plant={getPlant("tomato")!} locale="en" />);
    expect(screen.getByRole("heading", { name: "Tomato" })).toBeInTheDocument();
    expect(screen.getByText("Solanum lycopersicum")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "94/100" })).toBeInTheDocument();
    expect(screen.getByText(/companion plant basil/)).toBeInTheDocument();
    expect(screen.getByText("25–35 %")).toBeInTheDocument();
    expect(screen.getByText(/Example data/)).toBeInTheDocument();
  });

  it("explains that existing plants have no score, in German", () => {
    render(<PlantInfoPanel plant={getPlant("apple-tree")!} locale="de" />);
    expect(screen.getByRole("heading", { name: "Apfelbaum" })).toBeInTheDocument();
    expect(screen.getByText(/Ohne Wert/)).toBeInTheDocument();
  });
});

describe("SensorDashboard", () => {
  it("charts measured soil moisture and keeps the health index labelled as an estimate", () => {
    render(<SensorDashboard device={SENSOR_DEVICES[0]!} locale="en" />);
    expect(screen.getByTestId("primary-value")).toHaveTextContent("18 %");
    expect(screen.getByText("below target")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Soil moisture: .* → 18 %/ })).toBeInTheDocument();
    const health = screen.getByTestId("health-indicator");
    expect(within(health).getByText("Estimated")).toBeInTheDocument();
    expect(within(health).getByText(/not a direct measurement/)).toBeInTheDocument();
  });

  it("shows no health estimate for the weather station", () => {
    render(<SensorDashboard device={SENSOR_DEVICES.find((d) => d.kind === "weather-station")!} locale="en" />);
    expect(screen.queryByTestId("health-indicator")).toBeNull();
    expect(screen.getAllByText("Relative humidity").length).toBeGreaterThan(0);
  });
});

describe("TimeSeriesChart", () => {
  const series = getDeviceSeries("probe-1").find((s) => s.metric === "soil-moisture")!;

  it("renders a target band and an accessible data table", () => {
    const { container } = render(<TimeSeriesChart series={series} title="Soil moisture" locale="en" band={{ min: 25, max: 35, label: "Target" }} />);
    expect(container.querySelector("rect")).not.toBeNull();
    expect(container.querySelectorAll("table tr")).toHaveLength(series.points.length);
  });

  it("consumes ←/→ for the crosshair so the deck does not change slides", () => {
    render(<TimeSeriesChart series={series} title="Soil moisture" locale="en" />);
    const svg = screen.getByRole("img", { name: /Soil moisture/ });
    fireEvent.focus(svg);
    const ev = new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true });
    svg.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("degrades gracefully with too little data", () => {
    render(<TimeSeriesChart series={{ ...series, points: [{ t: "x", value: Number.NaN }] }} title="x" locale="en" />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("IrrigationDecision", () => {
  it("explains the tomato decision in plain language", () => {
    const d = planIrrigation("adaptive", WEATHER_SCENARIOS["dry-spell"]).decisions[0]!;
    render(<IrrigationDecision decision={d} locale="en" />);
    expect(screen.getByText(/Tomato: soil moisture 18 % is far below 25–35 %/)).toBeInTheDocument();
    expect(screen.getByText("36.3 L")).toBeInTheDocument();
  });
});
