# Networking Curriculum Restructure Design

**Date:** 2026-09-08  
**Status:** Proposed curriculum authority; implementation requires per-lesson plans  
**Scope:** Networking curriculum sequencing, depth, access boundaries, and future pathways

## Purpose

Packetsecrets must serve complete beginners, early-career IT professionals changing domains,
and networking practitioners seeking deeper knowledge. The curriculum therefore uses progressive
disclosure: establish an accurate end-to-end mental model first, then revisit each mechanism with
operational, packet-level, standards-oriented, and troubleshooting depth.

This specification restructures the long-term curriculum without immediately rewriting already
published lessons. It is the authority for future unpublished lesson designs. Published lessons
receive deferred redesign notes and will be revised only through separate specifications after the
remaining launch lessons are complete.

## Change Policy

1. Do not unpublish, rename, reorder, or rewrite an existing published lesson as part of adopting
   this specification.
2. Complete the remaining unpublished launch lessons first.
3. Apply this specification whenever a future lesson is designed or implemented.
4. Record overlaps with published lessons in the deferred-redesign register rather than modifying
   them opportunistically.
5. Give every substantial lesson its own approved design and implementation plan.
6. Preserve existing stable URLs unless a later migration plan supplies redirects, canonical URLs,
   sitemap changes, and regression coverage.

## Access Model

### Public

Public sections explain the core concept, provide accurate real-world examples, preserve a useful
no-JavaScript reading path, and may include a public-safe comparison or player. Public artifacts
must contain no protected exercise answers or authored account scenarios.

### Free account

Free members receive guided practice, easy through mid-advanced scenarios, command output,
introductory packet analysis, troubleshooting workflows, knowledge checks, interview scenarios,
and future progress tracking.

### Pro Member Waitlist

Pro previews advertise future depth without shipping the protected material anonymously. Future Pro
content includes standards/RFC/IEEE checks, advanced Wireshark analysis, ambiguous production
failures, multi-device reasoning, vendor evidence, certification depth, and advanced interview
preparation. The CTA remains **Join the Pro Member Waitlist** until paid access exists.

## Content Classification

Every advanced subject must be marked as one of:

- **Essential:** broadly applicable knowledge expected of a capable network practitioner.
- **Vendor-specific:** useful platform knowledge taught after the vendor-neutral mechanism.
- **Legacy:** historically or certification-relevant technology, clearly labelled as non-default for
  modern greenfield design.
- **Security pathway:** material whose primary purpose is policy enforcement, attack resistance,
  cryptography, or security operations.

## Revised Pathway Architecture

### Pathway 1 — Networking Foundations

This remains the launch pathway. It establishes the whole network before deeper specialization.

1. What Is a Computer Network? — published; redesign deferred
2. Hosts, Clients, Servers and Network Interfaces — published; redesign deferred
3. Cables, Fibre, Wireless and Network Connections — published; redesign deferred
4. Hubs, Bridges and Switches — published; redesign deferred
5. Unicast, Broadcast and Multicast Communication — new, unpublished
6. Routers, Default Gateways and Network Boundaries — unpublished
7. Access Points, Modems, ONTs and Firewalls — unpublished
8. OSI and TCP/IP Models — published; redesign deferred
9. A Packet’s First Journey Through a Small Network — unpublished
10. Networking Foundations Review and Readiness Check — new, unpublished

The final review diagnoses readiness for the specialist pathways; it does not lock learners out of
advanced material.

### Pathway 2 — Ethernet and Enterprise Switching

1. Ethernet Frames and MAC Addresses
2. How Switches Learn and Forward
3. ARP and Local IPv4 Delivery
4. VLANs, Access Ports and Trunks
5. Layer 2 Loops and Spanning Tree Protocol
6. Rapid STP and Multiple Spanning Tree
7. Link Aggregation, EtherChannel and LACP
8. VLAN Administration and VTP
9. Inter-VLAN Routing and Multilayer Switching
10. Enterprise Switching Troubleshooting Capstone

PAgP and VTP are explicitly Cisco-specific. STP, RSTP, MSTP and LACP are essential. Port security,
DHCP snooping, Dynamic ARP Inspection and similar enforcement features are introduced here only as
boundaries and taught operationally in the Network Security pathway.

### Pathway 3 — IP Addressing and Routing

1. IPv4 Addressing
2. Subnetting Fundamentals
3. IPv6 Fundamentals
4. Connected and Static Routes
5. Routing Tables, Default Routes and Longest-Prefix Match
6. ICMP, Ping and Path Discovery
7. First-Hop Redundancy with VRRP
8. HSRP and GLBP Vendor Extensions
9. Dynamic Routing Foundations
10. OSPF Foundations
11. Routing Troubleshooting Capstone

VRRP is the vendor-neutral first-hop redundancy foundation. HSRP and GLBP are labelled Cisco-specific.
Gratuitous ARP is revisited during gateway failover because it explains neighbour-cache updates.

### Pathway 4 — Network Services and Internet Communication

