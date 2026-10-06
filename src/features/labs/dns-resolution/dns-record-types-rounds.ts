import type { ChallengeRound } from "../challenge-rounds";

export const dnsRecordTypesRounds: ChallengeRound[] = [
  {
    prompt: "Which DNS record type maps a hostname directly to an IPv4 address?",
    options: [
      { id: "correct", label: "A record" },
      { id: "cname", label: "CNAME record" },
      { id: "mx", label: "MX record" },
      { id: "txt", label: "TXT record" },
    ],
    correctId: "correct",
    explanation: "An A record maps a hostname to an IPv4 address (AAAA does the same for IPv6). CNAME maps a hostname to another hostname (an alias), MX specifies mail servers, and TXT holds arbitrary text data.",
  },
  {
    prompt: "www.example.com is configured as a CNAME pointing to example.com, which has an A record for 93.184.216.34. What IP does a resolver ultimately return for www.example.com?",
    options: [
      { id: "correct", label: "93.184.216.34 — the resolver follows the CNAME to example.com, then resolves that name's A record" },
      { id: "nocname", label: "No IP — CNAMEs cannot be resolved to an address" },
      { id: "newaddr", label: "A new, auto-generated address distinct from example.com's" },
      { id: "error", label: "The resolver returns an error because www.example.com has no address itself" },
    ],
    correctId: "correct",
    explanation: "A CNAME record is an alias: it tells the resolver 'this name is really just another name — go look that one up instead.' The resolver follows the chain until it reaches a name with an actual A (or AAAA) record, then returns that address.",
  },
  {
    prompt: "Which record type tells other mail servers where to deliver email for a domain?",
    options: [
      { id: "correct", label: "MX record" },
      { id: "a", label: "A record" },
      { id: "ns", label: "NS record" },
      { id: "ptr", label: "PTR record" },
    ],
    correctId: "correct",
    explanation: "MX (Mail Exchange) records specify which mail servers handle email for a domain, along with a priority value. NS records specify a domain's authoritative name servers, and PTR records are used for reverse DNS lookups.",
  },
  {
    prompt: "What does a PTR record do?",
    options: [
      { id: "correct", label: "Maps an IP address back to a hostname — the reverse of an A record" },
      { id: "mail", label: "Points a domain to its mail server" },
      { id: "ttl", label: "Stores the domain's TTL value" },
      { id: "redirect", label: "Redirects HTTP traffic to HTTPS" },
    ],
    correctId: "correct",
    explanation: "PTR (pointer) records live in reverse DNS zones and answer 'what hostname does this IP address belong to?' — useful for things like verifying a mail server's identity or logging readable hostnames instead of raw IPs.",
  },
];
