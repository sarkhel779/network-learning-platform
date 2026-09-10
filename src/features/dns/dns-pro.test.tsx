import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { dnsRfcChecks, dnsTimingScenarios, dnssecWalkthrough, rootBootstrapScenario } from "./dns-pro.data";
import { DnsRfcCheck } from "./dns-rfc-check";
import { DnsTimingPlayer } from "./dns-timing-player";
import { RootBootstrapPlayer } from "./root-bootstrap-player";

afterEach(cleanup);

describe("DNS Pro experiences", () => {
  it("provides every approved timing mode in chronological order", () => {
    expect(dnsTimingScenarios.map(({ id }) => id)).toEqual(["cold-cache", "warm-cache", "delayed-authority", "tcp-fallback", "resolver-timeout", "dnssec-validation"]);
    for (const scenario of dnsTimingScenarios) expect(scenario.events.map(({ milliseconds }) => milliseconds)).toEqual([...scenario.events.map(({ milliseconds }) => milliseconds)].sort((a, b) => a - b));
  });

  it("synchronizes selected timing events and cache evidence", async () => {
    const user = userEvent.setup();
    render(<DnsTimingPlayer />);
    await user.selectOptions(screen.getByLabelText(/timing scenario/i), "tcp-fallback");
    expect(screen.getByRole("status")).toHaveTextContent("UDP response truncated");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent(/TCP retry/i);
    expect(screen.getByText(/TC=1/i)).toBeVisible();
  });

  it("returns immediate standards feedback with primary references", async () => {
    const user = userEvent.setup();
    render(<DnsRfcCheck check={dnsRfcChecks[0]} />);
    await user.click(screen.getByLabelText(/retry over TCP/i));
    await user.click(screen.getByRole("button", { name: /check answer/i }));
    const feedback = screen.getByRole("status");
    expect(feedback).toHaveTextContent(/rule/i);
    expect(feedback).toHaveTextContent(/evidence/i);
    expect(feedback).toHaveTextContent(/consequence/i);
    expect(screen.getByRole("link", { name: /RFC 7766/i })).toHaveAttribute("href", expect.stringContaining("rfc-editor.org"));
  });

  it("models the DNSSEC chain and authenticated denial records", () => {
    expect(dnssecWalkthrough.map(({ record }) => record)).toEqual(["DS", "DNSKEY", "RRSIG", "NSEC/NSEC3"]);
    expect(dnssecWalkthrough.every(({ explanation }) => explanation.length > 20)).toBe(true);
  });

  it("explains the root dot, hints, logical identities, anycast, and cached delegation", async () => {
    const user = userEvent.setup();
    expect(rootBootstrapScenario.steps).toHaveLength(6);
    render(<RootBootstrapPlayer />);
    expect(screen.getByText(/final dot represents the DNS root/i)).toBeVisible();
    expect(screen.getByText(/root hints/i)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent(/A through M are logical identities/i);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent(/many distributed anycast instances/i);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent(/cached delegation/i);
  });
});
