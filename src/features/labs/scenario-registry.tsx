import type { ComponentType } from "react";

import { aclDirectionTroubleshootingScenario } from "./access-control-lists/acl-direction-troubleshooting-hops";
import { AclRuleListPanel } from "./access-control-lists/acl-rule-list-panel";
import { aclRuleOrderScenario } from "./access-control-lists/acl-rule-order-hops";
import { permitDenyBasicsScenario } from "./access-control-lists/permit-deny-basics-hops";
import { ChallengeLab } from "./challenge-lab";
import { dnsRecordTypesRounds } from "./dns-resolution/dns-record-types-rounds";
import { dnsResolutionOrderRounds } from "./dns-resolution/dns-resolution-order-rounds";
import { dnsTroubleshootingRounds } from "./dns-resolution/dns-troubleshooting-rounds";
import { HopLab } from "./hop-lab";
import { networkBroadcastRounds } from "./ip-subnetting/network-broadcast-rounds";
import { subnetMaskRounds } from "./ip-subnetting/subnet-mask-rounds";
import { vlsmSubnetDesignRounds } from "./ip-subnetting/vlsm-subnet-design-rounds";
import { NatTablePanel } from "./nat-port-forwarding/nat-table-panel";
import { natTroubleshootingScenario } from "./nat-port-forwarding/nat-troubleshooting-hops";
import { patOverloadScenario } from "./nat-port-forwarding/pat-overload-hops";
import { staticNatBasicsScenario } from "./nat-port-forwarding/static-nat-basics-hops";
import { PacketJourneyLab } from "./packet-forwarding/packet-journey-lab";
import { accessVsTrunkScenario } from "./vlans-trunking/access-vs-trunk-hops";
import { interVlanRoutingDesignScenario } from "./vlans-trunking/inter-vlan-routing-design-hops";
import { nativeVlanMismatchScenario } from "./vlans-trunking/native-vlan-mismatch-hops";

type ScenarioKey = `${string}/${string}`;

const registry: Record<ScenarioKey, ComponentType> = {
  "packet-forwarding/local-delivery": () => <PacketJourneyLab configuration="local" />,
  "packet-forwarding/remote-delivery": () => <PacketJourneyLab configuration="remote" />,
  "packet-forwarding/missing-gateway": () => <PacketJourneyLab configuration="no-gateway" />,

  "ip-subnetting/find-the-subnet-mask": () => <ChallengeLab rounds={subnetMaskRounds} />,
  "ip-subnetting/identify-network-and-broadcast": () => <ChallengeLab rounds={networkBroadcastRounds} />,
  "ip-subnetting/vlsm-subnet-design": () => <ChallengeLab rounds={vlsmSubnetDesignRounds} />,

  "nat-port-forwarding/static-nat-basics": () => (
    <HopLab
      ariaLabel="Static NAT walkthrough"
      extraPanelTitle="NAT Table"
      extraPanel={<NatTablePanel rows={[{ private: "192.168.1.10:80", public: "203.0.113.5:80", note: "Static entry" }]} />}
      {...staticNatBasicsScenario}
    />
  ),
  "nat-port-forwarding/pat-overload": () => (
    <HopLab
      ariaLabel="PAT / NAT overload walkthrough"
      extraPanelTitle="NAT Table"
      extraPanel={<NatTablePanel
        caption="Both hosts share the same public IP; the port number is what keeps their sessions apart."
        rows={[
          { private: "192.168.1.10:5000", public: "203.0.113.9:40001", note: "Host A" },
          { private: "192.168.1.11:5000", public: "203.0.113.9:40002", note: "Host B" },
        ]}
      />}
      {...patOverloadScenario}
    />
  ),
  "nat-port-forwarding/nat-troubleshooting": () => (
    <HopLab
      ariaLabel="NAT troubleshooting walkthrough"
      extraPanelTitle="NAT ACL"
      extraPanel={<AclRuleListPanel rules={[
        { rule: "access-list 1 deny 192.168.1.0 0.0.0.255", status: "matched-deny" },
        { rule: "access-list 1 permit any", status: "unreachable" },
      ]} note="The NAT rule only translates traffic this ACL permits — denied traffic is excluded from translation entirely." />}
      {...natTroubleshootingScenario}
    />
  ),

  "vlans-trunking/access-vs-trunk": () => <HopLab ariaLabel="Access vs. trunk port walkthrough" {...accessVsTrunkScenario} />,
  "vlans-trunking/native-vlan-mismatch": () => <HopLab ariaLabel="Native VLAN mismatch walkthrough" {...nativeVlanMismatchScenario} />,
  "vlans-trunking/inter-vlan-routing-design": () => <HopLab ariaLabel="Inter-VLAN routing design walkthrough" {...interVlanRoutingDesignScenario} />,

  "access-control-lists/permit-deny-basics": () => (
    <HopLab
      ariaLabel="ACL implicit deny walkthrough"
      extraPanelTitle="ACL Rules"
      extraPanel={<AclRuleListPanel rules={[
        { rule: "10 deny host 192.168.1.5", status: "not-matched" },
        { rule: "(implicit) deny any", status: "matched-deny" },
      ]} />}
      {...permitDenyBasicsScenario}
    />
  ),
  "access-control-lists/acl-rule-order": () => (
    <HopLab
      ariaLabel="ACL rule order walkthrough"
      extraPanelTitle="ACL Rules"
      extraPanel={<AclRuleListPanel rules={[
        { rule: "10 permit any", status: "matched-permit" },
        { rule: "20 deny host 192.168.1.50", status: "unreachable" },
      ]} />}
      {...aclRuleOrderScenario}
    />
  ),
  "access-control-lists/acl-direction-troubleshooting": () => <HopLab ariaLabel="ACL direction troubleshooting walkthrough" {...aclDirectionTroubleshootingScenario} />,

  "dns-resolution/dns-record-types": () => <ChallengeLab rounds={dnsRecordTypesRounds} />,
  "dns-resolution/dns-resolution-order": () => <ChallengeLab rounds={dnsResolutionOrderRounds} />,
  "dns-resolution/dns-troubleshooting": () => <ChallengeLab rounds={dnsTroubleshootingRounds} />,
};

export function getScenarioComponent(topicSlug: string, scenarioSlug: string): ComponentType | undefined {
  return registry[`${topicSlug}/${scenarioSlug}`];
}
