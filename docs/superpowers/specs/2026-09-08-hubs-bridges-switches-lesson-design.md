# Hubs, Bridges and Switches Lesson Design

**Date:** 2026-09-08
**Status:** Approved for specification review
**Scope:** Publish one quality-first Networking Foundations lesson that teaches shared Ethernet, collision domains, bridge/switch learning, forwarding, filtering, flooding, and aging through accurate beginner explanations and an evidence-led frame-forwarding experience.

## Purpose

This lesson helps complete beginners and early-career IT professionals understand what an Ethernet intermediary actually does with a frame. It replaces the vague idea that every box simply “sends data onward” with a precise mental model: a hub repeats signals, while a bridge or switch learns source MAC locations and makes a separate forwarding decision for each destination MAC address.

The lesson follows `Cables, Fibre, Wireless and Network Connections`. It uses the learner's existing knowledge of hosts, interfaces, signals, frames, and MAC addresses, but does not require VLAN, Spanning Tree, routing, or vendor configuration knowledge.

## Central Learning Outcome

Given a small Ethernet topology, a frame's source and destination MAC addresses, and the current forwarding table, the learner can:

- predict what a hub, bridge, or switch will do;
- explain collision domains and shared versus dedicated bandwidth;
- describe how source-address learning builds a forwarding table;
- distinguish forwarding, filtering, unknown-unicast flooding, broadcast flooding, and table aging;
- recognize why a switch does not learn from a destination address;
- explain why switching reduces unnecessary delivery without providing routing or a security boundary; and
- choose the next evidence to inspect when traffic reaches the wrong ports or fails to cross a local network.

## Goals

- Publish the existing `hubs-bridges-and-switches` entry without changing its slug, position, title, objective, SEO metadata, or foundational estimate.
- Teach behavior before terminology, using one stable topology and progressively richer frame examples.
- Provide a public, server-rendered comparison of hub, bridge, and switch behavior.
- Provide a signed-in frame-forwarding lab with visible forwarding-table state and explanatory outcomes.
- Support **I know this—proceed to advanced**, taking the learner to an intermediate table-reasoning scenario without bypassing access controls.
- Preserve mobile, keyboard, reduced-motion, and no-JavaScript usefulness.
- Keep free-account exercises, answers, and Pro preview details out of anonymous HTML, RSC payloads, and client assets.

## Non-goals

- VLANs, trunks, inter-VLAN routing, Spanning Tree Protocol, link aggregation, port security, Power over Ethernet, or managed-switch configuration.
- Detailed Ethernet frame fields, ARP behavior, IP subnet decisions, default gateways, routing tables, or NAT.
- Switch fabric/ASIC architecture, buffering algorithms, cut-through switching, QoS, multicast snooping, or data-centre switching.
- Packet capture uploads, real network discovery, hardware access, vendor simulators, or external APIs.
- Immediate paid Pro access or checkout; the only upgrade action remains **Join the Pro Member Waitlist**.

## Lesson Structure

1. **One local Ethernet conversation** — hosts, interfaces, frames, ports, and the destination MAC address.
2. **What a hub does** — physical-layer repetition, shared bandwidth, one collision domain, and half-duplex history.
3. **Why bridges changed Ethernet** — segmenting collision domains and filtering traffic using learned MAC locations.
4. **How a switch learns** — source MAC, ingress port, forwarding-table entry, refresh, and aging.
5. **How a switch forwards** — known unicast, same-port filtering, unknown unicast flooding, broadcast flooding, and reply learning.
6. **Compare hub, bridge and switch** — visual, text, and tabular comparison without implying that a switch routes traffic.
7. **Forward the frame** — account-only guided lab.
8. **Diagnose local switching symptoms** — evidence-first troubleshooting.
9. **Knowledge check and summary** — application questions and compact decision table.
10. **Pro Deep Dive preview** — advanced switching, packet inspection, standards work, and interview preparation.

Catalog section metadata and MDX heading IDs must match exactly. Previous points to `cables-fibre-wireless-and-network-connections`; Next identifies `routers-default-gateways-and-network-boundaries` as planned.

## Teaching Model and Accuracy Boundaries

The lesson uses Ethernet learning bridges as the conceptual basis of modern Layer 2 switches.

