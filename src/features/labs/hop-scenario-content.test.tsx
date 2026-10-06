import { describe, expect, it } from "vitest";

import type { HopScenarioData } from "./hop-lab-types";
import { natTroubleshootingScenario } from "./nat-port-forwarding/nat-troubleshooting-hops";
import { patOverloadScenario } from "./nat-port-forwarding/pat-overload-hops";
import { staticNatBasicsScenario } from "./nat-port-forwarding/static-nat-basics-hops";
import { accessVsTrunkScenario } from "./vlans-trunking/access-vs-trunk-hops";
import { interVlanRoutingDesignScenario } from "./vlans-trunking/inter-vlan-routing-design-hops";
import { nativeVlanMismatchScenario } from "./vlans-trunking/native-vlan-mismatch-hops";

const scenarios: Record<string, HopScenarioData> = {
  "static-nat-basics": staticNatBasicsScenario,
  "pat-overload": patOverloadScenario,
  "nat-troubleshooting": natTroubleshootingScenario,
  "access-vs-trunk": accessVsTrunkScenario,
  "native-vlan-mismatch": nativeVlanMismatchScenario,
  "inter-vlan-routing-design": interVlanRoutingDesignScenario,
};

describe("hop scenario content", () => {
  for (const [name, scenario] of Object.entries(scenarios)) {
    describe(name, () => {
      it("has at least two devices and at least one step", () => {
        expect(scenario.devices.length).toBeGreaterThanOrEqual(2);
        expect(scenario.steps.length).toBeGreaterThanOrEqual(1);
      });

      it("gives every device a unique, non-empty id and label", () => {
        const ids = scenario.devices.map((device) => device.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const device of scenario.devices) {
          expect(device.id.trim().length).toBeGreaterThan(0);
          expect(device.label.trim().length).toBeGreaterThan(0);
        }
      });

      it("has every step reference devices that actually exist", () => {
        const deviceIds = new Set(scenario.devices.map((device) => device.id));
        for (const step of scenario.steps) {
          expect(deviceIds.has(step.fromId)).toBe(true);
          if (step.toId !== null) expect(deviceIds.has(step.toId)).toBe(true);
        }
      });

      it("gives every step a non-empty title and explanation", () => {
        for (const step of scenario.steps) {
          expect(step.title.trim().length).toBeGreaterThan(0);
          expect(step.explanation.trim().length).toBeGreaterThan(0);
        }
      });

      it("has a quiz with a correct option present among its choices", () => {
        expect(scenario.quiz.options.some((option) => option.id === scenario.quiz.correctId)).toBe(true);
        expect(scenario.quiz.options.length).toBeGreaterThanOrEqual(3);
        const ids = scenario.quiz.options.map((option) => option.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it("has a non-empty topology aria label", () => {
        expect(scenario.topologyAriaLabel.trim().length).toBeGreaterThan(0);
      });
    });
  }
});
