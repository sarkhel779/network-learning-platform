# Beginner Lesson Layout and Packet Journey Redesign

## Status

Approved for implementation planning on 2026-09-08.

## Purpose

Make the Networking Foundations lessons easier for complete beginners to read and understand. The redesign removes the permanent desktop curriculum column, prevents normal words from splitting, simplifies dense interactive comparisons, and teaches forwarding as an animated packet journey that reveals what changes at each hop.

This work improves the shared lesson experience and the current switching and routing lessons. It does not add authentication, change free-versus-Pro access rules, or redesign unrelated lesson content.

## Problems to solve

1. The permanent desktop curriculum sidebar consumes horizontal space and can make the lesson heading and body feel clipped.
2. Global wrapping rules split ordinary words such as `Device`, `Bridge`, and `Switch` across lines.
3. Tables and three-column comparison cards compress until their contents become difficult to scan.
4. The switching comparison presents too much information at once for a beginner.
5. The route-decision player shows a route result but not the packet's visible movement or encapsulation changes.
6. Router interfaces are not labelled clearly, so learners cannot connect an outgoing-interface decision to the diagram.
7. Animation and explanations need accessible manual controls and reduced-motion behavior.

## Design principles

- Show one decision or transformation at a time.
- Begin with the learner's application data, then introduce headers and addressing only when they become relevant.
- Keep the first view simple; place optional technical detail behind an explicit expansion control.
- Never imply that a switch routes, that a router forwards the original Ethernet frame unchanged, or that routing automatically performs NAT.
- Preserve complete, readable public explanations without JavaScript.
- Keep public data separated from protected account and Pro scenario data.

## 1. Lesson shell and course contents drawer

The lesson page becomes a single centred content column that can use the available viewport width. The permanent desktop curriculum sidebar and its reserved grid column are removed.

A floating **Course contents** button remains visible near the left viewport edge on desktop and in a reachable fixed position on smaller screens. Activating it opens a slide-in overlay drawer above the lesson. The drawer is collapsed by default and does not resize or shift the lesson when opened.

The drawer contains the existing curriculum navigation and access labels. It closes when the learner:

- activates the explicit Close button,
- presses Escape,
- selects a lesson,
- or activates the backdrop.

When opened, keyboard focus moves to the drawer's heading or first meaningful control. Focus is contained inside the open drawer. When closed, focus returns to the Course contents trigger. The document behind the drawer is not interactive while the drawer is open. The drawer uses dialog semantics, an accessible name, and an unobtrusive transition that is disabled when reduced motion is preferred.

The no-JavaScript page retains an ordinary in-flow course-contents disclosure or navigation block so lesson discovery does not depend on the client drawer.

## 2. Responsive readability

Normal prose, headings, table labels, device names, and control labels use normal word-breaking. Long unbroken technical values such as URLs or identifiers may break when necessary, but ordinary words must not split character by character.

The lesson heading uses responsive sizing and a constrained readable line length. It must fit at 360 CSS pixels without horizontal page overflow.

Tables live inside a horizontally scrollable wrapper. Columns receive meaningful minimum widths, allowing the table to scroll rather than crushing words. The wrapper is keyboard reachable and labelled when overflow exists.

Interactive panels stack before their contents become cramped. Controls preserve usable touch targets, and explanation text remains readable at desktop and mobile sizes.

## 3. Reusable packet-journey model

A new `packet-journey` feature provides a presentation model and player for beginner-facing hop-by-hop explanations. It does not perform routing itself. Lesson-specific adapters translate already evaluated routing or switching results into a sequence of immutable journey stages.

Each stage describes:

- a stable stage identifier and short beginner-facing title,
- the active device and interface,
- the active link or boundary,
- the packet's current position,
- visible nested layers,
- the values that changed since the previous stage,
- a concise explanation,
- and optional expandable technical detail.

The visible packet uses nested, labelled layers:

1. **Application data** — the learner's payload.
2. **IP packet** — source IP, destination IP, and TTL.
3. **Ethernet frame** — source MAC and destination MAC.

Only values relevant to the lesson are shown in the primary view. Full field explanations remain available in the technical-detail disclosure.

The journey player owns presentation state only: current stage, play/pause state, playback speed, and completion state. Scenario evaluation remains in the lesson domain. This boundary lets future ARP, switching, routing, NAT, and firewall lessons reuse the visual without duplicating animation logic.

## 4. Playback behavior

Selecting a scenario resets its journey to the first stage and autoplays once. Re-selecting the active scenario does not create an endless restart loop. When the journey reaches the final stage, it stops and exposes Replay.

Controls include:

- Play or Pause,
- Previous stage,
- Next stage,
- Replay,
- and a small set of labelled playback speeds.

Manual navigation pauses autoplay so the learner remains in control. A concise live region announces the stage title but does not narrate every animated pixel or repeatedly read the entire packet.

With `prefers-reduced-motion: reduce`, the player does not autoplay and does not move a packet continuously. It starts on the first static stage; all stages and layer changes remain available through Previous and Next.

If JavaScript is unavailable, the lesson renders a static ordered explanation of the same journey and its key packet changes.

## 5. Router journey

The route-decision player keeps its existing scenario evaluation and uses a route adapter to produce the following visual journeys.

### Remote destination through a router

1. **Build at the source** — application data is wrapped inside an IP packet, then inside an Ethernet frame.
2. **Leave the source** — the frame exits the host's explicitly labelled `eth0` interface and moves toward the router's labelled `LAN` interface.
3. **Open at the router** — the incoming Ethernet wrapper unfolds and is removed. The IP source and destination remain visible; TTL is exposed.
4. **Choose the route** — the router selects its explicitly labelled `WAN` interface and decreases TTL by one.
5. **Build a new frame** — the same IP packet is placed inside a new Ethernet frame with the next link's MAC addresses. The explanation explicitly states that the IP addresses remain unchanged because this lesson is not applying NAT.
6. **Deliver to the destination** — the frame reaches the destination interface, the Ethernet and IP wrappers unfold in order, and the application receives the payload.

