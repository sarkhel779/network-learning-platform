import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMDXComponents } from "../../../mdx-components";
import { RoutingProtocolSelectorPlayer } from "./routing-protocol-selector-player";

beforeEach(() => vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("RoutingProtocolSelectorPlayer", () => {
  it("server-renders a useful first scenario", () => {
    const markup = renderToStaticMarkup(<RoutingProtocolSelectorPlayer />);
    expect(markup).toContain("A small lab with two routers");
    expect(markup).toContain("Recommended protocol");
    expect(markup).toContain("Static routing");
  });

  it("shows a scenario picker and coordinated result regions", () => {
    render(<RoutingProtocolSelectorPlayer />);
    expect(screen.getByRole("group", { name: "Choose a network scenario" })).toBeVisible();
    expect(within(screen.getByRole("region", { name: "Recommended protocol" })).getByText("Static routing")).toBeVisible();
    expect(screen.getByText(/Running a link-state protocol for two routers/)).toBeVisible();
  });

  it("updates the recommendation and ruled-out list when the scenario changes", async () => {
    const user = userEvent.setup();
    render(<RoutingProtocolSelectorPlayer />);
    await user.click(screen.getByRole("radio", { name: "Connecting two independently administered networks" }));
    expect(within(screen.getByRole("region", { name: "Recommended protocol" })).getByText("BGP")).toBeVisible();
    expect(screen.getByText(/autonomous systems is exactly what BGP is designed for/)).toBeVisible();
    expect(screen.getByText(/OSPF assumes one administrative domain/)).toBeVisible();
  });

  it("marks the interactive complete only once the finish button is used", async () => {
    const user = userEvent.setup();
    render(<RoutingProtocolSelectorPlayer />);
    const finish = screen.getByRole("button", { name: "Finish scenario" });
    expect(finish).toBeEnabled();
    await user.click(finish);
    expect(screen.queryByRole("button", { name: "Retry saving" })).not.toBeInTheDocument();
  });

  it("registers only the public player in the shared MDX map", () => {
    const components = useMDXComponents({});
    expect(components.RoutingProtocolSelectorPlayer).toBe(RoutingProtocolSelectorPlayer);
  });

  it("provides 44px controls for scenario choices", () => {
    const style = document.head.appendChild(document.createElement("style"));
    style.textContent = readFileSync(join(process.cwd(), "src", "app", "globals.css"), "utf8");
    try {
      render(<RoutingProtocolSelectorPlayer />);
      for (const radio of screen.getAllByRole("radio")) expect(Number.parseFloat(getComputedStyle(radio.closest("label")!).minBlockSize)).toBeGreaterThanOrEqual(44);
    } finally { style.remove(); }
  });
});
