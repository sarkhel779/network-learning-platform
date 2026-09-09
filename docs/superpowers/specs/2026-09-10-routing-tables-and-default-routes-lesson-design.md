# Routing Tables and Default Routes Lesson Design

## Purpose

Build the next unpublished Networking Foundations lesson at
`/learn/networking-foundations/routing-tables-and-default-routes`. It follows IPv6 Fundamentals and
teaches a beginner to read a routing table, select the best route using one shared IPv4/IPv6 method,
and follow the resulting packet hop by hop.

Authentication-provider and redirect repairs remain deferred and outside this lesson's scope.
Protocol-specific best-path algorithms and recursive next-hop resolution are introduced only as
future topics for the dedicated routing section.

## Product Decisions

- Use two focused public interactive players: Routing Table Decision and Hop-by-Hop Forwarding.
- Teach IPv4 and IPv6 through the same ordered route-selection method.
- Cover connected, static, learned, default, equal-prefix preference, and no-route outcomes.
- Introduce administrative distance and metric at foundational depth, then revisit them in the later
  routing section.
- Keep the complete conceptual method and both players public. Evidence inspection, guided practice,
  troubleshooting, knowledge checks, and summary require a free account.
- Account-gated contents entries display `Locked`; Pro entries display `Pro` and `Locked`.
- Incorrect knowledge-check answers count as attempts but remain visibly incorrect. Completion still
  requires every registered item to be completed or attempted.
- Reuse existing progress, playback, packet inspection, lesson access, and responsive design
  conventions rather than creating parallel systems.

## Learning Outcome

After the public lesson, a learner can:

1. identify destination prefix, prefix length, route source, next hop, outgoing interface,
   administrative distance, and metric in a basic route entry;
2. discard routes from the wrong address family or whose prefixes do not match the destination;
3. apply longest-prefix match before comparing route preference or metric;
4. compare equal-prefix candidates using administrative distance and then metric at the appropriate
   introductory depth;
5. explain when connected, static, learned, host, and default routes are selected;
6. distinguish the next hop from the outgoing interface;
7. recognize a no-route outcome and explain why the packet is discarded;
8. follow forwarding across routers while the destination IP remains unchanged, Layer 2 addresses
   change per link, and IPv4 TTL or IPv6 Hop Limit decreases.

## Teaching Sequence

### Public introduction

1. **Why routing exists** — routers move packets between Layer 3 networks and make an independent
   forwarding decision at every hop.
2. **Route-table anatomy** — destination prefix, prefix length, source, preference, metric, next hop,
   and outgoing interface.
3. **Connected, static, learned, and default routes** — where entries originate and what each entry
   does without teaching protocol internals prematurely.
4. **How prefix matching works** — compare destination bits against candidate network prefixes.
5. **Interactive Player 1: Routing Table Decision** — visibly eliminate candidates in the approved
   decision order and select the winning route.
6. **Longest-prefix match** — show why a host route or narrower network overrides a broader match.
7. **Administrative distance and route preference** — compare equally specific routes learned from
   different sources while noting that platform values and terminology can vary.
8. **Metric and equal-source comparison** — compare remaining equal-prefix, equal-source candidates
   without teaching a protocol's full best-path algorithm.
9. **Next hop versus outgoing interface** — separate the neighbour to reach from the local interface
   used to transmit.
10. **Interactive Player 2: Hop-by-Hop Forwarding** — inspect the routing decision and packet changes
    at every router.
11. **IPv4 and IPv6 routing similarities** — reuse the same selection order while identifying TTL
    versus Hop Limit and ICMP versus ICMPv6 evidence.
12. **No matching route and packet disposal** — show the terminal outcome when no candidate or
    default route is usable.

### Account-locked continuation

- Inspect routing evidence on Windows, Linux, and representative network-device output.
- Read packet captures and relevant ICMP/ICMPv6 errors without treating every loss as a routing
  failure.
- Complete guided route-selection practice across connected, static, learned, host, default,
  equal-prefix, IPv4, IPv6, and no-route cases.
