import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { dhcpLeaseTimelines, dhcpRfcChecks } from "./dhcp-pro.data";
import { LeaseTimingPlayer } from "./lease-timing-player";
import { DhcpRfcCheck } from "./rfc-check";

afterEach(cleanup);

describe("advanced DHCP lease timing", () => {
  it("covers the required states across normal, delayed, silent, and relay-delay timelines", () => {
    expect(dhcpLeaseTimelines.map(({ id }) => id)).toEqual(["normal-renewal", "delayed-renewal", "retry-silence", "relay-delay"]);
    const states = dhcpLeaseTimelines.flatMap(({ events }) => events.map(({ state }) => state));
    expect(states).toEqual(expect.arrayContaining(["Initial allocation", "BOUND", "T1 RENEWING", "T2 REBINDING", "Renewed by ACK", "Expired", "NAK received", "DECLINE sent", "RELEASE sent"]));
  });

  it("derives position from seconds and exposes evidence at each selected point", async () => {
    const user = userEvent.setup();
    render(<LeaseTimingPlayer />);
    expect(screen.getByRole("status")).toHaveTextContent("0 seconds");
    expect(screen.getByRole("status")).toHaveTextContent("Initial allocation");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent("BOUND");
    expect(screen.getByText(/lease valid/i)).toBeVisible();
    expect(screen.getByTestId("lease-timeline-marker")).toHaveStyle({ left: "0%" });
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
