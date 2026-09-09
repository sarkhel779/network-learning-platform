import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Ipv6AddressExplorer } from "./ipv6-address-explorer";

describe("Ipv6AddressExplorer", () => {
  afterEach(cleanup);
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", { configurable: true, value: vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
  });
  it("shows the complete default address analysis and playback controls", () => {
    render(<Ipv6AddressExplorer />);
    expect(screen.getByText("2001:db8:0:0:20c:29ff:fe9c:409/64")).toBeVisible();
    expect(screen.getAllByTestId("ipv6-hextet")).toHaveLength(8);
    expect(screen.getByText("2001:db8::20c:29ff:fe9c:409")).toBeVisible();
    expect(screen.getByText("64 network bits · 64 interface bits")).toBeVisible();
    expect(screen.getByRole("button", { name: "Restart" })).toBeVisible();
    expect(screen.getByLabelText("Playback speed")).toBeVisible();
  });

  it("keeps the last valid view and explains invalid direct input", () => {
    render(<Ipv6AddressExplorer />);
    fireEvent.change(screen.getByLabelText("Try an IPv6 address and prefix"), { target: { value: "2001::db8::1/64" } });
    fireEvent.click(screen.getByRole("button", { name: "Explore address" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter one valid IPv6 address and a prefix from /0 to /128.");
    expect(screen.getByText("2001:db8::20c:29ff:fe9c:409")).toBeVisible();
  });

  it("offers curated address types and resets to the selected analysis", () => {
    render(<Ipv6AddressExplorer />);
    expect(screen.getAllByRole("radio")).toHaveLength(6);
    fireEvent.click(screen.getByRole("radio", { name: "Link-local neighbour" }));
    expect(screen.getByText("fe80::20c:29ff:fe9c:409/64")).toBeVisible();
    expect(screen.getByText("link-local")).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Step 1 of 7");
  });
});
