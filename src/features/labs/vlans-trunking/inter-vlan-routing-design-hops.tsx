import { HostIcon, RouterIcon, SwitchIcon } from "../hop-icons";
import type { HopScenarioData } from "../hop-lab-types";

export const interVlanRoutingDesignScenario: HopScenarioData = {
  topologyAriaLabel: "A host in VLAN 10 reaching a host in VLAN 20 through a router-on-a-stick",
  devices: [
    { id: "hostA", label: "Host A", sublabel: "VLAN 10 · 10.0.10.50", icon: <HostIcon /> },
    { id: "switch", label: "Switch", icon: <SwitchIcon /> },
    { id: "router", label: "Router-on-a-stick", icon: <RouterIcon /> },
    { id: "hostB", label: "Host B", sublabel: "VLAN 20 · 10.0.20.75", icon: <HostIcon /> },
  ],
  steps: [
    {
      fromId: "hostA", toId: "switch",
      title: "Host A sends toward its gateway",
      explanation: "Host A's destination is on a different subnet, so it addresses the frame to its default gateway.",
      fields: [{ label: "Source", value: "10.0.10.50" }, { label: "Destination gateway", value: "10.0.10.1" }],
    },
    {
      fromId: "switch", toId: "router",
      title: "Switch forwards over the trunk to the router",
      explanation: "The switch-to-router link is a trunk carrying both VLAN 10 and VLAN 20, tagged so the router's subinterfaces can tell them apart.",
      fields: [{ label: "Tag", value: "802.1Q VLAN 10" }, { label: "Router subinterface", value: "Gi0/0.10 (10.0.10.1)" }],
    },
    {
      fromId: "router", toId: "switch",
      title: "Router routes to the VLAN 20 subinterface",
      explanation: "The router has both subnets directly connected via its subinterfaces, so it simply routes the packet out the VLAN 20 subinterface, tagged for VLAN 20 this time.",
      fields: [{ label: "Tag", value: "802.1Q VLAN 20" }, { label: "Router subinterface", value: "Gi0/0.20 (10.0.20.1)" }],
    },
    {
      fromId: "switch", toId: "hostB",
      title: "Switch delivers to Host B",
      explanation: "The switch strips the tag and delivers the frame out Host B's access port, completing the inter-VLAN trip.",
      fields: [{ label: "Destination", value: "10.0.20.75 (Host B)" }],
      outcome: "delivered",
    },
  ],
  quiz: {
    question: "As VLAN count and inter-VLAN traffic grow, why might you replace this router-on-a-stick design with a Layer 3 switch using SVIs?",
    options: [
      { id: "correct", label: "A Layer 3 switch routes between VLANs in hardware at switch speed, avoiding the single trunk link's bottleneck" },
      { id: "twovlanlimit", label: "Router-on-a-stick cannot support more than 2 VLANs" },
      { id: "noip", label: "Layer 3 switches don't need IP addresses configured" },
      { id: "svinotallowed", label: "SVIs cannot be used for inter-VLAN routing" },
    ],
    correctId: "correct",
    feedbackCorrect: "Correct. Every inter-VLAN packet here has to funnel through one physical trunk link to the router. A Layer 3 switch with SVIs routes between VLANs directly in hardware, which scales far better.",
    feedbackIncorrect: "Not quite. Router-on-a-stick works fine functionally at small scale — the real issue as traffic grows is that every inter-VLAN packet has to cross the same single trunk link to reach the router.",
  },
};
