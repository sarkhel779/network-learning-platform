import { cleanup, render, screen } from "@testing-library/react";
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
  it("server-renders one beginner-focused device panel and all three selectors", () => {
    const markup = renderToStaticMarkup(<SwitchingComparison />);
    expect(markup).toContain("Hub");
    expect(markup).toContain("Bridge");
    expect(markup).toContain("Switch");
    expect(markup.match(/class="switching-device-card"/g)).toHaveLength(1);
    expect(markup).toContain("Hub repeats the incoming physical signal");
  });

  it("shows one selected device and answers the three beginner questions", async () => {
    const user = userEvent.setup();
    render(<SwitchingComparison />);
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Hub" })).toBeVisible();
    expect(screen.getByText("Host A sends")).toBeVisible();
    expect(screen.getByText(/Hub copies the signal to both Host B and Host C/i)).toBeVisible();
    expect(screen.getByText(/a hub is like a loudspeaker/i)).toBeVisible();
    expect(screen.getByText(/swipe sideways to follow the packet/i)).toBeVisible();
    for (const question of ["What entered?", "Where did it leave?", "What did it inspect or learn?"]) {
      expect(screen.getByText(question)).toBeVisible();
    }

    await user.click(screen.getByRole("radio", { name: "Switch" }));
    await user.click(screen.getByRole("radio", { name: "Delivery scope" }));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Switch" })).toBeVisible();
    expect(screen.getByText(/a switch is more selective/i)).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Hub" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /switch.*delivery scope/i })).toBeVisible();
  });

  it("preserves discrete ingress, action, and egress labels under reduced motion", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
    render(<SwitchingComparison />);
    expect(screen.getByRole("button", { name: "Play" })).toBeEnabled();
    expect(screen.getByText("Stage 1 of 3")).toBeVisible();
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
