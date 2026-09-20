# Computer Network Basics Restructure Design

**Date:** 2026-09-20
**Status:** Approved design; implementation requires a reviewed plan
**Scope:** Module 1 of the Networking Foundations pathway only

## Purpose

Restructure the first Networking Foundations module into a genuinely introductory course unit that
teaches the vocabulary, devices, addresses, and layered models a complete beginner needs before
studying network communication. Detailed forwarding decisions, packet journeys, and protocol
exchanges must not be taught in this module.

The module must remain useful without a paid subscription, retain simple interactive learning, and
preserve existing URLs, learner history, and reusable content wherever possible.

## Approved Curriculum Boundary

Module 1 is named **Computer Network Basics** and contains nine separate lessons:

1. Introduction to Computer Networks and Network Devices
2. Hosts, Clients and Servers
3. Hubs
4. Bridges
5. Switches
6. Routers
7. Physical and Logical Addressing
8. OSI and TCP/IP Models
9. Computer Network Basics Final Quiz

Module 1 explains what each concept is, why it exists, and where it belongs. It does not teach the
mechanics of communication.

The following subjects are explicitly out of scope and belong to a later module named **How Data
Moves Through Networks** or to their dedicated layer modules:

- DNS queries and resolver behaviour;
- ARP exchanges and next-hop resolution;
- binary AND operations used to determine whether a destination is local or foreign;
- host routing-table decisions;
- switch forwarding, filtering, flooding, and MAC-table operation beyond introductory recognition;
- router forwarding and route-selection decisions;
- hop-by-hop packet and frame changes;
- complete browser-to-server or host-to-host packet journeys;
- VLANs, trunks, STP, EtherChannel, port security, and advanced switching;
- subnetting, longest-prefix matching, static or dynamic routing, and advanced troubleshooting.

## Lesson Design

Every instructional lesson uses the same compact pattern:

1. plain-language definition;
2. reason the device or concept exists;
3. location in a small network;
4. limited introductory examples;
5. a simple identification, placement, comparison, or inspection interaction;
6. a short final knowledge check.

Interactions must reinforce recognition and conceptual distinctions. They must not simulate
communication decisions reserved for later modules.

### 1. Introduction to Computer Networks and Network Devices

Teach:

- what a computer network is;
- why networks exist;
- data and packets at a conceptual level only;
- LAN, WAN, and the Internet;
- end devices and intermediary devices;
- a high-level overview of hosts, hubs, bridges, switches, routers, access points, and firewalls;
- a simple home or office topology.

Interaction: identify devices and their broad roles in a small topology.

Reuse `how-networks-communicate`, removing its detailed packet journey and communication mechanics.

### 2. Hosts, Clients and Servers

Teach:

- what makes a device a host;
- desktops, laptops, phones, tablets, printers, cameras, IoT devices, physical servers, virtual
  machines, and cloud servers as host examples;
- the purpose of a network interface;
- client and server roles;
- how one host can act as a client in one exchange and a server in another;
- request and response as concepts, without teaching their network delivery.

Interaction: classify devices as hosts and classify example application roles as client, server, or
both.

Reuse and simplify `hosts-and-network-devices`.

### 3. Hubs

Teach:

- what a hub is;
- ports and connected devices;
- a hub as a signal repeater;
- shared traffic and shared bandwidth at an introductory level;
- why hubs are now largely historical.

Interaction: show that an incoming signal is repeated toward every other port without analyzing
frames, addresses, or collision mechanics.

Create a new lesson by extracting and simplifying hub material from `hubs-bridges-and-switches`.
Detailed signalling and collision-domain behaviour belongs to Physical Layer.

### 4. Bridges

Teach:

- what a network bridge is;
- why bridges were introduced;
- network segments;
- basic filtering as a conceptual improvement over a hub;
- the bridge as a predecessor to the modern switch.

Interaction: compare an unsegmented shared network with two connected segments. Do not implement a
detailed forwarding table.

Create a new lesson by extracting and simplifying bridge material from
`hubs-bridges-and-switches`. Detailed MAC learning belongs to Data Link Layer and How Data Moves
Through Networks.

