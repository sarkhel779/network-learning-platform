# Networking Foundations Launch Curriculum Design

**Date:** 2026-09-07  
**Status:** Approved conversational design, pending written-spec approval  
**Scope:** Define the complete launch curriculum, reusable lesson contract, access boundaries, interactive experiences, practical laboratories, quality gates, and seven-phase route to public launch.

## Purpose

Packetsecrets needs a coherent Networking Foundations pathway for three overlapping audiences:

- complete beginners and recent technical graduates;
- people with one to two years of IT experience who want to move into networking; and
- networking practitioners who want stronger protocol reasoning and packet-analysis depth.

The pathway must take a learner from “what is a network?” to diagnosing an end-to-end packet journey without assuming prior networking knowledge. It must remain useful to experienced learners through optional depth, authentic command output, packet captures, RFC-guided analysis, and interview practice.

This specification defines the curriculum program. Each module is a separately deliverable body of work and will receive its own implementation design and plan. This document does not authorize implementing all 23 lessons as one change.

## Product Principles

1. **Begin with the physical and observable.** Introduce hosts, links, interfaces, and devices before abstract protocol models.
2. **Show the packet moving.** Use the interactive player when sequence, state, or header changes are easier to understand visually.
3. **Explain before naming.** Give the plain-language behavior before introducing terminology and acronyms.
4. **Layer depth without duplicating courses.** Free foundations and Pro Deep Dives belong in the same lesson and learning sequence.
5. **Require evidence.** Connect claims to Windows/Linux output, Wireshark evidence, packet captures, or an identified standards reference.
6. **Teach reasoning, not vendor memorization.** Vendor-specific material is illustrative and read-only unless a future laboratory explicitly requires configuration.
7. **Keep security as a separate pathway.** Firewalls appear here only as network boundaries. Stateful policy, VPNs, IPsec, TLS inspection, IDS/IPS, and vendor administration belong to the later Network Security pathway.
8. **Accessibility is part of correctness.** Essential learning must remain available without animation, pointer input, or client-side JavaScript.

## Launch Access Model

### Public visitor

The foundational portions of Lessons 1 and 2 are fully available without an account, including their introductory interactive demonstrations. Their Pro Deep Dives remain locked. Anonymous progress may exist for the current browser session but is not promised as durable or portable.

### Free member

A signed-in free member can use the foundational material in all 23 lessons:

- plain-language and technical descriptions;
- standard interactive players;
- easy and intermediate scenarios;
- Windows and Linux checks;
- foundational Wireshark exercises and sanitized captures;
- knowledge checks, bookmarks, and saved progress; and
- lesson summaries and review material.

### Pro member

A Pro member additionally receives:

- difficult and ambiguous scenarios;
- deeper troubleshooting laboratories;
- advanced Wireshark investigations with noisy or partial captures;
- guided RFC checks;
- interview preparation and model reasoning; and
- advanced packet, topology, and protocol analysis.

There is no paid checkout at initial launch. Pro sections display a concise preview followed by the exact action **Join the Pro Member Waitlist**. They must not imply that payment or immediate access is available. The system may model a future `pro` entitlement, but launch behavior remains waitlist-only.

## Curriculum Structure

The launch pathway contains six modules and 23 focused lessons. A normal lesson targets 15–25 minutes of foundational learning; laboratories and the capstone may take longer.

### Module 1 — Network and Device Essentials

#### 1. What Is a Computer Network?

- **Access:** Public.
- **Outcome:** Explain why networks exist and identify source, destination, message, medium, protocol, and service in a familiar communication.
- **Core topics:** LAN/WAN/internet, data communication, peer-to-peer versus client/server at an introductory level, bandwidth versus latency, and a home/office/cloud comparison.
- **Interaction:** Assemble a minimal two-host network, then add the components needed to reach a remote service.
- **Free practice:** Identify missing communication ingredients in simple scenarios.
- **Pro preview:** Compare performance symptoms and distinguish bandwidth, latency, loss, and application delay from limited evidence.

