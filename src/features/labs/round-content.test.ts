import { describe, expect, it } from "vitest";

import { aclDirectionTroubleshootingRounds } from "./access-control-lists/acl-direction-troubleshooting-rounds";
import { aclRuleOrderRounds } from "./access-control-lists/acl-rule-order-rounds";
import { permitDenyBasicsRounds } from "./access-control-lists/permit-deny-basics-rounds";
import type { ChallengeRound } from "./challenge-rounds";
import { dnsRecordTypesRounds } from "./dns-resolution/dns-record-types-rounds";
import { dnsResolutionOrderRounds } from "./dns-resolution/dns-resolution-order-rounds";
import { dnsTroubleshootingRounds } from "./dns-resolution/dns-troubleshooting-rounds";
import { vlsmSubnetDesignRounds } from "./ip-subnetting/vlsm-subnet-design-rounds";
import { natTroubleshootingRounds } from "./nat-port-forwarding/nat-troubleshooting-rounds";
import { patOverloadRounds } from "./nat-port-forwarding/pat-overload-rounds";
import { staticNatBasicsRounds } from "./nat-port-forwarding/static-nat-basics-rounds";
import { accessVsTrunkRounds } from "./vlans-trunking/access-vs-trunk-rounds";
import { interVlanRoutingDesignRounds } from "./vlans-trunking/inter-vlan-routing-design-rounds";
import { nativeVlanMismatchRounds } from "./vlans-trunking/native-vlan-mismatch-rounds";

const roundSets: Record<string, ChallengeRound[]> = {
  "vlsm-subnet-design": vlsmSubnetDesignRounds,
  "static-nat-basics": staticNatBasicsRounds,
  "pat-overload": patOverloadRounds,
  "nat-troubleshooting": natTroubleshootingRounds,
  "access-vs-trunk": accessVsTrunkRounds,
  "native-vlan-mismatch": nativeVlanMismatchRounds,
  "inter-vlan-routing-design": interVlanRoutingDesignRounds,
  "permit-deny-basics": permitDenyBasicsRounds,
  "acl-rule-order": aclRuleOrderRounds,
  "acl-direction-troubleshooting": aclDirectionTroubleshootingRounds,
  "dns-record-types": dnsRecordTypesRounds,
  "dns-resolution-order": dnsResolutionOrderRounds,
  "dns-troubleshooting": dnsTroubleshootingRounds,
};

describe("new scenario round content", () => {
  for (const [name, rounds] of Object.entries(roundSets)) {
    describe(name, () => {
      it("has at least 3 rounds", () => {
        expect(rounds.length).toBeGreaterThanOrEqual(3);
      });

      it("gives every round a correct option present among its choices", () => {
        for (const round of rounds) {
          expect(round.options.some((option) => option.id === round.correctId)).toBe(true);
        }
      });

      it("gives every round at least 3 distinct, non-empty options", () => {
        for (const round of rounds) {
          expect(round.options.length).toBeGreaterThanOrEqual(3);
          const ids = round.options.map((option) => option.id);
          expect(new Set(ids).size).toBe(ids.length);
          for (const option of round.options) {
            expect(option.label.trim().length).toBeGreaterThan(0);
          }
        }
      });

      it("gives every round a non-empty prompt and explanation", () => {
        for (const round of rounds) {
          expect(round.prompt.trim().length).toBeGreaterThan(0);
          expect(round.explanation.trim().length).toBeGreaterThan(0);
        }
      });
    });
  }
});
