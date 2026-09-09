import type { MDXComponents } from "mdx/types";

import { ConnectionMediaComparison } from "@/features/connection-media/connection-media-comparison";
import { HostsAndDevicesExperience } from "@/features/hosts-and-devices/hosts-and-devices-experience";
import { HostsAndDevicesStaticOverview } from "@/features/hosts-and-devices/hosts-and-devices-static-overview";
import { InterviewScenario } from "@/features/lessons/interview-scenario";
import { KnowledgeCheck } from "@/features/lessons/knowledge-check";
import { LayerModelComparison } from "@/features/layer-models/layer-model-comparison";
import { EncapsulationExperience } from "@/features/layer-models/encapsulation-experience";
import { DeviceLayerScope } from "@/features/layer-models/device-layer-scope";
import { LearningObjective } from "@/features/lessons/learning-objective";
import { PremiumPreview } from "@/features/lessons/premium-preview";
import { WiresharkCheck } from "@/features/lessons/wireshark-check";
import { NetworkCommunicationPacketFlow } from "@/features/packet-flow/packet-flow-experience";
import { NetworkDeviceSymbol } from "@/features/packet-flow/network-device-symbol";
import { SwitchingComparison } from "@/features/switching/switching-comparison";
import { DeliveryScopePlayer } from "@/features/delivery-scope/delivery-scope-player";
import { RouteDecisionPlayer } from "@/features/route-decision/route-decision-player";
import { RouteDecisionExperience } from "@/features/route-decision/route-decision-experience";
import { EdgeDevicePlayer } from "@/features/edge-devices/edge-device-player";
import { FirstPacketJourneyPlayer } from "@/features/packet-flow/first-packet-journey-player";
import { EthernetFrameExplorer } from "@/features/ethernet/ethernet-frame-explorer";
import { SwitchLearningPlayer } from "@/features/switch-learning/switch-learning-player";
import { ArpLocalDeliveryPlayer } from "@/features/arp/arp-local-delivery-player";
import { ArpVariantPlayer } from "@/features/arp/arp-variant-player";
import { VlanMembershipPlayer } from "@/features/vlans/vlan-membership-player";
import { VlanTagJourneyPlayer } from "@/features/vlans/vlan-tag-journey-player";
import { SectionContinue } from "@/features/progress/section-continue";
import { Ipv4AddressBoundaryPlayer } from "@/features/ipv4/ipv4-address-boundary-player";
import { Ipv4BinaryExplorer } from "@/features/ipv4/ipv4-binary-explorer";
import { SubnetBoundaryPlayer } from "@/features/subnetting/subnet-boundary-player";
import { SubnetScenarioPlayer } from "@/features/subnetting/subnet-scenario-player";
import { Ipv6AddressExplorer } from "@/features/ipv6/ipv6-address-explorer";
import { NdpSlaacJourneyPlayer } from "@/features/ipv6/ndp-slaac-journey-player";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ArpLocalDeliveryPlayer,
    ArpVariantPlayer,
    ConnectionMediaComparison,
    EncapsulationExperience,
    DeviceLayerScope,
    EdgeDevicePlayer,
    EthernetFrameExplorer,
    FirstPacketJourneyPlayer,
    DeliveryScopePlayer,
    HostsAndDevicesExperience,
    HostsAndDevicesStaticOverview,
    InterviewScenario,
    Ipv4AddressBoundaryPlayer,
    Ipv4BinaryExplorer,
    Ipv6AddressExplorer,
    KnowledgeCheck,
    LayerModelComparison,
    LearningObjective,
    NetworkCommunicationPacketFlow,
    NetworkDeviceSymbol,
    NdpSlaacJourneyPlayer,
    PremiumPreview,
    RouteDecisionPlayer,
    RouteDecisionExperience,
    SectionContinue,
    SwitchingComparison,
    SwitchLearningPlayer,
    SubnetBoundaryPlayer,
    SubnetScenarioPlayer,
    WiresharkCheck,
    VlanMembershipPlayer,
    VlanTagJourneyPlayer,
    ...components,
  };
}
