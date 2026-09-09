export type SubnetScenarioKind = "containing-subnet" | "same-subnet" | "valid-host" | "smallest-subnet" | "reserved-address";
export type SubnetScenario = {
  id: string; kind: SubnetScenarioKind; prompt: string; address: string; prefix: number;
  options: readonly { id: string; label: string }[]; correctOptionId: string;
  explanationSteps: readonly string[];
};

export const SUBNET_SCENARIOS: readonly SubnetScenario[] = [
  { id: "containing", kind: "containing-subnet", prompt: "Which /26 subnet contains 192.0.2.130?", address: "192.0.2.130", prefix: 26,
    options: [{ id: "wrong", label: "192.0.2.127" }, { id: "right", label: "192.0.2.128" }, { id: "wrong2", label: "192.0.2.192" }], correctOptionId: "right",
    explanationSteps: ["A /26 mask has a block size of 64.", "The boundaries are 0, 64, 128 and 192.", "130 lies in 192.0.2.128/26."] },
  { id: "same", kind: "same-subnet", prompt: "Are 198.51.100.254 and 198.51.101.1 in the same local subnet?", address: "198.51.100.254", prefix: 24,
    options: [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }], correctOptionId: "no",
    explanationSteps: ["Apply /24 to both addresses.", "Their network addresses are 198.51.100.0 and 198.51.101.0.", "Different network addresses require a router."] },
  { id: "host", kind: "valid-host", prompt: "Which address is a usable host in 203.0.113.8/29?", address: "203.0.113.8", prefix: 29,
    options: [{ id: "network", label: "203.0.113.8" }, { id: "host", label: "203.0.113.10" }, { id: "broadcast", label: "203.0.113.15" }], correctOptionId: "host",
    explanationSteps: ["A /29 contains eight addresses.", "The network is .8 and broadcast is .15.", ".10 is inside the usable .9–.14 range."] },
  { id: "capacity", kind: "smallest-subnet", prompt: "What is the smallest traditional subnet for 14 hosts?", address: "192.0.2.0", prefix: 28,
    options: [{ id: "24", label: "/24" }, { id: "28", label: "/28" }, { id: "30", label: "/30" }], correctOptionId: "28",
    explanationSteps: ["Four host bits provide 16 total addresses.", "Subtract network and broadcast addresses.", "A /28 provides 14 traditionally usable hosts."] },
  { id: "reserved", kind: "reserved-address", prompt: "Which address is the broadcast address of 192.0.2.4/30?", address: "192.0.2.4", prefix: 30,
    options: [{ id: "network", label: "192.0.2.4" }, { id: "host", label: "192.0.2.6" }, { id: "broadcast", label: "192.0.2.7" }], correctOptionId: "broadcast",
    explanationSteps: ["A /30 has a block size of four.", "This block runs from .4 through .7.", "The final address, .7, is its broadcast address."] },
];
