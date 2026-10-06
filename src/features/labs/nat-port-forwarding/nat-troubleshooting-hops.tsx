import { CloudIcon, HostIcon, RouterIcon } from "../hop-icons";
import type { HopScenarioData } from "../hop-lab-types";

export const natTroubleshootingScenario: HopScenarioData = {
  topologyAriaLabel: "A host's packet blocked at the NAT router because its subnet is excluded from translation",
  devices: [
    { id: "host", label: "Host", sublabel: "192.168.1.50", icon: <HostIcon /> },
    { id: "router", label: "NAT router", sublabel: "ACL excludes 192.168.1.0/24", icon: <RouterIcon /> },
    { id: "internet", label: "Internet", icon: <CloudIcon /> },
  ],
  steps: [
    {
      fromId: "host", toId: "router",
      title: "Host attempts outbound traffic",
      explanation: "192.168.1.50 tries to reach a server on the internet, same as any other host on the LAN.",
      fields: [{ label: "Source", value: "192.168.1.50" }, { label: "Destination", value: "93.184.216.34" }],
    },
    {
      fromId: "router", toId: null,
      title: "Router checks the NAT access list — and excludes it",
      explanation: "The NAT overload rule references an ACL that explicitly denies 192.168.1.0/24 before its final 'permit any'. Since the packet matches that deny line, it's excluded from translation entirely, so the router never forwards it to the internet.",
      fields: [{ label: "ACL match", value: "line 1: deny 192.168.1.0/24" }],
      outcome: "blocked",
    },
  ],
  quiz: {
    question: "What's the fix so 192.168.1.0/24 can reach the internet through this NAT rule?",
    options: [
      { id: "correct", label: "Add or reorder a permit line for 192.168.1.0/24 before the ACL's deny line" },
      { id: "ports", label: "Increase the PAT overload port range" },
      { id: "switchstatic", label: "Switch from PAT to static NAT" },
      { id: "impossible", label: "Nothing can be done — NAT can never cover more than one subnet" },
    ],
    correctId: "correct",
    feedbackCorrect: "Correct. NAT only translates traffic the ACL permits. Adding (or reordering in) a permit line for 192.168.1.0/24 lets that subnet's traffic match the NAT rule and get translated.",
    feedbackIncorrect: "Not quite. The problem is the ACL that NAT consults: it explicitly denies this subnet, so NAT never translates its traffic. The fix is in the ACL, not the NAT rule's capacity.",
  },
};