- A **hub** repeats incoming physical signals toward its other ports. It does not inspect MAC addresses or build a forwarding table.
- A **bridge** learns and filters between Ethernet segments. A classic bridge may have few ports and software-oriented forwarding; a modern switch applies the same fundamental learning-bridge behavior at larger port counts and higher speed.
- A **switch learns from the source MAC address** of a received frame because the ingress port proves where that sender is reachable.
- A switch looks up the **destination MAC address** to decide where the frame should go; it does not learn the destination from that lookup.
- **Known unicast:** forward only through the learned destination port, unless that port is the ingress port.
- **Filtering:** if source and learned destination are on the same port/segment, do not forward the frame to other ports.
- **Unknown unicast:** flood through eligible ports in the same Layer 2 domain except the ingress port.
- **Broadcast:** flood through eligible ports except the ingress port. The lesson must not say a switch sends a frame “back out every port.”
- **Aging:** dynamic entries expire after an implementation-dependent period unless refreshed. No universal aging timer is taught.
- Each switch port normally creates a separate collision domain in full-duplex switched Ethernet. A switch does not eliminate the broadcast domain by itself.
- Switching decisions are link-layer decisions. A switch does not replace a router, infer application intent, or automatically provide confidentiality or authorization.

The public lesson may introduce CAM/MAC-address-table terminology but should prefer **forwarding table** first. Vendor-specific commands and exact timer defaults belong only in future deeper material.

## Public Visual Comparison

The public comparison presents the same three-host topology under hub, bridge, and switch modes. The learner selects a behavior such as signal handling, collision scope, bandwidth sharing, address awareness, or delivery scope. Each panel updates:

- the visible traffic path;
- a concise explanation;
- a labelled trade-off or consequence; and
- a non-color indicator showing repeat, filter, learn, forward, or flood behavior.

The interaction is explanatory, not a speed ranking. Reduced-motion mode uses discrete highlighted ports and arrows rather than travelling frames. With JavaScript disabled, a static comparison table and textual walkthrough preserve the essential conclusions.

## Frame-Forwarding Lab

### Scenario model

Each scenario includes a stable identifier, accessible title, topology nodes and ports, initial forwarding-table entries, ingress port, source MAC, destination MAC/type, expected source-learning update, expected egress ports, decision category, explanation, and evidence notes.

The free-account lesson includes six progressive scenarios:

1. Empty table: first known sender to an unknown unicast destination
2. Reply frame after the first sender has been learned
3. Known unicast to a learned destination
4. Source and destination learned behind the same bridge port, requiring filtering
5. Broadcast frame, requiring controlled flooding
6. An aged-out destination entry, returning the decision to unknown-unicast flooding

Every scenario must specify all eligible ports so the evaluator never guesses topology behavior.

### Learner flow

The learner:

1. selects a scenario;
2. reads the topology, current table, ingress port, and frame addresses;
3. predicts the switch action from labelled choices;
4. selects the expected egress port or ports where applicable;
5. submits explicitly; and
6. receives an explanation showing source learning, destination lookup, forwarding decision, table change, and why the alternatives are wrong.

Changing the scenario resets the prediction, selected ports, result, and live announcement. Repeated submission announces once per submission. Incorrect answers remain learning opportunities and are not persisted as penalties.

The evaluator is a pure function over validated scenario data and learner input. It returns the decision, learned entry, expected egress set, correctness, explanation, and next-table state. React components must not duplicate switching rules.

### Advanced shortcut

**I know this—proceed to advanced** selects the first intermediate scenario (same-port filtering), clears introductory state, focuses the scenario control, and allows the next Tab action to continue into the prediction choices. It does not unlock Pro content.

## Troubleshooting Experience

The account lesson teaches a repeatable evidence path:

1. define the affected hosts, direction, and scope;
2. verify link state and correct physical ports;
3. identify ingress and expected egress ports;
4. inspect source/destination MAC addresses and address type;
5. inspect the forwarding table and entry freshness;
6. compare observed forwarding with known-unicast, filtering, flooding, or broadcast behavior;
7. change one condition, retest, and record the result.

Foundational cases cover a MAC learned on an unexpected port, an aged/missing entry, a broadcast misunderstood as a switch failure, a same-port filtered frame, a host moved between ports, and an actual physical-link failure that cannot be solved by changing the MAC table.

