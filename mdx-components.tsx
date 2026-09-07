import type { MDXComponents } from "mdx/types";

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

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    EncapsulationExperience,
    DeviceLayerScope,
    HostsAndDevicesExperience,
    HostsAndDevicesStaticOverview,
    InterviewScenario,
    KnowledgeCheck,
    LayerModelComparison,
    LearningObjective,
    NetworkCommunicationPacketFlow,
    NetworkDeviceSymbol,
    PremiumPreview,
    WiresharkCheck,
    ...components,
  };
}
