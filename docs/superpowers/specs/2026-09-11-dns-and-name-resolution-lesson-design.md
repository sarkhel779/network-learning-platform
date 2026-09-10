# DNS and Name Resolution Lesson Design

## Purpose

Publish a packet-first DNS lesson at
`/learn/networking-foundations/dns-and-name-resolution`. The lesson must let a
beginner trace a name from an application through the stub resolver, recursive
resolver, root, TLD, and authoritative servers while inspecting each DNS
message, delegation, cache decision, transport choice, and response.

The public lesson teaches the complete everyday resolution model. A free
account unlocks guided evidence and troubleshooting practice. Pro adds the
operational and standards depth required to analyze difficult DNS incidents.
The root bootstrap and trailing-root-dot material is a Pro-only bonus topic.

## Learning outcomes

By the end of the lesson, a learner can:

- explain why applications use DNS and distinguish a name from an IP address;
- distinguish stub, recursive, root, TLD, and authoritative DNS roles;
- trace recursive service from the client and iterative referrals upstream;
- read an absolute domain name and explain labels, zones, and delegation;
- choose and interpret common DNS record types;
- inspect DNS header flags, section counts, questions, and resource records;
- distinguish positive, negative, and expired cache entries using TTL evidence;
- explain when DNS uses UDP 53, TCP 53, EDNS, or encrypted transports;
- distinguish NOERROR with data, NODATA, NXDOMAIN, SERVFAIL, REFUSED, and
  FORMERR;
- use `nslookup`, `Resolve-DnsName`, `dig`, and Wireshark evidence without
  treating any one tool's presentation as the protocol itself;
- diagnose common client, resolver, delegation, authority, cache, and transport
  failures.

## Access model

### Public

1. Why name resolution exists
2. DNS roles and responsibility boundaries
3. Domain labels, zones, and delegation
4. Recursive service versus iterative referrals
5. Interactive complete DNS resolution journey
6. DNS message and header structure
7. Common record types and record-selection rules
8. UDP 53, TCP 53, EDNS, and encrypted-DNS boundaries
9. Caching, TTL, and negative caching
10. Response codes and NODATA
11. Reverse DNS
12. Interactive DNS troubleshooting journey
13. Practical command and capture evidence
14. Common misconceptions
15. Summary and next steps

Both public players include one failure or contrast scenario so visitors can
judge the interactive teaching before creating an account.

### Free account

- A guided cold-cache versus warm-cache comparison
- Record-selection practice for A, AAAA, CNAME, NS, SOA, MX, TXT, PTR, SRV,
  and CAA
- NXDOMAIN versus NODATA evidence practice
- Delegation and authoritative-answer troubleshooting
- UDP-to-TCP behavior and packet-capture analysis
- Three knowledge checks with immediate conceptual explanations

Submitting any answer records an attempt even when the answer is incorrect.
Correctness and the explanation remain visible. Account-only sections appear
as `Locked` to unauthenticated visitors without adding account-tier labels to
the course-content list.

### Pro

- Interactive DNS timing diagram
- Advanced Wireshark analysis
- RFC-level checks with immediate explanations
- DNSSEC chain-of-trust awareness using DS, DNSKEY, RRSIG, NSEC, and NSEC3
- EDNS buffer negotiation, truncation, fragmentation risk, and TCP fallback
- Glue, lame delegation, delegation loops, and bailiwick boundaries
- Cache-poisoning defenses and transaction/source-port evidence
- Split-horizon DNS and conditional-forwarding loops
- Anycast operational behavior
- AXFR, IXFR, NOTIFY, and dynamic DNS boundaries
- **Bonus: the trailing root dot and how resolvers locate root servers**

The lesson must distinguish protocol requirements from common implementation
behavior. It must not imply that encrypted DNS changes DNS data semantics, that
anycast creates multiple logical root-server names, or that DNSSEC encrypts
queries.

## Technical approach

Create a focused `src/features/dns` domain containing validated scenario
contracts, pure resolution and troubleshooting builders, message models, and
the interactive components. MDX owns the teaching prose. Existing playback,
reduced-motion, progress, knowledge-check, registration-gate, premium-preview,
catalog, navigation, lesson-shell, and responsive player conventions remain
authoritative.

Scenario data is the single source of truth. Components render validated facts
and never independently infer packet flags, server roles, record ownership,
cache state, or final outcomes.

