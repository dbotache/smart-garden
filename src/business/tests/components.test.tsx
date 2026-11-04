import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { PrototypeCosts } from "../components/PrototypeCosts";
import { FinanceModel } from "../components/FinanceModel";

const value = (testId: string) => Number(screen.getByTestId(testId).getAttribute("data-value"));

describe("PrototypeCosts", () => {
  it("shows the three plan budgets (recalculated) and selects prototype 2 by default", () => {
    render(<PrototypeCosts />);
    expect([value("budget-1"), value("budget-2"), value("budget-3")]).toEqual([55.2, 177.68, 457.7]);
    expect(screen.getByTestId("prototype-costs")).toHaveAttribute("data-selected", "p2");
    expect(screen.getByTestId("breakdown-budget")).toHaveTextContent("177,68 €");
  });

  it("switches the breakdown when another prototype is chosen", () => {
    render(<PrototypeCosts />);
    fireEvent.click(screen.getByTestId("prototype-3"));
    const breakdown = screen.getByTestId("prototype-breakdown");
    expect(breakdown).toHaveTextContent("Prototyp 3");
    expect(breakdown).toHaveTextContent("Stromversorgung");
    expect(breakdown).toHaveTextContent("LTE-Funk");
    expect(screen.getByTestId("breakdown-budget")).toHaveTextContent("457,70 €");
  });

  it("scales the comparison to pilot fleets", () => {
    render(<PrototypeCosts />);
    fireEvent.click(within(screen.getByTestId("fleet-size")).getByText("25×"));
    expect([value("fleet-1"), value("fleet-2"), value("fleet-3")]).toEqual([1380, 4442, 11442.5]);
  });

  it("opens the full parts list and marks the corrected total", () => {
    render(<PrototypeCosts initial="p3" />);
    fireEvent.click(screen.getByTestId("show-bom"));
    const bom = screen.getByTestId("bom");
    expect(bom).toHaveTextContent("LTE-Modem (z. B. SIM7600-Klasse)");
    expect(bom).toHaveTextContent("Materialsumme 398,00 €");
    expect(bom).toHaveTextContent("Vorlage nannte 438,00 €");
    fireEvent.click(screen.getByTestId("close-bom"));
    expect(screen.queryByTestId("bom")).toBeNull();
  });
});

describe("FinanceModel", () => {
  it("starts with the worked example of the business plan", () => {
    render(<FinanceModel />);
    expect(screen.getByTestId("finance-model")).toHaveAttribute("data-preset", "beispiel");
    expect(value("kpi-paying")).toBe(100);
    expect(value("kpi-mrr")).toBeCloseTo(629.41, 2);
    expect(value("kpi-result")).toBeCloseTo(-5690.59, 2);
    expect(value("kpi-break-even")).toBe(1940);
    expect(screen.getByTestId("kpi-result-tile")).toHaveAttribute("data-tone", "bad");
  });

  it("applies the year-3 presets", () => {
    render(<FinanceModel />);
    fireEvent.click(screen.getByTestId("preset-j3-ambitioniert"));
    expect(value("kpi-paying")).toBe(10000);
    expect(Math.round(value("kpi-result"))).toBe(15941);
    expect(screen.getByTestId("kpi-result-tile")).toHaveAttribute("data-tone", "good");
    fireEvent.click(screen.getByTestId("preset-j3-basis"));
    expect(Math.round(value("kpi-result"))).toBe(-1765);
  });

  it("recomputes when an assumption changes and leaves the preset", () => {
    render(<FinanceModel />);
    fireEvent.change(screen.getByTestId("slider-conversion"), { target: { value: "10" } });
    expect(value("kpi-paying")).toBe(200);
    expect(screen.getByTestId("finance-model")).toHaveAttribute("data-preset", "custom");
    fireEvent.click(within(screen.getByTestId("mix")).getByText("40/40/20"));
    expect(value("kpi-mrr")).toBeGreaterThan(200 * 6.29);
  });

  it("shows the free tier and the three subscriptions consistently with the tier slide", () => {
    render(<FinanceModel />);
    fireEvent.click(screen.getByTestId("tab-tarife"));
    expect(screen.getByTestId("tariff-free")).toHaveTextContent("0,00 €");
    expect(screen.getByTestId("tariff-basic")).toHaveTextContent("4,99 €");
    expect(screen.getByTestId("tariff-erweitert")).toHaveTextContent("9,99 €");
    expect(screen.getByTestId("tariff-expert")).toHaveTextContent("14,99 €");
    expect(screen.getByTestId("tariff-erweitert")).toHaveTextContent("Sensor-Kit separat (Kauf)");
  });

  it("customer and hardware views", () => {
    render(<FinanceModel />);
    fireEvent.click(screen.getByTestId("tab-kunde"));
    expect(screen.getByTestId("payback")).toHaveTextContent("5,0 bezahlten Monaten");
    expect(screen.getByTestId("ltv-table")).toHaveTextContent("99,88 €");
    expect(screen.getByTestId("ad-cac")).toHaveTextContent("50,00 €");
    fireEvent.click(screen.getByTestId("tab-hardware"));
    expect(screen.getByTestId("kit-db")).toHaveTextContent("+30,21 €");
    fireEvent.click(within(screen.getByTestId("kit-price")).getByText("179 €"));
    expect(screen.getByTestId("kit-db")).toHaveTextContent("+55,42 €");
  });

  it("adds the acquisition month to the waterfall on request", () => {
    render(<FinanceModel />);
    const bars = () => screen.getByTestId("waterfall").querySelectorAll("g").length;
    expect(bars()).toBe(5);
    fireEvent.click(screen.getByTestId("toggle-acquisition"));
    expect(bars()).toBe(8);
    expect(screen.getByTestId("waterfall").getAttribute("aria-label")).toContain("−7.284 €");
  });
});
