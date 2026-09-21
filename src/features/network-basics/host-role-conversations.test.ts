import { describe, expect, it } from "vitest";

import { hostRoleConversations } from "./host-role-conversations";

describe("hostRoleConversations", () => {
  it("offers the three approved beginner conversations in order", () => {
    expect(Object.keys(hostRoleConversations)).toEqual([
      "web-request",
      "print-job",
      "file-sharing",
    ]);
  });

  it.each([
    ["web-request", [["laptop", "web-server"], ["web-server", "laptop"]]],
    ["print-job", [["laptop", "printer"], ["printer", "laptop"]]],
    ["file-sharing", [
      ["computer-a", "computer-b"],
      ["computer-b", "computer-a"],
      ["computer-b", "computer-a"],
      ["computer-a", "computer-b"],
    ]],
  ] as const)("models the request and response directions for %s", (id, expectedDirections) => {
    const conversation = hostRoleConversations[id];

    expect(conversation.scenario.steps.map((step) => [step.packet?.from, step.packet?.to])).toEqual(expectedDirections);
    expect(conversation.scenario.steps.every((step) => step.durationMs === 5200)).toBe(true);
  });

  it("reverses client and server roles during computer-to-computer file sharing", () => {
    const fileSharing = hostRoleConversations["file-sharing"];

    expect(fileSharing.stepRoles.map(({ clientId, serverId }) => [clientId, serverId])).toEqual([
      ["computer-a", "computer-b"],
      ["computer-a", "computer-b"],
      ["computer-b", "computer-a"],
      ["computer-b", "computer-a"],
    ]);
  });

  it("keeps bubble, active device, packet endpoints, and roles internally consistent", () => {
    for (const conversation of Object.values(hostRoleConversations)) {
      const deviceIds = new Set(conversation.scenario.devices.map(({ id }) => id));
      expect(conversation.stepRoles).toHaveLength(conversation.scenario.steps.length);

      conversation.scenario.steps.forEach((step, index) => {
        const roles = conversation.stepRoles[index];
        expect(deviceIds.has(roles.clientId)).toBe(true);
        expect(deviceIds.has(roles.serverId)).toBe(true);
        expect(step.activeDeviceIds).toContain(roles.bubble.deviceId);
        expect(deviceIds.has(step.packet?.from ?? "")).toBe(true);
        expect(deviceIds.has(step.packet?.to ?? "")).toBe(true);
      });
    }
  });
});
