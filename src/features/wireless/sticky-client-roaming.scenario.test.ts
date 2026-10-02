import { describe, expect, it } from "vitest";

import { stickyClientRoamingScenario } from "./sticky-client-roaming.scenario";

const fieldsFor = (stepId: string) => {
  const step = stickyClientRoamingScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

describe("Sticky client and roaming trigger scenario", () => {
  it("parses with a client linked to both APs", () => {
    expect(stickyClientRoamingScenario.devices.map((device) => device.id)).toEqual(["ap1", "client", "ap2"]);
    expect(stickyClientRoamingScenario.links.map((link) => link.id)).toEqual(["client-ap1", "client-ap2"]);
  });

  it("walks the unassisted sticky-client path before the assisted one", () => {
    expect(stickyClientRoamingScenario.steps.map((step) => step.id)).toEqual([
      "client-starts-strongly-connected-to-ap1",
      "client-walks-away-signal-degrades-but-stays-connected",
      "ap2-is-now-the-better-choice-but-client-stays-put",
      "client-finally-roams-only-after-signal-is-nearly-gone",
      "80211k-gives-the-client-a-neighbor-report",
      "80211v-proactively-suggests-the-move",
      "assisted-roam-happens-much-earlier",
      "site-design-and-client-assistance-both-matter",
    ]);
  });

  it("shows the client staying attached to a weakening AP1 even once AP2 is stronger", () => {
    expect(summaryValue("ap2-is-now-the-better-choice-but-client-stays-put", "RSSI to AP1")).toBe("-74 dBm (poor)");
    expect(summaryValue("ap2-is-now-the-better-choice-but-client-stays-put", "RSSI to AP2 (unknown to client)")).toContain("stronger");
    expect(fieldsFor("ap2-is-now-the-better-choice-but-client-stays-put").detailFields[0]?.value).toBe("AP1");
  });

  it("only roams unassisted once the signal is nearly gone", () => {
    expect(summaryValue("client-finally-roams-only-after-signal-is-nearly-gone", "RSSI to AP1 at roam")).toContain("-82 dBm");
    expect(summaryValue("client-finally-roams-only-after-signal-is-nearly-gone", "Roam trigger")).toMatch(/client's own threshold/i);
  });

  it("uses 802.11k and 802.11v frames to pull the roam decision forward", () => {
    expect(summaryValue("80211k-gives-the-client-a-neighbor-report", "Frame")).toBe("802.11k Neighbor Report");
    expect(summaryValue("80211v-proactively-suggests-the-move", "Frame")).toBe("802.11v BSS Transition Management Request");
    expect(summaryValue("assisted-roam-happens-much-earlier", "RSSI to AP1 at roam")).toContain("-65 dBm");
    expect(summaryValue("assisted-roam-happens-much-earlier", "Roam trigger")).toMatch(/network-assisted/i);
  });

  it("contrasts the unassisted and assisted roam points in the final step", () => {
    expect(summaryValue("site-design-and-client-assistance-both-matter", "Unassisted roam point")).toBe("-82 dBm");
    expect(summaryValue("site-design-and-client-assistance-both-matter", "Assisted roam point")).toBe("-65 dBm");
    expect(fieldsFor("site-design-and-client-assistance-both-matter").stateNote).toMatch(/seamless/i);
  });
});
