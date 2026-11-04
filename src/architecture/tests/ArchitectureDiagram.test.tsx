import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ArchitectureDiagram } from "../components/ArchitectureDiagram";

const node = (c: HTMLElement, id: string) => c.querySelector<HTMLButtonElement>(`[data-node="${id}"]`)!;
const edges = (c: HTMLElement) => c.querySelectorAll("[data-edge]").length;

describe("ArchitectureDiagram", () => {
  it("starts with the full system and the Bewässerungs-Engine selected", () => {
    const { container } = render(<ArchitectureDiagram />);
    expect(screen.getByTestId("architecture")).toHaveAttribute("data-level", "3");
    expect(screen.getByTestId("arch-detail")).toHaveAttribute("data-node", "engine");
    expect(screen.getByTestId("arch-detail")).toHaveTextContent("Jede Aktion wird protokolliert und ist widerrufbar.");
    expect(edges(container)).toBe(17);
    expect(container.querySelectorAll("button.arch-node:disabled")).toHaveLength(0);
  });

  it("switches levels: hides flows, disables later modules, selects the level's default module", () => {
    const { container } = render(<ArchitectureDiagram />);
    fireEvent.click(screen.getByTestId("arch-level-1"));
    expect(edges(container)).toBe(8);
    expect(node(container, "gateway")).toBeDisabled();
    expect(node(container, "valves")).toBeDisabled();
    expect(node(container, "twin")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Aktiv: Level 1–1/)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("arch-level-2"));
    expect(edges(container)).toBe(12);
    expect(screen.getByTestId("arch-detail")).toHaveAttribute("data-node", "gateway");
  });

  it("shows details and connections of a clicked module", () => {
    const { container } = render(<ArchitectureDiagram />);
    fireEvent.click(node(container, "twin"));
    const detail = screen.getByTestId("arch-detail");
    expect(detail).toHaveTextContent("Garden Digital Twin");
    expect(detail).toHaveTextContent("Eingang");
    expect(detail).toHaveTextContent("API + Auth, IoT-Ingestion");
    expect(detail).toHaveTextContent("Analyse + KI, Datenplattform, Bewässerungs-Engine");
  });

  it("toggles the flow animation", () => {
    const { container } = render(<ArchitectureDiagram />);
    expect(container.querySelectorAll(".arch-flow").length).toBe(17);
    fireEvent.click(screen.getByTestId("arch-animation"));
    expect(container.querySelectorAll(".arch-flow").length).toBe(0);
    expect(screen.getByTestId("arch-animation")).toHaveTextContent("Animation starten");
  });

  it("supports a controlled level", () => {
    const onLevelChange = vi.fn();
    const { container, rerender } = render(<ArchitectureDiagram level={1} onLevelChange={onLevelChange} />);
    fireEvent.click(screen.getByTestId("arch-level-3"));
    expect(onLevelChange).toHaveBeenCalledWith(3);
    expect(edges(container)).toBe(8); // still controlled at 1
    rerender(<ArchitectureDiagram level={3} onLevelChange={onLevelChange} />);
    expect(edges(container)).toBe(17);
  });

  it("uses unique marker ids per instance", () => {
    const { container } = render(
      <>
        <ArchitectureDiagram />
        <ArchitectureDiagram />
      </>,
    );
    const ids = [...container.querySelectorAll("marker")].map((m) => m.id);
    expect(new Set(ids).size).toBe(6);
  });
});