Use documentation-safe example domains and IP address ranges. Do not send live
DNS traffic or depend on a public resolver at runtime. Command and Wireshark
examples are deterministic authored evidence so the lesson remains reliable,
private, and testable offline.

## Validated scenario model

Each scenario defines:

- stable scenario and step identifiers;
- the original application question and requested type;
- client, stub resolver, recursive resolver, and relevant authoritative roles;
- queried server, transport, source/destination ports, and direction;
- query ID, opcode, flags, response code, and all four section counts;
- ordered Question, Answer, Authority, and Additional section entries;
- owner name, type, class, TTL, and type-specific RDATA for every record;
- whether each reply is an answer, referral, negative answer, or failure;
- cache lookup result, stored records, remaining TTL, and expiry behavior;
- plain-language explanation, packet evidence, result, and terminal marker.

Validation rejects duplicate IDs, malformed names or documentation addresses,
impossible ports, answers without QR set, queries with response-only flags,
inconsistent section counts, records in the wrong scenario zone, CNAME chains
that are cyclic, mutually contradictory outcomes, negative caching without SOA
evidence, and terminal scenarios without exactly one visible terminal step.

Invalid input fails closed with an accessible unavailable-state message, no
autoplay, no navigation, and no progress completion.

## Player 1: complete DNS resolution

The first public player synchronizes five views:

1. A topology showing application, stub, recursive resolver, root, TLD, and
   authoritative server.
2. A journey timeline distinguishing the client's recursive request from the
   resolver's iterative work.
3. A DNS message inspector for the selected query or response.
4. A delegation/cache view showing what the resolver learns and stores.
5. A concise explanation of what changed and why the next hop is selected.

The canonical cold-cache scenario resolves `www.example.test.` A data. The
stub requests recursion from its configured recursive resolver. The resolver
starts without a cached answer, follows root and TLD referrals, reaches the
authoritative server, receives the final answer, caches eligible records by
TTL, and returns a recursive response to the client.

Additional selectable scenarios include:

- a warm-cache answer that requires no authoritative traversal;
- a CNAME followed to a canonical-name A or AAAA answer;
- an AAAA query whose result differs from the A query;
- a truncated UDP response retried over TCP;
- a public NXDOMAIN path with authoritative SOA evidence.

The topology must not imply that the stub contacts root or authoritative
servers when using a recursive resolver. Referrals are shown as referrals, not
as final answers. The resolver's cache can shorten later journeys without
rewriting the earlier cold-cache history.

## DNS message inspector

For the selected message, show each header field with size, current value,
purpose, and step-specific meaning:

- ID: transaction identifier used to match a response to a query;
- QR: query or response;
- OPCODE: operation requested;
- AA: authoritative-answer indication;
- TC: truncation indication;
- RD: recursion desired;
- RA: recursion available;
- Z/AD/CD: reserved and DNSSEC-related flag positions with contextual labels;
- RCODE: response status, including extended-code awareness in Pro;
- QDCOUNT, ANCOUNT, NSCOUNT, and ARCOUNT: section entry counts.

Show the Question, Answer, Authority, and Additional sections as independently
labelled regions. Each resource record exposes owner name, type, class, TTL,
RDLENGTH, decoded RDATA, and its purpose in the current exchange. Compression
pointers are explained without requiring learners to decode raw hexadecimal in
the public lesson; Pro capture analysis can expose the encoded offsets.

The inspector must visually distinguish facts carried in the packet from
facts inferred by the resolver or teaching UI.

## Names, zones, delegation, and records

The public lesson explains that a domain name is a sequence of labels, while a
zone is an administrative portion of the namespace. Delegation occurs through
NS records at a zone cut. Additional-section address records may provide glue
needed to reach delegated name servers, but they are not automatically
authoritative answers for the original question.

Record coverage includes:

- A and AAAA for IPv4 and IPv6 addresses;
- CNAME for an alias and its canonical target;
- NS for zone delegation and authority;
- SOA for zone identity, timers, and negative-answer evidence;
- MX for mail exchangers and preference ordering;
- TXT as arbitrary text whose meaning depends on the consuming convention;
- PTR for reverse lookup data;
- SRV for service location and priority/weight/port semantics;
- CAA for certification-authority authorization policy.

The lesson must state that standard CNAME semantics conflict with other data
at the same owner name and therefore make an apex CNAME problematic. Provider
features that flatten or synthesize apex aliases are implementation behavior,
not ordinary wire-level CNAME records at the zone apex.

