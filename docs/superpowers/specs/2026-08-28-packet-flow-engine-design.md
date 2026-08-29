# Packet-Flow Animation Engine — Approved Design

Date: 28 August 2026
Status: Approved for implementation planning

## 1. Purpose

Build the first reusable interactive packet-flow experience for the published
“How networks communicate” lesson. The experience teaches a complete ping to a
server on another IPv4 network, including default-gateway ARP resolution and the
ICMP return path. It establishes the reusable animation engine for later ARP,
switching, routing, DNS, TCP, NAT, firewall, and Palo Alto policy scenarios.

## 2. Scope

This increment includes:

- A structured, validated packet-flow scenario model
- A reusable React player rendered with accessible, responsive SVG
- Automatic playback with pause/resume
- Restart, previous-step, and next-step controls
- Playback speeds of 0.5×, 1×, 1.5×, and 2×
- Synchronized topology, explanations, progress, and packet details
- A beginner summary plus expandable technical packet details
- Keyboard-accessible controls
- Reduced-motion behavior that starts paused and uses discrete state changes
- A static instructional fallback
- Integration into the existing published networking lesson
- Unit, integration, and browser coverage for the supported behavior

This increment does not include free-form topology editing, learner-created
scenarios, packet-capture generation, audio, video, analytics, persistence, real
network emulation, or additional animated lessons.

## 3. Learning scenario

The topology contains a source PC, a switch, a router, and a destination server.
The first scenario progresses through these learning stages:

1. The PC determines that the server is on a remote IPv4 network.
2. The PC broadcasts an ARP request for the default gateway.
3. The switch floods the broadcast on the local LAN.
4. The router replies with its interface MAC address.
5. The PC records the gateway IP-to-MAC mapping.
6. The PC creates an ICMP echo request. The IP destination remains the server,
   while the Ethernet destination is the gateway interface.
7. The switch forwards the unicast frame toward the router.
8. The router removes the incoming frame, examines the destination IP, reduces
   the TTL, selects the outgoing route, and creates a new frame.
9. The server receives the ICMP echo request.
10. The server creates an ICMP echo reply, which follows the reverse routed path.
11. The PC receives the echo reply and the scenario reports a successful ping.

The scenario is intentionally simplified to the devices necessary for the
lesson. Explanations must distinguish end-to-end IP addressing from link-local
Ethernet addressing and must not imply that a switch routes packets.

## 4. Architecture

### 4.1 Scenario model

`PacketFlowScenario` is immutable structured data containing stable identifiers,
metadata, topology devices, links, playback defaults, and ordered steps. Each
step references topology identifiers rather than embedding presentation markup.

A step can define:

- The active device and active link or links
- The packet or frame type and its current path segment
- A concise beginner explanation
- A default playback duration
- Source and destination MAC addresses when relevant
- Source and destination IP addresses when relevant
- A protocol label
- Beginner-visible fields
- Expandable technical fields such as EtherType, ARP opcode, TTL, and ICMP type
- State changes such as an ARP-table entry

Scenario validation rejects empty steps, duplicate identifiers, invalid device
or link references, unsupported speeds, invalid durations, and packet paths that
do not correspond to a declared link. Validation happens before interactive
rendering.

### 4.2 Player state

`PacketFlowPlayer` is the client-side orchestration boundary. It owns the current
step index, playing or paused state, selected speed, timer lifecycle, and reduced-
motion startup behavior. Timer behavior is isolated so transitions can be tested
deterministically.

Automatic playback advances after `step.durationMs / speed`. Playback pauses on
the final step rather than looping. Restart returns to step zero and resumes only
when motion preferences permit automatic playback. Previous and Next always pause
first so the learner can inspect the selected step. Changing speed affects the
next scheduled transition without skipping a step.

### 4.3 Rendering boundaries

- `NetworkTopology` renders devices, links, active states, and the traveling
  packet as responsive SVG.
- `PlaybackControls` renders Play/Pause, Restart, Previous, Next, and the speed
  selector using native interactive elements.
- `StepExplanation` renders the current stage number, title, explanation, and
  progress.
