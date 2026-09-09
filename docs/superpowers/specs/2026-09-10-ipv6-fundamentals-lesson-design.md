# IPv6 Fundamentals Lesson Design

## Purpose

Build the next unpublished Networking Foundations lesson at
`/learn/networking-foundations/ipv6-fundamentals`. It follows Subnetting Fundamentals and teaches a
complete beginner to read IPv6 addresses, understand their scope, and follow the ICMPv6 exchanges
that establish an address, discover a router, and reach a neighbour on the local link.

Authentication-provider and redirect behavior remain deferred and outside this lesson's scope.

## Product Decisions

- Use the concept-first layered approach: notation, address scope, then one coherent Neighbor
  Discovery and SLAAC packet journey.
- Provide two focused public players: an IPv6 Address Explorer and an NDP & SLAAC Journey.
- Autoplay begins each selected journey, with Previous, Play/Pause, Next, Restart, and speed controls.
- Keep all essential concepts and both players public. Commands, capture evidence, guided practice,
  troubleshooting, knowledge checks, and the summary require a free account.
- Account-gated contents entries display `Locked`; Pro entries display `Pro` and `Locked`.
- Incorrect knowledge-check answers count as attempts but remain visibly incorrect. Lesson
  completion still requires every required item to be attempted or completed.
- Existing authentication behavior, learning-tool drawers, and postponed cosmetic rectification work
  are not changed by this branch.

## Learning Outcome

After the public introduction, a learner can:

1. recognize that an IPv6 address is 128 bits written as eight hexadecimal hextets;
2. expand and correctly shorten IPv6 addresses using the single `::` compression rule;
3. separate an IPv6 prefix from the interface identifier without assuming every prefix is `/64`;
4. classify unspecified, loopback, link-local, global unicast, unique-local, and multicast addresses;
5. explain why IPv6 has no broadcast and how multicast narrows delivery scope;
6. identify Router Solicitation, Router Advertisement, Neighbor Solicitation, and Neighbor
   Advertisement exchanges;
7. explain SLAAC, Duplicate Address Detection, solicited-node multicast, neighbour resolution, and
   default-router discovery at a foundational level;
8. predict whether a destination is local or must be sent through a discovered default router.

## Teaching Sequence

### Public introduction

1. **Why IPv6 exists** — address scale, simpler end-to-end addressing expectations, and coexistence
   with IPv4 without claiming IPv4 has disappeared.
2. **Address structure and hexadecimal notation** — 128 bits, eight 16-bit hextets, four hexadecimal
   digits per hextet, and prefix notation.
3. **Expand and shorten safely** — remove leading zeros per hextet, compress one longest consecutive
   zero run once, and reject ambiguous or invalid text.
4. **Interactive Player 1: IPv6 Address Explorer** — unfold an address into hextets and bits, apply
   shortening in visible steps, mark the prefix boundary, and classify the result.
5. **Prefixes and interface identifiers** — explain the routing prefix and remaining bits while
   presenting `/64` as common for LANs rather than a universal parsing rule.
6. **Address types and scopes** — compare unspecified, loopback, link-local, global unicast,
   unique-local, multicast, and documentation addresses with beginner-safe examples.
7. **No broadcast in IPv6** — relate broadcast, multicast, and solicited-node multicast without
   implying every node processes every discovery message.
8. **Neighbor Discovery uses ICMPv6** — introduce RS, RA, NS, and NA and state that NDP provides more
   than an IPv4 ARP replacement.
9. **Interactive Player 2: NDP & SLAAC Journey** — autoplay address formation, DAD, router discovery,
   neighbour resolution, and local/default-router delivery with labelled interfaces and packet
   inspection at every hop.
10. **Default-router discovery and local delivery** — connect prefix information, neighbour cache,
    next-hop choice, and the router boundary to earlier delivery lessons.

### Account-locked continuation