#### 2. Hosts, Clients, Servers and Network Interfaces

- **Access:** Public.
- **Outcome:** Identify end hosts and interfaces and explain that “client” and “server” describe roles rather than fixed device types.
- **Core topics:** desktops, phones, printers, IoT devices, virtual machines, cloud hosts, NICs, logical/physical interfaces, addressing overview, wired and wireless attachment.
- **Interaction:** Explore a topology and select each host/interface to see what it originates, receives, and exposes.
- **Free practice:** Classify devices and distinguish a device from one of its interfaces.
- **Pro preview:** Diagnose multihomed-host and interface-selection scenarios.
- **Migration:** Retain the stable `hosts-and-network-devices` route and reuse the relevant material from the current published lesson. Device-forwarding depth moves to Lessons 4–6.

#### 3. Cables, Fibre, Wireless and Network Connections

- **Access:** Free account.
- **Outcome:** Choose an appropriate connection medium and explain duplex, speed, signal, and link state at a beginner level.
- **Core topics:** copper Ethernet, fibre, radio, connectors, link lights, negotiated speed, duplex, interference, distance, and physical versus logical connectivity.
- **Interaction:** Change media and conditions and observe link availability, bandwidth, latency, and loss without presenting the simulation as a laboratory measurement.
- **Free lab:** Inspect interface state and negotiated properties on Windows and Linux.
- **Pro Deep Dive:** Interpret errors, duplex symptoms, optical-level examples, and ambiguous physical-layer faults.

#### 4. Hubs, Bridges and Switches

- **Access:** Free account.
- **Outcome:** Explain why hubs repeat signals while bridges and switches make link-layer forwarding decisions.
- **Core topics:** collision domains, broadcasts, bridge evolution, switching ports, flooding versus selective forwarding, and Layer 2 versus multilayer switching as a preview.
- **Interaction:** Send the same frame through a hub and a switch and compare who receives it.
- **Free lab:** Observe broadcast and unicast behavior in a small capture.
- **Pro Deep Dive:** Diagnose loops, flooding, and misleading physical-topology assumptions without yet teaching STP in depth.

#### 5. Routers, Default Gateways and Network Boundaries

- **Access:** Free account.
- **Outcome:** Decide whether a destination is local or remote and identify the first next hop.
- **Core topics:** interfaces, connected networks, routing-table purpose, default gateway, hop-by-hop forwarding, frame replacement, and end-to-end IP addressing.
- **Interaction:** Compare local delivery with delivery through a router and inspect what changes at each hop.
- **Free lab:** Use Windows and Linux address/route output to predict the first hop.
- **Pro Deep Dive:** Resolve competing routes and diagnose incorrect gateways from partial evidence.

#### 6. Access Points, Modems, ONTs and Firewalls

- **Access:** Free account.
- **Outcome:** Explain where common edge devices fit and distinguish access, conversion, routing, and security roles.
- **Core topics:** access-point bridging, home-router role bundling, modem/ONT purpose, ISP handoff, and firewall as a security boundary.
- **Interaction:** Explore home, office, and cloud-edge topologies and identify combined versus separate functions.
- **Free lab:** Map a real-world device list to logical network roles.
- **Pro Deep Dive:** Analyze asymmetric placement and virtualized network-function examples.
- **Boundary:** Do not teach firewall policy processing, state tables, NAT behavior, VPNs, or vendor configuration here.

#### 7. OSI and TCP/IP Models

- **Access:** Free account.
- **Outcome:** Use the models as troubleshooting maps and relate real protocols and devices to appropriate layers without treating layers as rigid physical boxes.
- **Core topics:** seven-layer OSI model, four-layer TCP/IP model, encapsulation, decapsulation, PDUs, and common model limitations.
- **Interaction:** Follow data down one host’s stack, across a path, and up the receiving stack.
- **Free lab:** Locate Ethernet, IP, transport, and application information in Wireshark.
- **Pro Deep Dive:** Explain tunnelling, encryption visibility, and protocols that do not fit simplified diagrams neatly.
- **Migration:** Preserve the published lesson slug and existing tested player behavior.

