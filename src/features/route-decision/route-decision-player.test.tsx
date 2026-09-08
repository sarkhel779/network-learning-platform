import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMDXComponents } from "../../../mdx-components";
import { RouteDecisionPlayer } from "./route-decision-player";

beforeEach(() => vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("RouteDecisionPlayer", () => {
  it("server-renders a useful first scenario in reduced-motion mode", () => {
    const markup = renderToStaticMarkup(<RouteDecisionPlayer />);
    expect(markup).toContain("A neighbour on the local subnet");
    expect(markup).toContain("Packet journey: step by step");
    expect(markup).toContain("On-link");
    expect(markup).not.toMatch(/off-link-gateway|wrong-prefix|router-no-onward-route/);
  });

  it("shows a labelled packet journey and coordinated decision regions", () => {
    render(<RouteDecisionPlayer />);
    expect(screen.getByRole("group", { name: "Choose a route decision scenario" })).toBeVisible();
    expect(screen.getByRole("img", { name: /packet journey for a neighbour/i })).toBeVisible();
    expect(screen.getByText("Stage 1 of 3")).toBeVisible();
    expect(screen.getByText("Host eth0", { exact: true })).toBeVisible();
    expect(screen.getByText("Router LAN", { exact: true })).toBeVisible();
    expect(screen.getByText("Router WAN", { exact: true })).toBeVisible();
    expect(within(screen.getByRole("region", { name: "Decision" })).getByText("On-link")).toBeVisible();
    expect(within(screen.getByRole("region", { name: "First frame" })).getByText("Destination host")).toBeVisible();
  });

  it("updates every result together for gateway and no-route cases", async () => {
    const user = userEvent.setup();
    render(<RouteDecisionPlayer />);
    await user.click(screen.getByRole("radio", { name: "A server beyond the local network" }));
    expect(screen.getByText("Stage 1 of 6")).toBeVisible();
    expect(screen.getByRole("region", { name: "Decision" })).toHaveTextContent("Remote via gateway");
    expect(screen.getByRole("region", { name: "Next hop" })).toHaveTextContent("192.0.2.1");
    expect(screen.getByRole("region", { name: "First frame" })).toHaveTextContent("Gateway interface");
    expect(screen.getByRole("region", { name: "Boundary action" })).toHaveTextContent("Route unicast");
    expect(screen.queryByText("Destination host")).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "A remote network with no usable route" }));
    expect(screen.getByRole("region", { name: "Decision" })).toHaveTextContent("No route");
    expect(screen.getByRole("region", { name: "Outgoing interface" })).toHaveTextContent("None");
    expect(screen.getByRole("region", { name: "First frame" })).toHaveTextContent("No frame");
  });

  it("handles the gateway itself and broadcast boundary without stale state", async () => {
    const user = userEvent.setup();
    render(<RouteDecisionPlayer />);
    await user.click(screen.getByRole("radio", { name: "Contact the gateway itself" }));
    expect(screen.getByRole("region", { name: "Decision" })).toHaveTextContent("On-link");
    expect(screen.getByRole("region", { name: "First frame" })).toHaveTextContent("Destination host");
    await user.click(screen.getByRole("radio", { name: "A local broadcast reaches the router boundary" }));
    expect(screen.getByRole("region", { name: "Decision" })).toHaveTextContent("Local broadcast");
    expect(screen.getByRole("region", { name: "Boundary action" })).toHaveTextContent("Stop broadcast");
    expect(screen.queryByText("Gateway interface")).not.toBeInTheDocument();
  });

  it("supports keyboard radio selection", async () => {
    const user = userEvent.setup();
    render(<RouteDecisionPlayer />);
    const first = screen.getByRole("radio", { name: "A neighbour on the local subnet" });
    first.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "A server beyond the local network" })).toBeChecked();
  });

  it("registers only the public player in the MDX component map", () => {
    const components = useMDXComponents({});
    expect(components.RouteDecisionPlayer).toBe(RouteDecisionPlayer);
    expect(components).not.toHaveProperty("RouteDecisionLab");
  });
});
