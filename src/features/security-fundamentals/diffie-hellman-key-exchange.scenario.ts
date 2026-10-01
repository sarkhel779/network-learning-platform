import { parsePacketFlowScenario, type PacketFlowScenario } from "@/features/packet-flow/packet-flow.schema";

export const diffieHellmanKeyExchangeScenario: PacketFlowScenario = parsePacketFlowScenario({
  id: "diffie-hellman-key-exchange",
  title: "Diffie-Hellman: deriving a shared secret without ever sending it",
  description: "Watch Alice and Bob agree on public parameters, each generate a private value they never transmit, and independently derive an identical shared secret — one an eavesdropper who sees every public value still can't compute.",
  defaultSpeed: 1,
  devices: [
    { id: "alice", label: "Alice", role: "initiates key exchange", x: 140, y: 135 },
    { id: "bob", label: "Bob", role: "responds to key exchange", x: 640, y: 135 },
    { id: "eve", label: "Eve", role: "passive eavesdropper", x: 390, y: 280 },
  ],
  links: [
    { id: "alice-bob", from: "alice", to: "bob" },
  ],
  steps: [
    {
      id: "agree-on-public-parameters",
      title: "Alice and Bob agree on public parameters",
      explanation: "Alice and Bob agree on a public prime p = 23 and a generator g = 5. These values are sent in the clear — Eve, passively listening, sees them too, but that's fine: they're not secret.",
      durationMs: 2200,
      activeDeviceIds: ["alice", "bob", "eve"],
      activeLinkIds: ["alice-bob"],
      packet: { kind: "packet", label: "p = 23, g = 5 (public, cleartext)", from: "alice", to: "bob" },
      summaryFields: [
        { label: "Prime (p)", value: "23" },
        { label: "Generator (g)", value: "5" },
      ],
      detailFields: [
        { label: "Visible to Eve", value: "Yes — these are public by design" },
      ],
    },
    {
      id: "alice-generates-private-key",
      title: "Alice generates a private value",
      explanation: "Alice picks a secret integer a = 6. This value is never transmitted to anyone, including Bob.",
      durationMs: 1800,
      activeDeviceIds: ["alice"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Alice's private value (a)", value: "6 (never sent)", changed: true },
      ],
      detailFields: [],
    },
    {
      id: "alice-sends-public-value",
      title: "Alice sends her public value",
      explanation: "Alice computes A = g^a mod p = 5^6 mod 23 = 8, and sends A to Bob. Eve now sees A, but not the private exponent a that produced it.",
      durationMs: 2200,
      activeDeviceIds: ["alice", "bob", "eve"],
      activeLinkIds: ["alice-bob"],
      packet: { kind: "packet", label: "A = 8", from: "alice", to: "bob" },
      summaryFields: [
        { label: "A = g^a mod p", value: "5^6 mod 23 = 8" },
      ],
      detailFields: [
        { label: "Visible to Eve", value: "A = 8 (not a = 6)" },
      ],
    },
    {
      id: "bob-generates-private-key",
      title: "Bob generates a private value",
      explanation: "Bob picks his own secret integer b = 15, independently of Alice. This value is also never transmitted.",
      durationMs: 1800,
      activeDeviceIds: ["bob"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Bob's private value (b)", value: "15 (never sent)", changed: true },
      ],
      detailFields: [],
    },
    {
      id: "bob-sends-public-value",
      title: "Bob sends his public value",
      explanation: "Bob computes B = g^b mod p = 5^15 mod 23 = 19, and sends B to Alice. Eve now has p, g, A, and B — every public value in the exchange.",
      durationMs: 2200,
      activeDeviceIds: ["alice", "bob", "eve"],
      activeLinkIds: ["alice-bob"],
      packet: { kind: "packet", label: "B = 19", from: "bob", to: "alice" },
      summaryFields: [
        { label: "B = g^b mod p", value: "5^15 mod 23 = 19" },
      ],
      detailFields: [
        { label: "Visible to Eve", value: "B = 19 (not b = 15)" },
      ],
    },
    {
      id: "alice-computes-shared-secret",
      title: "Alice derives the shared secret",
      explanation: "Alice computes s = B^a mod p = 19^6 mod 23 = 2, using Bob's public value and her own private exponent.",
      durationMs: 2200,
      activeDeviceIds: ["alice"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Alice's shared secret", value: "19^6 mod 23 = 2", changed: true },
      ],
      detailFields: [],
    },
    {
      id: "bob-computes-shared-secret",
      title: "Bob derives the same shared secret",
      explanation: "Bob computes s = A^b mod p = 8^15 mod 23 = 2, using Alice's public value and his own private exponent — the identical result, derived independently.",
      durationMs: 2200,
      activeDeviceIds: ["bob"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Bob's shared secret", value: "8^15 mod 23 = 2", changed: true },
      ],
      detailFields: [],
      stateNote: "Both sides now hold the same secret (2) without it ever being transmitted — only p, g, A, and B crossed the network.",
    },
    {
      id: "eve-cannot-compute-secret",
      title: "Eve still can't compute the shared secret",
      explanation: "Eve has p, g, A, and B — everything that was sent. Computing the shared secret from those alone requires recovering a or b from A or B, which means solving the discrete logarithm problem. That's infeasible at real key sizes; p = 23 is only small enough here to let you check the arithmetic by hand.",
      durationMs: 2600,
      activeDeviceIds: ["eve"],
      activeLinkIds: [],
      summaryFields: [
        { label: "Eve knows", value: "p, g, A, B" },
        { label: "Eve cannot derive", value: "a, b, or the shared secret", changed: true },
      ],
      detailFields: [
        { label: "Why", value: "Recovering a from A = g^a mod p is the discrete logarithm problem" },
      ],
      stateNote: "Real protocols use primes hundreds of digits long specifically to make this problem computationally infeasible.",
    },
  ],
} as const);
