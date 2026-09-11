# NAT, PAT and the Complete Internet Packet Journey — Lesson Design

**Date:** 2026-09-11  
**Status:** Approved in conversation; awaiting written-spec review  
**Pathway:** Networking Foundations  
**Lesson slug:** `nat-pat-and-the-complete-internet-packet-journey`

## Purpose

Publish a practical IPv4 lesson that shows exactly how private-addressed hosts reach Internet services through address and port translation. The lesson connects prior DNS, routing, TCP/UDP, HTTP, and ICMP knowledge into one end-to-end packet journey while keeping translation state visible at every hop.

The lesson must distinguish basic NAT from PAT, teach the four address terms accurately, and make the return path as important as the outbound path. Learners should leave able to read a translation table, predict translated tuples, and diagnose failures caused by missing or incorrect state.

## Scope

The lesson covers:

1. why private IPv4 addresses require translation at an Internet boundary;
2. static NAT, dynamic NAT, and PAT/NAT overload;
3. inside local, inside global, outside local, and outside global terminology;
4. address-and-port mappings and tuple uniqueness;
5. outbound and return packet transformations;
6. translation-table creation, lookup, timeout, and removal;
7. checksum updates, ICMP handling, fragmentation implications, and application protocols that embed addresses;
8. port forwarding and unsolicited inbound traffic;
9. U-Turn/hairpin NAT as a Pro scenario;
10. evidence-driven troubleshooting with packet captures and translation tables.

NAT64, NPTv6, IPv6 transition mechanisms, carrier-grade NAT architecture, and deep NAT traversal techniques are reserved for later advanced modules. CGNAT may be named briefly to explain shared public addressing but is not taught as a full workflow.

## Learning outcomes

After completing the lesson, learners can:

- distinguish static NAT, dynamic NAT, and PAT by mapping behavior;
- correctly identify inside local/global and outside local/global values in a flow;
- trace source and destination addresses and ports in both directions;
- explain why PAT can multiplex many private sessions onto one public IPv4 address;
- interpret and predict translation-table entries;
- explain why return traffic must match existing translation state;
- recognize common inbound, timeout, exhaustion, checksum, and asymmetric-path failures;
- analyze a U-Turn NAT failure and explain why paired destination and source translation restores a valid return path;
- validate NAT behavior using Wireshark-style evidence and IETF behavioral requirements.

## Information architecture

### Lesson chapters

The lesson uses stable anchors and the established `Page contents` network-map interaction. Opening the map restarts a subtle route animation every time. The chapters are:

1. The IPv4 translation boundary
2. NAT vocabulary and address realms
3. Static NAT and port forwarding
4. Dynamic NAT and address pools
5. PAT and translation-table state
6. Complete Internet packet journey
7. Return traffic, timeouts, and failure modes
8. Account practice labs
9. Pro packet analysis and RFC validation
10. Pro U-Turn NAT lab

Locked Account and Pro nodes remain clickable and redirect to sign-in while preserving the exact lesson anchor. All map transitions honor `prefers-reduced-motion` and the layout must not overflow on narrow screens.

## Tier design

### Public tier

The public lesson provides complete conceptual instruction rather than a teaser:

- RFC 1918 private address ranges and the boundary between private and public addressing;
- NAT as address translation and PAT as address-plus-port translation;
- static one-to-one mappings, dynamic pool mappings, and many-to-one PAT;
- inside local/global and outside local/global terms shown against one consistent topology;
- translation-table columns, tuple matching, and port allocation;
- an end-to-end HTTPS journey from DNS result through TCP establishment, request, response, and reverse translation;
- port forwarding and why unsolicited inbound packets normally lack usable state;
- a concise discussion of benefits, operational tradeoffs, and why NAT is not a firewall by definition;
- immediate knowledge checks with explanations after both correct and incorrect attempts.

An attempted answer marks its activity complete even when wrong. Correctness and confidence remain separate signals.

### Free-account tier

Account users receive:

- a controllable NAT/PAT journey player using the site's consistent Previous, Play/Pause, Next, Restart, and speed controls;
- a live tuple inspector showing pre-NAT and post-NAT source/destination IP addresses and ports;
- an animated translation-table panel that adds, matches, ages, and removes entries;
- a mapping exercise for static NAT, dynamic NAT, and PAT;
- a return-path exercise that requires selecting the correct reverse translation;
- troubleshooting cases for missing state, wrong port forwarding, pool exhaustion, PAT port collision, timeout expiry, and asymmetric routing;
- retry, simplified-explanation, progress, resume, next-incomplete, and restart behavior.

