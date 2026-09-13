import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { doraScenarios } from "./dora-journeys";
import { DhcpPacketInspector } from "./dhcp-packet-inspector";
import { DhcpTopology } from "./dhcp-topology";
import { relayScenarios } from "./relay-journeys";

describe("DHCP inspection views", () => {
  it("separates delivery evidence and every protocol layer", () => {
    render(<DhcpPacketInspector packet={doraScenarios[0].steps[0].packet} />);
    for (const name of ["Ethernet", "IPv4", "UDP", "BOOTP/DHCP", "DHCP options"]) {
      expect(screen.getByRole("region", { name })).toBeVisible();
    }
    expect(screen.getByText("DHCP broadcast flag").closest("tr")).toHaveTextContent("set");
    expect(screen.getByText("IPv4 destination").closest("tr")).toHaveTextContent("255.255.255.255");
    expect(screen.getByText("Ethernet destination").closest("tr")).toHaveTextContent("ff:ff:ff:ff:ff:ff");
  });

  it("describes every fixed BOOTP field with size, value, purpose, and significance", () => {
    render(<DhcpPacketInspector packet={doraScenarios[0].steps[1].packet} />);
    const header = within(screen.getAllByRole("region", { name: "BOOTP/DHCP" }).at(-1)!);
    for (const field of ["op", "htype", "hlen", "hops", "xid", "secs", "flags", "ciaddr", "yiaddr", "siaddr", "giaddr", "chaddr", "sname", "file", "magic cookie"]) {
      const row = header.getByText(field).closest("tr");
      expect(row).toHaveTextContent(/bits|bytes/);
      expect(row).toHaveTextContent(/Purpose:/);
      expect(row).toHaveTextContent(/Here:/);
    }
  });

  it("renders direct and relay topologies with labelled interfaces", () => {
    const { rerender } = render(<DhcpTopology step={doraScenarios[0].steps[0]} mode="direct" />);
    expect(screen.getByLabelText("Direct DHCP topology")).toHaveTextContent("Client interface");
    rerender(<DhcpTopology step={relayScenarios[0].steps[1]} mode="relay" />);
    expect(screen.getByLabelText("Relayed DHCP topology")).toHaveTextContent("Client broadcast domain");
    expect(screen.getByLabelText("Relayed DHCP topology")).toHaveTextContent("Server subnet");
  });

  it("shows recognizable devices and a packet on the correct active leg", () => {
    const { rerender, container } = render(<DhcpTopology step={doraScenarios[0].steps[0]} mode="direct" />);
    expect(screen.getByRole("img", { name: /direct DHCP packet traversal/i }).querySelectorAll('[data-device]')).toHaveLength(2);
    expect(container.querySelector('[data-packet-leg="client-to-server"]')).not.toBeNull();
    rerender(<DhcpTopology step={relayScenarios[0].steps[1]} mode="relay" />);
    expect(container.querySelectorAll('svg[aria-label*="relayed DHCP packet traversal"] [data-device]')).toHaveLength(3);
    expect(container.querySelector('[data-packet-leg="relay-to-server"]')).not.toBeNull();
  });
});
