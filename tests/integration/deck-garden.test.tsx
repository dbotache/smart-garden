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

describe("slide deck", () => {
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
