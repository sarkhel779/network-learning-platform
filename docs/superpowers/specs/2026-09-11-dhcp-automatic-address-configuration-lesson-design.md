# DHCP and Automatic Address Configuration Lesson Design

## Purpose

Publish a packet-first IPv4 DHCP lesson at
`/learn/networking-foundations/dhcp-and-automatic-address-configuration`.
The lesson must let a beginner trace direct and relayed DHCP exchanges without
hiding the protocol details: every stage identifies the link-layer delivery,
IPv4 addresses, UDP ports, BOOTP/DHCP header values, options, device traversal,
and client/server state.

The lesson introduces DHCPv6 and SLAAC only as boundaries. Detailed DHCPv6
behavior remains in the IPv6 curriculum and future advanced material.

## Learning outcomes

By the end of the lesson, a learner can:

- explain why hosts need automatic configuration and what a lease supplies;
- identify the client, server, scope, lease, and relay-agent roles;
- trace Discover, Offer, Request, and Acknowledge in order;
- distinguish the DHCP broadcast flag from Ethernet and IPv4 broadcast
  delivery;
- apply UDP ports 68 and 67 correctly for direct client/server exchanges;
- trace relay traffic using client 68 to server 67 locally, relay 67 to server
  67 upstream, server 67 to relay 67, and server 67 to client 68 downstream;
- inspect every fixed BOOTP/DHCP header field and the important DHCP options;
- explain how `giaddr` lets a server select the client's subnet and address
  pool;
- distinguish allocation, renewal, rebinding, expiry, NAK, decline, and
  release;
- use packet evidence to isolate common DHCP and helper-address failures.

## Access model

The lesson uses public teaching, free-account practice, and Pro operational
depth.

### Public

1. Why automatic configuration exists
2. DHCP roles: client, server, scope, lease, and relay
3. UDP ports 67 and 68
4. Broadcast and unicast rules
5. DHCP packet structure
6. Interactive DHCP DORA journey
7. Lease contents: address, prefix, gateway, DNS, and lease time
8. Lease lifecycle: allocation, T1 renewal, T2 rebinding, and expiry
9. Interactive DHCP relay and helper-address journey
10. DHCP boundaries and a brief DHCPv6/SLAAC distinction
11. Common DHCP evidence and terminology
12. Summary

Both public players include one failure scenario so visitors can evaluate the
quality of the interactive teaching before creating an account.

### Free account

- Packet-inspection exercise with focused DHCP display filters
- Guided direct-DORA diagnosis
- Guided relay/helper-address diagnosis
- Failure scenarios covering no offer, address-pool exhaustion, blocked UDP
  67/68, a missing helper address, a helper on the wrong interface, and a
  scope that does not match `giaddr`
- Three knowledge checks with immediate conceptual explanations

Submitting any answer records an attempt, independently of correctness.
Correctness and the explanation remain visible. Account-only content is shown
as `Locked` to unauthenticated visitors without advertising the account tier in
the course-content list.

### Pro

- Interactive lease timing diagram
- Advanced RFC-level packet checks with immediate explanations
- DHCP snooping and rogue-server defense
- Relay Agent Information Option (Option 82)
- Reservations, exclusions, policy options, and multiple-server behavior
- DHCPv4 high availability and vendor-specific failover approaches
- Advanced capture and lease-state analysis
- DHCPv6 modes, prefix delegation, coexistence with SLAAC, and DHCPv6 failover

The Pro material must not label DHCPv4 failover as an Internet-standard
protocol. RFC 8156 applies to DHCPv6 failover. DHCPv4 failover behavior must be
presented as implementation- or vendor-specific where appropriate.

## Technical approach

Create a focused `src/features/dhcp` domain containing validated scenario
contracts, pure journey builders, packet/header models, and three interactive
components. MDX owns the explanatory prose. Existing playback, reduced-motion,
progress, knowledge-check, registration-gate, premium-preview, catalog,
navigation, and lesson-shell primitives remain authoritative.

The feature should follow the visual and control conventions established by
the TCP/UDP lesson. Controls use the shared player styling, remain keyboard
operable, provide at least 44-pixel targets, wrap without overlap, and keep
wide packet data inside local scrolling containers.

## Validated scenario model

Scenario data is the source of truth. UI components must not reconstruct
packet facts with independent conditionals.

Each journey defines:

