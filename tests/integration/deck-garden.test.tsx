// Integration: SlideDeck + GardenHost + PrototypeEmbed with a stub garden (WebGL is not available in jsdom).
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

// The deck prefetches the 3D bundle near garden slides; keep three.js out of jsdom.
vi.mock("@/prototype/components/GardenCanvas", () => ({ default: () => null }));

const mounts = vi.fn();
vi.mock("@/prototype", async (orig) => {
  const actual = await orig<typeof import("@/prototype")>();
  const { useEffect } = await import("react");
  function GardenScene(props: { currentStage?: string; initialStage?: string; onStageChange?: (s: string) => void; active?: boolean; presentationMode?: boolean }) {
    useEffect(() => mounts(), []);
    return (
      <section data-garden-root data-testid="stub-garden" data-stage={props.currentStage ?? props.initialStage} data-active={String(props.active)}>
        <button type="button" data-testid="stub-stage-btn" onClick={(e) => (e.stopPropagation(), props.onStageChange?.("irrigation"))}>
          stage
        </button>
        <canvas data-testid="stub-canvas" />
      </section>
    );
  }
  return { ...actual, GardenScene };
});

const { SlideDeck } = await import("@/presentation/components/SlideDeck");
const { SLIDES } = await import("@/presentation/slides");

const current = () => screen.getByTestId("deck").getAttribute("data-slide-id");
// hashchange (our navigation) is dispatched asynchronously, as in browsers → flush a macrotask after each action.
const flush = () => act(async () => void (await new Promise((r) => setTimeout(r, 0))));
const key = async (k: string, target: EventTarget = window) => {
  act(() => void target.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true })));
  await flush();
};

beforeEach(async () => {
  mounts.mockClear();
  window.location.hash = "";
  await new Promise((r) => setTimeout(r, 0));
});

describe("slide deck with embedded garden", () => {
  it("navigates in registry order with arrows and buttons", async () => {
    render(<SlideDeck slides={SLIDES} />);
    expect(current()).toBe("title");
    await key("ArrowRight");
    expect(current()).toBe("team");
    fireEvent.click(screen.getByTestId("deck-next"));
    await flush();
    expect(current()).toBe("problem");
    await key("ArrowLeft");
    expect(current()).toBe("team");
    await key("End");
    expect(current()).toBe("call");
    await key("Home");
    expect(current()).toBe("title");
  });

  it("two quick key presses move two slides, even before the deck re-renders", async () => {
    render(<SlideDeck slides={SLIDES} />);
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true }));
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown", bubbles: true, cancelable: true }));
    });
    await flush();
    expect(current()).toBe("problem");
  });

  it("mounts ONE garden for all demo slides and drives its stage from the slide", async () => {
    window.location.hash = "#/6";
    await flush();
    render(<SlideDeck slides={SLIDES} />);
    expect(screen.queryByTestId("stub-garden")).toBeNull(); // no WebGL work before the first garden slide
    await key("ArrowRight");
    expect(current()).toBe("demo-planning");
    expect(screen.getByTestId("stub-garden")).toHaveAttribute("data-stage", "planning");
    await key("ArrowRight");
    await key("ArrowRight");
    expect(screen.getByTestId("stub-garden")).toHaveAttribute("data-stage", "monitoring");
    await key("ArrowRight");
    await key("ArrowRight"); // leave the demo
    expect(current()).toBe("architecture");
    expect(screen.getByTestId("deck-garden")).toHaveAttribute("data-visible", "false");
    expect(screen.getByTestId("stub-garden")).toHaveAttribute("data-active", "false"); // render loop paused
    await key("ArrowLeft");
    expect(screen.getByTestId("stub-garden")).toHaveAttribute("data-stage", "irrigation");
    expect(mounts).toHaveBeenCalledTimes(1); // never re-created
  });

  it("lets the garden change its stage without changing the slide", async () => {
    window.location.hash = "#/8";
    await flush();
    render(<SlideDeck slides={SLIDES} />);
    fireEvent.click(screen.getByTestId("stub-stage-btn"));
    expect(current()).toBe("demo-planting");
    expect(screen.getByTestId("stub-garden")).toHaveAttribute("data-stage", "irrigation");
  });

  it("does not navigate on clicks, drags or wheel over the garden, nor on Space while a button has focus", async () => {
    window.location.hash = "#/9";
    await flush();
    render(<SlideDeck slides={SLIDES} />);
    const canvas = screen.getByTestId("stub-canvas");
    fireEvent.pointerDown(canvas);
    fireEvent.pointerMove(canvas, { clientX: 300 });
    fireEvent.pointerUp(canvas);
    fireEvent.click(canvas);
    fireEvent.wheel(canvas, { deltaY: 400 });
    const btn = screen.getByTestId("stub-stage-btn");
    btn.focus();
    await key(" ", btn);
    expect(current()).toBe("demo-monitoring");
    // …and navigation still works afterwards
    await key("ArrowRight", btn);
    expect(current()).toBe("demo-irrigation");
  });

  it("toggles speaker notes with N and shows the PPTX notes", async () => {
    window.location.hash = "#/3";
    await flush();
    render(<SlideDeck slides={SLIDES} />);
    await key("n");
    expect(screen.getByTestId("speaker-notes")).toHaveTextContent("Peter steht für viele Einsteiger");
    await key("Escape");
    expect(screen.queryByTestId("speaker-notes")).toBeNull();
  });
});
