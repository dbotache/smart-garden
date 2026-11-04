import { describe, expect, it } from "vitest";
import { clampSlide, deckKeyAction, parseSlideHash } from "../utils/keyboard";

const el = (html: string) => {
  const d = document.createElement("div");
  d.innerHTML = html;
  document.body.appendChild(d);
  return d.firstElementChild!;
};

describe("deck keyboard rules", () => {
  it("maps arrows, clicker keys and Home/End", () => {
    expect(deckKeyAction({ key: "ArrowRight" })).toBe("next");
    expect(deckKeyAction({ key: "PageDown" })).toBe("next");
    expect(deckKeyAction({ key: "ArrowLeft" })).toBe("prev");
    expect(deckKeyAction({ key: "PageUp" })).toBe("prev");
    expect(deckKeyAction({ key: "Home" })).toBe("first");
    expect(deckKeyAction({ key: "End" })).toBe("last");
    expect(deckKeyAction({ key: "f" })).toBe("fullscreen");
    expect(deckKeyAction({ key: "n" })).toBe("notes");
    expect(deckKeyAction({ key: "Escape" })).toBe("escape");
    expect(deckKeyAction({ key: "x" })).toBeNull();
  });

  it("uses Space for next/previous only when nothing interactive has focus", () => {
    expect(deckKeyAction({ key: " ", target: document.body })).toBe("next");
    expect(deckKeyAction({ key: " ", shiftKey: true, target: document.body })).toBe("prev");
    expect(deckKeyAction({ key: " ", target: el("<button>b</button>") })).toBeNull();
    expect(deckKeyAction({ key: " ", target: el("<a href='#'>a</a>") })).toBeNull();
    const garden = el("<section data-garden-root><div><span>x</span></div></section>");
    expect(deckKeyAction({ key: " ", target: garden.querySelector("span") })).toBeNull();
  });

  it("ignores typing, modifiers and keys a widget already handled", () => {
    expect(deckKeyAction({ key: "ArrowRight", target: el("<input />") })).toBeNull();
    expect(deckKeyAction({ key: "ArrowRight", target: el("<textarea></textarea>") })).toBeNull();
    expect(deckKeyAction({ key: "ArrowRight", ctrlKey: true })).toBeNull();
    expect(deckKeyAction({ key: "ArrowRight", defaultPrevented: true })).toBeNull();
  });

  it("leaves arrows to a focused slider but lets presenter clickers (PageUp/PageDown) navigate", () => {
    const range = el("<input type='range' />");
    expect(deckKeyAction({ key: "ArrowRight", target: range })).toBeNull();
    expect(deckKeyAction({ key: "ArrowLeft", target: range })).toBeNull();
    expect(deckKeyAction({ key: "Home", target: range })).toBeNull();
    expect(deckKeyAction({ key: " ", target: range })).toBeNull();
    expect(deckKeyAction({ key: "PageDown", target: range })).toBe("next");
    expect(deckKeyAction({ key: "PageUp", target: range })).toBe("prev");
    expect(deckKeyAction({ key: "PageDown", target: el("<input type='text' />") })).toBeNull();
  });

  it("parses and clamps slide hashes", () => {
    expect(parseSlideHash("#/7", 13)).toBe(6);
    expect(parseSlideHash("#3", 13)).toBe(2);
    expect(parseSlideHash("#/99", 13)).toBe(12);
    expect(parseSlideHash("#/0", 13)).toBe(0);
    expect(parseSlideHash("#/abc", 13)).toBe(0);
    expect(parseSlideHash("", 13)).toBe(0);
    expect(clampSlide(-3, 13)).toBe(0);
  });
});
