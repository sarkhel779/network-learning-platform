# ICMP, Ping and Path Discovery Lesson Design

## Purpose

Publish the final lesson in the IP Addressing and Routing module at
`/learn/networking-foundations/icmp-ping-and-path-discovery`. The lesson teaches a beginner to use
IPv4 ICMP, ping, and traceroute as evidence without overstating what any single result proves.

This lesson is IPv4-only. ICMPv6 remains in the IPv6 lesson and later advanced material.

## Product Decisions

- Use a packet-first teaching sequence.
- Provide two focused public interactive players: Ping and ICMP Evidence, and Traceroute Path Discovery.
- Keep the public conceptual explanation complete and useful without an account.
- Gate command/capture inspection, guided diagnosis, systematic troubleshooting, and knowledge checks behind a free account.
- Show advanced filtering, Path MTU Discovery, and deceptive path behavior only as a Pro preview.
- Reuse the existing lesson shell, playback controls, packet inspector, progress model, access boundaries, and responsive styling.
- Count any submitted knowledge-check answer as an attempt while displaying correctness separately.

## Learning Outcome

After the public lesson, a learner can:

1. explain why ICMP carries control and error information alongside IPv4 traffic;
2. identify the ICMP type, code, checksum, and quoted-packet evidence relevant to an error;
3. distinguish Echo Request, Echo Reply, Destination Unreachable, and Time Exceeded;
4. follow an IPv4 ping request and reply across a routed path;
5. interpret replies, timeouts, loss, and round-trip time without treating them as complete application tests;
6. explain how traceroute discovers hops by sending probes with progressively larger TTL values;
7. interpret silent, changing, incomplete, and unreachable traceroute results cautiously; and
8. state what ping and traceroute do and do not prove.

## Lesson Architecture

### Public sequence

1. **Why ICMP exists** — ICMP reports network-layer conditions and supports diagnostics; it does not carry ordinary application data.
2. **ICMP message anatomy** — introduce type, code, checksum, and the quoted part of the triggering IPv4 packet where applicable.
3. **Informational and error messages** — separate echo messages from errors and explain that an ICMP error is not guaranteed.
4. **Echo request and echo reply** — follow the basic request/reply relationship and identifiers used to associate responses.
5. **Interactive Player 1: Ping and ICMP Evidence** — compare success and several failure outcomes.
6. **What successful ping proves** — establish limited evidence of an echo exchange, not proof that every application or path works.
7. **Timeouts, loss, and round-trip time** — explain missing replies, sampling, transient loss, and latency measurements.
8. **Destination Unreachable** — introduce network unreachable, host unreachable, and administratively prohibited at beginner depth.
9. **TTL Exceeded** — connect TTL decrement, loop protection, packet disposal, and conditional ICMP Time Exceeded.
10. **Interactive Player 2: Traceroute Path Discovery** — reveal routers using increasing TTL values.
11. **Why traceroute can be incomplete** — explain `*`, later replies after a silent hop, route changes, and asymmetric return paths.
12. **Safe conclusions** — summarize evidence-first interpretations and explicitly reject common overclaims.

### Account-locked continuation

13. **Inspect command and capture evidence** — compare representative Windows `ping` and `tracert` with Linux `ping`, `traceroute`, and `tracepath`, plus filtered packet-capture evidence. Tool behavior and probe transport can vary; the lesson labels the exact authored method.
14. **Guided diagnosis** — classify successful echo, filtered echo, unreachable destination, TTL expiry, intermittent loss, and incomplete path evidence.
15. **Troubleshoot ICMP methodically** — verify addressing, route, gateway, local policy, remote policy, return path, and application reachability in order.
16–18. **Three knowledge checks and summary** — all submitted answers count as attempts; correctness and explanations remain visible.

### Pro preview

- filtered or rate-limited ICMP;
- IPv4 Path MTU Discovery and fragmentation-needed evidence;
- misleading or asymmetric traceroute paths;
- protocol- and platform-specific traceroute probes;
- deeper packet-capture and production diagnosis.

## Interactive Player 1: Ping and ICMP Evidence

The player uses one compact routed IPv4 topology and selectable, curated outcomes:

- successful Echo Request and Echo Reply;
- timeout with no response observed;
- Destination Network Unreachable;
- Destination Host Unreachable;
- Communication Administratively Prohibited; and
- TTL Exceeded before the request reaches the destination.

Each scenario has an explicit source, destination, packet direction, responsible device, TTL, ICMP type and code when a message exists, and plain-language conclusion. A timeout must not invent an ICMP packet. An unreachable or TTL-exceeded response must identify the reporting device separately from the original destination.

The player exposes one synchronized step at a time. The topology, active link, packet marker, packet layers, field evidence, explanation, and outcome update together. The final result appears only at the terminal step.

## Interactive Player 2: Traceroute Path Discovery

The player models a source, multiple routers, and a destination. It teaches the conceptual ICMP-based Windows-style flow while clearly noting that traceroute implementations can use different probe transports.

