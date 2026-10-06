import type { ChallengeRound } from "../challenge-rounds";

export const vlsmSubnetDesignRounds: ChallengeRound[] = [
  {
    prompt: "You're given 192.168.1.0/24 to allocate via VLSM. You need one subnet for 100 hosts, one for 50 hosts, and one for 20 hosts. Which mask fits the 100-host subnet with the least waste?",
    detail: "VLSM allocates the largest requirement first, then works down to the smallest.",
    options: [
      { id: "25", label: "/25 — 126 usable addresses" },
      { id: "24", label: "/24 — 254 usable addresses" },
      { id: "26", label: "/26 — 62 usable addresses" },
      { id: "27", label: "/27 — 30 usable addresses" },
    ],
    correctId: "25",
    explanation: "100 hosts need at least 100 usable addresses. /26 only gives 62 — too few. /25 gives 126 usable addresses (2^7 − 2), the smallest mask that still fits 100 with the least waste.",
  },
  {
    prompt: "After allocating 192.168.1.0/25 (addresses .0–.127) to the 100-host subnet, what block and mask should the 50-host subnet use?",
    options: [
      { id: "correct", label: "192.168.1.128/26 — 62 usable addresses" },
      { id: "overlap25", label: "192.168.1.128/25 — overlaps the next subnet's needed space" },
      { id: "overlap0", label: "192.168.1.0/26 — overlaps the subnet already allocated" },
      { id: "toosmall", label: "192.168.1.200/27 — 30 usable addresses, not enough for 50" },
    ],
    correctId: "correct",
    explanation: "The /25 allocation used 192.168.1.0–192.168.1.127. The next available block starts at 192.168.1.128. A /26 there (.128–.191) gives 62 usable addresses — enough for 50 hosts with far less waste than another /25.",
  },
  {
    prompt: "After the /25 and /26 allocations above (through 192.168.1.191), what block and mask fits the 20-host subnet?",
    options: [
      { id: "correct", label: "192.168.1.192/27 — 30 usable addresses" },
      { id: "overlap128", label: "192.168.1.128/27 — overlaps the 50-host subnet" },
      { id: "wasteful", label: "192.168.1.192/26 — far more addresses than needed" },
      { id: "overlap64", label: "192.168.1.64/28 — overlaps the 100-host subnet" },
    ],
    correctId: "correct",
    explanation: "The /26 allocation used up through 192.168.1.191. The next block, 192.168.1.192/27 (.192–.223), gives 30 usable addresses — enough for 20 hosts without excessive waste.",
  },
  {
    prompt: "Why does VLSM allocate the largest subnets first, working down to the smallest?",
    options: [
      { id: "correct", label: "A subnet must start on an address boundary matching its own size, so allocating largest-first keeps the remaining space contiguous and properly aligned for what's left" },
      { id: "convention", label: "Smaller subnets must always sit at the start of the range by convention only" },
      { id: "noeffect", label: "Allocation order has no effect on whether everything fits" },
      { id: "hardware", label: "Router hardware requires subnets configured in descending size order" },
    ],
    correctId: "correct",
    explanation: "A block of a given size must begin at an address that's a multiple of its own size. Allocating largest-first keeps remaining free space contiguous and large enough for the next requirement; allocating smaller subnets first can fragment the space so a later, larger requirement no longer has an aligned block available.",
  },
];