- `PacketInspector` renders beginner fields and an expandable native disclosure
  for technical fields.
- The MDX lesson embeds a single exported scenario component and contains no
  player state or timer logic.

These units communicate through typed props and do not depend on lesson-specific
DOM structure.

## 5. Visual and interaction behavior

The topology appears first, followed by playback controls, synchronized
explanation, and packet inspector. At viewport widths of 56rem and above, the
explanation and packet inspector use a two-column region beneath the topology.
Narrower viewports use a single column in that same learning order.

The active device and link are identified by color, stroke treatment, and a text
label so meaning never depends on color alone. ARP broadcast behavior is visibly
distinct from unicast ICMP forwarding. Packet travel occurs only along the active
declared link; state changes never suggest continuous movement through a router.

The progress display communicates both the current step and total steps. Buttons
have visible focus treatment and accurate accessible names. Previous is disabled
at the first step and Next at the last step. Play is disabled at the final step,
and the always-visible Restart control provides the obvious way to replay.

## 6. Packet inspector

The default beginner view shows only information needed to understand the current
decision:

- Frame or packet type
- Source and destination MAC addresses when a frame is present
- Source and destination IPv4 addresses when an IP packet is present
- Protocol and ICMP request/reply role

Expandable technical details may show EtherType, ARP opcode, TTL, and ICMP type.
Fields that change at a routing boundary are highlighted and described. The UI
must make clear that the IP destination remains the server while Ethernet
addresses change per link.

## 7. Accessibility and reduced motion

All controls use native buttons, select, and details/summary semantics and are
usable in logical tab order. SVG content has a concise accessible name, while a
complete text alternative lists the topology and current explanation. Decorative
packet motion is hidden from assistive technology to avoid duplicate narration.

Status updates identify the selected step without announcing every animation
frame. Autoplay does not repeatedly move keyboard focus.

When `prefers-reduced-motion: reduce` is active, the player starts paused,
transitions between complete step states without animated travel, and preserves
all manual controls and instructional content. The server-rendered static diagram
and lesson text remain useful without client-side JavaScript.

## 8. Failure handling

If scenario validation or interactive rendering fails, the lesson displays the
existing static PC-to-server diagram, its text alternative, and a short notice
that the interactive view is unavailable. The written explanation, Wireshark
check, quiz, and interview scenario remain accessible.

Timer cleanup prevents stale transitions after pausing, restarting, changing
steps, changing speed, or unmounting. Player failure must not prevent the rest of
the MDX lesson from rendering.

## 9. Content integration

The existing placeholder notice in
`src/content/networking-foundations/how-networks-communicate.mdx` is replaced by
the interactive player. The static diagram remains as the fallback and no-script
instructional representation rather than being removed.

The scenario data lives outside MDX under the packet-flow feature so it can be
validated, unit-tested, and reused independently from lesson presentation.

## 10. Testing and acceptance criteria

### Unit coverage

- Valid scenario data is accepted.
- Duplicate identifiers and missing topology references are rejected.
- Empty steps, invalid durations, and unsupported speed defaults are rejected.
- Autoplay advances exactly one step at the computed interval.
- Pause cancels advancement; resume restores it.
- Restart, Previous, Next, speed changes, and final-step behavior are correct.
- Reduced-motion mode starts paused and performs no traveling animation.
- Packet inspector summary and expanded details match the current step.

### Integration coverage

- The published lesson renders the packet-flow experience.
- The static fallback and text alternative remain present.
- The ARP and ICMP content agrees with the existing `arp or icmp` Wireshark check.
- The current explanation and packet fields remain synchronized after manual and
  automatic transitions.

### Browser coverage

- Automatic playback, pause/resume, restart, Previous, and Next operate through
  visible controls.
- All four speeds can be selected.
- The complete ARP request/reply and ICMP request/reply sequence is reachable.
- Controls are keyboard operable.
- Reduced-motion startup is paused.
- Desktop and mobile layouts remain readable without horizontal page overflow.

The increment is complete when a beginner can watch or manually step through the
full exchange, explain why the destination MAC changes while the destination IP
does not, and connect the ARP and ICMP stages to the existing Wireshark exercise.