1. TCP, UDP and Ports
2. DHCP and Automatic Address Configuration
3. DNS and Name Resolution
4. HTTP, HTTPS, TLS and Essential Network Services
5. NAT and PAT
6. The Complete Internet Packet Journey
7. Service Troubleshooting Capstone

TLS is explained here as an application dependency and visibility boundary. Cryptographic choices,
certificate security, inspection policy, SSL VPNs, and attacks belong to Network Security.

### Pathway 5 — Multicast Networking

1. Multicast Addressing and Group Communication
2. IGMP and IGMP Snooping
3. IPv6 Multicast and MLD
4. Multicast Routing Concepts
5. PIM, Rendezvous Points and Distribution Trees
6. Reverse Path Forwarding and Source-Specific Multicast
7. Multicast Troubleshooting Capstone

The Foundations lesson teaches delivery scope only. This pathway owns protocol operation and
production troubleshooting.

### Pathway 6 — WAN and Remote Connectivity

1. WAN Fundamentals and Provider Boundaries
2. Point-to-Point Links and PPP
3. MPLS Foundations
4. Broadband, Internet Underlays and Overlays
5. Site-to-Site Connectivity and VPN Concepts
6. SD-WAN Foundations
7. Frame Relay and Legacy WAN Technologies
8. WAN Troubleshooting Capstone

Frame Relay, DLCIs, LMI and Inverse ARP are classified as legacy. They remain available for older
environments, certification history, and conceptual comparison, but do not displace modern WAN
technologies.

### Pathway 7 — Packet Analysis and Network Troubleshooting

1. Evidence-First Troubleshooting Method
2. Wireshark Foundations
3. Capture Placement and Visibility
4. Ethernet and ARP Analysis
5. IP, ICMP and Routing Analysis
6. TCP and UDP Analysis
7. DHCP and DNS Analysis
8. Application and TLS Visibility
9. Multi-Layer Troubleshooting Scenarios
10. Troubleshooting and Packet-Analysis Capstone

### Pathway 8 — Network Security

This begins with the firewall as previously approved and is implemented after the launch networking
foundation is stable.

1. Firewalls and Network Security Boundaries
2. Stateless and Stateful Policy Processing
3. Network Segmentation and Security Zones
4. Access Control Lists
5. Secure Network Address Translation Boundaries
6. VPN and Tunnelling Foundations
7. IPsec
8. TLS and Certificate Security
9. Secure Network Services
10. Network Security Monitoring and Troubleshooting

## New Foundations Lesson: Unicast, Broadcast and Multicast

### Outcome

Identify the intended delivery scope, predict which ports and interfaces receive traffic, distinguish
receipt from acceptance, and explain where a routing boundary changes the outcome.

### Public sections

1. Why delivery scope matters
2. Unicast: one intended destination
3. Broadcast: the local broadcast domain
4. Multicast: an interested receiver group
5. Unknown unicast is not broadcast
6. Compare delivery types
7. Interactive delivery-scope player

### Public examples

- Known unicast: a workstation sends an HTTPS request to one server.
- Unknown unicast: the destination MAC is unicast but absent from the switch table, causing temporary
  flooding without changing the address type.
- Broadcast: an ARP request uses `FF:FF:FF:FF:FF:FF` within one broadcast domain.
- DHCP discovery: local broadcast where required, with relay behaviour identified as explicit
  forwarding rather than ordinary router broadcast forwarding.
- Multicast: a video stream targets a receiver group with subscribed and unsubscribed hosts.

### Interactive delivery-scope player

Use one stable topology containing a sender, switch, three local receivers, router, and remote host.
Scenarios include known unicast, unknown unicast, ARP broadcast, DHCP discovery, multicast with known
subscribers, multicast without group state, and a router-boundary comparison.

Every step distinguishes:

1. the source;
2. destination address type;
3. switch decision;
4. ports that carry the traffic;
5. interfaces that physically receive it;
6. hosts that accept or discard it;
7. whether the router can forward it; and
8. plain-language and technical explanations.

The player must not imply that a flooded unknown unicast becomes broadcast, that every broadcast
receiver responds, that a router forwards ordinary Layer 2 broadcasts, or that multicast is always
efficient without group-aware switching and routing.

### Free-account sections

- Predict who receives each frame or packet.
- Diagnose delivery-scope scenarios.
- Inspect introductory Ethernet/IP packet evidence.
- Complete knowledge checks, summary, and interview scenarios.
- Use **I know this—proceed to advanced** to jump to the first intermediate scenario without
  bypassing access controls.

### Pro scope

IGMP, MLD, snooping, multicast routing, PIM, distribution trees, RPF, source-specific multicast,
advanced capture analysis, broadcast containment, and production troubleshooting stay protected and
belong primarily to the Multicast Networking pathway.

## Required Additions to Future Unpublished Lessons

### Routers, Default Gateways and Network Boundaries

- Local-versus-remote decision using only prerequisite-level subnet knowledge.
- Default gateway and first next hop.
- Direct delivery, default route, more-specific route, and no-usable-route outcomes.
- Router interfaces and connected networks.
- Hop-by-hop frame replacement versus end-to-end source/destination IP addresses.
- Router treatment of unicast, ordinary Layer 2 broadcast, and multicast.
- Account simulator using Windows and Linux route evidence.
- Defer binary subnet calculation and route-selection edge cases to later pathways.

