import type { ChallengeRound } from "../challenge-rounds";

export const dnsResolutionOrderRounds: ChallengeRound[] = [
  {
    prompt: "Your laptop needs to resolve www.example.com and has an empty DNS cache. Before contacting any DNS server, what does the OS check first?",
    options: [
      { id: "correct", label: "The local hosts file, for a manually configured entry" },
      { id: "authoritative", label: "The domain's authoritative name server directly" },
      { id: "random", label: "A random public resolver chosen at query time" },
      { id: "tld", label: "The TLD (.com) name servers" },
    ],
    correctId: "correct",
    explanation: "Before any network query, most operating systems check a local hosts file for a static mapping. Only if there's no match there does the OS send a query to its configured recursive resolver.",
  },
  {
    prompt: "Assuming no cache and no hosts file entry, which server does the recursive resolver contact first to resolve www.example.com?",
    options: [
      { id: "correct", label: "A root DNS server, to find out who is authoritative for the .com TLD" },
      { id: "authoritative", label: "example.com's authoritative name server directly" },
      { id: "webserver", label: "The destination web server itself" },
      { id: "cname", label: "A CNAME server" },
    ],
    correctId: "correct",
    explanation: "Starting from nothing, the recursive resolver begins at the root. The root servers don't know the answer directly, but they know which servers are authoritative for each top-level domain like .com, so they refer the resolver onward.",
  },
  {
    prompt: "After the root server responds, what's the next step in resolving www.example.com?",
    options: [
      { id: "correct", label: "Query the .com TLD name servers, which refer the resolver to example.com's authoritative name servers" },
      { id: "cached", label: "Immediately return a cached answer regardless of TTL" },
      { id: "ptr", label: "Query a PTR record for the destination IP" },
      { id: "mailserver", label: "Contact the mail server for example.com" },
    ],
    correctId: "correct",
    explanation: "The TLD servers (for .com, .org, etc.) don't hold the final answer either — they refer the resolver to the specific authoritative name servers for example.com, which actually hold the A record for www.example.com.",
  },
  {
    prompt: "Once the resolver gets the final answer from example.com's authoritative server, what does it do with it, besides returning it to the client?",
    options: [
      { id: "correct", label: "Cache it locally for the duration of the record's TTL, so future queries for that name don't repeat the whole process" },
      { id: "discard", label: "Immediately discard it to avoid stale data" },
      { id: "forwardroot", label: "Forward it to the root servers for verification" },
      { id: "permanent", label: "Store it permanently with no expiration" },
    ],
    correctId: "correct",
    explanation: "Caching the result for its TTL (time-to-live) is what makes DNS fast in practice — repeated lookups for a popular name are answered from cache instead of walking the whole root to TLD to authoritative chain again, until the TTL expires.",
  },
];