#### 8. A Packet’s First Journey Through a Small Network

- **Access:** Free account.
- **Outcome:** Narrate an end-to-end exchange using the concepts from Lessons 1–7.
- **Core topics:** application request, name/address assumptions, local/remote decision, next-hop resolution preview, framing, switching, routing, response, and evidence locations.
- **Interaction:** A complete controllable packet journey with plain-language and technical inspection modes.
- **Free lab:** Match capture frames and host commands to journey steps.
- **Pro Deep Dive:** Explain apparent gaps created by capture position and incomplete observability.
- **Migration:** Reuse the current `how-networks-communicate` scenario and content where it fits. Preserve the old route through a stable slug or permanent redirect; do not create duplicate canonical pages.

### Module 2 — Ethernet, Switching and Local Networks

#### 9. Ethernet Frames and MAC Addresses

- **Outcome:** Read the purpose of core Ethernet fields and distinguish unicast, broadcast, and multicast destinations.
- **Interaction:** Inspect a frame and change destination types to observe LAN delivery behavior.
- **Free lab:** Find source/destination MAC addresses and EtherType in a focused capture.
- **Pro Deep Dive:** Analyze padding, frame size, tagging visibility, and capture-versus-wire caveats using IEEE-oriented references where licensing permits citation.

#### 10. How Switches Learn and Forward

- **Outcome:** Build and use a MAC address table to predict forwarding, filtering, and flooding.
- **Interaction:** Step through source learning, known unicast forwarding, unknown unicast flooding, aging, and host movement.
- **Free lab:** Infer a MAC table from a short frame sequence.
- **Pro Deep Dive:** Diagnose stale entries, loops, duplicate MAC symptoms, and multilayer-switch boundaries.

#### 11. ARP and Local Delivery

- **Outcome:** Explain how IPv4 nodes resolve a local next-hop IP address to a MAC address.
- **Interaction:** ARP request/reply, cache use, expiry, local destination, and gateway resolution.
- **Free lab:** Compare `arp -a`/`Get-NetNeighbor` with `ip neigh` and an ARP capture.
- **Pro Deep Dive:** Interpret gratuitous ARP, duplicate-address symptoms, incomplete entries, and RFC-guided cache behavior.

#### 12. VLANs, Access Ports and Trunks

- **Outcome:** Explain why VLANs create separate broadcast domains and how access and trunk links carry them.
- **Interaction:** Assign hosts to VLANs, observe allowed Layer 2 communication, then introduce inter-VLAN routing as a boundary.
- **Free lab:** Read a sanitized tagged-frame capture and a vendor-neutral port table.
- **Pro Deep Dive:** Diagnose native/allowed VLAN mismatches and trace traffic through an inter-VLAN topology. STP is introduced only as loop prevention and reserved for later depth unless required by the scenario.

### Module 3 — IP Addressing and Routing

#### 13. IPv4 Addressing

- **Outcome:** Read dotted-decimal addresses and prefixes and distinguish network, host, private, public, loopback, link-local, and documentation ranges.
- **Interaction:** Change address/prefix values and visualize network membership.
- **Free lab:** Inspect Windows/Linux addressing and classify addresses.
- **Pro Deep Dive:** Diagnose overlapping, duplicate, APIPA/link-local, and multihomed addressing cases.

#### 14. Subnetting Fundamentals

- **Outcome:** Calculate network boundaries, usable ranges, broadcast addresses, and host capacity for common IPv4 prefixes.
- **Interaction:** A binary/prefix visualizer that reveals reasoning before shortcuts.
- **Free lab:** Solve practical /24 through /30 allocation and same-subnet decisions.
- **Pro Deep Dive:** VLSM planning, summarization, awkward prefixes, and interview-style mental calculations.

#### 15. IPv6 Fundamentals

