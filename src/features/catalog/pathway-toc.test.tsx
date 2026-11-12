import { act, cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { PathwayToc } from "./pathway-toc";

afterEach(cleanup);

const modules = [
  { id: "module_one", title: "Computer Network Basics" },
  { id: "module_two", title: "Ethernet, Switching and Local Networks" },
];

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

describe("PathwayToc", () => {
  it("shows every module link by default", () => {
    render(<PathwayToc modules={modules} />);

    const nav = screen.getByRole("navigation", { name: "Jump to module" });
    expect(within(nav).getAllByRole("link")).toHaveLength(2);
    expect(screen.getByRole("button", { name: /jump to module/i })).toHaveAttribute("aria-expanded", "true");
  });

  it("hides the links and flips aria-expanded when the toggle is clicked, then restores them on a second click", async () => {
    const user = userEvent.setup();
    render(<PathwayToc modules={modules} />);

    const toggle = screen.getByRole("button", { name: /jump to module/i });
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("auto-collapses once scrolled past its natural position, and expands again when scrolled back", () => {
    render(<PathwayToc modules={modules} />);
    const toggle = screen.getByRole("button", { name: /jump to module/i });

    fireIntersection(false, -40);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    fireIntersection(true, 80);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("does not auto-collapse while the sentinel is merely below the viewport, not yet scrolled past", () => {
    render(<PathwayToc modules={modules} />);
    const toggle = screen.getByRole("button", { name: /jump to module/i });

    fireIntersection(false, 400);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});