- Troubleshoot methodically by verifying the destination, address family, matching prefixes,
  preference, metric, next hop, interface state, and return path.
- Attempt three knowledge checks and review a concise summary. Any submitted answer counts as an
  attempt while correctness remains separately visible.

### Pro preview

- Recursive next-hop resolution and resolution failures.
- Equal-cost multipath and per-flow forwarding implications.
- Floating static routes, dynamic-routing protocol selection, and convergence.
- Policy-based routing, VRFs, route redistribution, and production troubleshooting.

The preview advertises outcomes without exposing protected lesson bodies.

## Interactive Player 1: Routing Table Decision

The player accepts curated, documentation-safe IPv4 and IPv6 scenarios. A pure decision engine
evaluates each candidate in this order:

1. eliminate entries from the wrong address family;
2. eliminate prefixes that do not contain the destination;
3. retain the longest matching prefix length;
4. among equally specific candidates, retain the lowest administrative distance or equivalent
   route preference;
5. among still-equal candidates, retain the lowest comparable metric;
6. select the route, report an intentional equal-cost result where authored, or report no route.

Each candidate visibly exposes its source, prefix, next hop, outgoing interface, administrative
distance, metric, current status, and accepted or rejected reason. Scenarios include:

- a directly connected destination;
- a static route beating an equally specific learned route;
- a learned route winning because it is more specific;
- an IPv4 `/32` and IPv6 `/128` host route overriding broader routes;
- a default route used only when no more-specific route matches;
- equal-prefix preference and metric comparisons;
- no matching route with no usable default;
- equivalent IPv4 and IPv6 decisions using the same method.

The player never compares administrative distance before prefix length and never compares metrics
that belong to unrelated routing protocols as if they were universally equivalent. Protocol-specific
best-path selection and recursive lookup are explicitly deferred.

## Interactive Player 2: Hop-by-Hop Forwarding

The player uses a small routed topology containing a source, multiple routers, and a destination.
Every link labels both interfaces. At each hop it opens the active packet and shows:

1. the router receiving and decapsulating the current Layer 2 frame;
2. the unchanged Layer 3 destination address used for a fresh route lookup;
3. the selected next hop and outgoing interface;
4. IPv4 TTL or IPv6 Hop Limit decreasing by one;
5. a replacement Layer 2 header for the next link;
6. transmission to the next router or final destination.

Selectable terminal outcomes include successful IPv4 delivery, successful IPv6 delivery, no route,
expired TTL/Hop Limit, and an explicitly authored unresolved-next-hop preview. The latter explains
the dependency but does not simulate recursive route resolution in this lesson. Disposal states show
the responsible device and appropriate evidence without guaranteeing that an ICMP error can always
be returned.

## Playback and Interaction

- Both players autoplay by default when normal motion is permitted.
- Previous, Play/Pause, Next, Restart, and all shared playback-speed choices remain available.
- Manual navigation pauses autoplay and keeps explanation, table state, topology, packet fields, and
  status announcements synchronized.
- Restart and scenario changes return deterministically to the first step.
- Reduced-motion learners receive discrete manual progression with no missing state or content.
- The complete public conclusion remains understandable through server-rendered static text.

## Component Boundaries

- A focused pure routing domain module owns address-family validation, prefix membership,
  longest-prefix comparison, equal-prefix preference comparison, metric comparison, and typed
  terminal outcomes.
- `RoutingTableDecisionPlayer` owns scenario selection, elimination visualization, playback, and
  route-result presentation.
- `HopByHopForwardingPlayer` owns topology playback, per-hop route lookups, packet inspection,
  Layer 2 replacement, TTL/Hop Limit changes, and disposal states.
- Shared playback, reduced-motion, topology, packet-inspector, progress, and lesson-shell primitives
  are reused where their contracts fit. Routing-specific evaluation stays inside the routing feature.
- Public and account bodies remain separate MDX modules loaded through the existing authorized
  lesson repository.
- Catalog publication, route generation, sitemap, adjacent navigation, and progress manifests follow
  established lesson conventions.
