import type { ChallengeRound } from "./challenge-rounds";

export const subnetMaskRounds: ChallengeRound[] = [
  {
    prompt: "You need at least 50 usable host addresses on this subnet. Which prefix length gives you enough addresses with the least waste?",
    options: [
      { id: "24", label: "/24 — 254 usable addresses" },
      { id: "25", label: "/25 — 126 usable addresses" },
      { id: "26", label: "/26 — 62 usable addresses" },
      { id: "27", label: "/27 — 30 usable addresses" },
    ],
    correctId: "26",
    explanation: "/26 gives 2^6 − 2 = 62 usable addresses, enough for 50 hosts with the least waste. /25 would also work but wastes more addresses; /27 only gives 30, which is not enough.",
  },
  {
    prompt: "You need at least 10 usable host addresses. Which is the smallest valid subnet?",
    options: [
      { id: "30", label: "/30 — 2 usable addresses" },
      { id: "29", label: "/29 — 6 usable addresses" },
      { id: "28", label: "/28 — 14 usable addresses" },
      { id: "27", label: "/27 — 30 usable addresses" },
    ],
    correctId: "28",
    explanation: "/29 only gives 2^3 − 2 = 6 usable addresses, too few. /28 gives 2^4 − 2 = 14 usable addresses — enough, and the smallest subnet that fits.",
  },
  {
    prompt: "A /30 subnet is commonly used for what kind of link?",
    options: [
      { id: "ptp", label: "A point-to-point link between two routers — 2 usable addresses" },
      { id: "office", label: "A large office LAN — 62 usable addresses" },
      { id: "four", label: "A /30 provides 4 usable addresses" },
      { id: "none", label: "A /30 has no usable addresses" },
    ],
    correctId: "ptp",
    explanation: "/30 reserves 4 total addresses (network, 2 usable, broadcast) — 2^2 − 2 = 2 usable — exactly enough for a two-router point-to-point link.",
  },
  {
    prompt: "You need 4 subnets from 192.168.1.0/24, each supporting at least 50 hosts. Which mask should you use?",
    detail: "Borrowing bits from the host portion increases the number of subnets but shrinks each subnet's host capacity.",
    options: [
      { id: "25", label: "/25 — only 2 subnets available" },
      { id: "26", label: "/26 — 4 subnets of 62 usable hosts each" },
      { id: "27", label: "/27 — 8 subnets of 30 usable hosts each" },
      { id: "24", label: "/24 — no subnetting applied" },
    ],
    correctId: "26",
    explanation: "Borrowing 2 bits (24 → 26) creates 2^2 = 4 subnets, each with 2^6 − 2 = 62 usable hosts — enough for both the subnet count and the host requirement.",
  },
];