- **Outcome:** Read and shorten IPv6 addresses and explain prefixes, link-local/global addresses, multicast, Neighbor Discovery, SLAAC, and default-router discovery.
- **Interaction:** Compare an IPv4 ARP-based local exchange with IPv6 Neighbor Discovery and SLAAC.
- **Free lab:** Use `ipconfig`/PowerShell and `ip -6` plus Wireshark IPv6/ICMPv6 filters.
- **Pro Deep Dive:** Diagnose prefix, Router Advertisement, duplicate-address-detection, and dual-stack preference problems with RFC-guided checks.

#### 16. Routing, Routing Tables and Default Routes

- **Outcome:** Read a basic routing table and choose a route using longest-prefix match and administrative/metric concepts at the appropriate depth.
- **Interaction:** Alter route entries and predict the selected interface and next hop.
- **Free lab:** Interpret `route print`, `Get-NetRoute`, and `ip route` output.
- **Pro Deep Dive:** Resolve overlapping routes, recursive next hops, asymmetric paths, and static-versus-dynamic evidence. Dynamic protocols are introduced, not configured.

#### 17. ICMP, Ping and Path Discovery

- **Outcome:** Use ICMP as control/error evidence and explain what ping and traceroute do and do not prove.
- **Interaction:** Generate echo, unreachable, and time-exceeded messages and visualize TTL/hop-limit changes.
- **Free lab:** Compare `ping`, `tracert`/`Test-NetConnection`, and `traceroute`/`tracepath` with a capture.
- **Pro Deep Dive:** Diagnose filtered ICMP, path MTU symptoms, misleading traceroutes, and IPv4/IPv6 differences.

### Module 4 — Transport and Application Services

#### 18. TCP, UDP and Ports

- **Outcome:** Compare TCP and UDP, explain sockets/ports, and trace connection establishment, reliability, flow, and closure at a foundational level.
- **Interaction:** Compare a TCP conversation with UDP datagrams; introduce sequence and acknowledgement behavior.
- **Free lab:** Use `netstat`/PowerShell and `ss`, then follow TCP/UDP streams in Wireshark.
- **Pro Deep Dive:** Analyze retransmission, reset, zero-window, handshake, teardown, and port-exhaustion evidence with RFC checks.

#### 19. DHCP and Automatic Address Configuration

- **Outcome:** Trace address acquisition and identify the supplied address, prefix, gateway, DNS, and lease information.
- **Interaction:** Discover, offer, request, acknowledge, renew, and failure paths across a broadcast boundary.
- **Free lab:** Inspect leases and a focused DORA capture on Windows/Linux.
- **Pro Deep Dive:** Diagnose relay, scope exhaustion, conflicting offers, missing options, and renewal-state problems.

#### 20. DNS and Name Resolution

- **Outcome:** Trace recursive name resolution and distinguish stub resolver, recursive resolver, authoritative server, common records, caching, and response codes.
- **Interaction:** Follow a query from host cache through recursive and authoritative stages.
- **Free lab:** Compare `nslookup`/`Resolve-DnsName` with `dig` and Wireshark DNS evidence.
- **Pro Deep Dive:** Diagnose delegation, caching, NXDOMAIN, timeout, TCP fallback, split-horizon, and DNSSEC-awareness scenarios.

#### 21. HTTP, HTTPS, TLS and Essential Network Services

- **Outcome:** Relate application requests to DNS, transport, TLS, and HTTP and recognize the purposes of SSH, NTP, and common service ports without memorizing an excessive list.
- **Interaction:** Trace a browser request from DNS through TCP/QUIC awareness, TLS establishment, HTTP request, and response.
- **Free lab:** Inspect safe HTTP metadata and TLS handshake metadata without decrypting private user traffic.
- **Pro Deep Dive:** Diagnose certificates, SNI/ALPN, redirects, proxies, time-related TLS failures, and HTTP-version behavior. Detailed cryptography and TLS inspection remain in the security pathway.

### Module 5 — NAT and Internet Communication

#### 22. NAT, PAT and the Complete Internet Packet Journey

