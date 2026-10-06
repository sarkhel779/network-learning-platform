import { HostIcon, RouterIcon, ServerIcon } from "../hop-icons";
import type { HopScenarioData } from "../hop-lab-types";

export const aclRuleOrderScenario: HopScenarioData = {
  topologyAriaLabel: "A packet that slips through an ACL because a general rule comes before a specific one",
  devices: [
    { id: "host", label: "Host", sublabel: "192.168.1.50", icon: <HostIcon /> },
    { id: "router", label: "Router", sublabel: "ACL 101", icon: <RouterIcon /> },
    { id: "destination", label: "Destination", icon: <ServerIcon /> },
  ],
  steps: [
    {
      fromId: "host", toId: "router",
      title: "Packet from 192.168.1.50 arrives",
      explanation: "The ACL here was meant to block 192.168.1.50, but it's written as: 10 permit any, then 20 deny host 192.168.1.50.",
      fields: [{ label: "Source", value: "192.168.1.50" }],
    },
    {
      fromId: "router", toId: "destination",
      title: "Router evaluates the ACL top-down — and permits it anyway",
      explanation: "Line 10, 'permit any', matches every packet — including this one — before line 20 is ever reached. The more specific deny rule is unreachable, dead configuration; the packet gets through despite the intent to block it.",
      fields: [{ label: "Matched rule", value: "10 permit any" }],
      outcome: "delivered",
    },
  ],
  quiz: {
    question: "To correctly block only 192.168.1.50 while permitting everyone else, how should these two lines be ordered?",
    options: [
      { id: "correct", label: "Put 'deny host 192.168.1.50' first, then 'permit any' second" },
      { id: "same", label: "The original order is already correct" },
      { id: "bothdeny", label: "Both lines need to say 'deny'" },
      { id: "noeffect", label: "Order doesn't matter in ACLs" },
    ],
    correctId: "correct",
    feedbackCorrect: "Correct. More specific rules must come before more general ones — placing the specific deny first ensures .50's traffic is matched and blocked before the general permit rule ever gets a chance.",
    feedbackIncorrect: "Not quite. Because the first matching line wins, the general 'permit any' needs to move after the specific deny, not before it.",
  },
};