Where the educational-team chat entry point exists, learners can request a simplified explanation without losing the lesson anchor or current activity context.

### Pro tier

Pro provides deeper evidence and standards work:

- Wireshark-style before/after capture analysis with IP, TCP, UDP, and ICMP evidence;
- RFC-level validation based on IPv4 traditional NAT terminology and TCP/UDP/ICMP behavioral requirements;
- checksum recalculation and ICMP error translation;
- fragments and the difficulty of translating non-initial fragments without transport headers;
- embedded-address protocols and the limited role and risks of application-level gateways;
- overlapping address spaces, endpoint-dependent behavior, port exhaustion, state timeout, and asymmetric return paths;
- an advanced U-Turn/hairpin NAT player and diagram.

## U-Turn/hairpin NAT Pro experience

### Scenario

An internal client `10.0.0.25` resolves `portal.example.com` to the organization's public address `203.0.113.10` and opens an HTTPS connection to destination port 443. The service actually runs on internal server `10.0.0.50:443`, behind the same NAT gateway.

The exercise teaches two flows.

#### Failed flow: destination translation only

1. The client sends `10.0.0.25:51514 → 203.0.113.10:443`.
2. The gateway applies DNAT and forwards `10.0.0.25:51514 → 10.0.0.50:443`.
3. The server recognizes `10.0.0.25` as directly reachable on the internal network and replies without traversing the NAT gateway.
4. The client receives a response sourced from `10.0.0.50:443`, although its connection was opened to `203.0.113.10:443`.
5. The unexpected peer tuple does not match the established session, so the exchange fails.

The lesson describes the result as a tuple and path-consistency failure, not as a universal claim that every operating system displays an identical rejection message.

#### Correct flow: paired DNAT and SNAT

1. The client again sends to the public endpoint.
2. The gateway applies DNAT to the server and SNAT to a gateway-controlled address/port.
3. The server sees the gateway as the peer and therefore returns the packet through it.
4. The gateway reverses both translations.
5. The client receives the response from the public endpoint it originally contacted, preserving the expected session tuple.

The lesson calls this paired translation bidirectional U-Turn/hairpin NAT configuration. It also notes that product interfaces may label the feature hairpin NAT, NAT loopback, NAT reflection, or U-Turn NAT.

### Interactive player

The player contains selectable `Broken: DNAT only` and `Working: DNAT + SNAT` modes. Each step synchronizes:

- the active network link;
- packet direction;
- original tuple;
- translated tuple;
- current NAT-table entry;
- the device making the forwarding decision;
- a concise explanation of why the packet takes that path.

Controls follow the shared player contract. Switching modes resets to step one. Restart clears temporary state. Previous and Next are disabled only at real boundaries.

### Modern IT-style diagram and motion

The diagram uses a restrained dark technical-console aesthetic consistent with the existing site. It shows an internal client, access network, NAT gateway, public/FQDN identity, internal server, translation boundary, and return path.

- A softly glowing packet marker travels along the active link.
- DNAT and SNAT fields receive a brief, subtle highlight when changed.
- Tuple values cross-fade or slide a few pixels rather than flashing.
- The failed direct-return path turns amber and then muted red.
- The corrected gateway return path uses blue and resolves to green at tuple validation.
- The translation table highlights only the row used by the active packet.
- Animations remain short and instructional; no continuous decorative motion runs while paused.
- Reduced-motion mode replaces travel with immediate state changes and gentle opacity transitions.
- Text labels and status icons communicate every state without relying on color.

## Component architecture

The implementation should reuse existing lesson infrastructure and isolate NAT-specific behavior:

- `NatLessonMap` adapts the reusable lesson network map to NAT chapters and tier-aware links.
- `NatJourneyPlayer` owns shared playback state for normal and hairpin journeys.
- `NatTopology` renders endpoints, translation boundary, active links, and packet motion.
- `PacketTupleInspector` renders original, current, and expected return tuples.
- `TranslationTableInspector` renders mapping creation, lookup, timeout, and removal.
- `NatMappingLab` teaches static, dynamic, and PAT selection.
- `NatTroubleshootingLab` renders evidence, choices, immediate explanations, retry, and confidence.
- `NatCaptureAnalysisLab` renders Pro Wireshark-style evidence.
- `NatRfcValidationLab` renders Pro behavioral checks and explanations.

Typed scenario data supplies devices, links, tuples, translation operations, table entries, captions, and expected outcomes. Public, Account, and Pro MDX compose tier content without duplicating playback logic.

