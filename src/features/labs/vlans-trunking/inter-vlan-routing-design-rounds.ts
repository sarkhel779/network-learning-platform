import type { ChallengeRound } from "../challenge-rounds";

export const interVlanRoutingDesignRounds: ChallengeRound[] = [
  {
    prompt: "You have VLAN 10 (Sales) and VLAN 20 (Engineering) on a single switch, each needing to reach the other and the internet, but only one router with one physical interface available. What's the standard solution?",
    options: [
      { id: "correct", label: "Router-on-a-stick: one physical router interface configured with subinterfaces (e.g. Gi0/0.10, Gi0/0.20), each with 802.1Q encapsulation and an IP in its VLAN's subnet, connected to the switch over a trunk link" },
      { id: "twointerfaces", label: "Run two separate router interfaces for every VLAN, no exceptions" },
      { id: "merge", label: "Merge VLAN 10 and VLAN 20 into one VLAN so no routing is needed" },
      { id: "accessports", label: "Use access ports on the router" },
    ],
    correctId: "correct",
    explanation: "Router-on-a-stick lets a single physical interface serve many VLANs using logical subinterfaces, each tagged for its VLAN and holding that VLAN's default-gateway address — the switch connects to the router over a trunk so all tagged VLAN traffic reaches the right subinterface.",
  },
  {
    prompt: "In a router-on-a-stick setup, VLAN 10 hosts use 10.0.10.1 as their gateway and VLAN 20 hosts use 10.0.20.1. A VLAN 10 host can't reach a VLAN 20 host, but both can reach the internet. What's most likely missing?",
    options: [
      { id: "correct", label: "The switch port facing the router isn't configured as a trunk carrying both VLANs" },
      { id: "samesubnet", label: "VLAN 10 and VLAN 20 need the exact same subnet" },
      { id: "staticroute", label: "The router needs a static route to its own subinterface" },
      { id: "dns", label: "DNS is not configured on the router" },
    ],
    correctId: "correct",
    explanation: "If both VLANs can reach the internet, their gateways and subinterfaces are working individually — so inter-VLAN traffic failing specifically points at the switch-to-router link: it must be a trunk carrying both VLAN 10 and VLAN 20 tagged traffic, or one VLAN's tagged frames never reach the router's matching subinterface.",
  },
  {
    prompt: "For a larger network with many VLANs and high inter-VLAN traffic, why might a Layer 3 switch with SVIs be preferred over router-on-a-stick?",
    options: [
      { id: "correct", label: "A Layer 3 switch routes between VLANs in hardware at switch speed, avoiding the single-link bottleneck and extra hop of sending all inter-VLAN traffic through one router interface" },
      { id: "twovlanlimit", label: "Router-on-a-stick cannot support more than 2 VLANs" },
      { id: "noip", label: "Layer 3 switches don't need IP addresses configured" },
      { id: "svinotallowed", label: "SVIs cannot be used for inter-VLAN routing" },
    ],
    correctId: "correct",
    explanation: "Router-on-a-stick funnels all inter-VLAN traffic through one physical link to the router, which becomes a bottleneck as VLAN count and traffic grow. A Layer 3 switch with SVIs (Switched Virtual Interfaces) routes between VLANs directly in hardware, which scales much better.",
  },
];
