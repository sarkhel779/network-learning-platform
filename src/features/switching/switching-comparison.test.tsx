import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useMDXComponents } from "../../../mdx-components";
import { SwitchingComparison } from "./switching-comparison";

beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("SwitchingComparison", () => {
  it("server-renders three meaningful panels in a safe reduced-motion state", () => {
    const markup = renderToStaticMarkup(<SwitchingComparison />);
    expect(markup).toContain("Hub");
    expect(markup).toContain("Bridge");
    expect(markup).toContain("Switch");
    expect(markup.match(/data-motion="reduced"/g)).toHaveLength(3);
    expect(markup).toContain("Hub repeats the incoming physical signal");
  });

  it("changes meaningful explanations and non-color behaviors for every dimension", async () => {
    const user = userEvent.setup();
    const { container } = render(<SwitchingComparison />);
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByRole("img", { name: "Three hosts connected through the selected Ethernet intermediary" })).toBeVisible();

    const expected = {
      "Signal handling": ["repeat", "segment", "forward"],
      "Collision scope": ["repeat", "segment", "segment"],
      "Bandwidth sharing": ["repeat", "segment", "forward"],
      "Address awareness": ["repeat", "learn", "learn"],
      "Delivery scope": ["flood", "filter", "forward"],
    } as const;

    for (const [dimension, behaviors] of Object.entries(expected)) {
      await user.click(screen.getByRole("radio", { name: dimension }));
      const cards = screen.getAllByRole("article");
      behaviors.forEach((behavior, index) => {
        expect(cards[index]).toHaveAttribute("data-behavior", behavior);
        expect(within(cards[index]).getByText(/Behavior:/)).toBeVisible();
      });
    }
    expect(container.querySelectorAll("[data-port]")).toHaveLength(3);
  });

  it("preserves discrete ingress, action, and egress labels under reduced motion", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
    render(<SwitchingComparison />);
    for (const path of screen.getAllByRole("img", { name: /traffic path/i })) {
      expect(path).toHaveAttribute("data-motion", "reduced");
      expect(path).toHaveTextContent("Ingress");
      expect(path).toHaveTextContent("Action");
      expect(path).toHaveTextContent("Egress");
    }
  });

  it("registers only the public switching comparison in the shared MDX map", () => {
    const components = useMDXComponents({});
    expect(components.SwitchingComparison).toBe(SwitchingComparison);
    expect(components).not.toHaveProperty("FrameForwardingExperience");
  });

  it("gives comparison controls accessible touch targets", () => {
    const stylesheet = document.head.appendChild(document.createElement("style"));
    stylesheet.textContent = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");
    try {
      render(<SwitchingComparison />);
      for (const control of screen.getAllByRole("radio")) {
        expect(Number.parseFloat(getComputedStyle(control.closest("label")!).minBlockSize)).toBeGreaterThanOrEqual(44);
      }
    } finally {
      stylesheet.remove();
    }
  });
});
import { readFileSync } from "node:fs";
import { join } from "node:path";