## Data model

Every scenario has a stable ID, mode, endpoints, ordered steps, translations, optional table mutations, and expected outcome. A step may change source address, source port, destination address, destination port, or multiple fields, but must explicitly declare each operation.

Translation entries include protocol, inside local tuple, inside global tuple, outside tuple, state, age, and timeout where relevant. Authored examples use documentation address ranges and never resemble deployable secrets or customer data.

Interactive progress IDs are independent of display labels. The progress manifest and idempotent Supabase migration register only required Account activities unless the existing progress model explicitly supports Pro completion without changing public completion semantics.

## State and data flow

1. The catalog resolves the lesson and the content repository selects the permitted MDX tiers.
2. MDX passes validated scenario definitions to client components.
3. The player derives topology, tuple inspector, and table inspector from one current-step index so panels cannot disagree.
4. Playback changes only transient local state.
5. Completing an exercise records an optimistic attempt through the existing progress provider and retry queue.
6. Locked links construct a safe internal `returnTo` containing the lesson path and anchor.

## Error handling

- Schema validation rejects duplicate IDs, invalid tuples, missing reverse operations, empty steps, impossible table references, and invalid anchors.
- The hairpin working scenario must contain both destination and source translation before it may be marked successful.
- Malformed authored activity data is contained within that activity and produces a readable fallback rather than crashing the lesson.
- Player controls remain safe at first and last steps and during mode changes.
- Progress failures preserve the local attempt and expose the existing retry state.
- Safe internal-route validation prevents arbitrary redirect targets.

## Accessibility and responsive behavior

- Controls use native buttons, links, and selects with visible focus styles.
- Current step, tuple transformations, table updates, failure, and success are announced in text.
- The diagram has a structured textual equivalent that follows the same step state.
- Animation respects `prefers-reduced-motion` and does not autoplay indefinitely.
- On narrow screens, the topology, tuple inspector, and translation table stack vertically.
- Long addresses and tuples wrap or scroll inside bounded panels without causing page-level horizontal overflow.
- Touch targets and player-control spacing remain consistent with the corrected shared player style.

## Testing strategy

### Schema and unit tests

- validate all NAT types, tuples, operations, table entries, and troubleshooting cases;
- reject duplicate IDs and inconsistent forward/reverse translations;
- assert that the successful U-Turn scenario applies both DNAT and SNAT;
- assert canonical documentation addresses and stable progress IDs.

### Component tests

- exercise Previous, Play/Pause, Next, Restart, speed, and mode controls;
- verify tuple and table panels remain synchronized with every step;
- verify the failed direct-return explanation and the successful reverse translation;
- verify animation-state attributes and reduced-motion behavior;
- verify immediate explanations for right and wrong answers;
- verify locked links preserve anchors.

### Integration tests

- render public, Account, and Pro variants without leaking gated content;
- verify catalog publication, metadata, sitemap, content routing, progress manifest, and migration;
- verify wrong attempts still count as completed;
- verify Pro includes the hairpin player, capture lab, and RFC checks.

### Browser checks

- inspect public and authenticated lesson states at desktop, tablet, and mobile widths;
- verify the network map replays whenever opened;
- verify subtle packet animation and the reduced-motion alternative;
- verify no diagram labels or controls overlap and no page-level overflow occurs;
- verify Account and Pro return anchors.

Before merge, run focused tests, type checking, linting, the full test suite, and representative desktop/mobile browser tests.

## Publication and acceptance criteria

The lesson is ready when:

- public content accurately teaches static NAT, dynamic NAT, PAT, terminology, state, and a complete bidirectional Internet journey;
- Account activities provide synchronized packet, tuple, and translation-table practice;
- Pro includes Wireshark evidence, RFC validation, advanced failure cases, and the complete U-Turn NAT experience;
- the U-Turn player demonstrates both the DNAT-only failure and paired DNAT/SNAT success;
- the modern diagram uses subtle accessible motion and a reduced-motion alternative;
- immediate explanations and attempt-completion semantics work consistently;
- progress IDs and the Supabase migration are stable and idempotent;
- all responsive and verification checks pass.

## Explicit non-goals

- NAT64, NPTv6, or other IPv6 translation and transition mechanisms;
- a full CGNAT architecture lesson;
- STUN, TURN, ICE, VPN traversal, or peer-to-peer hole punching labs;
- vendor-specific production NAT configuration syntax;
- redesigning older lesson diagrams during this change;
- unrelated authentication, billing, chat, notifications, or dashboard work.