## Transport and privacy boundaries

Public material teaches UDP destination port 53 as the common starting point
and TCP destination port 53 for cases including truncation retry and zone
transfer. It explains that modern DNS is not limited by the obsolete idea that
UDP messages can never exceed 512 bytes: EDNS advertises larger capabilities,
while path MTU and fragmentation still affect reliability.

DoT, DoH, and DoQ are introduced only as encrypted transports between specific
participants. Encryption protects that hop; it does not make the DNS operator
unable to see the query, validate the answer with DNSSEC, or guarantee privacy
through every upstream exchange.

## Caching and response semantics

The cache view shows original TTL, elapsed time, remaining TTL, and the
decision to reuse or refresh an entry. It distinguishes browser/OS caches from
recursive-resolver caches without pretending every platform exposes identical
layers.

Positive answers cache eligible resource records. Negative caching uses SOA
evidence and an applicable negative TTL. The lesson distinguishes:

- NOERROR with requested data;
- NOERROR/NODATA, where the name exists but the requested type does not;
- NXDOMAIN, where the queried name does not exist;
- SERVFAIL, where the resolver could not produce a valid answer;
- REFUSED, where the server declines the operation;
- FORMERR, where the request is malformed.

A timeout is transport behavior, not a DNS RCODE. A successful DNS response
does not prove the application service is reachable.

## Player 2: DNS troubleshooting

The second public player uses an evidence-first incident workflow. A learner
selects a scenario, predicts the faulty layer or DNS condition, submits the
choice, and receives immediate evidence and an explanation. Wrong answers
still record an attempted check.

Scenarios include:

- NXDOMAIN versus NODATA;
- recursive resolver timeout;
- cached stale-looking data that is still within its TTL;
- missing or incorrect delegation;
- authoritative server reachable but refusing recursion;
- UDP response truncated with successful TCP retry;
- TCP fallback blocked after truncation;
- a CNAME target that cannot be resolved.

One NXDOMAIN/NODATA comparison is public. The remaining guided diagnoses are
account practice. Each result identifies the decisive command output, DNS
fields, relevant server role, and next safe troubleshooting step.

## Command and Wireshark evidence

Public examples align equivalent evidence across:

- `nslookup` for familiar resolver queries;
- `Resolve-DnsName` for structured Windows output;
- `dig` for explicit flags and DNS sections;
- Wireshark filters such as `dns`, `udp.port == 53`, `tcp.port == 53`,
  `dns.flags.response == 1`, and response-code-specific filters.

The lesson labels command output as an observation from a chosen resolver, not
the full authoritative journey. Account exercises correlate command output
with authored packets. Pro exercises inspect query/response matching,
truncation and TCP streams, retransmission, EDNS OPT data, DNSSEC records,
delegation evidence, and timing.

## Pro timing diagram and RFC checks

The timing diagram correlates client time, resolver processing, upstream
queries, referrals, cache insertion, response delivery, retries, and timeout.
Modes cover cold cache, warm cache, delayed authority, UDP truncation followed
by TCP, resolver timeout, and DNSSEC validation delay. Selecting an event
updates the topology, message inspector, cache state, and elapsed-time view.

RFC checks are teaching exercises rather than a closed-book exam. Every answer
immediately shows:

- whether the classification is correct;
- the governing requirement or constraint in concise paraphrase;
- the exact flags, sections, records, or transport evidence involved;
- why the behavior matters operationally;
- the relevant RFC and section reference.

Checks cover core DNS concepts and messages, clarifications, negative caching,
EDNS, TCP requirements, DNSSEC records and validation, and privacy transports.
The initial reference set is RFC 1034, RFC 1035, RFC 2181, RFC 2308, RFC 6891,
RFC 7766, RFC 8499, RFC 4033 through RFC 4035, RFC 7858, RFC 8484, and RFC
9250. Implementation must verify references against the current RFC text when
authoring each check.

## Pro bonus: trailing dot and root-server discovery

This topic appears only in the Pro content and is explicitly marked as a bonus.
It explains that the final dot in an absolute FQDN represents the DNS root. The
dot is part of the name's absolute form; it is not a server address and does
not appear merely because a browser added punctuation.

The interactive trace shows:

1. how recursive resolver software starts with configured root hints;
2. how a logical root-server identity is reached through one of its advertised
   IPv4 or IPv6 addresses;