- A new idempotent Supabase migration registers the lesson and required progress items without
  changing unrelated policies, authentication providers, redirects, or existing learner data.

## Accuracy Rules

- Route matching uses the destination address and network prefix, not the packet's source address.
- IPv4 entries are never candidates for IPv6 destinations and vice versa.
- Longest-prefix match is applied before administrative distance or metric.
- Administrative distance is presented as local trust or preference between route sources and is not
  sent between routers as a universal network value.
- Metric is compared only within an authored context where comparison is meaningful; full
  protocol-specific best-path rules are deferred.
- A default route is `0.0.0.0/0` for IPv4 or `::/0` for IPv6 and wins only when no longer matching
  prefix remains.
- A connected route can identify only an outgoing interface; a gateway route identifies a next hop
  that must ultimately be reachable through an interface.
- Routers make a new forwarding decision at each hop. They do not reserve the full end-to-end path.
- The source and destination Layer 3 addresses normally remain unchanged in these non-NAT examples.
- Layer 2 source and destination addresses are link-local forwarding information and change at each
  routed hop.
- IPv4 TTL and IPv6 Hop Limit decrease at each router. An exhausted value causes disposal.
- Absence of a route produces disposal; an ICMP or ICMPv6 error is conditional and not guaranteed.

## Responsive, Accessible, and Resilient Behavior

- Both players fit the lesson column at desktop and 390-pixel widths without page-level horizontal
  overflow. Wide route tables may scroll only inside a clearly labelled local region.
- Candidate status, active route, interfaces, packet direction, and disposal outcomes use text and
  shape in addition to color.
- Tables use captions and correct headers. Scenario choices use semantic fieldsets and legends.
- Controls provide at least 44-pixel touch targets, predictable keyboard order, visible focus, and
  polite status announcements.
- Technical packet details use accessible native disclosures while essential decisions remain visible
  in plain language.
- Invalid or incomplete authored scenarios fail closed with a useful static explanation instead of
  inventing a route or crashing the lesson.
- The public lesson remains usable when Supabase is unavailable; authenticated synchronization may
  enter the existing retry state without hiding lesson content.

## Progress and Completion

- Stable required-item identifiers cover public section continuations, both public player attempts,
  account exercises, three knowledge-check attempts, and the summary.
- Player progress is recorded only at meaningful terminal steps, not on every animation frame.
- The existing learner-specific queue provides idempotent retry, optimistic display, confirmed server
  state, bounded storage, and duplicate prevention; the lesson introduces no second persistence path.
- Any submitted knowledge-check answer counts as an attempt. Correctness remains visible and can be
  improved through retry.
- A lesson is complete only after all registered required items are completed or attempted according
  to their type.
- Existing Continue, resume, next-incomplete, skip-to-next, and restart controls remain intact.

## Testing and Acceptance

Automated tests must verify:

- IPv4 and IPv6 prefix membership, family rejection, host routes, default routes, malformed scenario
  rejection, and no-route outcomes;
- strict ordering of longest prefix, administrative distance, and metric;
- connected, static, learned, equal-prefix, and intentionally equal-cost scenarios;
- visible elimination reasons and synchronized table/player state;
- successful per-hop IPv4 and IPv6 forwarding, unchanged Layer 3 destinations, Layer 2 replacement,
  TTL/Hop Limit decrement, expiry, and disposal;
- autoplay, pause, manual navigation, restart, speed, scenario reset, and reduced-motion behavior;
- wrong answers recording attempts while retaining incorrect feedback;
- anonymous/account/Pro module separation and absence of protected strings in public output;
- catalog publication, section order, repository registration, route generation, sitemap, adjacent
  navigation, progress manifest, and idempotent migration text;
- semantic controls, server-rendered fallback content, safe malformed-data behavior, and responsive
  style contracts;
- the complete unit suite, TypeScript validation, lint, and production build.

Visual review must confirm that route rows, rejection reasons, prefix comparisons, interface labels,
packet fields, active hops, disposal states, controls, and locked boundaries remain readable in light
and dark themes at desktop and 390-pixel widths.