### 5. Switches

Teach:

- what a switch is;
- connecting devices inside a local network;
- switch ports;
- why a switch is more selective than a hub;
- very basic awareness that a switch associates devices with ports;
- the distinction between a switch and a router.

Interaction: match hosts to switch ports and compare the broad roles of a hub, bridge, and switch.
Do not simulate learning, forwarding, filtering, flooding, aging, or movement.

Create a new lesson from the introductory switch material in `hubs-bridges-and-switches`. Preserve
detailed switching players for later modules.

### 6. Routers

Teach:

- what a router is;
- connecting different IP networks;
- router interfaces;
- local-network and remote-network boundaries as concepts;
- the router's role as a host's default gateway;
- the distinction between a router and a switch.

Interaction: place routers at network boundaries and distinguish router, switch, and access-point
roles. Do not simulate a route lookup or packet forwarding.

Reuse and retitle `routers-default-gateways-and-network-boundaries`. Remove detailed routing-table,
local/foreign, and forwarding mechanics from this introductory version while preserving those
components for later reuse.

### 7. Physical and Logical Addressing

Teach:

- why networking uses addresses;
- identity, location, and delivery as separate ideas;
- MAC addresses as link-layer addresses and IP addresses as logical network-layer addresses;
- basic MAC hexadecimal notation;
- the Universal/Local bit and Individual/Group bit at introductory depth;
- basic IPv4 dotted-decimal notation;
- the conceptual difference between a MAC address and an IP address.

Interaction: inspect sample addresses, identify their formats, and classify address properties. Do
not perform ARP, subnet calculations, or delivery decisions.

Create a new lesson using only the introductory portions of the existing Ethernet/MAC and IPv4
lessons. Keep the detailed lessons intact for Data Link Layer and Network Layer.

### 8. OSI and TCP/IP Models

Teach:

- why layered models exist;
- the seven OSI layers;
- the TCP/IP model;
- a practical mapping between the models;
- examples of responsibilities at each layer;
- encapsulation and decapsulation as introductory concepts.

Interaction: retain the encapsulation visualization and add a simple layer-matching exercise. Avoid
rote memorization as the sole learning outcome.

Reuse `osi-and-tcp-ip-models`, make its instructional content public, and keep it as the transition
to the later layer-specific modules.

### 9. Computer Network Basics Final Quiz

Create a separate assessment lesson covering:

- network purpose and basic network types;
- host, client, and server recognition;
- hub, bridge, switch, and router distinctions;
- physical and logical addressing;
- introductory Universal/Local and Individual/Group bit interpretation;
- OSI and TCP/IP layer mapping;
- device placement in a small topology.

Passing the final quiz records completion of the module assessment. It must not include DNS, ARP,
local/foreign calculation, switching decisions, routing decisions, or a packet-journey question.

## Access and Completion

- All eight instructional lessons are public and free.
- All introductory interactions and lesson knowledge checks are public.
- Anonymous learners can use the content and checks without persisted progress.
- A free account is required to save progress and submit the final module quiz.
- No Module 1 section is Pro-only.
- Each instructional lesson ends with a short final knowledge check. Passing it marks that lesson
  complete for a signed-in learner.
- Passing the separate final module quiz records completion of the module assessment.
- The interface must not expose manual-completion, restart, or retry-saving controls.

## Navigation and Presentation

The Networking Foundations course page displays **Computer Network Basics** as an expandable module
with nine separate lesson entries. The remaining future modules remain collapsed navigation groups.

Each lesson opens on its own route. Module 1 must not become one long content page. Navigation shows
instructional-lesson completion separately from the final module assessment.

The approved visual direction is recorded in the brainstorming preview and includes:

- the PacketSecrets dark visual system with equivalent light-theme support;
- numbered lesson entries;
- clear Free labels for instructional lessons;
- a Free account label for the final quiz;
- an introductory-scope explanation on the module overview;
- explicit messaging that communication mechanics move to later modules.

## Content Reuse and URL Compatibility

Use the reuse-and-split approach rather than rebuilding all lessons or changing navigation alone.

