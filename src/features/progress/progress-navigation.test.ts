import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { focusLessonAnchor } from "./progress-navigation";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

beforeEach(() => {
  window.scrollBy = vi.fn();
});

describe("focusLessonAnchor", () => {
  it("focuses the anchor and scrolls it into view", () => {
    document.body.innerHTML = `<section><div id="hop-1"></div></section>`;
    const target = document.getElementById("hop-1")!;
    target.scrollIntoView = vi.fn();

    const result = focusLessonAnchor("hop-1");

    expect(result).toBe(true);
    expect(target.scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: "start" }));
    expect(document.activeElement).toBe(target);
    expect(target.getAttribute("tabindex")).toBe("-1");
  });

  it("returns false and does nothing when the anchor does not exist", () => {
    const result = focusLessonAnchor("missing-anchor");

    expect(result).toBe(false);
  });
});
