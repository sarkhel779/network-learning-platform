import { describe, expect, it } from "vitest";

import { dnsIncidents } from "./troubleshooting-scenarios";

describe("DNS troubleshooting incidents", () => {
  it("provides the approved evidence-first incident set", () => {
    expect(dnsIncidents.map(({ id }) => id)).toEqual([
      "nxdomain-vs-nodata", "resolver-timeout", "valid-ttl", "bad-delegation",
      "recursion-refused", "tcp-fallback", "tcp-blocked", "broken-cname-target",
    ]);
  });

  it("keeps only the NXDOMAIN/NODATA comparison public", () => {
    expect(dnsIncidents.filter(({ access }) => access === "public").map(({ id }) => id)).toEqual(["nxdomain-vs-nodata"]);
  });

  it("distinguishes a transport timeout from DNS response codes", () => {
    const timeout = dnsIncidents.find(({ id }) => id === "resolver-timeout")!;
    expect(timeout.diagnosis).toMatch(/transport timeout/i);
    expect(timeout.explanation).toMatch(/no DNS response/i);
    expect(timeout.choices).toContain("NXDOMAIN response");
  });
});
