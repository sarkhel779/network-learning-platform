# Routers, Default Gateways and Network Boundaries Lesson Design

**Date:** 2026-09-08
**Status:** Proposed
**Scope:** Publish the sixth Networking Foundations lesson with a focused route-decision player, free-account diagnostic practice, and explicit public, account, and Pro boundaries.

## Purpose

This lesson teaches complete beginners and early-career IT professionals how a host decides whether a destination is local or remote, when it uses a default gateway, and what a router changes while forwarding a packet between networks. It follows `Unicast, Broadcast and Multicast Communication` and precedes `Access Points, Modems, ONTs and Firewalls`.

The lesson connects earlier host, link, switch, and delivery-scope concepts without turning into a subnetting course or the later end-to-end packet-journey capstone. Learners should leave with a reliable decision process they can apply to simple topologies and basic operating-system evidence.

## Central Learning Outcome

Given a source address and prefix, a destination address, a small topology, and a simplified routing table, the learner can:

- decide whether the destination is on-link or remote;
- identify whether the host sends directly or to a next-hop router;
- explain the default gateway as a router interface reachable on the local link;
- identify the outgoing interface and first next hop;
- distinguish the packet's end-to-end IP addresses from hop-specific Ethernet addresses;
- explain what a router does at a network boundary; and
- recognize no-route, unreachable-gateway, and wrong-interface symptoms without guessing.

## Goals

- Publish the existing `routers-default-gateways-and-network-boundaries` catalog entry without changing its slug, order, title, objective, or 20-minute estimate.
- Teach local-versus-remote reasoning before detailed subnet arithmetic.
- Provide a public route-decision player with visible host, link, router, and destination states.
- Provide signed-in free members with easy-to-intermediate route interpretation and troubleshooting scenarios.
- Support **I know this—proceed to advanced** without bypassing authentication or exposing Pro material.
- Reuse existing topology symbols, content authorization, navigation, accessibility, and styling conventions while keeping routing logic independent from delivery-scope logic.
- Preserve server rendering, keyboard operation, reduced-motion behavior, 360px usability, and meaningful no-JavaScript content.

## Non-goals

- Teaching binary subnet calculation, VLSM, route summarization, or exhaustive prefix mathematics; those belong to the addressing and subnetting lessons.
- Dynamic routing protocols, policy-based routing, VRFs, route redistribution, ECMP internals, or vendor configuration.
- NAT, DHCP, DNS, firewall rule evaluation, VPNs, or internet-provider architecture.
- Rebuilding the complete packet journey that belongs to `first-packet-journey-through-a-small-network`.
- Live system inspection, command execution, packet uploads, network access, or external APIs.
- Unlocking paid Pro content or adding checkout; the only advanced action remains **Join the Pro Member Waitlist**.

## Lesson Structure

1. **Why network boundaries matter** — one local link cannot directly deliver every destination.
2. **What a router does** — receives a Layer 2 frame, processes the addressed IP packet, chooses an eligible route, and creates a new Layer 2 frame for the next link.
3. **Local or remote?** — compare the source host's address and prefix with the destination at a conceptual, visual level.
4. **The default gateway** — explain the gateway as the host's local next hop for destinations without a more specific route.
5. **Direct delivery and routed delivery** — contrast destination IP and destination MAC choices.
6. **What changes at each hop** — show new link-layer headers, reduced TTL or Hop Limit, and stable end-to-end source/destination IP addresses in the no-NAT foundational case.
7. **Interactive route-decision player** — choose representative destinations and inspect the decision and forwarding steps.
8. **Read a basic routing table** — interpret destination/prefix, next hop, interface, and default route using simplified evidence.
9. **Diagnose gateway and boundary problems** — apply a repeatable evidence-first workflow.
10. **Knowledge check and summary** — apply the local/remote decision and state what routing evidence proves.
11. **Pro Deep Dive preview** — preview advanced route selection, packet analysis, standards checks, and interview preparation.

Catalog `sections` metadata must match these headings and access levels exactly. Existing curriculum navigation and Previous/Next controls remain unchanged except for publishing this route.