### Access Points, Modems, ONTs and Firewalls

- Separate physical device from logical role.
- Explain AP bridging, modem/ONT conversion, ISP handoff, routing and firewall boundaries.
- Identify multifunction home gateways without teaching that the functions are inseparable.
- Mention broadcast-domain and multicast behaviour only where required to place devices accurately.
- Defer firewall policy, state, NAT, VPN and vendor configuration to Network Security.

### A Packet’s First Journey Through a Small Network

- Integrate known-unicast switching, local/remote decision, next-hop resolution, routing, frame
  replacement and return traffic.
- Include a broadcast ARP step and explicitly limit it to the local broadcast domain.
- Keep DNS, DHCP and NAT as clearly labelled assumptions/previews until their dedicated lessons.
- Provide plain-language and technical inspection modes.

### Ethernet Frames and MAC Addresses

- Individual/group MAC-address distinction.
- Broadcast MAC address.
- Unicast, broadcast and multicast frame evidence.
- IPv4/IPv6 multicast-to-Ethernet mapping at the appropriate depth.
- Unknown-unicast flooding versus broadcast.
- Capture-versus-wire caveats in Pro.

### How Switches Learn and Forward

- Source learning, filtering, known forwarding, unknown flooding, broadcast flooding, aging and host
  movement.
- Multicast flooding versus group-aware forwarding as a boundary to the multicast pathway.
- Loop symptoms as a preview to STP, without duplicating the STP lesson.

### ARP and Local IPv4 Delivery

- Standard ARP request/reply and cache behaviour.
- Gateway resolution.
- Proxy ARP with a scenario showing how it can conceal an addressing error.
- Gratuitous ARP with duplicate-address, cache-update and failover examples.
- RARP only as an obsolete historical predecessor to BOOTP/DHCP.
- Inverse ARP only as a pointer to the legacy Frame Relay lesson.

### VLANs, Access Ports and Trunks

- VLAN-separated broadcast domains.
- Access/trunk behaviour and allowed VLANs.
- Inter-VLAN routing boundary.
- STP and link aggregation only as explicit next-lesson previews.

### First-Hop Redundancy

- Virtual IP and MAC behaviour.
- VRRP master/backup election, priority, tracking and preemption.
- Gateway stability during failover.
- Gratuitous ARP during ownership changes.
- HSRP and GLBP as protected vendor extensions.

### Legacy WAN Technologies

- Frame Relay purpose and NBMA behaviour.
- PVCs, DLCIs, LMI, Inverse ARP and static mappings.
- Hub-and-spoke, partial mesh and split-horizon complications.
- Interactive DLCI/IP mapping and inactive-PVC diagnosis.
- Prominent legacy classification and comparison with modern alternatives.

## Deferred Redesign Register for Published Lessons

No item below is implemented until the unpublished launch lessons are complete.

### What Is a Computer Network?

- Verify its unicast examples align with the new delivery-scope terminology.
- Remove any duplication that belongs exclusively in the new delivery-scope player.

### Hosts, Clients, Servers and Network Interfaces

- Align device/interface receipt and acceptance language with the new delivery-scope lesson.
- Preserve current topology behaviour and stable route.

### Cables, Fibre, Wireless and Network Connections

- No immediate structural change.
- Later verify that shared-medium language supports broadcast/multicast lessons without implying that
  physical sharing and logical delivery scope are identical.

### Hubs, Bridges and Switches

- Add a future cross-link to the delivery-scope lesson.
- Keep unknown-unicast flooding explicitly distinct from broadcast.
- Avoid adding STP/LACP/VTP depth; those belong to Enterprise Switching.

### OSI and TCP/IP Models

- Reassess its position after the new Foundations lesson is published.
- Preserve its stable route, tested encapsulation player and account boundary.
- Add future mappings for multicast control protocols only when those lessons exist.

## Quality Requirements

Every future lesson must provide:

- beginner-friendly explanation before jargon;
- accurate real-world analogy with stated limits;
- accessible static representation;
- interactive diagram, player or simulator where it materially improves understanding;
- practical Windows/Linux or packet evidence where appropriate;
- common misconceptions;
- easy through mid-advanced account scenarios;
- knowledge check and summary;
- interview scenarios;
- Pro preview without anonymous protected details;
- keyboard, touch, mobile, dark/light, reduced-motion and no-JavaScript coverage;
- schema-validated authored data, pure evaluators, privacy audits and production tests where the
  lesson contains protected interactive scenarios.

## Adoption Sequence

1. Save and approve this curriculum specification.
2. Do not alter the current live catalog solely to reflect future pathways.
3. Design and implement **Unicast, Broadcast and Multicast Communication**.
4. Design and implement **Routers, Default Gateways and Network Boundaries** using this specification.
5. Complete the remaining unpublished Networking Foundations lessons.
6. Perform a dedicated published-lesson redesign cycle using the deferred register.
7. Split the expanded specialist pathways into catalog entries only when their first lesson is ready
   for implementation.