- Inspect IPv6 addressing and routes with Windows `ipconfig`/PowerShell and Linux `ip -6 address` and
  `ip -6 route` output.
- Use focused Wireshark `ipv6` and `icmpv6` display filters to distinguish RS, RA, NS, NA, and DAD.
- Complete guided address-shortening, scope-classification, prefix, and packet-sequence exercises.
- Diagnose invalid compression, missing or unsuitable Router Advertisements, DAD failures, wrong
  prefixes, stale neighbour entries, and mistaken local/default-router decisions.
- Attempt three knowledge checks and review a concise summary. Attempts count toward progress even
  when the selected answer is wrong.

### Pro preview

- Prefix and Router Advertisement diagnosis in multi-router networks.
- Duplicate Address Detection and neighbour-cache failure evidence.
- Dual-stack source/destination selection and preference problems.
- RFC-guided interpretation of less common flags, lifetimes, and ICMPv6 options.
- Production escalation scenarios that correlate host, switch, router, and packet-capture evidence.

The preview describes these outcomes without exposing protected lesson content.

## Interactive Player 1: IPv6 Address Explorer

The player uses curated documentation-safe examples and validated direct input. The default example
is `2001:db8:0:0:20c:29ff:fe9c:409/64`.

Each journey shows:

1. validation and separation of the address from its prefix length;
2. expansion to exactly eight four-digit hextets;
3. hexadecimal-to-binary grouping and the exact prefix boundary;
4. removal of leading zeros inside each hextet;
5. selection of the one longest zero run eligible for `::` compression, using the leftmost run when
   equal-length runs tie;
6. the canonical shortened representation;
7. address type, scope, and a plain-language explanation of where it is usable.

Curated scenarios include global documentation, link-local, unique-local, multicast, loopback, and
unspecified addresses. Invalid input returns an inline explanation and preserves the last valid
visual state. The player never invents missing hextets or permits more than one `::`.

## Interactive Player 2: NDP & SLAAC Journey

The player offers related scenarios on a small LAN with a host, switch, router, and optional peer.
Every link names both interfaces. Packet markers move along all eligible paths, and the active packet
opens at each hop to show Ethernet, IPv6, and ICMPv6 fields in plain-language and technical views.

The primary autoplay journey shows:

1. the host forming a link-local address;
2. Duplicate Address Detection using an NS sent to the address's solicited-node multicast group;
3. an RS sent to the all-routers multicast group;
4. an RA providing prefix, default-router, flags, and lifetime information;
5. SLAAC formation of a global address followed by DAD;
6. an NS/NA exchange resolving a local neighbour's link-layer address;
7. direct local delivery or delivery to the discovered router for an off-link destination.

Selectable scenarios isolate DAD success/failure, router discovery, neighbour resolution, multicast
fan-out, and local-versus-router forwarding. The switch may flood eligible Ethernet multicast within
the VLAN, but the explanation distinguishes link delivery from ICMPv6 group acceptance. No scenario
shows IPv6 broadcast or describes NDP as only “ARP for IPv6.”

## Component Boundaries

- A focused pure IPv6 domain module owns parsing, expansion, canonical compression, prefix splitting,
  solicited-node multicast derivation, and address classification.
- `Ipv6AddressExplorer` owns address input, notation steps, prefix visualization, and classification.
- `NdpSlaacJourneyPlayer` owns topology scenarios, autoplay state, packet movement, hop inspection,
  and scenario feedback.
- Shared playback, reduced-motion, packet-inspector, and progress primitives are reused where their
  interfaces fit; IPv6-specific protocol data remains inside the IPv6 feature boundary.
- Public and account bodies remain separate MDX modules loaded through the established authorized
  lesson repository.
- Catalog, route, sitemap, adjacent navigation, and progress manifest follow existing published
  lesson conventions.
- A new idempotent Supabase migration registers the lesson manifest and required items without
  changing providers, redirects, policies unrelated to progress, or existing learner data.

