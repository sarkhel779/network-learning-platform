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
import { RoutingTableDecisionPlayer } from "@/features/routing/routing-table-decision-player";
import { HopByHopForwardingPlayer } from "@/features/routing/hop-by-hop-forwarding-player";
import { PingEvidencePlayer } from "@/features/icmp/ping-evidence-player";
import { TracerouteDiscoveryPlayer } from "@/features/icmp/traceroute-discovery-player";
import { TcpConnectionPlayer } from "@/features/transport/tcp-connection-player";
import { PortDeliveryPlayer } from "@/features/transport/port-delivery-player";
import { DoraPlayer } from "@/features/dhcp/dora-player";
import { DhcpRelayPlayer } from "@/features/dhcp/relay-player";
import { LeaseTimingPlayer } from "@/features/dhcp/lease-timing-player";
import { DhcpRfcCheck } from "@/features/dhcp/rfc-check";
import { DnsResolutionPlayer } from "@/features/dns/resolution-player";
import { DnsTroubleshootingPlayer } from "@/features/dns/troubleshooting-player";
import { DnsTimingPlayer } from "@/features/dns/dns-timing-player";
import { DnsRfcCheck } from "@/features/dns/dns-rfc-check";
import { RootBootstrapPlayer } from "@/features/dns/root-bootstrap-player";
import { ServiceJourneyPlayer } from "@/features/essential-services/service-journey-player";
import { ProtocolMessageInspector } from "@/features/essential-services/protocol-message-inspector";
import { PortTransportPanel } from "@/features/essential-services/port-transport-panel";
import { ServiceTroubleshootingLab } from "@/features/essential-services/service-troubleshooting-lab";
import { CaptureAnalysisLab } from "@/features/essential-services/capture-analysis-lab";
import { RfcValidationLab } from "@/features/essential-services/rfc-validation-lab";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ArpLocalDeliveryPlayer,
    ArpVariantPlayer,
    ConnectionMediaComparison,
    EncapsulationExperience,
    DeviceLayerScope,
    DhcpRelayPlayer,
    DhcpRfcCheck,
    DoraPlayer,
    DnsResolutionPlayer,
    DnsTroubleshootingPlayer,
    DnsTimingPlayer,
    DnsRfcCheck,
    RootBootstrapPlayer,
    ServiceJourneyPlayer,
    ProtocolMessageInspector,
    PortTransportPanel,
    ServiceTroubleshootingLab,
    CaptureAnalysisLab,
    RfcValidationLab,
    EdgeDevicePlayer,
    EthernetFrameExplorer,
    FirstPacketJourneyPlayer,
    DeliveryScopePlayer,
    HostsAndDevicesExperience,
    HostsAndDevicesStaticOverview,
    HopByHopForwardingPlayer,
    InterviewScenario,
    Ipv4AddressBoundaryPlayer,
    Ipv4BinaryExplorer,
    Ipv6AddressExplorer,
    KnowledgeCheck,
    LayerModelComparison,
    LeaseTimingPlayer,
    LearningObjective,
    NetworkCommunicationPacketFlow,
    NetworkDeviceSymbol,
    NdpSlaacJourneyPlayer,
    PremiumPreview,
    PingEvidencePlayer,
    TracerouteDiscoveryPlayer,
    TcpConnectionPlayer,
    PortDeliveryPlayer,
    RouteDecisionPlayer,
    RouteDecisionExperience,
    RoutingTableDecisionPlayer,
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
