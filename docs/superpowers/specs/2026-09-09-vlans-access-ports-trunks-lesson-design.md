# VLANs, Access Ports and Trunks Lesson Design

## Purpose

Build the next unpublished Networking Foundations lesson at the stable route
`/learn/networking-foundations/vlans-access-ports-and-trunks`. The lesson must help a complete
beginner understand why VLANs exist, how access and trunk ports carry frames, where an IEEE 802.1Q
tag appears, and why traffic between VLANs requires a Layer 3 device.

The lesson follows ARP and Local Delivery. It may rely on the learner knowing Ethernet frames, MAC
learning, broadcast flooding and ARP, but it must explain every new VLAN term before using it.

## Approved Product Decisions

- Use two focused interactive players rather than one large simulator.
- Treat the first version as replaceable if beta feedback shows that the interaction is not clear
  enough.
- Keep native-VLAN mismatch, allowed-VLAN mismatch and advanced inter-VLAN diagnosis behind the Pro
  boundary.
- This is the final lesson implementation for the current workday.
- Account-gated entries in the lesson contents navigation display only `Locked`; they do not repeat
  `Free account`. Pro-gated entries retain `Pro` plus `Locked`.
- The registration boundary itself continues to explain that account creation is free.

## Learning Outcome

After the public introduction, a learner can:

1. explain that a VLAN creates a separate Layer 2 broadcast domain;
2. predict whether two access-port hosts can exchange Layer 2 traffic;
3. explain that ordinary endpoint frames are normally untagged on an access link;
4. follow a frame as a switch associates it with a VLAN, adds an 802.1Q tag on a trunk and removes
   the tag before delivery through another access port;
5. explain that a trunk can carry multiple VLANs while preserving their separation;
6. identify a router or multilayer switch as the boundary required for communication between VLANs.

## Teaching Sequence

### Public introduction

1. **Why VLANs exist** — begin with one physical office switch and two teams that require separate
   broadcast domains. State the analogy limit: VLANs create logical Layer 2 separation, not complete
   security by themselves.
2. **One switch, multiple broadcast domains** — explain VLAN IDs and membership before port modes.
3. **Access ports** — show that an access port belongs to one operational VLAN and that a normal host
   sends and receives untagged Ethernet frames.
4. **Interactive Player 1: Build the broadcast domains** — let the learner choose host VLAN
   membership and run a broadcast or local unicast. Highlight eligible recipients and explicitly
   label blocked cross-VLAN paths.
5. **Trunk links** — explain why two switches need one link to carry several VLANs.
6. **802.1Q tagging** — introduce TPID `0x8100`, priority bits, DEI and the 12-bit VLAN ID at an
   appropriate beginner level. Make clear that the tag is inserted between source MAC and EtherType
   in the Ethernet header and changes the frame checksum when transmitted.
7. **Interactive Player 2: Follow the tag** — animate an untagged frame from a VLAN 10 host into an
   access port, show the switch's internal VLAN classification, unfold the frame when the 802.1Q tag
   is added for the trunk, carry it to the second switch, remove the tag for the destination access
   port and deliver the frame.
8. **Allowed VLANs** — introduce the concept as a trunk forwarding filter without presenting the
   mismatch troubleshooting lab publicly.
9. **Inter-VLAN boundary** — show that VLAN 10 cannot directly reach VLAN 20 at Layer 2 and preview
   routing through a router or multilayer switch. Do not teach router-on-a-stick configuration here.
10. **What comes next** — preview STP as loop prevention and link aggregation as parallel-link
    bundling without teaching either protocol.

### Account-locked continuation

- Read a vendor-neutral port table containing access mode, access VLAN, trunk mode and allowed VLANs.
- Read a sanitized tagged-frame capture and identify the 802.1Q fields.
- Work through easy-to-mid-level reachability scenarios with expected evidence.
- Complete knowledge checks, a summary and interview-style explanations.

### Pro preview

- Native-VLAN mismatch diagnosis.
- Allowed-VLAN mismatch diagnosis.
- Advanced inter-VLAN packet tracing.
- Standards-guided 802.1Q checks, advanced Wireshark analysis and production troubleshooting.
- Advanced scenarios and interview preparation.

The preview describes these benefits but does not expose the protected lesson content.

## Interactive Player 1: VLAN Membership and Delivery

The topology contains one switch and four labelled hosts. Two hosts initially use VLAN 10 and two use
VLAN 20. Every host-to-switch link displays the host interface, switch interface, access mode and
assigned VLAN.

The learner can choose a source action and modify one host's VLAN membership. Supported journeys:

- broadcast from a VLAN 10 host;
- broadcast from a VLAN 20 host;
- same-VLAN unicast;
- cross-VLAN destination without routing;
- move a host from VLAN 20 to VLAN 10 and replay the traffic.

