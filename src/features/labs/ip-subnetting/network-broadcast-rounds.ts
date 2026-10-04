import type { ChallengeRound } from "./challenge-rounds";

export const networkBroadcastRounds: ChallengeRound[] = [
  {
    prompt: "What are the network and broadcast addresses for 192.168.10.77/26?",
    detail: "A /26 mask creates blocks of 64 addresses: 0, 64, 128, 192.",
    options: [
      { id: "correct", label: "Network 192.168.10.64 · Broadcast 192.168.10.127" },
      { id: "prev-block", label: "Network 192.168.10.0 · Broadcast 192.168.10.63" },
      { id: "off-by-one", label: "Network 192.168.10.64 · Broadcast 192.168.10.126" },
      { id: "next-block", label: "Network 192.168.10.128 · Broadcast 192.168.10.191" },
    ],
    correctId: "correct",
    explanation: "192.168.10.77 falls in the 64–127 block of a /26 (block size 64), so the network address is 192.168.10.64 and the broadcast address — the last address in that block — is 192.168.10.127.",
  },
  {
    prompt: "What are the network and broadcast addresses for 10.4.17.200/28?",
    detail: "A /28 mask creates blocks of 16 addresses.",
    options: [
      { id: "correct", label: "Network 10.4.17.192 · Broadcast 10.4.17.207" },
      { id: "prev-block", label: "Network 10.4.17.176 · Broadcast 10.4.17.191" },
      { id: "next-block", label: "Network 10.4.17.208 · Broadcast 10.4.17.223" },
      { id: "off-by-one", label: "Network 10.4.17.192 · Broadcast 10.4.17.206" },
    ],
    correctId: "correct",
    explanation: "/28 creates 16-address blocks. 200 falls between 192 and 207, so the network address is 10.4.17.192 and the broadcast address is 10.4.17.207.",
  },
  {
    prompt: "What are the network and broadcast addresses for 172.16.5.130/25?",
    detail: "A /25 mask splits the last octet into two 128-address halves: 0–127 and 128–255.",
    options: [
      { id: "correct", label: "Network 172.16.5.128 · Broadcast 172.16.5.255" },
      { id: "prev-block", label: "Network 172.16.5.0 · Broadcast 172.16.5.127" },
      { id: "off-by-one", label: "Network 172.16.5.128 · Broadcast 172.16.5.254" },
      { id: "wrong-octet", label: "Network 172.16.6.0 · Broadcast 172.16.6.127" },
    ],
    correctId: "correct",
    explanation: "130 falls in the second half (128–255) of a /25, so the network address is 172.16.5.128 and the broadcast address is 172.16.5.255.",
  },
  {
    prompt: "What are the network and broadcast addresses for 192.0.2.10/30?",
    detail: "A /30 mask creates blocks of 4 addresses.",
    options: [
      { id: "correct", label: "Network 192.0.2.8 · Broadcast 192.0.2.11" },
      { id: "prev-block", label: "Network 192.0.2.4 · Broadcast 192.0.2.7" },
      { id: "next-block", label: "Network 192.0.2.12 · Broadcast 192.0.2.15" },
      { id: "off-by-one", label: "Network 192.0.2.8 · Broadcast 192.0.2.10" },
    ],
    correctId: "correct",
    explanation: "/30 creates 4-address blocks. 10 falls between 8 and 11, so the network address is 192.0.2.8 and the broadcast address — the last address in the block — is 192.0.2.11.",
  },
];
