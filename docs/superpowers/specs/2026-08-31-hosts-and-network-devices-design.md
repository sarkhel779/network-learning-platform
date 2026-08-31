# Hosts and Network Devices Lesson Design

**Date:** 2026-08-31
**Status:** Approved conversational design, pending written-spec approval
**Scope:** Publish the `Hosts and Network Devices` lesson with descriptive device exploration, four short packet-flow comparisons, Windows and Wireshark checks, and scenario-based assessment.

## Purpose

The second Networking Essentials lesson teaches learners to distinguish end hosts from intermediary devices, explain what each device contributes to communication, and decide whether a sender communicates directly with a local destination or sends traffic to its default gateway.

This lesson complements `How Networks Communicate` rather than repeating it. The first lesson follows a packet and emphasizes the communication process. This lesson treats the topology and its devices as the main subject, using short packet journeys only to compare device roles and next-hop decisions.

## Central Learning Outcome

Given a simple topology, the learner can:

- identify hosts and intermediary network devices;
- explain the roles of a switch, wireless access point, router/default gateway, and firewall;
- decide whether a destination is local or remote;
- identify whether the first frame targets the destination host's MAC address or the default gateway's MAC address; and
- use basic Windows and Wireshark evidence to support that decision.

## Goals

- Publish the existing `hosts-and-network-devices` catalog lesson.
- Explain wired and wireless hosts using beginner-friendly language.
- Provide a clickable, self-explanatory network topology.
- Compare wired and wireless communication to local and remote destinations.
- Animate both outbound and return paths with the established playback controls.
- Present simple packet information first and expandable technical details second.
- Add Windows command and basic Wireshark checks connected to the lesson scenarios.
- Add knowledge checks and scenario-based interview questions with expandable answers.
- Preserve accessibility, reduced-motion support, server rendering, and graceful fallback behavior.

## Non-goals

- A complete ARP lesson; ARP is recalled only to support the next-hop decision.
- Detailed Ethernet switching, MAC-table learning, VLAN, routing-table, NAT, or 802.11 frame instruction.
- Stateful firewall processing, security policies, zones, App-ID, or Palo Alto configuration.
- Real laboratories, packet capture uploads, emulation, virtualization, accounts, or persisted learner progress.
- Reworking the first lesson's packet journey or the approved curriculum structure.

## Differentiation from the First Lesson

`How Networks Communicate` answers, “What happens when I send data?” It presents a sequential packet journey and introduces ARP, addressing, encapsulation, delivery, and return traffic.

`Hosts and Network Devices` answers, “Which devices are involved, and what does each one do?” It emphasizes:

- host versus intermediary classification;
- device roles and operating scope;
- local-versus-remote forwarding decisions;
- wired-versus-wireless access;
- what each device observes or changes; and
- troubleshooting evidence associated with device behavior.

The four journeys are concise comparisons, not another exhaustive packet walkthrough. ARP appears only as a brief prerequisite reminder: a sender resolves the local destination's MAC for local traffic and the gateway's MAC for remote traffic.

## Lesson Structure

The lesson follows this order:

1. **What is a host?** — devices that originate, request, receive, or process data, including desktops, laptops, phones, servers, printers, and IoT devices.
2. **Devices that connect hosts** — switch, wireless access point, router/default gateway, and a brief firewall introduction.
3. **Explore the topology** — a clickable topology with descriptive device details.
4. **Compare packet journeys** — four selectable, short outbound-and-return demonstrations.
5. **Windows checks** — relevant `ipconfig /all`, `arp -a`, and `route print` observations.
6. **Wireshark checks** — basic filters and fields that corroborate the selected journey.
7. **Test your understanding** — knowledge checks, a next-hop decision activity, and scenario-based interview questions.
8. **Summary** — a compact role-and-addressing comparison table and lesson takeaway.

Catalog `sections` metadata supplies matching `On this page` links for the major headings. The existing curriculum sidebar, mobile `Course contents`, and bottom Previous/Next navigation remain unchanged in structure.

## Topology and Device Explorer

The shared topology contains a wired client PC, wireless laptop, wireless access point, Layer 2 switch, router/default gateway, firewall/security boundary, local server, and remote server.

Every visible device is a keyboard-operable control rather than a decorative click target. Hover, focus, and selected states are visually distinct and do not rely on color alone.

