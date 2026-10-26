import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FloatingTopology } from "./floating-topology";

afterEach(cleanup);

let capturedCallback: IntersectionObserverCallback | null = null;

beforeEach(() => {
  capturedCallback = null;
  class StubIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];
    constructor(callback: IntersectionObserverCallback) { capturedCallback = callback; }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
  }
  vi.stubGlobal("IntersectionObserver", StubIntersectionObserver);

  class StubResizeObserver implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", StubResizeObserver);
});

afterEach(() => vi.unstubAllGlobals());

function fireIntersection(isIntersecting: boolean, top: number) {
  act(() => {
    capturedCallback?.(
      [{ isIntersecting, boundingClientRect: { top } } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
}

describe("FloatingTopology", () => {
  it("docks to a scaled-down floating box once the diagram scrolls above the viewport", () => {
    render(
      <FloatingTopology>
        <div data-testid="diagram-content">topology</div>
      </FloatingTopology>,
    );

    const box = screen.getByTestId("diagram-content").closest(".floating-topology__box")!;
    vi.spyOn(box, "getBoundingClientRect").mockReturnValue({
      top: 100, left: 0, bottom: 450, right: 1100, width: 1100, height: 350, x: 0, y: 100, toJSON: () => ({}),
    });
    Object.defineProperty(box, "offsetWidth", { value: 1100, configurable: true });
    Object.defineProperty(box, "offsetHeight", { value: 350, configurable: true });

    expect(box.className).not.toContain("floating-topology__box--docked");

    fireIntersection(false, -40);

    expect(box.className).toContain("floating-topology__box--docked");
  });

  it("stays undocked while the diagram's natural slot is still below the viewport", () => {
    render(
      <FloatingTopology>
        <div data-testid="diagram-content">topology</div>
      </FloatingTopology>,
    );

    const box = screen.getByTestId("diagram-content").closest(".floating-topology__box")!;

    fireIntersection(false, 400);

    expect(box.className).not.toContain("floating-topology__box--docked");
  });

  it("undocks again once the diagram's natural slot scrolls back into view", () => {
    render(
      <FloatingTopology>
        <div data-testid="diagram-content">topology</div>
      </FloatingTopology>,
    );

    const box = screen.getByTestId("diagram-content").closest(".floating-topology__box")!;
    vi.spyOn(box, "getBoundingClientRect").mockReturnValue({
      top: 100, left: 0, bottom: 450, right: 1100, width: 1100, height: 350, x: 0, y: 100, toJSON: () => ({}),
    });
    Object.defineProperty(box, "offsetWidth", { value: 1100, configurable: true });
    Object.defineProperty(box, "offsetHeight", { value: 350, configurable: true });

    fireIntersection(false, -40);
    expect(box.className).toContain("floating-topology__box--docked");

    fireIntersection(true, 80);
    expect(box.className).not.toContain("floating-topology__box--docked");
  });
});
