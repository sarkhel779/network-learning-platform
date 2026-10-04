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
    ],
  },
];