For each hop:

1. the source sends a probe with a chosen TTL;
2. each router decrements TTL;
3. the router where TTL reaches zero discards the probe;
4. that router may return ICMP Time Exceeded;
5. the source records the responding address and round-trip evidence; and
6. the next probe uses a larger TTL until the destination responds or the trace stops.

Selectable outcomes include:

- a complete stable path;
- one silent hop followed by later responding hops;
- a path that changes between probes;
- destination unreachable; and
- a trace that ends without a destination response.

A `*` means no response was observed for that probe within the waiting period. It must never be presented as proof that the silent router did not forward the packet. A displayed forward path also must not be presented as proof that the return path is identical.

## Playback and Accessibility

- Both players autoplay after client motion preference resolves when normal motion is allowed.
- Both provide Previous, Play/Pause, Next, Restart, and the shared playback speeds.
- Manual navigation pauses autoplay and resets correctly when the scenario changes.
- Reduced-motion users receive complete discrete states without hidden timers or missing evidence.
- All controls use semantic labels, keyboard-accessible targets, live status text, and locally scrollable wide evidence.
- Color is never the only indicator of packet state or outcome.
- Server-rendered text preserves the complete public conclusion before JavaScript runs.

## Data and Component Boundaries

- A focused ICMP scenario schema validates message kind, type/code pairing, packet presence, responsible device, and terminal outcome.
- Pure scenario builders produce deterministic ping and traceroute journeys.
- `PingEvidencePlayer` owns scenario selection and synchronized evidence playback.
- `TracerouteDiscoveryPlayer` owns TTL-probe sequencing, hop observations, and path conclusions.
- Shared packet-flow primitives render topology, motion, packet layers, controls, and reduced-motion behavior where their contracts fit.
- Public and account MDX remain separate and are loaded through the authorized lesson repository.
- Catalog publication, sitemap generation, adjacent navigation, access labels, progress manifests, and migration registration follow existing conventions.

Invalid authored data must fail closed. A player displays readable static scenario evidence, does not start hidden autoplay, and does not award terminal progress when it cannot safely construct a journey.

## Progress and Access

- Register every required public section, both interactive players, account sections, and three knowledge checks in the lesson progress manifest.
- Mark each player complete only when its terminal state is visibly reached.
- Mark a knowledge check attempted on any submitted answer while retaining a separate correctness result.
- Anonymous learners see complete public material and locked labels for account sections.
- Pro entries display both `Pro` and `Locked` without exposing protected bodies.
- Add an idempotent Supabase migration for the new manifest and ordered items without changing authentication, RLS, or unrelated learner data.

## Accuracy Rules

- ICMP is carried inside IPv4 and reports network-layer information; it is not TCP or UDP.
- Echo success confirms that the authored echo exchange completed, not that a particular application is healthy.
- A timeout means no reply was observed before the deadline; it does not identify the cause by itself.
- Packet loss percentages are samples, not guarantees of future behavior.
- Round-trip time includes both directions and cannot isolate one-way delay without additional evidence.
- Routers decrement TTL before forwarding. TTL expiry causes disposal; an ICMP Time Exceeded response may be generated but is not guaranteed.
- ICMP errors identify the reporting device and quote enough of the triggering packet for correlation; they do not originate from the intended destination in every case.
- Traceroute reveals responding devices for specific probes, not a guaranteed complete or symmetric path.
- Silent hops may still forward traffic, and later replies can prove that forwarding continued beyond them.
- The lesson must not imply that all traceroute implementations use ICMP Echo probes.
- IPv6 message types, codes, and Hop Limit behavior are outside this lesson's scenario set.

## Error Handling

- Schema validation rejects impossible type/code combinations, references to missing devices or links, and packetless steps that claim a transmitted ICMP message.
- Runtime evaluation catches unexpected authored-data failures and renders a static explanation.
- Timers and progress effects are gated on a valid playable journey.
- A no-response outcome displays absence of evidence rather than fabricating an error response.

## Verification

Focused tests will cover:

- scenario-schema rejection and deterministic builders;
- all ping outcomes and correct ICMP type/code evidence;
- traceroute TTL progression and hop discovery;
- silent-hop, changing-path, unreachable, and incomplete outcomes;
- cautious conclusions for success, timeout, loss, latency, and `*`;
- autoplay hydration, manual controls, reset behavior, speed, and reduced motion;
- packet-layer and topology synchronization;
- fail-closed rendering with no hidden completion;
- progress-manifest and migration parity;
- public/account/Pro access boundaries;
- catalog, sitemap, adjacent navigation, SSR, responsive containment, TypeScript, lint, full tests, and production build.

## Deferred Scope

The lesson does not implement live network probes, depend on external targets, teach ICMPv6, promise that ICMP responses always return, or diagnose application protocols. IPv4 Path MTU Discovery, advanced filtering/rate limiting, multipath interpretation, and platform-specific probe algorithms remain Pro-preview topics.
