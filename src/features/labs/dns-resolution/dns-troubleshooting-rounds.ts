import type { ChallengeRound } from "../challenge-rounds";

export const dnsTroubleshootingRounds: ChallengeRound[] = [
  {
    prompt: "Your company just changed www.example.com's A record from an old server IP to a new one. Several users still reach the old server hours later. What's the most likely cause?",
    options: [
      { id: "correct", label: "The old record's TTL hadn't expired yet in those users' resolvers/caches, so they're still being served the stale cached answer" },
      { id: "immutable", label: "DNS records can never be changed once published" },
      { id: "firewall", label: "The new server's firewall is blocking all DNS traffic" },
      { id: "hostsfile", label: "Those users have a corrupted hosts file that overrides all DNS lookups" },
    ],
    correctId: "correct",
    explanation: "Cached DNS answers remain valid for their TTL. If the TTL was set to, say, 24 hours, resolvers that cached the old answer before the change will keep serving it until that TTL expires — the single most common cause of 'some users still see the old server' after a DNS change.",
  },
  {
    prompt: "To minimize this kind of delay the next time you plan a DNS change, what should you do in advance?",
    options: [
      { id: "correct", label: "Lower the record's TTL well before the change, so caches expire quickly once the new value is published" },
      { id: "raise", label: "Increase the TTL to the maximum right before the change" },
      { id: "delete", label: "Delete the DNS record entirely a week beforehand" },
      { id: "nothing", label: "Nothing can be done — DNS propagation delay is fixed and unavoidable" },
    ],
    correctId: "correct",
    explanation: "Pre-lowering the TTL (e.g., from 24 hours to 5 minutes) days before a planned change means that by the time you actually make the change, caches are already refreshing frequently — so the new value propagates fast. This is standard practice before a DNS cutover.",
  },
  {
    prompt: "A user reports NXDOMAIN (domain does not exist) when trying to reach a subdomain your team just created, like new.example.com. You've confirmed the A record exists at the authoritative server. What's a likely explanation?",
    options: [
      { id: "correct", label: "The earlier NXDOMAIN was itself cached as a negative response, and will be served until that negative cache's TTL expires" },
      { id: "protocolbroken", label: "NXDOMAIN means the DNS protocol itself is broken" },
      { id: "nosubdomains", label: "Subdomains can never be added to an existing domain" },
      { id: "nosupport", label: "The user's computer doesn't support subdomains" },
    ],
    correctId: "correct",
    explanation: "DNS resolvers can cache negative answers like NXDOMAIN too, governed by the SOA record's negative-caching TTL. If a client queried new.example.com before the record existed, it may have cached that failure and will keep returning it for a while — even though the record now exists upstream.",
  },
];
