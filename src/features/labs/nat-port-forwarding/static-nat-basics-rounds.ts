import type { ChallengeRound } from "../challenge-rounds";

export const staticNatBasicsRounds: ChallengeRound[] = [
  {
    prompt: "A server inside your network has private IP 192.168.1.10. You configure a static NAT entry mapping it to public IP 203.0.113.5. What happens when an external host connects to 203.0.113.5?",
    options: [
      { id: "correct", label: "The router translates the destination to 192.168.1.10 and forwards the packet inside" },
      { id: "dropped", label: "The connection is dropped because private IPs can't be reached from outside" },
      { id: "direct", label: "The server replies using its public IP directly, with no translation involved" },
      { id: "broadcast", label: "The router broadcasts the request to every internal host" },
    ],
    correctId: "correct",
    explanation: "Static NAT creates a permanent one-to-one mapping between a private and public address. The router rewrites the destination IP from 203.0.113.5 to 192.168.1.10 on the way in, and the reverse on the way out, so the real private address is never exposed.",
  },
  {
    prompt: "Which NAT type is best suited for a single internal server (like a web server) that must always be reachable at the same public address?",
    options: [
      { id: "static", label: "Static NAT" },
      { id: "dynamic", label: "Dynamic NAT (pool-based)" },
      { id: "pat", label: "PAT / NAT overload" },
      { id: "none", label: "No NAT needed" },
    ],
    correctId: "static",
    explanation: "Static NAT gives a fixed, predictable public address — essential for a server others need to reliably reach. Dynamic NAT and PAT are designed for outbound client traffic sharing a pool or single address, not for hosting a stable inbound service.",
  },
  {
    prompt: "What is the main limitation of Dynamic NAT compared to PAT (NAT overload)?",
    options: [
      { id: "correct", label: "Dynamic NAT maps each internal host to one address from a pool, so it runs out of translations once the pool is exhausted" },
      { id: "cannot", label: "Dynamic NAT cannot translate IP addresses at all" },
      { id: "ipv6", label: "Dynamic NAT only works with IPv6" },
      { id: "route", label: "Dynamic NAT requires a static route to every internal host" },
    ],
    correctId: "correct",
    explanation: "Dynamic NAT uses a pool of public addresses and assigns one per active internal host — if more hosts are active than addresses in the pool, additional hosts can't get a translation until one frees up. PAT solves this by multiplexing many internal hosts onto one public address using different port numbers.",
  },
  {
    prompt: "A static NAT entry maps 192.168.1.10 to 203.0.113.5. A different internal host, 192.168.1.20, tries to reach the internet. What public address does its traffic use?",
    options: [
      { id: "shares", label: "203.0.113.5, since that's the only NAT entry configured" },
      { id: "correct", label: "192.168.1.20 cannot reach the internet unless it also has its own NAT (dynamic or PAT) entry configured" },
      { id: "auto", label: "The router automatically creates a new static entry for it" },
      { id: "session", label: "It uses .10's existing connection, sharing the same session" },
    ],
    correctId: "correct",
    explanation: "A static NAT entry only covers the specific host it's configured for. .20 isn't it, so unless a separate dynamic NAT or PAT rule also covers it, .20 has no translation and cannot reach the internet.",
  },
];
