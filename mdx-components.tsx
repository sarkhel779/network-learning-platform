import type { MDXComponents } from "mdx/types";

import { InterviewScenario } from "@/features/lessons/interview-scenario";
import { KnowledgeCheck } from "@/features/lessons/knowledge-check";
import { LearningObjective } from "@/features/lessons/learning-objective";
import { PremiumPreview } from "@/features/lessons/premium-preview";
import { WiresharkCheck } from "@/features/lessons/wireshark-check";
import { NetworkCommunicationPacketFlow } from "@/features/packet-flow/packet-flow-experience";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    InterviewScenario,
    KnowledgeCheck,
    LearningObjective,
    NetworkCommunicationPacketFlow,
    PremiumPreview,
    WiresharkCheck,
    ...components,
  };
}
