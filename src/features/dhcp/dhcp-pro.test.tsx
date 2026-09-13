import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { dhcpLeaseTimelines, dhcpRfcChecks } from "./dhcp-pro.data";
import { LeaseTimingPlayer } from "./lease-timing-player";
import { leaseStateScenarios } from "./lease-state-flow.data";
import { DhcpRfcCheck } from "./rfc-check";

afterEach(cleanup);

describe("advanced DHCP lease timing", () => {
  it("places playback controls immediately after the animated lease packet topology", () => {
    const { container } = render(<LeaseTimingPlayer />);
    const topology = container.querySelector(".lease-packet-flow");
    expect(topology?.nextElementSibling).toContainElement(screen.getByRole("button", { name: "Restart" }));
  });
  it("shows state transitions with an animated DHCP packet when a message is sent", async () => {
    const user = userEvent.setup();
    render(<LeaseTimingPlayer />);
    expect(screen.getByRole("img", { name: "DHCP lease state diagram" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent("DHCPDISCOVER");
    expect(screen.getByTestId("dhcp-packet")).toBeVisible();
    expect(screen.getByTestId("state-selecting")).toHaveAttribute("data-active", "true");
  });

  it("sends an electrical pulse along the matching connector, but not during silence", async () => {
    const user = userEvent.setup();
    render(<LeaseTimingPlayer />);
    expect(screen.queryByTestId("dhcp-line-signal")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByTestId("dhcp-line-signal")).toHaveAttribute("data-route", "init-selecting");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByTestId("dhcp-line-signal")).toHaveAttribute("data-route", "selecting-offer");
    await user.click(screen.getByRole("radio", { name: "Expiry after silence" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.queryByTestId("dhcp-line-signal")).not.toBeInTheDocument();
  });

  it("covers the required states across normal, delayed, silent, and relay-delay timelines", () => {
    expect(dhcpLeaseTimelines.map(({ id }) => id)).toEqual(["normal-renewal", "delayed-renewal", "retry-silence", "relay-delay"]);
    const states = dhcpLeaseTimelines.flatMap(({ events }) => events.map(({ state }) => state));
    expect(states).toEqual(expect.arrayContaining(["Initial allocation", "BOUND", "T1 RENEWING", "T2 REBINDING", "Renewed by ACK", "Expired", "NAK received", "DECLINE sent", "RELEASE sent"]));
  });

  it("provides DORA, renewal, relay, release, expiry, NAK, and decline scenarios", () => {
    expect(leaseStateScenarios.map(({ title }) => title)).toEqual([
      "Initial DORA", "Normal renewal", "Delayed response", "Relay-path delay", "Release", "Expiry after silence", "NAK", "Decline",
    ]);
    expect(leaseStateScenarios.flatMap(({ steps }) => steps.map(({ message }) => message))).toEqual(expect.arrayContaining([
      "DHCPDISCOVER", "DHCPOFFER", "DHCPREQUEST", "DHCPACK", "DHCPRELEASE", "DHCPNAK", "DHCPDECLINE",
    ]));
  });

  it("does not animate a packet on lease expiry without an ACK", async () => {
    const user = userEvent.setup();
    render(<LeaseTimingPlayer />);
    await user.click(screen.getByRole("radio", { name: "Expiry after silence" }));
    expect(screen.getByRole("status")).toHaveTextContent("Lease active");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent("Expired");
    expect(screen.getByRole("status")).toHaveTextContent("No ACK · no packet arrived");
    expect(screen.queryByTestId("dhcp-packet")).not.toBeInTheDocument();
  });

  it("provides working shared playback controls", async () => {
    const user = userEvent.setup();
    render(<LeaseTimingPlayer />);
    expect(screen.getByRole("button", { name: "Play" }).closest(".player-controls")).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(screen.getByRole("button", { name: "Pause" })).toBeVisible();
  });
});

describe("RFC checks", () => {
  it("defines the required primary references and states the failover boundary", () => {
    expect(dhcpRfcChecks.map(({ referenceLabel }) => referenceLabel)).toEqual(["RFC 2131", "RFC 2132", "RFC 3046", "RFC 3118", "RFC 3442", "RFC 6607", "RFC 8156"]);
    expect(dhcpRfcChecks.at(-1)?.rule).toMatch(/DHCPv6 failover/i);
    expect(dhcpRfcChecks.at(-1)?.consequence).toMatch(/DHCPv4.*vendor-specific/i);
  });

  it("immediately explains an incorrect answer with rule, evidence, consequence, and source", async () => {
    const user = userEvent.setup();
    render(<DhcpRfcCheck check={dhcpRfcChecks[0]} />);
    await user.click(screen.getByLabelText("The client may keep the address after lease expiry"));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status")).toHaveTextContent("Incorrect");
    expect(screen.getByText(/address is no longer valid/i)).toBeVisible();
    expect(screen.getByText(/Packet evidence:/i)).toBeVisible();
    expect(screen.getByText(/Operational consequence:/i)).toBeVisible();
    expect(screen.getByRole("link", { name: /RFC 2131/i })).toHaveAttribute("href", expect.stringContaining("rfc-editor.org"));
  });

  it("classifies a correct answer and still reveals the complete explanation", async () => {
    const user = userEvent.setup();
    render(<DhcpRfcCheck check={dhcpRfcChecks[0]} />);
    await user.click(screen.getByLabelText("The client must stop using the address after lease expiry"));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status")).toHaveTextContent("Correct");
    expect(screen.getByText(/address is no longer valid/i)).toBeVisible();
  });
});