- Preserve stable routes for Introduction, Hosts, Routers, and OSI/TCP-IP wherever their topic still
  matches.
- Add clean routes for Hubs, Bridges, Switches, Physical and Logical Addressing, and the Final Module
  Quiz.
- Keep the old combined Hubs/Bridges/Switches route working through a permanent redirect to the
  first relevant replacement lesson or a compatibility route selected in the implementation plan.
- Preserve existing detailed lesson files and interactive components for future modules.
- Update canonical URLs, sitemap entries, catalogue references, and navigation tests whenever a
  route changes.

## Progress Preservation and Database Changes

No historical learner answer, attempt, or progress record may be deleted.

The implementation plan must inspect the current progress schema and define an idempotent migration
that:

- adds manifests and required quiz items for new lessons;
- preserves existing identifiers for reused lessons where possible;
- carries a completed `hubs-bridges-and-switches` lesson forward to the three introductory
  replacement lessons;
- leaves incomplete historical attempts intact;
- records the final module assessment without reintroducing manual progress controls;
- can be safely rerun through upserts or conflict-safe inserts;
- applies no destructive table, column, or row operation.

If the current schema cannot represent module-assessment completion independently, the
implementation plan must choose the smallest additive schema change and test its backward
compatibility before implementation.

## Preserved Future Material

Do not delete the existing complete packet journey, ARP journey, switch-decision player,
route-decision player, or detailed addressing content. Remove them only from Module 1 navigation and
rendering where necessary.

They are reserved for:

- Physical Layer;
- Data Link Layer;
- Network Layer;
- Transport Layer;
- Application, Session and Presentation;
- How Data Moves Through Networks.

The separate **How Data Moves Through Networks** module will later own DNS queries, binary AND
local/foreign calculations, ARP, host packet/frame construction, switch decisions, router decisions,
multi-network journeys, browser-to-server synthesis, and its final communication challenge. That
future module is not implemented by this specification.

## Error and Compatibility Behaviour

- Missing registered lesson content must fail validation or tests before deployment.
- A legacy lesson URL must redirect rather than return a 404.
- Anonymous learners must never encounter an account-only error while reading Module 1.
- Failed progress persistence must not hide instructional content or lose an already-correct quiz
  result; the UI should present a clear retry path only where persistence is still part of the
  approved quiz interaction.
- A migration prerequisite must be verified before production deployment.
- A failed migration must leave production unchanged through transactional SQL.

## Testing Requirements

Before the branch is pushed:

1. catalogue tests verify module title, lesson order, slugs, publication status, and access;
2. repository tests verify every registered lesson imports and renders;
3. content tests verify required headings, introductory boundaries, and forbidden premature topics;
4. interaction tests cover keyboard, pointer, touch-sized controls, and meaningful static fallback;
5. theme tests or focused visual checks cover light and dark modes;
6. progress tests verify quiz-only lesson completion and module-assessment completion;
7. migration tests verify idempotence, split-lesson carry-forward, and foreign-key ordering;
8. redirect, canonical, sitemap, and navigation tests cover every retired or changed route;
9. the full unit test suite passes serially;
10. type checking and linting pass;
11. a local browser preview is reviewed;
12. the Vercel preview deployment is reviewed before merge.

## Branch and Release Workflow

Use one isolated branch and one pull request for this module:

`feature/computer-network-basics-restructure`

The pull request contains the catalogue update, content reuse and splits, new introductory lessons,
simple interactions, final module quiz, redirects, tests, and non-destructive migration.

Release sequence:

1. implement and verify locally;
2. commit coherent changes on the feature branch;
3. push the branch and open a pull request;
4. review all automated checks and the Vercel preview;
5. obtain explicit approval before merge;
6. confirm a current production database backup before any production progress migration;
7. merge the pull request;
8. apply the verified migration;
9. confirm the production deployment is Ready;
10. smoke-test public lessons, signed-in completion, legacy redirects, and the final module quiz.

Later modules receive separate designs, branches, and pull requests. This branch must not implement
How Data Moves Through Networks or restructure the remaining layer modules.