The packet marker moves only between adjacent stages. At a device, the packet pauses while the selected layer opens and the changed fields are highlighted. The learner can therefore associate movement, inspection, and rebuilding with a specific hop.

### Other route outcomes

- **On-link destination:** source encapsulation followed by direct delivery; the router is visibly bypassed.
- **Gateway itself:** the journey ends at the router's LAN interface and identifies the router as the IP destination.
- **No usable route:** the packet remains at the source and the final stage explains that no interface or next hop was selected.
- **Local broadcast:** the frame reaches the router boundary and stops; the explanation states that routers do not forward that local broadcast by default.

Interface labels remain visible throughout the journey and are repeated in the corresponding decision summary.

## 6. Switching comparison

The current simultaneous Hub, Bridge, and Switch card grid becomes a single-device comparison. Tabs or equivalent segmented controls select **Hub**, **Bridge**, or **Switch**. Only the selected device's topology, animated path, short explanation, and “What changed?” summary are shown.

The primary explanation answers three questions:

1. What entered the device?
2. Where did it leave?
3. What did the device inspect or learn?

The selected comparison dimension still changes the lesson emphasis, but it no longer forces all three dense diagrams into one row. The existing at-a-glance table remains the concise cross-device comparison and uses the new scrollable table behavior.

Switching animation may reuse the packet-journey presentation primitives, but switching domain rules remain in the switching feature. Hub behavior must show repetition to other ports; bridge and switch behavior must distinguish filtering, forwarding, flooding, and learned location without implying IP routing.

## 7. Component boundaries

### Lesson shell

- `LessonShell` renders the lesson content at full width and supplies curriculum data.
- A client-side `CourseContentsDrawer` owns open/closed state, focus management, dismiss behavior, and the overlay.
- Existing curriculum navigation remains responsible for lesson links, grouping, status, and access labels.

### Packet journey

- Journey types define devices, interfaces, layers, field changes, and stages.
- A playback reducer or controller owns deterministic navigation and timing.
- The visual stage renders topology, interface labels, packet position, nested layers, and changed-field emphasis.
- Controls render accessible playback actions and speed selection.
- A static journey summary supports server rendering and no-JavaScript access.

### Lesson adapters

- The route adapter converts a route-decision result into journey stages.
- The switching adapter converts the selected device and comparison dimension into its simpler path and explanation.
- Adapters do not read protected data. Public routes continue to import only public lesson and scenario modules.

Where practical, the new playback controller will reuse the existing packet-flow reducer and control conventions. Reuse is accepted only when it preserves the explicit stage model; the design does not require forcing incompatible continuous-link animation into the new component.

## 8. State and error handling

- An empty or invalid journey renders a clear unavailable-state message rather than an empty diagram.
- Stage indexes are clamped when scenarios change.
- Timers are cleared on pause, scenario change, unmount, and reduced-motion preference changes.
- Hidden drawer contents cannot receive focus.
- Missing optional technical details do not remove the primary explanation.
- The server-rendered lesson remains useful if the interactive player cannot hydrate.

## 9. Accessibility

- All player and drawer actions are operable by keyboard.
- Touch targets are at least 44 by 44 CSS pixels where layout permits.
- Color is not the sole indication of the active device, packet layer, interface, or changed value.
- SVG diagrams provide an accessible name and a text alternative; decorative motion is hidden from assistive technology.
- Focus indicators remain visible.
- Reduced-motion users receive complete static staged content with no autoplay.
- Animation timing is never required to understand or answer a knowledge check.

## 10. Testing and acceptance criteria

### Unit and component tests

- Drawer open, Close, Escape, backdrop, lesson selection, focus containment, and focus return.
- Playback autoplay-once, pause, previous, next, replay, speed, scenario reset, timer cleanup, and reduced-motion behavior.
- Route adapters produce the correct stages for remote, on-link, gateway-self, no-route, and local-broadcast outcomes.
- Remote routing preserves IP addresses, decrements TTL, and changes the Ethernet wrapper at the router.
- Switching selection renders only one primary device comparison at a time and preserves correct hub, bridge, and switch behavior.
- Static/no-JavaScript summaries contain the essential explanation and image alternative.

### End-to-end tests

- At desktop and 360-pixel mobile widths, the page has no document-level horizontal overflow and ordinary words do not split mid-word.
- The floating contents drawer does not reserve page width and is fully keyboard operable.
- Wide tables scroll inside their wrapper.
- The remote route scenario visibly progresses through source encapsulation, host `eth0`, router `LAN`, router inspection, router `WAN`, reframing, and destination delivery.
- Manual controls change the displayed stage and packet layers.
- Reduced motion disables autoplay while preserving stage navigation.
- Public lesson content remains readable without JavaScript.
- Protected account scenarios and Pro-only material do not appear in public HTML or public client payloads.

## 11. Delivery scope

The implementation plan will cover:

1. responsive wrapping and table fixes,
2. the floating course-contents drawer,
3. reusable packet-journey types, playback, visuals, and static fallback,
4. route-decision integration with labelled interfaces and all five outcomes,
5. simplified single-device switching comparison,
6. accessibility and regression tests.

Authentication, learner dashboards, payment, production deployment, NAT animation, and redesigning every previously published interactive lesson are outside this delivery. Future lessons may adopt the packet-journey component incrementally.
