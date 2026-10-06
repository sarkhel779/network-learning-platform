import { CloudIcon, HostIcon, RouterIcon } from "../hop-icons";
import type { HopScenarioData } from "../hop-lab-types";

export const aclDirectionTroubleshootingScenario: HopScenarioData = {
  topologyAriaLabel: "A packet passing an ACL applied in the wrong direction",
  devices: [
    { id: "host", label: "Host", sublabel: "192.168.1.50 (LAN)", icon: <HostIcon /> },
    { id: "router", label: "Router", sublabel: "ACL applied 'out' on Gi0/1", icon: <RouterIcon /> },
    { id: "internet", label: "Internet", icon: <CloudIcon /> },
  ],
  steps: [
    {
      fromId: "host", toId: "router",
      title: "Host sends toward the internet",
      explanation: "192.168.1.50's traffic enters the router through Gi0/1, the LAN-facing interface — that's the direction any outbound packet from the LAN takes.",
      fields: [{ label: "Entering interface", value: "Gi0/1 (inbound from LAN)" }],
    },
    {
      fromId: "router", toId: "internet",
      title: "The 'out' ACL on Gi0/1 never inspects it",
      explanation: "The ACL meant to block this host is applied 'out' on Gi0/1 — which only filters traffic the router is sending back toward the LAN. This packet is entering on Gi0/1, not leaving through it, so the out-direction ACL never inspects it, and it passes straight through to the internet.",
      fields: [{ label: "ACL direction configured", value: "out" }, { label: "Direction needed", value: "in" }],
      outcome: "delivered",
    },
  ],
  quiz: {
    question: "What's the fix for this ACL so it actually blocks the host's outbound traffic?",
    options: [
      { id: "correct", label: "Apply the ACL 'in' on Gi0/1 instead, so it inspects traffic entering the router from the LAN" },
      { id: "ipv6only", label: "Switch the ACL number to one reserved for outbound filtering" },
      { id: "wronginterface", label: "Apply it on the internet-facing interface instead, never the LAN interface" },
      { id: "nohostdeny", label: "Standard ACLs can't deny a single host, only whole subnets" },
    ],
    correctId: "correct",
    feedbackCorrect: "Correct. Direction is relative to the router: 'in' catches traffic entering through that interface. Since the host's traffic enters on Gi0/1, the ACL needs to be applied 'in' there to filter it before it's routed onward.",
    feedbackIncorrect: "Not quite. The ACL is on the right interface already — the problem is the direction keyword. Applying it 'in' on Gi0/1 catches the host's traffic as it enters; 'out' only checks traffic headed back toward the LAN.",
  },
};