The lesson must separate observation from diagnosis: flooding is not automatically a loop, a missing table entry is not proof of switch failure, and a populated table is not proof that IP configuration or the destination application is correct.

## Access Model

### Public visitor

Receives the beginner explanations, static diagrams, interactive hub/bridge/switch comparison using public-only data, and a concise summary table. No scenario answer set, forwarding evaluator dataset, knowledge-check answers, troubleshooting answers, interview answers, or Pro detail may ship anonymously.

### Free member

Receives the complete foundational lesson, six frame-forwarding scenarios, evidence-led troubleshooting, application knowledge checks, summary, and future saved-progress hooks.

### Pro member waitlist

Receives only a preview of future depth: VLAN-aware forwarding, STP reasoning, link aggregation, managed-switch evidence, standards/RFC/IEEE-guided checks, advanced Wireshark analysis, ambiguous campus and data-centre cases, and interview/certification preparation.

The CTA is exactly **Join the Pro Member Waitlist**, temporarily linking to `/contact`. Copy must not imply immediate purchase or access.

## Architecture and Data Boundaries

Follow the proven connection-media split:

- public and account MDX modules loaded through the lesson-content repository;
- public comparison data in a public-safe module;
- authored scenario/answer data in a `server-only` account module;
- a safe account loader that validates before passing explicit props to the client experience;
- schema-derived TypeScript types;
- a pure forwarding evaluator;
- `SwitchingComparison`, `FrameForwardingExperience`, and `FrameForwardingLab` focused components.

Only the public comparison may be registered globally for public MDX. The account experience is imported directly from account MDX and receives validated scenario props. It must not import authored account data itself.

Invalid authored data renders explicit static troubleshooting guidance instead of throwing or silently replacing scenarios. Unknown identifiers and inconsistent egress sets are rejected. Anonymous artifact audits must scan HTML, RSC, metadata, and all requested client JavaScript for protected scenario and answer phrases.

## Accessibility and Responsive Requirements

- Use native radio/checkbox/button/table/details elements where they fit the interaction.
- Topology nodes, ports, frames, decisions, table updates, and controls require unambiguous accessible names.
- Color supplements text, port labels, patterns, and shapes; it never carries state alone.
- Results use one polite live announcement per submission.
- Keyboard users can select scenarios, predict decisions/ports, submit, use the advanced shortcut, and continue in logical focus order.
- Reduced motion preserves discrete ingress, lookup, learning, and egress states.
- At 360px, topology and cards reflow without document-level horizontal overflow. Wide tables use an explicitly labelled, focusable local scroll region.
- No-JavaScript output retains all public teaching content and an honest account boundary.

## Testing Strategy

### Catalog and content

- Publication, order, duration, SEO, sections, Previous/Next behavior, sitemap, and pathway counts.
- Exact public/account/Pro heading contracts and valid compiled MDX hierarchy.
- Anonymous loader/import boundaries and protected-string exclusion.

### Data and evaluator

- Schema validation for MAC format, unique nodes/ports/scenarios, valid ingress/egress references, complete decision data, and internally consistent forwarding tables.
- Source learning/refresh, known-unicast forwarding, same-port filtering, unknown-unicast flooding, broadcast flooding, and aging behavior.
- Deterministic rejection of unknown identifiers and invalid topology data.

### Components

- All public comparison dimensions change meaningful rendered state.
- All six account scenarios and correct reset behavior.
- Correct and incorrect decision/port predictions with explanatory results.
- Keyboard flow, live announcements, advanced jump, reduced motion, SSR, and malformed-data fallback.

### Browser and production

- Desktop, 360px mobile, light/dark themes, keyboard focus, local table scrolling, and absence of hydration/console errors.
- No-JavaScript public content and registration boundary.
- Full unit suite, typecheck, lint, production build, Playwright projects, and production artifact privacy audit.

Focused tests run while implementing each layer. The full project suite and production artifact audit run once at the final gate unless a cross-cutting change requires an earlier regression run.

## Acceptance Criteria

The lesson is ready when a complete beginner can observe a frame, predict hub/bridge/switch behavior, update a forwarding table using the source address, distinguish forwarding/filtering/flooding, and troubleshoot common local-switching symptoms without confusing switching with routing. Public content remains useful without JavaScript; account and Pro material remains private; the route is accessible and responsive; and the complete verification gate passes.
