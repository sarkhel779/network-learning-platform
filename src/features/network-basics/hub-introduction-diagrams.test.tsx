import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HubPortOverview, HubSharedMediumOverview } from "./hub-introduction-diagrams";

afterEach(cleanup);

describe("Hub introduction diagrams", () => {
  it("labels the sender and every receiving port without treating the hub as a destination", () => {
    render(<HubPortOverview />);
    const diagram = screen.getByRole("figure", { name: /four hosts connected to a hub/i });
    expect(within(diagram).getByText("Laptop")).toBeVisible();
    expect(within(diagram).getByText("Workstation")).toBeVisible();
    expect(within(diagram).getByText("Printer")).toBeVisible();
    expect(within(diagram).getByText("Server")).toBeVisible();
    expect(within(diagram).getByText("For me — accepted")).toBeVisible();
    expect(within(diagram).getAllByText("Not for me — ignored")).toHaveLength(2);
    const cables = diagram.querySelectorAll("[data-hub-cable]");
    expect(cables).toHaveLength(4);
    // The laptop's right screen edge is x=100+29 at y=200.
    expect(cables[0]).toHaveAttribute("d", "M129 200 H278");
    expect([...cables].map((cable) => cable.getAttribute("data-hub-cable"))).toEqual([
      "laptop-port-1", "port-2-workstation", "port-3-printer", "port-4-server",
    ]);
  });

  it("presents one shared medium rather than separate capacity for each host", () => {
    render(<HubSharedMediumOverview />);
    const diagram = screen.getByRole("figure", { name: /one shared communication space/i });
    expect(within(diagram).getByText(/not a separate allowance for each port/i)).toBeVisible();
    expect(within(diagram).getByText(/signals can collide/i)).toBeVisible();
  });
});
