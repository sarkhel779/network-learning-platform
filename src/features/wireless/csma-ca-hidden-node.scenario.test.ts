import { describe, expect, it } from "vitest";

import { csmaCaHiddenNodeScenario } from "./csma-ca-hidden-node.scenario";

const fieldsFor = (stepId: string) => {
  const step = csmaCaHiddenNodeScenario.steps.find((candidate) => candidate.id === stepId);
  expect(step, `expected step ${stepId}`).toBeDefined();
  return step!;
};

const summaryValue = (stepId: string, label: string) =>
  fieldsFor(stepId).summaryFields.find((field) => field.label === label)?.value;

describe("CSMA/CA hidden node scenario", () => {
  it("parses with two clients hidden from each other, both linked only to the AP", () => {
    expect(csmaCaHiddenNodeScenario.devices.map((device) => device.id)).toEqual(["client-a", "ap", "client-b"]);
    expect(csmaCaHiddenNodeScenario.links.map((link) => link.id)).toEqual(["client-a-ap", "client-b-ap"]);
  });

  it("shows both clients independently sensing an idle channel before colliding", () => {
    expect(summaryValue("client-a-senses-the-channel-idle", "Channel state (A's view)")).toBe("Idle");
    expect(summaryValue("client-b-also-senses-the-channel-idle", "Channel state (B's view)")).toBe("Idle");
    expect(summaryValue("client-b-also-senses-the-channel-idle", "Can B hear client A?")).toMatch(/hidden node/i);
  });

  it("collides at the AP because neither sender could detect the other", () => {
    expect(summaryValue("collision-at-the-access-point", "Result at the AP")).toMatch(/garbled/i);
    expect(fieldsFor("collision-at-the-access-point").detailFields[0]?.value).toMatch(/collision occurs at the ap/i);
  });

  it("resolves the collision with RTS/CTS, with the CTS reaching both clients", () => {
    expect(summaryValue("client-a-sends-rts-to-ap", "Frame")).toBe("RTS (Request to Send)");
    expect(summaryValue("ap-broadcasts-cts-both-clients-hear-it", "Frame")).toBe("CTS (Clear to Send)");
    expect(summaryValue("ap-broadcasts-cts-both-clients-hear-it", "Heard by")).toBe("Client A and Client B");
    expect(fieldsFor("ap-broadcasts-cts-both-clients-hear-it").packet?.fanOut).toBe(true);
  });

  it("has client B defer via its NAV without ever hearing client A's RTS", () => {
    expect(summaryValue("client-b-sets-its-nav-and-defers", "Client B's NAV")).toMatch(/set/i);
    expect(fieldsFor("client-b-sets-its-nav-and-defers").detailFields.find((field) => field.label === "Client B still hasn't heard")?.value).toContain("RTS");
  });

  it("lets client A transmit safely and client B's NAV expire after the ACK", () => {
    expect(summaryValue("client-a-sends-data-protected", "Collision risk")).toMatch(/none/i);
    expect(summaryValue("ap-acknowledges-nav-expires", "Frame")).toBe("ACK");
    expect(summaryValue("ap-acknowledges-nav-expires", "Client B's NAV")).toMatch(/expired/i);
    expect(fieldsFor("ap-acknowledges-nav-expires").stateNote).toMatch(/RTS\/CTS/);
  });
});