## Teaching Model and Terminology

The lesson uses one precise reasoning sequence:

1. Inspect the destination IP address.
2. Apply the source interface's prefix to decide whether the destination is on-link.
3. If on-link, resolve and use the destination's link-layer address.
4. If remote, consult the routing table and select the best matching route.
5. Resolve and use the selected next hop's link-layer address on the outgoing link.
6. If no eligible route exists, stop and report the routing failure.

The foundational explanation may use visually simple `/24` examples, but it must state that a host uses its configured prefix rather than assuming that matching the first three octets always means local.

- A **router** forwards packets between IP networks according to its routing information and forwarding rules.
- A **default gateway** is normally a router interface reachable from the host's local network; it is not the final destination of the remote packet.
- A **next hop** is the immediate Layer 3 neighbor selected for forwarding. The route may instead identify an on-link destination through an outgoing interface.
- A **default route** is used only when no more-specific eligible route matches.
- **Direct delivery** still uses Layer 2 delivery on the local link.
- **Routed delivery** sends the first frame to the gateway while retaining the remote destination IP address in the packet, assuming no NAT.

The lesson distinguishes observation from conclusion. Seeing a frame addressed to a router MAC proves the router is the local Layer 2 recipient, not that the router is the packet's final IP destination.

## Router-Boundary Accuracy Constraints

- A router must not be shown forwarding an ordinary Layer 2 broadcast to another network.
- A router removes the received link-layer framing and creates framing appropriate for the outgoing link; it does not simply preserve the original Ethernet header end to end.
- IPv4 TTL or IPv6 Hop Limit decreases during forwarding. The player does not require checksum arithmetic, but may note that the IPv4 header checksum is updated.
- Source and destination IP addresses remain stable in the foundational no-NAT scenarios. NAT is explicitly labelled as a later exception.
- ARP resolves IPv4 next-hop addresses only on a local link. It does not discover a remote host's MAC address through a router.
- IPv6 uses Neighbor Discovery rather than ARP; IPv6 details remain a labelled preview for the dedicated IPv6 lesson.
- Broadcast and multicast behavior must follow the delivery-scope lesson: ordinary broadcasts stop at the boundary, while multicast crosses routers only when multicast forwarding is explicitly configured.
- A default gateway outside the host's on-link prefix is treated as invalid or unusable unless an explicitly modelled on-link mechanism exists; the beginner scenarios do not model such exceptions.

## Public Route-Decision Player

### Scenario model

The public player contains a small validated dataset with stable identifiers. Each scenario defines:

- source host address and prefix;
- destination address;
- simplified topology nodes and links;
- directly connected route and optional default route;
- expected scope: `on-link`, `remote-via-gateway`, or `no-route`;
- selected outgoing interface and next hop when one exists;
- first-hop destination MAC role;
- ordered explanation steps; and
- a plain-language conclusion and technical conclusion.

Initial public scenarios cover:

1. A destination on the same local subnet
2. A remote destination reached through the default gateway
3. A remote destination when no default or matching route exists
4. The gateway's own local IP address
5. A local broadcast that stops at the router boundary

The player does not expose signed-in diagnostic cases, answers, protected identifiers, or Pro copy in anonymous HTML, RSC payloads, or client bundles.

### Learner experience

The learner chooses a destination scenario using keyboard-operable single-choice controls. The visual then presents:

- **Decision:** local, remote, or no route;
- **Outgoing interface:** the source interface selected;
- **Next hop:** destination itself, gateway, or none;
- **First frame:** whose link-layer address is used;
- **Boundary action:** local delivery, router forwarding, router stop, or host routing failure; and
- **Why:** a short plain-language explanation followed by the technical reasoning.

The topology uses existing device symbols where possible. Labels, shapes, line patterns, and text carry meaning independently of color. Reduced-motion mode changes discrete states without travelling animation. Without JavaScript, the server-rendered comparison and scenario summaries still teach the essential decisions.

## Basic Routing-Table Evidence