- **Outcome:** Explain address/port translation and trace a browser exchange from a private host to an internet service and back.
- **Interaction:** Maintain a translation table while showing Ethernet, IP, transport, DNS, routing, and application events across the journey.
- **Free lab:** Correlate host, gateway, DNS, and capture evidence using documentation-safe addresses.
- **Pro Deep Dive:** Diagnose stale/missing translations, port pressure, double NAT, hairpin behavior, asymmetric paths, and misleading capture points.
- **Boundary:** NAT is taught as address translation, not as a substitute for firewall policy.

### Module 6 — Packet Analysis and Troubleshooting

#### 23. Systematic Network Troubleshooting Capstone

- **Outcome:** Apply a repeatable, layer-aware troubleshooting method and communicate evidence, scope, hypothesis, test, result, and next action.
- **Core topics:** baseline and scope, bottom-up/top-down/divide-and-conquer methods, capture placement, timestamps, change control, documentation, and escalation.
- **Interaction:** Diagnose multiple selectable incidents across physical, VLAN, addressing, routing, DNS, transport, and application layers.
- **Free lab:** Guided incidents with bounded evidence and hints.
- **Pro Deep Dive:** Unknown-fault incidents, noisy multi-conversation captures, conflicting symptoms, RFC verification, and interview-style verbal explanations.

## Reusable Lesson Contract

Every lesson follows this sequence unless a written exception is justified:

1. **Why this matters:** a workplace or everyday problem.
2. **Learning objectives:** two to five observable outcomes.
3. **Prerequisite check:** links or short reminders, not duplicated teaching.
4. **Plain-language model:** beginner explanation and a labelled analogy.
5. **Technical model:** accurate terminology, fields, states, or algorithms.
6. **Interactive explanation:** used only when sequence, state, comparison, or topology materially benefits from interaction.
7. **Windows and Linux checks:** illustrative commands, expected evidence, limitations, and safe-use notes.
8. **Foundational Wireshark lab:** focused capture, filters, guided questions, hints, and explanation.
9. **Check your understanding:** short feedback-rich questions.
10. **Apply it:** easy and intermediate scenarios.
11. **Summary:** decisions, evidence, and misconceptions.
12. **Pro Deep Dive:** preview plus locked advanced work and the **Join the Pro Member Waitlist** action before Pro sales exist.

Not every lesson needs a large animation. Static diagrams, tables, or command evidence are preferable when motion adds no instructional value.

## Progress and Completion

Signed-in learners retain:

- pathway, module, lesson, and last meaningful section;
- scenario/player position where resumption is genuinely useful;
- knowledge-check attempts and best score;
- lesson completion;
- bookmarks;
- downloaded-lab acknowledgement; and
- use of **I know this — proceed to advanced**.

A lesson becomes foundationally complete when the learner reaches its summary and submits the free knowledge check. Watching every animation or opening every section is not mandatory. Using **I know this — proceed to advanced** does not itself complete the lesson; the learner may proceed directly to its knowledge check.

Deep Dive completion is separate from foundational completion. A learner must not lose a completed foundation status merely because Pro material is unavailable or unfinished.

## Interactive Player Requirements

Applicable experiences provide:

- play, pause, previous, next, restart, and speed controls;
- plain-language narration plus expandable technical detail;
- topology and packet/frame inspection appropriate to the lesson;
- synchronized semantic and visual state;
- keyboard operation, visible focus, adequate touch targets, and unambiguous accessible names;
- reduced-motion behavior with complete manual navigation;
- responsive layouts without page-level horizontal overflow;
- server-rendered text alternatives; and
- an error boundary that preserves surrounding learning content.

Scenario data remains validated TypeScript data rather than stateful MDX. Shared playback, topology, inspection, and accessibility primitives are reused, while lesson-specific experiences compose them through focused adapters. Generic schemas must not be inflated with concepts required by only one lesson.

## Packet-Capture Laboratory Contract

Packet captures are sanitized, intentionally created learning artifacts; production or personal traffic is prohibited. Each `.pcapng` asset must include:

