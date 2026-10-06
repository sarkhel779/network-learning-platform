import type { ChallengeRound } from "../challenge-rounds";

export const natTroubleshootingRounds: ChallengeRound[] = [
  {
    prompt: "After enabling PAT, hosts on 192.168.1.0/24 still can't reach the internet, while hosts on 192.168.2.0/24 work fine. The router's config includes:\n\naccess-list 1 deny 192.168.1.0 0.0.0.255\naccess-list 1 permit any\nip nat inside source list 1 interface GigabitEthernet0/1 overload\n\nWhat's wrong?",
    detail: "NAT overload uses an access list to decide which traffic gets translated — the ACL controls what NAT translates, not general connectivity.",
    options: [
      { id: "correct", label: "The access list explicitly denies 192.168.1.0/24 from matching the NAT rule, so that subnet is excluded from translation entirely" },
      { id: "onesubnet", label: "The 'overload' keyword only supports one subnet at a time" },
      { id: "interface", label: "GigabitEthernet0/1 is the wrong interface type for NAT" },
      { id: "noacl", label: "Access lists cannot be used with NAT at all" },
    ],
    correctId: "correct",
    explanation: "The ACL's first line denies (excludes) 192.168.1.0/24 from matching — since NAT only translates traffic permitted by the ACL, that subnet is never translated and so can't reach the internet. The fix is to permit 192.168.1.0/24 before the final permit any.",
  },
  {
    prompt: "A host can ping internal servers fine but gets 'destination unreachable' trying to reach the internet. `show ip nat translations` shows no entries for that host, and the NAT overload rule's ACL already permits its subnet. What should you check next?",
    options: [
      { id: "correct", label: "Whether the host has a default route pointing to the NAT router as its gateway" },
      { id: "mac", label: "Whether the host's MAC address is on an allow list" },
      { id: "mask", label: "Whether the host's subnet mask uses /23 instead of /24" },
      { id: "dns", label: "Whether DNS is configured on the host" },
    ],
    correctId: "correct",
    explanation: "If NAT translations never appear for a host, its traffic isn't reaching the NAT-enabled router/interface at all — the most common cause is a missing or wrong default gateway, so outbound packets never arrive at the router to be translated in the first place.",
  },
  {
    prompt: "NAT overload is applied correctly and translations are being created, but users still report intermittent internet failures under heavy load. What's a plausible advanced cause?",
    options: [
      { id: "correct", label: "PAT's translation table is exhausting available ports/sessions under heavy load, causing new connection attempts to fail" },
      { id: "limit10", label: "NAT overload can only translate 10 sessions total, by design" },
      { id: "range", label: "The internal hosts are using an invalid private IP range" },
      { id: "udponly", label: "NAT doesn't support TCP, only UDP" },
    ],
    correctId: "correct",
    explanation: "When many hosts generate many simultaneous sessions, a single public IP's roughly 65,000 available ports can become a real constraint — especially if old sessions aren't timing out quickly enough. This is a legitimate operational issue advanced troubleshooting should consider.",
  },
];