Selecting a device pauses active playback and opens a descriptive information panel. The current step is retained; closing the panel does not restart the journey. On desktop, the panel appears beside the topology when space permits. On smaller screens, it appears below the topology without horizontal overflow.

Each device description answers:

1. What is this device?
2. What is its purpose here?
3. Does it originate traffic, forward traffic, or both?
4. Does it primarily use MAC addresses, IP addresses, or both in this scenario?
5. What does it do to the current frame or packet?
6. What changes, and what stays the same, as traffic passes it?
7. What evidence might appear in Windows or Wireshark?
8. What common failure would affect communication?

The default view is a short plain-language explanation and a simple analogy. An expandable `Technical details` disclosure contains the deeper addressing and forwarding explanation. Content is scenario-aware where behavior differs between local and remote communication.

The access point is described as bridging the wireless client into the LAN. The lesson acknowledges the wireless-to-wired transition but deliberately avoids detailed 802.11 frame fields. The firewall is introduced as a security checkpoint; its dedicated lesson will teach policy evaluation and vendor-specific behavior.

## Scenario Selection

One topology supports four clearly labelled scenarios:

1. Wired host to local server
2. Wireless host to local server
3. Wired host to remote server
4. Wireless host to remote server

Scenario selection uses an accessible single-choice control. Changing the scenario pauses playback, selects the new scenario, resets it to its first step, updates the topology/inspector/device descriptions consistently, and announces the change without moving focus unexpectedly.

The first scenario is selected by default. The interaction must not depend on drag-and-drop or pointer input.

## Packet-Flow Behavior

### Local destination

- The sender determines that the destination IP belongs to its local subnet.
- If necessary, it uses ARP to resolve the destination host's MAC address.
- The IP destination remains the local server.
- The Ethernet destination is the local server's MAC address.
- The switch or access-point-plus-switch path forwards the frame within the LAN.
- The router and firewall are visibly outside the active path.
- The return journey targets the original sender's MAC address on the LAN.

### Remote destination

- The sender determines that the destination IP is outside its local subnet.
- If necessary, it uses ARP to resolve the default gateway's MAC address.
- The IP destination remains the remote server.
- The first Ethernet destination is the default gateway's MAC address, not the remote server's.
- The router removes the incoming Layer 2 frame and creates the appropriate next-hop frame.
- The firewall is shown as a security boundary/checkpoint without simulating detailed policy or NAT behavior.
- The return journey is animated as distinct steps and is delivered back to the initiating host.

### Wireless variation

- The laptop is already associated before the selected data journey begins.
- Traffic passes through the access point before entering the switched LAN.
- The access point's bridging role is emphasized.
- The local-versus-remote IP decision remains the same as for the wired client.

## Playback and Packet Inspection

The interaction reuses automatic playback, play/pause, previous/next step, restart, 0.5x/1x/1.5x/2x speeds, and reduced-motion behavior that preserves manual navigation.

The packet inspector follows progressive disclosure. Its summary shows the active protocol or frame type, source and destination, and the main teaching point. Expandable details show relevant source/destination MAC addresses, source/destination IP addresses, protocol, current next hop, and changed fields.

The inspector must not imply that routers rewrite end-to-end IP addresses as ordinary routing behavior. NAT remains outside this lesson. Address values use documentation-safe private/example ranges and consistent, fictional MAC addresses.

## Windows Checks

The lesson uses illustrative Windows output rather than executing commands on the learner's computer.

- `ipconfig /all` identifies the host's IPv4 address, subnet mask, default gateway, and physical address.
- `arp -a` connects cached IP-to-MAC mappings to local-host and default-gateway resolution.
- `route print` identifies the connected network and default route at a beginner level.

Every command block explains what to look for and how it supports the local-versus-remote decision. Example output is clearly labelled and uses the same addresses as the topology.

## Wireshark Checks

Basic checks connect capture evidence to the selected scenario:

- `arp`
- `icmp`
- `ip.addr == <example-address>`
- `eth.addr == <example-mac>`
- `tcp`

The content identifies useful Ethernet, IP, ARP, and protocol fields. It explains that a capture taken at one location does not reveal every frame used on every routed segment. Filters and sample values remain internally consistent with the topology.

## Assessment

Short knowledge checks follow the explanatory sections. The principal activity presents an unfamiliar topology and asks the learner to classify each item, decide whether the destination is local or remote, choose whether the first-hop MAC belongs to the destination host or gateway, and identify expected forwarding devices.