- stable scenario and step identifiers;
- devices, interfaces, subnets, and broadcast-domain membership;
- sender, receiver, traversed links, and relay transformation points;
- DHCP message type and transaction ID;
- Ethernet source and destination;
- IPv4 source and destination;
- UDP source and destination ports;
- fixed BOOTP/DHCP fields and ordered options;
- broadcast, unicast, or relay-forwarded delivery classification;
- client and server state;
- an explanation, evidence cue, outcome, and terminal marker.

Validation rejects duplicate IDs, invalid IP addresses or ports, inconsistent
transaction IDs, contradictory address/delivery classifications, impossible
lease timers, direct client traffic with relay-only ports, relayed traffic with
an empty `giaddr`, and acknowledgements without a usable client address.

Exactly one visible terminal step completes each player scenario. Invalid
input fails closed with an accessible unavailable-state message, no autoplay,
no navigation, and no progress completion.

## Direct DORA player

The first public player synchronizes four views:

1. A topology showing the client, switch, DHCP server, interfaces, and the
   exact traversal of the active packet.
2. A packet inspector containing Ethernet, IPv4, UDP, BOOTP/DHCP, and options.
3. A delivery explanation that separately shows the DHCP broadcast flag,
   Ethernet destination, and IPv4 destination.
4. A DORA sequence and client/server state view.

The canonical initial-allocation scenario uses:

- DHCPDISCOVER: client UDP 68 to server UDP 67, normally IPv4
  `0.0.0.0` to `255.255.255.255` and Ethernet broadcast.
- DHCPOFFER: server UDP 67 to client UDP 68. The scenario explicitly shows
  whether delivery is broadcast or unicast and relates that choice to client
  state and the DHCP broadcast flag.
- Selecting DHCPREQUEST: client UDP 68 to server UDP 67, broadcast so all
  offering servers can observe the selected server and requested address.
- DHCPACK: server UDP 67 to client UDP 68. The selected scenario and its
  header evidence determine whether delivery is broadcast or unicast.

The lesson must avoid the false rule that every Offer or ACK is always
broadcast or always unicast. Learners inspect the actual L2, L3, and DHCP flag
evidence.

Available scenarios include successful initial allocation, multiple offers
with one selected server, a requested address followed by NAK, and server
silence/no offer. Server silence is the public failure scenario.

## DHCP header inspector

For the selected packet, show each fixed field with its size, current value,
purpose, and step-specific significance:

- `op`: request or reply
- `htype`: hardware type
- `hlen`: hardware address length
- `hops`: relay hop count
- `xid`: transaction identifier
- `secs`: elapsed acquisition time
- `flags`: including the broadcast bit
- `ciaddr`: client address when already bound and valid
- `yiaddr`: address offered or assigned to the client
- `siaddr`: next-server/bootstrap field, not a generic DHCP-server address
- `giaddr`: first relay-agent address used for relay and subnet selection
- `chaddr`: client hardware address field
- `sname`: optional server-host-name field
- `file`: boot-file field
- magic cookie: marks the DHCP options format
- options: ordered code, length, value, decoded meaning, and why each option is
  present in the current message

Important options include message type, server identifier, requested IP
address, parameter request list, subnet mask, router, DNS servers, lease time,
renewal time, rebinding time, client identifier, maximum message size,
classless static routes, and relay-agent information where applicable.

## Relay/helper-address player

The second public player uses two broadcast domains with a client and access
switch on one subnet, a router/relay between subnets, and a remote DHCP server.
Each relay transformation is visible rather than represented as a single
abstract arrow.

The canonical flow is:

- client to relay on the local subnet: UDP 68 to 67, initially broadcast;
- relay to server: UDP 67 to 67, routed unicast, with `giaddr` populated;
- server to relay: UDP 67 to 67, routed toward `giaddr`;
- relay to client: server UDP 67 to client UDP 68, delivered according to the
  response and client state.

The inspector highlights fields preserved end to end, fields changed by the
relay, hop-count changes, and the use of `giaddr` for address-pool selection.
An optional Option 82 view shows Circuit ID and Remote ID insertion, server
echo behavior, and removal before client delivery.

Available scenarios include a successful remote allocation, a missing helper
address, an incorrect `giaddr`/scope match, and a blocked relay/server path.
The missing-helper scenario is the public failure scenario.

## Lease lifecycle and Pro timing diagram

The public lifecycle section explains a lease timeline with lease start, T1,
T2, and expiry. It identifies normal defaults as server-supplied policy rather
than universal constants.

The Pro timing diagram is interactive. Learners can move through:

- initial allocation;
- bound operation;
- unicast renewal beginning at T1;
- rebinding beginning at T2;
- successful ACK with recalculated timers;
- expiry and address removal;
- NAK and immediate loss of the address;
- decline after conflict detection;
- release when the client voluntarily returns the lease.

Comparison modes cover normal timing, delayed offers, retransmission/backoff,
server silence, and relay-induced delay. Every point synchronizes elapsed time,
client state, destination behavior, active packet fields, and lease validity.

## RFC-level Pro checks

RFC checks are teaching exercises, not a closed-book exam. After every answer,
show immediately:

- whether the classification is correct;
- the governing normative rule or constraint in concise paraphrase;
- the exact fields or options that provide the evidence;
- why the behavior matters operationally;
- a link or citation to the relevant RFC section in the lesson references.

Checks cover RFC 2131 protocol/state behavior, RFC 2132 option encoding, RFC
3046 Option 82, RFC 3442 classless static routes, RFC 3118 authentication and
its practical limitations, and RFC 8156 only in the DHCPv6 advanced boundary.
They examine transaction identifiers, `secs`, flags, `ciaddr`, `yiaddr`,
`siaddr`, `giaddr`, client/server identifiers, requested-address handling,
option lengths and ordering, missing required options, inconsistent lease
timers, relay trust boundaries, and behavior that is permitted but varies by
implementation.

## Progress behavior

- Each public player completes only after its rendered terminal step is
  reached.
- Changing scenarios resets playback without erasing already confirmed
  completion.
- Account exercises record attempts regardless of correctness.
- Progress uses the existing optimistic display, server-confirmed state,
  idempotency keys, pending queue, and sequential replay behavior.
- Retry controls remain visible when persistence fails.
- The lesson becomes complete only after all required public and account items
  in its versioned manifest are complete. Pro content is not required for free
  lesson completion.

## Accessibility and responsive behavior

- All controls work with keyboard and touch.
- Autoplay occurs once and pauses at terminal states.
- Reduced motion disables automatic animated travel while preserving manual
  step navigation and all information.
- Status updates use polite live regions without duplicate announcements.
- Broadcast/unicast, direction, and success/failure use text and shape in
  addition to color.
- Topology labels, packet markers, status rows, and controls must not overlap
  at desktop or narrow widths.
- Packet and option tables scroll locally rather than widening the page.
- Focus remains visible, and scenario changes announce the new context.

## Testing strategy

Use test-driven implementation with focused unit, component, content,
integration, and migration tests.

Tests must cover:

- schema rejection of every contradictory packet and timer condition;
- DORA ordering, message types, addresses, ports, transaction IDs, and state;
- broadcast flag versus L2/L3 destination behavior;
- all header fields, sizes, decoded values, and options;
- relay 68-to-67, 67-to-67, 67-to-67, and 67-to-68 traversal;
- `giaddr`, hop count, pool selection, and Option 82 transformations;
- successful and public failure scenarios for both players;
- timing states, renewal, rebinding, expiry, NAK, decline, and release;
- immediate RFC-check feedback and standards/vendor distinction;
- terminal-only progress, wrong-answer attempts, retry, and invalid-data
  boundaries;
- shared control styling, keyboard support, reduced motion, and responsive
  containment;
- MDX content, catalog registration, previous/next navigation, sitemap,
  progress manifest, and Supabase migration consistency.

Before completion, run the focused DHCP suite, the full Vitest suite,
TypeScript validation, ESLint, and a production build. Do not run a production
build concurrently with a development server that shares the same `.next`
directory.

## Integration points

Implementation is expected to touch:

- `src/features/dhcp/*` for schemas, data, builders, players, and tests;
- public and account MDX under `src/content/networking-foundations/`;
- `mdx-components.tsx` for component registration;
- catalog data and repository tests;
- lesson content registration and rendering tests;
- progress manifest definitions and tests;
- lesson route/navigation and sitemap tests;
- shared CSS only where existing component-level styles are insufficient;
- one transactional, idempotent Supabase migration registering the versioned
  lesson progress manifest and items.

No authentication changes and no new runtime dependencies are required.

## Standards references

- RFC 2131, Dynamic Host Configuration Protocol
- RFC 2132, DHCP Options and BOOTP Vendor Extensions
- RFC 3046, DHCP Relay Agent Information Option
- RFC 3118, Authentication for DHCP Messages
- RFC 3442, Classless Static Route Option for DHCPv4
- RFC 6607, updated relay-agent Option 82 handling
- RFC 8156, DHCPv6 Failover Protocol, used only in the DHCPv6 advanced scope

