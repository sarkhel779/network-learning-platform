import type { LabTopic } from "./labs.types";

export const labTopics: LabTopic[] = [
  {
    slug: "packet-forwarding",
    title: "Packet Forwarding",
    description: "Trace how a device decides where to send a packet next, hop by hop, across a few common setups.",
    scenarios: [
      {
        slug: "local-delivery",
        title: "Local delivery on one LAN",
        summary: "Two hosts on the same subnet exchange a ping with no router involved.",
        difficulty: "Beginner",
        estimatedMinutes: 5,
      },
      {
        slug: "remote-delivery",
        title: "Delivery across a gateway",
        summary: "A host reaches a remote server through its default gateway router.",
        difficulty: "Beginner",
        estimatedMinutes: 6,
      },
      {
        slug: "missing-gateway",
        title: "Missing default gateway",
        summary: "Diagnose why a packet to a remote network never leaves the host.",
        difficulty: "Intermediate",
        estimatedMinutes: 4,
      },
    ],
  },
  {
    slug: "ip-subnetting",
    title: "IP Addressing & Subnetting",
    description: "Practice picking subnet masks and reading addresses quickly, the way you would on the job.",
    scenarios: [
      {
        slug: "find-the-subnet-mask",
        title: "Find the subnet mask",
        summary: "Given a host-count or subnet-count requirement, choose the smallest mask that fits.",
        difficulty: "Beginner",
        estimatedMinutes: 6,
      },
      {
        slug: "identify-network-and-broadcast",
        title: "Identify network & broadcast",
        summary: "Given an address and a mask, identify the network ID and broadcast address.",
        difficulty: "Intermediate",
        estimatedMinutes: 7,
      },
      {
        slug: "vlsm-subnet-design",
        title: "VLSM subnet design",
        summary: "Carve one block into differently-sized subnets without overlap or wasted space.",
        difficulty: "Advanced",
        estimatedMinutes: 9,
      },
    ],
  },
  {
    slug: "nat-port-forwarding",
    title: "NAT & Port Forwarding",
    description: "Work through how address translation lets private networks share public addresses — and what breaks it.",
    scenarios: [
      {
        slug: "static-nat-basics",
        title: "Static NAT basics",
        summary: "A one-to-one mapping gives a single internal server a fixed public address.",
        difficulty: "Beginner",
        estimatedMinutes: 5,
      },
      {
        slug: "pat-overload",
        title: "PAT / NAT overload",
        summary: "Share one public IP across many internal hosts using port numbers.",
        difficulty: "Intermediate",
        estimatedMinutes: 7,
      },
      {
        slug: "nat-troubleshooting",
        title: "NAT troubleshooting",
        summary: "Diagnose a misconfigured ACL that silently excludes a subnet from translation.",
        difficulty: "Advanced",
        estimatedMinutes: 8,
      },
    ],
  },
  {
    slug: "vlans-trunking",
    title: "VLANs & Trunking",
    description: "Segment a switched network into VLANs, carry them over trunks, and route between them.",
    scenarios: [
      {
        slug: "access-vs-trunk",
        title: "Access vs. trunk ports",
        summary: "Match the right port mode to end devices versus switch-to-switch links.",
        difficulty: "Beginner",
        estimatedMinutes: 5,
      },
      {
        slug: "native-vlan-mismatch",
        title: "Native VLAN mismatch",
        summary: "Spot the risk when two trunk ends disagree on the native VLAN.",
        difficulty: "Intermediate",
        estimatedMinutes: 6,
      },
      {
        slug: "inter-vlan-routing-design",
        title: "Inter-VLAN routing design",
        summary: "Choose between router-on-a-stick and a Layer 3 switch as VLANs scale up.",
        difficulty: "Advanced",
        estimatedMinutes: 8,
      },
    ],
  },
  {
    slug: "access-control-lists",
    title: "Access Control Lists",
    description: "Learn how ACLs evaluate traffic in order, and where small mistakes quietly break a rule.",
    scenarios: [
      {
        slug: "permit-deny-basics",
        title: "Permit/deny basics",
        summary: "Understand the implicit deny that sits at the end of every ACL.",
        difficulty: "Beginner",
        estimatedMinutes: 5,
      },
      {
        slug: "acl-rule-order",
        title: "Rule order matters",
        summary: "See how a general rule placed too early can shadow a more specific one.",
        difficulty: "Intermediate",
        estimatedMinutes: 6,
      },
      {
        slug: "acl-direction-troubleshooting",
        title: "Direction & placement troubleshooting",
        summary: "Diagnose an ACL applied in the wrong direction, and where standard ACLs belong.",
        difficulty: "Advanced",
        estimatedMinutes: 8,
      },
    ],
  },
  {
    slug: "arp-resolution",
    title: "ARP Resolution",
    description: "See how a host turns an unknown IP into a MAC address — one subnet check and one request/reply exchange at a time.",
    scenarios: [
      {
        slug: "same-subnet-arp",
        title: "ARP within the same subnet",
        summary: "Work out whether a destination is local, then build the ARP request yourself.",
        difficulty: "Beginner",
        estimatedMinutes: 7,
      },
    ],
  },
  {
    slug: "dns-resolution",
    title: "DNS Resolution",
    description: "Follow a name lookup from record types through the full resolution chain to common failures.",
    scenarios: [
      {
        slug: "dns-record-types",
        title: "DNS record types",
        summary: "Match A, CNAME, MX, and PTR records to what they actually do.",
        difficulty: "Beginner",
        estimatedMinutes: 5,
      },
      {
        slug: "dns-resolution-order",
        title: "Resolution order",
        summary: "Walk the lookup chain from hosts file to root, TLD, and authoritative servers.",
        difficulty: "Intermediate",
        estimatedMinutes: 6,
      },
      {
        slug: "dns-troubleshooting",
        title: "DNS troubleshooting",
        summary: "Explain stale answers and NXDOMAIN caching after a record change.",
        difficulty: "Advanced",
        estimatedMinutes: 8,
      },
    ],
  },
];
