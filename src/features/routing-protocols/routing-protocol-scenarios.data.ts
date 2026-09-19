export type RoutingProtocolId = "static" | "rip" | "ospf" | "eigrp" | "bgp";

export type RoutingProtocolScenario = {
  id: string;
  title: string;
  recommended: RoutingProtocolId;
  reasoning: string;
  ruledOut: { protocol: RoutingProtocolId; reason: string }[];
};

export const protocolLabels: Record<RoutingProtocolId, string> = {
  static: "Static routing",
  rip: "RIP",
  ospf: "OSPF",
  eigrp: "EIGRP",
  bgp: "BGP",
};

export const publicRoutingProtocolScenarios: RoutingProtocolScenario[] = [
  {
    id: "small-lab",
    title: "A small lab with two routers and a stable topology",
    recommended: "static",
    reasoning: "With only two routers and nothing changing, a couple of static routes are simpler to configure and audit than running a routing protocol, and there is no scale problem to justify the overhead.",
    ruledOut: [
      { protocol: "ospf", reason: "Running a link-state protocol for two routers adds configuration and control-plane overhead with no convergence benefit at this scale." },
    ],
  },
  {
    id: "single-vendor-enterprise",
    title: "A large, all-Cisco enterprise that wants fast convergence with simple configuration",
    recommended: "eigrp",
    reasoning: "EIGRP's composite metric and unequal-cost load balancing suit an all-Cisco environment that wants OSPF-like convergence speed without OSPF's area design.",
    ruledOut: [
      { protocol: "rip", reason: "RIP's hop-count metric and slow periodic updates do not scale to a large enterprise." },
      { protocol: "bgp", reason: "BGP is built for policy between independent organizations, not one company's internal topology." },
    ],
  },
  {
    id: "multi-vendor-enterprise",
    title: "A multi-vendor enterprise that wants fast, standards-based convergence",
    recommended: "ospf",
    reasoning: "OSPF is an open standard supported by every major vendor and converges quickly because every router holds an identical map of the organization's own topology.",
    ruledOut: [
      { protocol: "eigrp", reason: "EIGRP's interoperability outside Cisco-heavy environments is limited." },
      { protocol: "rip", reason: "RIP's slow convergence and hop-count metric are a poor fit once the network has more than a few routers." },
    ],
  },
  {
    id: "connect-two-organizations",
    title: "Connecting two independently administered networks",
    recommended: "bgp",
    reasoning: "Exchanging routes between two autonomous systems is exactly what BGP is designed for: each side keeps policy control over what it accepts and announces instead of blindly trusting the other's shortest path.",
    ruledOut: [
      { protocol: "ospf", reason: "OSPF assumes one administrative domain sharing a single link-state database, not two independently managed networks." },
    ],
  },
  {
    id: "legacy-branch",
    title: "A small, low-change legacy branch network with minimal engineering support",
    recommended: "rip",
    reasoning: "RIP's simplicity can still fit a very small, low-change legacy network with little operational support, though most new deployments choose OSPF instead even at small scale.",
    ruledOut: [
      { protocol: "bgp", reason: "BGP's policy machinery is unnecessary complexity for one small internal network." },
    ],
  },
];
