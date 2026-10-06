import type { ComponentType } from "react";

import { aclDirectionTroubleshootingRounds } from "./access-control-lists/acl-direction-troubleshooting-rounds";
import { aclRuleOrderRounds } from "./access-control-lists/acl-rule-order-rounds";
import { permitDenyBasicsRounds } from "./access-control-lists/permit-deny-basics-rounds";
import { ChallengeLab } from "./challenge-lab";
import { dnsRecordTypesRounds } from "./dns-resolution/dns-record-types-rounds";
import { dnsResolutionOrderRounds } from "./dns-resolution/dns-resolution-order-rounds";
import { dnsTroubleshootingRounds } from "./dns-resolution/dns-troubleshooting-rounds";
import { networkBroadcastRounds } from "./ip-subnetting/network-broadcast-rounds";
import { subnetMaskRounds } from "./ip-subnetting/subnet-mask-rounds";
import { vlsmSubnetDesignRounds } from "./ip-subnetting/vlsm-subnet-design-rounds";
import { natTroubleshootingRounds } from "./nat-port-forwarding/nat-troubleshooting-rounds";
import { patOverloadRounds } from "./nat-port-forwarding/pat-overload-rounds";
import { staticNatBasicsRounds } from "./nat-port-forwarding/static-nat-basics-rounds";
import { PacketJourneyLab } from "./packet-forwarding/packet-journey-lab";
import { accessVsTrunkRounds } from "./vlans-trunking/access-vs-trunk-rounds";
import { interVlanRoutingDesignRounds } from "./vlans-trunking/inter-vlan-routing-design-rounds";
import { nativeVlanMismatchRounds } from "./vlans-trunking/native-vlan-mismatch-rounds";

type ScenarioKey = `${string}/${string}`;

const registry: Record<ScenarioKey, ComponentType> = {
  "packet-forwarding/local-delivery": () => <PacketJourneyLab configuration="local" />,
  "packet-forwarding/remote-delivery": () => <PacketJourneyLab configuration="remote" />,
  "packet-forwarding/missing-gateway": () => <PacketJourneyLab configuration="no-gateway" />,
  "ip-subnetting/find-the-subnet-mask": () => <ChallengeLab rounds={subnetMaskRounds} />,
  "ip-subnetting/identify-network-and-broadcast": () => <ChallengeLab rounds={networkBroadcastRounds} />,
  "ip-subnetting/vlsm-subnet-design": () => <ChallengeLab rounds={vlsmSubnetDesignRounds} />,
  "nat-port-forwarding/static-nat-basics": () => <ChallengeLab rounds={staticNatBasicsRounds} />,
  "nat-port-forwarding/pat-overload": () => <ChallengeLab rounds={patOverloadRounds} />,
  "nat-port-forwarding/nat-troubleshooting": () => <ChallengeLab rounds={natTroubleshootingRounds} />,
  "vlans-trunking/access-vs-trunk": () => <ChallengeLab rounds={accessVsTrunkRounds} />,
  "vlans-trunking/native-vlan-mismatch": () => <ChallengeLab rounds={nativeVlanMismatchRounds} />,
  "vlans-trunking/inter-vlan-routing-design": () => <ChallengeLab rounds={interVlanRoutingDesignRounds} />,
  "access-control-lists/permit-deny-basics": () => <ChallengeLab rounds={permitDenyBasicsRounds} />,
  "access-control-lists/acl-rule-order": () => <ChallengeLab rounds={aclRuleOrderRounds} />,
  "access-control-lists/acl-direction-troubleshooting": () => <ChallengeLab rounds={aclDirectionTroubleshootingRounds} />,
  "dns-resolution/dns-record-types": () => <ChallengeLab rounds={dnsRecordTypesRounds} />,
  "dns-resolution/dns-resolution-order": () => <ChallengeLab rounds={dnsResolutionOrderRounds} />,
  "dns-resolution/dns-troubleshooting": () => <ChallengeLab rounds={dnsTroubleshootingRounds} />,
};

export function getScenarioComponent(topicSlug: string, scenarioSlug: string): ComponentType | undefined {
  return registry[`${topicSlug}/${scenarioSlug}`];
}