Scenario-based interview questions use native expandable disclosures for answers. Answers explain the reasoning, not just the conclusion. Initial questions cover an unavailable switch, incorrect default gateway, disconnected access point, missing ARP entry, and a firewall boundary without requiring concepts not yet taught.

## Architecture and Data Model

Lesson prose remains in dedicated MDX. Catalog metadata remains authoritative for publication, objective, duration, navigation, and section links.

Reusable interactive behavior is implemented in focused TypeScript/React components rather than stateful MDX markup. Scenario and device-copy data live outside MDX and are validated before reaching the renderer.

The existing packet-flow model may be extended only where necessary for multiple related scenarios, selectable devices, scenario-aware explanations, and explicit next-hop/inspection metadata. `How Networks Communicate` must remain backward compatible. Shared playback, topology, inspection, error-boundary, and reduced-motion primitives should be reused; lesson-specific wrappers may compose them without forcing unrelated concepts into the generic schema.

## Static Rendering and Failure Behavior

- Prose, device summaries, commands, Wireshark guidance, and assessments server-render.
- A static topology description provides device order and relationships.
- Invalid interactive data renders the established friendly fallback without hiding surrounding content.
- One broken scenario must not falsely display another scenario's data.
- Hydration or JavaScript failure must not remove essential explanations.
- No external API, network request, learner data store, or browser permission is required.

## Accessibility and Responsive Requirements

- Every device and scenario option has an unambiguous accessible name.
- Device selection works with keyboard and pointer input.
- Opening a device panel pauses playback; closing it does not resume unexpectedly.
- Status changes are announced without excessive live-region chatter.
- The topology SVG has a concise name plus current-step description.
- Controls retain visible focus and adequate touch targets.
- Meaning is not conveyed by color or motion alone.
- Reduced-motion users receive state changes without animated travel.
- Desktop places details beside the topology where practical.
- Mobile stacks controls, topology, inspector, and details without horizontal overflow.
- Native disclosures remain readable without custom client logic.

## Testing Strategy

### Catalog and lesson tests

- Assert the lesson is published, free, and reachable at its existing slug.
- Assert section metadata matches explicit MDX heading IDs.
- Assert Previous points to `How Networks Communicate` and next-item behavior remains accurate.
- Server-render the MDX and reject invalid nested paragraph or SVG structures.

### Scenario and schema tests

- Validate all four scenarios and stable device/link/step identifiers.
- Verify every packet path matches its active link.
- Verify local scenarios use the destination host as LAN frame target.
- Verify remote scenarios use the gateway as first frame target while retaining remote destination IP.
- Verify outbound and return phases exist for every scenario.
- Verify all selectable devices have complete descriptive content.
- Reject inconsistent data with a useful fallback.

### Component tests

- Select each scenario and confirm reset-to-first-step behavior.
- Verify playback, step, restart, and speed controls for the active scenario.
- Open device details with pointer and keyboard interactions.
- Verify opening details pauses playback and closing preserves the step.
- Verify simple and expandable technical content.
- Verify scenario-aware content, reduced motion, and accessible names/status.

### Browser and regression tests

- Load the lesson on desktop and mobile without page or relevant console errors.
- Verify curriculum and `On this page` navigation.
- Exercise all scenario selectors and representative device panels.
- Verify no mobile horizontal overflow and no-JavaScript core content.
- Re-run first-lesson interaction tests to detect regressions.
- Run type checking, linting, unit tests, production build, and focused Playwright coverage.

## Delivery Sequence

1. Add failing catalog, MDX, scenario, device-detail, and browser tests.
2. Add lesson metadata updates and MDX structure.
3. Extend the shared data model minimally while preserving existing scenarios.
4. Add validated device descriptions and four lesson scenarios.
5. Build the accessible scenario selector and clickable device explorer.
6. Integrate playback, packet inspection, and scenario-aware details.
7. Add Windows, Wireshark, assessment, and summary content.
8. Complete responsive, reduced-motion, static-fallback, and accessibility behavior.
9. Run the full verification suite and review the lesson in the browser.

## Acceptance Criteria

The lesson is ready when a learner can open it through the curriculum, understand every displayed device, compare all four wired/wireless and local/remote journeys, identify the first-hop MAC target, follow outbound and return paths, relate behavior to Windows and Wireshark evidence, and complete the scenario questions. The existing first lesson must continue to work unchanged, and all automated and browser verification must pass.