The free-account section introduces a normalized four-column representation: destination/prefix, next hop, outgoing interface, and purpose. It then maps that representation to selected read-only examples from Windows `route print` and Linux `ip route`.

The lesson teaches more-specific matching only at a recognition level: an explicit network route beats the default route. Full longest-prefix calculations, route preference, administrative distance, and metric comparison belong to later or Pro material.

Command output is static teaching data. The site never runs commands on the learner's device and never asks learners to paste private routing tables or IP addresses.

## Free-Account Practice

### Scenario coverage

Signed-in free members receive validated easy-to-intermediate cases covering:

1. A correct local-delivery decision
2. A correct default-gateway decision
3. A missing default route
4. A configured gateway that is not locally reachable
5. A wrong prefix causing an incorrect local/remote decision
6. A more-specific route overriding the default route
7. A router receiving a packet but lacking an onward route

Each case asks the learner to predict the decision, outgoing interface, next hop, and first-hop link-layer recipient before revealing feedback. Feedback distinguishes an incorrect host decision from an unreachable next hop and from a router-side forwarding failure.

### “I know this” route

An **I know this—proceed to advanced** control appears after the public comparison. For a signed-in learner it moves focus to the first intermediate account scenario and announces the destination. For an anonymous visitor it invokes the existing account boundary. It never unlocks Pro content.

### Troubleshooting method

The lesson uses an evidence-first sequence:

1. State the source, destination, symptom, and scope.
2. Confirm the source interface address and prefix.
3. Decide whether the destination should be on-link.
4. Inspect the selected route, next hop, and interface.
5. Test reachability to the local next hop before blaming the remote path.
6. If the gateway is reachable, inspect the next router or return path with appropriately scoped evidence.
7. Change one variable, retest, and record the result.

Ping failure is never presented as proof that the target is offline; filtering, return-path problems, and control-plane policy remain possible.

## Access Model

### Public visitor

Anonymous visitors receive the beginner explanation, comparison material, five public route-decision scenarios, and a useful static fallback. They do not receive routing-table exercises, diagnostic datasets, knowledge-check answers, or Pro material.

### Free member

Signed-in free members receive the complete foundational lesson, normalized routing-table evidence, easy-to-intermediate prediction and troubleshooting cases, knowledge checks, summary, and saved-progress hooks when learner persistence is enabled.

### Pro Member Waitlist

At launch, advanced material remains unavailable. The preview names longest-prefix edge cases, metrics and route preference, recursive next-hop resolution, ECMP, policy routing, dynamic-routing context, advanced Wireshark analysis, vendor diagnostics, RFC-guided checks, production troubleshooting, and interview preparation.

The only upgrade action is **Join the Pro Member Waitlist**. The interface must not imply immediate paid access.

## Architecture and Data Boundaries

Lesson prose lives in separate public and account MDX modules registered through the existing authorized content repository. Catalog metadata remains authoritative for publication, SEO, estimated duration, navigation, and section access.

Focused implementation units are:

- `RouteDecisionExperience` for lesson composition;
- `RouteDecisionPlayer` for public scenario selection and explanation;
- `RouteDecisionLab` for protected prediction exercises;
- Zod schemas and typed public/account scenario data in separate modules;
- a pure `evaluateRouteDecision` function that returns scope, route, next hop, interface, first-hop recipient, boundary action, and explanations; and
- a server-only account loader that prevents protected scenarios from entering anonymous artifacts.

Routing evaluation contains no React state and accepts validated teaching data. Components render its result and do not reimplement route-selection rules. Public and account scenario modules remain physically separate. Pro material is preview metadata only; no Pro lesson body exists at launch.

The evaluator supports only the lesson's explicit model: connected routes, one or more simplified static routes, and an optional default route. Unsupported or malformed input returns an unavailable state; it never silently guesses or substitutes another scenario.

## Static Rendering and Failure Behavior

