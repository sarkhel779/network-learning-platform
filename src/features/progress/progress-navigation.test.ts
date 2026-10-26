import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { focusLessonAnchor } from "./progress-navigation";

function mockRect(el: HTMLElement, top: number, height: number) {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    top,
    height,
    bottom: top + height,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: top,
    toJSON() { return {}; },
  });
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

beforeEach(() => {
  window.scrollBy = vi.fn();
});

describe("focusLessonAnchor", () => {
  it("falls back to scrollIntoView when there is no sticky diagram in the lab section", () => {
    document.body.innerHTML = `<section class="sample-lab"><div id="hop-1"></div></section>`;
    const target = document.getElementById("hop-1")!;
    target.scrollIntoView = vi.fn();

    const result = focusLessonAnchor("hop-1");

    expect(result).toBe(true);
    expect(target.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: "start" }));
    expect(window.scrollBy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(target);
  });

  it("scrolls by an offset that clears the sticky diagram instead of jumping under it", () => {
    document.body.innerHTML = `
      <section class="sample-lab">
        <div class="labs-sticky-diagram"></div>
        <div id="hop-2"></div>
      </section>
    `;
    const stickyDiagram = document.querySelector<HTMLElement>(".labs-sticky-diagram")!;
    const target = document.getElementById("hop-2")!;
    target.scrollIntoView = vi.fn();
    stickyDiagram.style.top = "72px";
    mockRect(stickyDiagram, 72, 353);
    mockRect(target, 900, 40);

    const result = focusLessonAnchor("hop-2");

    expect(result).toBe(true);
    expect(target.scrollIntoView).not.toHaveBeenCalled();
    // reserved = 353 (diagram height) + 72 (sticky top offset) + 16 (gap) = 441
    // delta = target.top (900) - reserved (441) = 459
    expect(window.scrollBy).toHaveBeenCalledWith(expect.objectContaining({ top: 459 }));
  });

  it("returns false and does nothing when the anchor does not exist", () => {
    const result = focusLessonAnchor("missing-anchor");

    expect(result).toBe(false);
    expect(window.scrollBy).not.toHaveBeenCalled();
  });
});