## Accuracy Rules

- IPv6 addresses contain 128 bits and exactly eight hextets when fully expanded.
- Leading-zero suppression applies within hextets; `::` may appear at most once and represents one or
  more all-zero hextets.
- Canonical display compresses the longest eligible zero run and uses the leftmost run for a tie.
- `/64` is common for ordinary SLAAC LANs but is not treated as the only valid IPv6 prefix length.
- IPv6 has no broadcast address. Multicast and anycast are not described as broadcast substitutes.
- Link-local addresses use `fe80::/10`; unique-local addresses use `fc00::/7`; multicast uses
  `ff00::/8`; documentation examples use `2001:db8::/32`.
- NDP is carried by ICMPv6 and includes router discovery, prefix discovery, neighbour resolution,
  reachability functions, and Duplicate Address Detection.
- DAD uses an unspecified source address before the tentative address is assigned.
- Solicited-node multicast reduces listener scope but does not guarantee a switch forwards the frame
  to only one physical port unless multicast-aware forwarding state exists.
- Router Advertisements can be unsolicited or sent in response to Router Solicitations; SLAAC does
  not itself supply every application setting such as DNS in all deployments.
- Examples never imply that NAT is required for IPv6 or that globally scoped addressing removes the
  need for firewall policy.

## Responsive, Accessible, and Resilient Behavior

- Both players fit the lesson column at desktop and 390-pixel widths without page-level horizontal
  overflow. Hextets and packet fields may scroll only within clearly labelled local regions.
- Interfaces, multicast recipients, active links, packet direction, and acceptance decisions use
  text and shape as well as color.
- Controls use semantic fieldsets, legends, buttons, status messages, and a predictable focus order.
- Autoplay pauses after manual navigation and stops at the final step. Restart and scenario changes
  deterministically restore the first step.
- Reduced-motion users receive manual progression with no lost content or state.
- Static explanations preserve the complete public conclusion when JavaScript is disabled.
- Invalid address input is explained inline, does not crash the player, and does not erase the last
  valid result.

## Progress and Completion

- Public section continuations, both player attempts, account exercises, three knowledge-check
  attempts, and the summary are registered as stable required items.
- The existing learner-specific queue supplies idempotent retries, optimistic state, and
  server-confirmed state; the lesson introduces no second persistence path.
- Any submitted answer counts as an attempt. Correctness remains separately visible and can be
  improved by retrying.
- A lesson is marked complete only after all required items are complete or attempted according to
  their registered kind.
- Existing Continue, resume, next-incomplete, skip-to-next, and restart behavior remains intact.

## Testing and Acceptance

Automated tests must verify:

- valid expansion/compression, tie-breaking, uppercase normalization, embedded IPv4 rejection or
  explicit handling, malformed input, invalid prefixes, and address-type boundaries;
- prefix splitting and solicited-node multicast derivation with known examples;
- the Address Explorer's scenario changes, direct input, invalid-input recovery, autoplay/manual
  controls, canonical output, and reduced-motion behavior;
- the NDP/SLAAC player's RS/RA, NS/NA, DAD, multicast fan-out, interface labels, packet inspection,
  local/default-router decisions, autoplay/manual controls, and reduced-motion behavior;
- wrong answers produce attempted progress while preserving correctness feedback;
- anonymous/account/Pro module separation and absence of account-only strings in public output;
- catalog publication, section order, lesson repository registration, route generation, sitemap,
  adjacent navigation, progress manifest, and idempotent migration text;
- responsive styles, semantic controls, and server-rendered static public explanations;
- the complete unit suite, TypeScript validation, lint, and production build.

Visual review must confirm that hextets, compression steps, prefix boundaries, address classification,
interfaces, multicast fan-out, moving packets, hop-level packet fields, feedback, and controls remain
readable in light and dark themes at desktop and 390-pixel widths.
