import type { ChallengeRound } from "../challenge-rounds";

export const aclDirectionTroubleshootingRounds: ChallengeRound[] = [
  {
    prompt: "You want to block host 192.168.1.50 (on the LAN) from reaching the internet. You create an ACL denying 192.168.1.50 and apply it with 'ip access-group 101 out' on the LAN-facing interface (where the LAN plugs in). The host can still reach the internet. What's wrong?",
    detail: "Direction is relative to the router: 'in' means traffic entering the router through that interface, 'out' means traffic leaving through it.",
    options: [
      { id: "correct", label: "The ACL should be applied 'in' on the LAN interface, since the host's traffic enters the router there — 'out' on that interface only filters traffic going back toward the LAN" },
      { id: "ipv6only", label: "ACL 101 is reserved for IPv6 only" },
      { id: "wronginterface", label: "The host's traffic must be denied on the ISP-facing interface instead, never the LAN interface" },
      { id: "nohostdeny", label: "Standard ACLs cannot deny individual hosts, only subnets" },
    ],
    correctId: "correct",
    explanation: "Since the host's outbound traffic enters the router via the LAN interface, the ACL needs to be applied 'in' there to catch it before routing. Applied 'out' on that same interface, it would only check traffic the router is sending back toward the LAN — the reverse of what's needed.",
  },
  {
    prompt: "A standard numbered ACL (access-list 1–99) can only match on which field of a packet?",
    options: [
      { id: "correct", label: "Source IP address only" },
      { id: "both", label: "Source and destination IP, plus port numbers" },
      { id: "mac", label: "MAC address only" },
      { id: "hostname", label: "DNS hostname" },
    ],
    correctId: "correct",
    explanation: "Standard ACLs (numbered 1–99) can only filter based on source IP address. To filter by destination address, protocol, or port number, you need an extended ACL (numbered 100–199, or named).",
  },
  {
    prompt: "Because standard ACLs can only match source address, best practice is to apply them:",
    options: [
      { id: "correct", label: "As close to the destination as possible, so they don't accidentally block that source's traffic to other, legitimate destinations" },
      { id: "nearsource", label: "As close to the source as possible, always" },
      { id: "everywhere", label: "On every interface in the network, both in and out" },
      { id: "internetonly", label: "Only on interfaces connected to the internet" },
    ],
    correctId: "correct",
    explanation: "Since a standard ACL can't distinguish between destinations, placing it near the source would block that source's traffic to every destination, not just the one you care about. Placing it near the destination limits the effect to just the traffic headed there. Extended ACLs, which can match destination too, are generally placed close to the source instead.",
  },
];