- scenario purpose and capture point;
- generation/provenance notes;
- expected protocols and safe documentation ranges;
- SHA-256 checksum;
- size and maximum supported Wireshark version assumptions where relevant;
- suggested display filters;
- guided questions and progressive hints;
- an explanation stored separately from the initial task; and
- a test that verifies the file exists, matches its checksum, and does not contain prohibited sentinel values.

Public captures are small demonstrations. Free captures are focused and guided. Pro captures may contain multiple conversations, partial visibility, and deliberately introduced faults. Capture downloads must remain available even if the interactive player cannot hydrate.

## Assessment Design

Assessment tests reasoning rather than isolated definition recall. Supported tasks include ordering events, selecting a next hop, predicting field preservation/change, interpreting command output, applying a display filter, finding evidence, diagnosing a topology, and explaining a conclusion as an interview response.

Free knowledge checks may be retried and give explanations for correct and incorrect choices. The best result is retained. Interview preparation appears inside relevant Pro Deep Dives and culminates in Lesson 23; it is not a disconnected question bank.

Certificates, timed examinations, public leaderboards, AI-generated grading, user-uploaded packet captures, and live device configuration are outside launch scope.

## Content and Data Architecture

- The catalog remains authoritative for pathway/module/lesson order, stable IDs and slugs, publication state, estimated duration, SEO metadata, and section access.
- MDX remains authoritative for prose and static examples.
- Focused validated data files define devices, links, steps, packets, questions, and lab metadata.
- Reusable React components render players, device explorers, checks, labs, and Deep Dive gates.
- Static downloadable assets are versioned with the curriculum.
- Supabase later owns authentication and persisted user state; public lesson rendering must not require an authenticated client session.
- Public, account, and Pro access decisions are enforced on the server. Protected content must not be shipped to an unauthorized browser and merely hidden with CSS or client state.
- Existing published slugs remain stable where possible. Any necessary replacement uses a permanent redirect and one canonical URL.

The current combined catalog entries will be decomposed to match this specification. Existing published lessons are content seeds, not a constraint forcing unrelated concepts into one page.

## Failure and Safety Behavior

- Invalid catalog or scenario data fails before publication with a useful diagnostic.
- A failed interaction renders a friendly fallback and never removes prose, commands, assessment, or summary content.
- One failed scenario cannot display another scenario’s data.
- Missing or checksum-invalid downloads are treated as publication blockers.
- No-JavaScript navigation exposes essential public/free prose and static alternatives; authenticated persistence may degrade gracefully when JavaScript is unavailable.
- Commands are illustrative and clearly label privileges, platform assumptions, and potentially disruptive operations.
- RFC and vendor claims identify the applicable version and source; disputed or implementation-specific behavior is labelled accordingly.

## Verification and Editorial Gates

### Automated verification

- catalog/schema uniqueness, ordering, access, and publication tests;
- MDX heading/section integrity and valid server-rendered markup;
- scenario invariants and packet-path consistency;
- interaction, assessment, Deep Dive gate, and progress-state component tests;
- public/free/Pro authorization tests, including direct-route and network-payload checks;
- capture existence, checksum, metadata, and prohibited-sentinel scans;
- hydration, no-JavaScript, desktop, and mobile browser tests;
- keyboard, focus, semantic-name, reduced-motion, and overflow coverage;
- type checking, linting, unit tests, production build, and focused end-to-end tests; and
- regression coverage for every previously published lesson.

### Human review

Each lesson receives:

- beginner-readability review by someone who is not relying on unstated networking knowledge;
- technical review against captures, current standards, and internally consistent addressing;
- visual review on desktop and 360px mobile layouts;
- accessibility review of controls, reading order, alternatives, and non-color cues; and
- copy review for terminology, grammar, promises, and Pro Member Waitlist language.

A module is ready only when all its lessons, interactions, assessments, downloads, accessibility checks, and editorial gates pass. Publication is an explicit catalog decision separate from implementation completion.

