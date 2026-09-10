import { describe, expect, it } from "vitest";

import { buildResolutionJourney, resolutionScenarios } from "./resolution-journeys";

const scenario = (id: string) => resolutionScenarios.find((candidate) => candidate.id === id)!;

describe("DNS resolution journeys", () => {
  it("offers every approved deterministic scenario", () => {
    expect(resolutionScenarios.map(({ id }) => id)).toEqual([
      "cold-cache", "warm-cache", "cname-chain", "aaaa-answer", "truncated-tcp-retry", "nxdomain",
    ]);
  });

  it("separates the stub recursive request from iterative upstream referrals", () => {
    const steps = buildResolutionJourney(scenario("cold-cache"));
    expect(steps[0].roles).toEqual({ sender: "stub", receiver: "recursive" });
    expect(steps[0].message.header.rd).toBe(true);
    expect(steps.filter(({ classification }) => classification === "referral").map(({ roles }) => roles.sender)).toEqual(["root", "tld"]);
    expect(steps.at(-1)?.classification).toBe("answer");
    expect(steps.at(-1)?.cache.result).toBe("store");
    expect(steps.filter(({ terminal }) => terminal)).toHaveLength(1);
  });

  it("uses a warm cache without contacting authoritative infrastructure", () => {
    const steps = buildResolutionJourney(scenario("warm-cache"));
    expect(steps.some(({ roles }) => ["root", "tld", "authoritative"].includes(roles.receiver))).toBe(false);
    expect(steps.at(-1)?.cache.result).toBe("hit");
  });

  it("models CNAME and AAAA answers as distinct record paths", () => {
    expect(buildResolutionJourney(scenario("cname-chain")).flatMap(({ message }) => message.answer.map(({ type }) => type))).toEqual(expect.arrayContaining(["CNAME", "A"]));
    expect(buildResolutionJourney(scenario("aaaa-answer")).at(-1)?.message.answer[0]).toMatchObject({ type: "AAAA", data: "2001:db8::80" });
  });

  it("retries a truncated UDP response over TCP port 53", () => {
    const steps = buildResolutionJourney(scenario("truncated-tcp-retry"));
    const truncated = steps.find(({ message }) => message.header.tc)!;
    expect(truncated.message.transport).toBe("UDP");
    const tcpQuery = steps[steps.indexOf(truncated) + 1];
    expect(tcpQuery.message).toMatchObject({ transport: "TCP", destinationPort: 53 });
  });

  it("models NXDOMAIN with authoritative SOA evidence", () => {
    const terminal = buildResolutionJourney(scenario("nxdomain")).at(-1)!;
    expect(terminal.message.header.rcode).toBe("NXDOMAIN");
    expect(terminal.message.authority.some(({ type }) => type === "SOA")).toBe(true);
    expect(terminal.cache.result).toBe("negative-store");
  });
});
