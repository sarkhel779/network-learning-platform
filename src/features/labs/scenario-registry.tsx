import type { ComponentType } from "react";

import { aclDirectionTroubleshootingSim } from "./access-control-lists/acl-direction-troubleshooting-sim";
import { aclRuleOrderSim } from "./access-control-lists/acl-rule-order-sim";
import { AclSimulator } from "./access-control-lists/acl-simulator";
import { permitDenyBasicsSim } from "./access-control-lists/permit-deny-basics-sim";
import { ChallengeLab } from "./challenge-lab";
import { dnsRecordTypesRounds } from "./dns-resolution/dns-record-types-rounds";
import { dnsResolutionOrderRounds } from "./dns-resolution/dns-resolution-order-rounds";
import { dnsTroubleshootingRounds } from "./dns-resolution/dns-troubleshooting-rounds";
import { networkBroadcastRounds } from "./ip-subnetting/network-broadcast-rounds";
import { subnetMaskRounds } from "./ip-subnetting/subnet-mask-rounds";
import { vlsmSubnetDesignRounds } from "./ip-subnetting/vlsm-subnet-design-rounds";
import { natTroubleshootingSim } from "./nat-port-forwarding/nat-troubleshooting-sim";
import { PatSimulator } from "./nat-port-forwarding/pat-simulator";
import { StaticNatSimulator } from "./nat-port-forwarding/static-nat-simulator";
import { PacketJourneyLab } from "./packet-forwarding/packet-journey-lab";
import { accessVsTrunkSim } from "./vlans-trunking/access-vs-trunk-sim";
import { interVlanRoutingDesignSim } from "./vlans-trunking/inter-vlan-routing-design-sim";
import { LinkTypeSimulator } from "./vlans-trunking/link-type-simulator";
import { NativeVlanSimulator } from "./vlans-trunking/native-vlan-simulator";

type ScenarioKey = `${string}/${string}`;

const registry: Record<ScenarioKey, ComponentType> = {
  "packet-forwarding/local-delivery": () => <PacketJourneyLab configuration="local" />,
  "packet-forwarding/remote-delivery": () => <PacketJourneyLab configuration="remote" />,
  "packet-forwarding/missing-gateway": () => <PacketJourneyLab configuration="no-gateway" />,

  "ip-subnetting/find-the-subnet-mask": () => <ChallengeLab rounds={subnetMaskRounds} />,
  "ip-subnetting/identify-network-and-broadcast": () => <ChallengeLab rounds={networkBroadcastRounds} />,
  "ip-subnetting/vlsm-subnet-design": () => <ChallengeLab rounds={vlsmSubnetDesignRounds} />,

  "nat-port-forwarding/static-nat-basics": () => <StaticNatSimulator />,
  "nat-port-forwarding/pat-overload": () => <PatSimulator />,
  "nat-port-forwarding/nat-troubleshooting": () => <AclSimulator config={natTroubleshootingSim} />,

  "vlans-trunking/access-vs-trunk": () => <LinkTypeSimulator config={accessVsTrunkSim} />,
  "vlans-trunking/native-vlan-mismatch": () => <NativeVlanSimulator />,
  "vlans-trunking/inter-vlan-routing-design": () => <LinkTypeSimulator config={interVlanRoutingDesignSim} />,

  "access-control-lists/permit-deny-basics": () => <AclSimulator config={permitDenyBasicsSim} />,
  "access-control-lists/acl-rule-order": () => <AclSimulator config={aclRuleOrderSim} />,
  "access-control-lists/acl-direction-troubleshooting": () => <AclSimulator config={aclDirectionTroubleshootingSim} />,

  "dns-resolution/dns-record-types": () => <ChallengeLab rounds={dnsRecordTypesRounds} />,
  "dns-resolution/dns-resolution-order": () => <ChallengeLab rounds={dnsResolutionOrderRounds} />,
  "dns-resolution/dns-troubleshooting": () => <ChallengeLab rounds={dnsTroubleshootingRounds} />,
};

export function getScenarioComponent(topicSlug: string, scenarioSlug: string): ComponentType | undefined {
  return registry[`${topicSlug}/${scenarioSlug}`];
}