Autoplay starts each selected journey. Previous, Play/Pause, Next, Restart and playback-speed controls
remain available. Reduced-motion users receive manual progression without losing content.

At each step the player must show:

- ingress interface and assigned VLAN;
- switch forwarding decision;
- eligible egress interfaces;
- ingress exclusion for flooded traffic;
- visible packet copies for every eligible flooded path;
- a clear `Layer 2 boundary: different VLAN` result when no cross-VLAN forwarding occurs.

## Interactive Player 2: Access-to-Trunk Frame Journey

The topology contains Host A, Switch 1, an 802.1Q trunk, Switch 2 and Host B. The default journey uses
VLAN 10. A second selection uses VLAN 20 so the learner can see the same trunk carry a separate
broadcast domain.

The animation unfolds the frame at every meaningful hop:

1. Host A sends an untagged frame on its access link.
2. Switch 1 classifies the frame into the access port's VLAN.
3. Switch 1 inserts an 802.1Q tag before trunk transmission.
4. The trunk carries the tagged frame while preserving the VLAN ID.
5. Switch 2 reads the tag and chooses only ports in that VLAN.
6. Switch 2 removes the tag for the destination access link and recalculates the transmitted FCS.
7. Host B receives a normal untagged Ethernet frame.

The packet inspector has plain-language and technical views. The technical view identifies destination
MAC, source MAC, TPID, PCP, DEI, VLAN ID, encapsulated EtherType and FCS treatment. Copy must not imply
that the switch preserves the old FCS while editing the header.

## Component Boundaries

- `VlanMembershipPlayer` owns membership selections and VLAN-scoped forwarding scenarios.
- `VlanTagJourneyPlayer` owns access/trunk encapsulation scenarios.
- Reuse `PacketFlowPlayer`, topology rendering, autoplay, reduced-motion handling and packet inspection
  patterns where they accurately represent the journey.
- Extend shared packet-flow types only if required to display VLAN tag fields. The extension must be
  backwards compatible with every existing lesson.
- Lesson content remains split into public and account MDX files using the established repository
  boundary. The Pro section remains a preview component, not downloadable protected MDX.
- `LessonSectionNavigation` changes presentation only: account access semantics remain unchanged even
  though the repeated `Free account` badge is removed.

## Content and Accuracy Rules

- Say that access-link endpoint frames are *normally* untagged; do not claim tagged endpoint traffic
  is impossible.
- Do not describe a VLAN as a subnet. Explain that one-to-one VLAN/subnet mapping is common design,
  but the concepts belong to different layers.
- Do not call VLANs security boundaries by themselves.
- A switch floods broadcasts only within the frame's VLAN and excludes the ingress interface.
- A trunk carries selected VLANs; it does not merge their broadcast domains.
- Do not teach Dynamic Trunking Protocol, VTP, STP, RSTP, MSTP, LACP, PAgP, router-on-a-stick commands
  or vendor-specific configuration in this lesson.
- Native VLAN is mentioned only in the Pro preview. Its detailed behavior and mismatch evidence are
  protected.
- Use documentation address ranges and locally administered MAC addresses in examples.

## Responsive and Accessible Behavior

- Both players must fit the lesson column without horizontal page overflow at desktop and 390-pixel
  mobile widths.
- Scenario choices wrap on desktop and become full-width touch targets on narrow screens.
- Interface and VLAN labels remain readable without overlapping device names or packet markers.
- Color is never the only indication of VLAN membership; every path and device includes text such as
  `VLAN 10` or `VLAN 20`.
- Players use semantic fieldsets, legends, buttons, status text and descriptive topology alternatives.
- The public lesson remains complete and understandable with JavaScript disabled.

## Testing and Acceptance

The implementation is complete only when automated tests verify:

- catalog publication, route generation, section ordering and adjacent lesson navigation;
- anonymous/account/Pro content boundaries;
- account-locked contents entries show `Locked` without `Free account`;
- Pro entries still show both `Pro` and `Locked`;
- Player 1 floods only within the selected VLAN and shows no Layer 2 cross-VLAN delivery;
- Player 1 displays one marker on every eligible flooded egress path;
- Player 2 shows untagged → classified → tagged → tag preserved → untagged progression;
- 802.1Q fields and FCS treatment are technically accurate;
- autoplay, manual controls and reduced-motion behavior;
- desktop, mobile and no-JavaScript lesson behavior;
- full unit suite, lint, type-check, production build and lesson-specific browser tests.

Visual review must confirm that device names, interfaces, VLAN labels, frame markers and inspector text
are readable in light and dark themes at desktop and mobile widths.
