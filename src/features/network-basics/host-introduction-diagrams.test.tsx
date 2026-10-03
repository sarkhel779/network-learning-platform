import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ClientServerOverview, HostInterfaceOverview } from "./host-introduction-diagrams";

afterEach(cleanup);
describe("Host introduction diagrams", () => {
  it("labels wired and wireless connection examples independently of line colour", () => {
    const { container } = render(<HostInterfaceOverview />);
    const view = within(container);
    expect(view.getByRole("figure", { name: "Two ways a laptop can join a network" })).toBeVisible();
    expect(view.getByText("Ethernet cable")).toBeVisible();
    expect(view.getByText("Wi-Fi radio link")).toBeVisible();
    expect(container.querySelector('[data-device-symbol="switch"]')).toBeInTheDocument();
    expect(container.querySelector('[data-device-symbol="access-point"]')).toBeInTheDocument();
  });
  it("makes request and response directions available without animation", () => {
    const { container } = render(<ClientServerOverview />);
    const view = within(container);
    expect(view.getByRole("figure", { name: "Client requests a service; server responds" })).toBeVisible();
    expect(view.getByText("Client → Server: request a page")).toBeVisible();
    expect(view.getByText("Server → Client: return the page")).toBeVisible();
    expect(container.querySelector('[data-host-device-icon="laptop"]')).toBeInTheDocument();
    expect(container.querySelector('[data-host-device-icon="physical-server"]')).toBeInTheDocument();
  });
});