## Seven-Phase Delivery Roadmap

### Phase 1 — Finalize the launch curriculum

This specification defines “Networking Foundations complete.” Before each module begins, its implementation design expands the lesson-level outcomes, exact scenarios, capture inventory, content sources, and acceptance tests without changing this approved pathway boundary.

### Phase 2 — Build and test lessons incrementally

Deliver one module at a time using:

`design → failing tests → content/data → interaction → automated verification → visual review → beginner-readability review → commit`

Every completed module remains launch-quality. Large all-curriculum branches are prohibited.

### Phase 3 — Start pre-launch marketing alongside content

While modules are built:

- publish useful development and teaching updates on LinkedIn;
- share short networking explanations and demonstrations;
- establish consistent Packetsecrets profiles and visual identity;
- prepare SEO titles, descriptions, structured data, and internal links;
- speak with graduates, IT career switchers, and networking practitioners; and
- collect demand through the Pro Member Waitlist.

Paid advertising is deferred until the site has measurable activation and retention.

### Phase 4 — Add accounts and learner progress

At approximately 60–70% stable curriculum coverage, implement:

- Google sign-in and email magic links;
- learner profiles and server-enforced roles/entitlements;
- saved progress, bookmarks, knowledge-check results, and resume behavior;
- learner dashboard;
- optional learner TOTP MFA; and
- mandatory administrator TOTP MFA.

Authentication proves identity; the learner dashboard is a separate application feature. Passwords and MFA secrets are not stored in application profile tables.

### Phase 5 — Build the administrator dashboard

The protected administrator area provides registrations, active learners, lesson starts/completions, drop-off, knowledge-check performance, waitlist membership, publication state, account support, and security/audit events. Google Analytics provides detailed traffic acquisition and website reports; the internal dashboard emphasizes account and learning data.

### Phase 6 — Production preparation

Configure and verify:

- domain and DNS;
- Vercel Pro hosting and deployment environments;
- Supabase production database/authentication;
- transactional email and production redirect URLs;
- Google OAuth consent/branding;
- secrets, Row Level Security, rate limiting, and abuse controls;
- analytics, monitoring, error reporting, backups, and recovery checks;
- privacy, terms, support, and future payment/refund disclosures;
- canonical URLs, sitemap, robots rules, and search-console ownership; and
- full automated, manual, performance, accessibility, and security verification.

The target operating budget is approximately ₹2,000 per month with an allowed launch buffer near ₹2,500. Usage alerts and spend controls are mandatory. Razorpay-ready entitlement and event boundaries may exist, but checkout is deferred.

### Phase 7 — Controlled launch

1. Private test with approximately 10–20 representative learners.
2. Repair comprehension, usability, access, and reliability issues.
3. Invite a larger beta group.
4. Confirm activation, lesson completion, return usage, and support load.
5. Launch publicly.
6. Introduce paid Pro membership only after observing genuine demand and validating the Pro offer.

## Program Acceptance Criteria

Networking Foundations is launch-ready when:

- all 23 lessons are published in the approved order;
- a complete beginner can progress without relying on unstated prerequisites;
- every device and protocol is explained in plain language before deeper detail;
- Windows and Linux evidence appears throughout the pathway;
- required players and downloadable captures meet their contracts;
- public, free, locked-Pro, and Pro Member Waitlist behavior is consistent and server-enforced;
- foundational and Deep Dive progress remain separate;
- all automated and human quality gates pass;
- the controlled-launch infrastructure and operational checklist are complete; and
- firewall/security depth has not leaked into Networking Foundations beyond the approved device/boundary introduction.

## Explicitly Deferred Work

- Network Security curriculum beginning with Firewall Fundamentals;
- IPsec, VPN, TLS inspection, IDS/IPS, and vendor firewall administration;
- paid Razorpay checkout and subscription lifecycle;
- certificates, timed exams, leaderboards, AI tutoring/grading, community forums, user capture uploads, and live device labs; and
- native mobile applications.
