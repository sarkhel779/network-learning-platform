import type { ChallengeRound } from "../challenge-rounds";

export const patOverloadRounds: ChallengeRound[] = [
  {
    prompt: "Your office has 50 internal hosts but only 1 public IP address from your ISP. Which NAT approach lets all 50 hosts access the internet simultaneously?",
    options: [
      { id: "static", label: "Static NAT" },
      { id: "dynamic", label: "Dynamic NAT (pool)" },
      { id: "correct", label: "PAT / NAT overload" },
      { id: "none", label: "No NAT — use private IPs directly on the internet" },
    ],
    correctId: "correct",
    explanation: "PAT (NAT overload) multiplexes many internal hosts onto a single public IP by using different source port numbers to distinguish each session — exactly what's needed when hosts outnumber public addresses.",
  },
  {
    prompt: "With PAT, two internal hosts (192.168.1.10 and 192.168.1.11) both open a web connection to the same external server at the same time. How does the router tell their return traffic apart?",
    options: [
      { id: "correct", label: "It assigns each host a different source port number on the shared public IP, and uses that port to route replies back to the correct host" },
      { id: "alternate", label: "It alternates which host gets internet access every few seconds" },
      { id: "onlyone", label: "It can't — only one of the two connections will work at a time" },
      { id: "mac", label: "It uses the hosts' MAC addresses embedded in the IP packet" },
    ],
    correctId: "correct",
    explanation: "PAT keeps a translation table of (public IP, public port) to (private IP, private port) for every session. Even though both hosts share one public IP, each gets a unique source port, so return traffic is unambiguous.",
  },
  {
    prompt: "What is the practical limit on simultaneous PAT sessions through a single public IP address, and why?",
    options: [
      { id: "correct", label: "Roughly 65,000, bounded by the number of available TCP/UDP port numbers" },
      { id: "254", label: "Exactly 254, one per possible host address in a /24" },
      { id: "unlimited", label: "There is no limit — PAT can handle unlimited sessions" },
      { id: "16", label: "16, matching common port security limits" },
    ],
    correctId: "correct",
    explanation: "Port numbers are 16-bit (0–65535), and PAT assigns one per translated session on a given public IP, so the theoretical ceiling is around 65,000 concurrent sessions (fewer in practice, since some ports are typically reserved).",
  },
  {
    prompt: "Why can't an external host normally initiate a new connection to an internal host behind PAT, without extra configuration?",
    options: [
      { id: "correct", label: "PAT only creates translation table entries in response to outbound traffic from inside, so there's no existing mapping for unsolicited inbound traffic" },
      { id: "firewall", label: "PAT blocks all traffic using a firewall rule by default" },
      { id: "physical", label: "External hosts are physically incapable of reaching private IP ranges" },
      { id: "ipv6", label: "PAT requires IPv6 for inbound connections" },
    ],
    correctId: "correct",
    explanation: "PAT (and NAT generally) builds its translation table dynamically from outbound sessions. Without a matching entry — created either by an existing outbound session or a manual rule like port forwarding — the router has no way to know which internal host unsolicited inbound traffic is meant for.",
  },
];