3. how global anycast allows multiple physical instances to serve that logical
   identity;
4. how root referrals lead to TLD servers and later authoritative servers;
5. how cached delegations often mean a resolver does not contact a root server
   for every lookup;
6. how operators refresh root hints and what happens when individual root
   addresses or paths are unavailable.

The content must not claim there are only thirteen physical root servers.
It may describe the A through M logical identities while explaining that they
are served by many distributed instances.

## Progress behavior

- Each public player completes only after its rendered terminal step is
  reached.
- Scenario changes reset playback without removing confirmed completion.
- Account exercises and knowledge checks record attempts regardless of
  correctness.
- Progress uses the existing optimistic display, server-confirmed state,
  idempotency keys, pending queue, and sequential replay behavior.
- Retry controls remain visible when persistence fails.
- The lesson completes only after all required public and account items in its
  versioned manifest are complete.
- Pro and Pro-bonus content is never required for free lesson completion.

## Accessibility and responsive behavior

- All controls work with keyboard and touch and retain visible focus.
- Autoplay occurs once and pauses at terminal states.
- Reduced motion disables automatic animated travel while preserving manual
  navigation and every piece of information.
- Status changes use polite live regions without duplicate announcements.
- Roles, directions, cache results, and success/failure use text and shape in
  addition to color.
- Player controls use the shared outlined style and at least 44-pixel targets.
- Controls wrap as one spaced group without overlapping the topology,
  inspector, or following section.
- Topology labels and message markers do not overlap at desktop or 360-pixel
  widths.
- DNS record tables and encoded details scroll inside labelled local regions
  rather than widening the page.

## Testing strategy

Use test-driven implementation with focused schema, builder, component,
content, integration, accessibility, and migration tests.

Tests must cover:

- rejection of contradictory flags, counts, records, cache facts, and paths;
- cold-cache traversal, warm-cache shortcuts, referrals, and final answers;
- every header field and all four DNS sections;
- CNAME, A/AAAA, delegation, glue, and record-selection semantics;
- TTL countdown, expiry, positive caching, and SOA-backed negative caching;
- NOERROR/data, NODATA, NXDOMAIN, SERVFAIL, REFUSED, FORMERR, and timeout;
- UDP 53, TC behavior, TCP retry, and blocked-fallback evidence;
- troubleshooting prediction, immediate explanations, and wrong-answer
  attempts;
- terminal-only progress, retry behavior, and invalid-data boundaries;
- shared control styling, keyboard use, reduced motion, and responsive
  containment;
- public/account/Pro isolation, including the Pro-only root bonus;
- MDX content, catalog registration, previous/next navigation, sitemap,
  progress manifest, and Supabase migration consistency.

Before completion, run focused DNS tests, source-only full Vitest tests,
TypeScript validation, ESLint, and a production build. Test discovery must
exclude `.pnpm-store`, `.worktrees`, and other cached project copies. Do not
run a production build concurrently with a development server that shares the
same `.next` directory.

## Integration points

Implementation is expected to touch:

- `src/features/dns/*` for contracts, data, builders, players, and tests;
- public, account, and Pro MDX under
  `src/content/networking-foundations/`;
- `mdx-components.tsx` for interactive component registration;
- catalog data and repository tests;
- lesson content registration and rendering tests;
- progress manifest definitions and tests;
- lesson route, curriculum navigation, and sitemap tests;
- shared CSS only where existing component styles cannot meet containment;
- one transactional, idempotent Supabase migration registering the versioned
  lesson progress manifest and required items.

No authentication changes, live DNS dependency, external API, or new runtime
package is required.

## Acceptance criteria

The design is complete when the implementation can demonstrate all of the
following:

1. An anonymous learner can trace a correct cold-cache lookup and compare a
   public negative response without protected content leaking into HTML.
2. A signed-in free learner can complete evidence exercises and three checks,
   with every submitted answer recorded as an attempt.
3. A Pro learner can access timing, Wireshark, RFC, DNSSEC, advanced failure,
   and root-bootstrap bonus content.
4. Every rendered DNS fact comes from a validated scenario and contradictory
   authored data fails closed.
5. Both players remain readable and operable at desktop and 360-pixel widths,
   with control styling consistent with recent lessons.
6. Lesson completion follows the versioned progress manifest and never depends
   on Pro material.
7. The focused and source-only full verification suites pass without reading
   cached or nested project copies.