- Essential explanations, comparison tables, public scenario summaries, and boundary rules render on the server.
- If JavaScript is unavailable, learners retain the complete public conceptual explanation and scenario outcomes.
- Invalid scenario or route data produces a clear unavailable-state message while preserving surrounding lesson content.
- A missing route yields a valid `no-route` learning result, not a generic application error.
- Account-content loading failures preserve the public lesson and show the existing access-safe fallback.
- No external request, hardware permission, or sensitive learner data is required.

## Accessibility and Responsive Requirements

- Every topology node, route, step, and control has an unambiguous accessible name.
- The scenario choices and prediction form work with keyboard and pointer input.
- Dynamic results use a restrained live region and announce each learner submission once.
- Focus moves intentionally after **I know this—proceed to advanced**.
- Color and animation supplement rather than replace text, shape, and state labels.
- Reduced-motion mode retains all state changes and explanations.
- At 360px, topology elements stack or wrap, tables are keyboard-scrollable, controls remain at least 44px high, and the document has no horizontal overflow.
- The no-JavaScript response retains meaningful headings, comparisons, and boundary explanations.

## Testing Strategy

### Catalog and authorization contracts

- Assert the existing slug becomes published in the approved position with exact section metadata.
- Assert Previous is the delivery-scope lesson and Next remains the planned edge-device lesson.
- Render public and account MDX separately and verify valid heading structure.
- Assert anonymous responses and production artifacts exclude account scenario identifiers, explanations, answers, and server-only loaders.

### Schemas and pure evaluator

- Validate IPv4 teaching addresses, prefixes, interfaces, routes, next hops, and stable scenario identifiers.
- Cover on-link, default-route, more-specific-route, and no-route results.
- Verify the first-hop recipient is the destination for direct delivery and the gateway for routed delivery.
- Verify ordinary local broadcast does not receive a routed outcome.
- Reject malformed prefixes, off-link gateways, incomplete routes, unknown interfaces, and ambiguous duplicate routes without guessing.
- Verify prediction scoring evaluates decision, interface, next hop, and boundary action independently for useful feedback.

### Component behavior

- Select every public scenario and verify consistent decision cards and topology state.
- Exercise correct and incorrect account predictions and verify explanatory feedback and reset behavior.
- Operate all controls by keyboard and verify deliberate focus movement.
- Verify restrained announcements, reduced motion, static fallback, and invalid-data behavior.

### Browser and regression coverage

- Open the lesson on desktop and 360px mobile without console, hydration, or markup errors.
- Verify curriculum, `On this page`, Previous/Next, sitemap, metadata, and direct-route behavior.
- Verify anonymous, free-account, and Pro-preview boundaries.
- Verify no-JavaScript usefulness, keyboard-scrollable tables, 44px controls, and no horizontal overflow.
- Re-run all previously published lesson journeys plus type checking, linting, unit/component tests, production build, and focused Chromium/mobile Chromium tests.

## Delivery Sequence

1. Add failing catalog, navigation, sitemap, and authorization tests.
2. Define schemas and add failing evaluator tests for direct, gateway, specific-route, broadcast-boundary, and no-route outcomes.
3. Implement the minimum pure evaluator and validated public scenario data.
4. Add public and account MDX structure with matching catalog sections.
5. Build the accessible public player and its static/reduced-motion behavior.
6. Add the protected scenario loader, prediction evaluator, and free-account lab.
7. Add routing-table evidence, troubleshooting, knowledge checks, advanced jump, and Pro waitlist preview.
8. Add responsive, privacy, no-JavaScript, browser, and regression coverage.
9. Complete automated verification and desktop/mobile visual review.

## Acceptance Criteria

The lesson is ready when a complete beginner can correctly decide whether a simple destination is local or remote, identify the first next hop and outgoing interface, explain why the remote destination IP remains unchanged while link-layer addressing changes, and distinguish a host routing failure from an unreachable gateway or router-side no-route condition. The published route must be useful anonymously, provide deeper free-account practice without leaking protected material, preview Pro depth accurately, work with keyboard and reduced motion at 360px, remain meaningful without JavaScript, and pass the full project verification suite.
