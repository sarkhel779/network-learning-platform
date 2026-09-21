# Hosts, Clients and Servers Lesson Restructure Design

**Date:** 2026-09-21  
**Status:** Approved conversational design, pending written-spec approval  
**Course:** Networking Foundations  
**Module:** Computer Network Basics  
**Lesson:** 2 — Hosts, Clients and Servers  
**Stable slug:** `hosts-and-network-devices`

## Purpose

Restructure the second Computer Network Basics lesson into a focused introduction to hosts and to client/server application roles. The lesson is for complete beginners who have finished **Introduction to Computer Networks and Network Devices** but have not yet studied hubs, bridges, switches, routers, addressing, or layered models in depth.

The lesson must answer four beginner questions:

1. What makes a device a network host?
2. What is a network interface?
3. What do client and server mean?
4. Can one host perform more than one role?

Success means that a learner can identify a host, distinguish a host from an application role, and explain a simple request-and-response conversation without needing switching, routing, DNS, ARP, port, or packet-header knowledge.

## Scope

### Included

- A beginner definition of a host.
- Familiar examples: computers, laptops, phones, printers, physical servers, cloud servers, and similar endpoints.
- A short introduction to wired and wireless network interfaces.
- Client and server as application roles rather than permanent hardware types.
- The fact that one host can act as a client, a server, or both across different conversations.
- Three selectable animated request-and-response scenarios.
- A short role-classification activity where it improves comprehension.
- A concise summary and knowledge checks.
- Quiz-only lesson completion.

### Excluded from the visible lesson

- Windows command output and command-line troubleshooting.
- Wireshark filters and packet-capture analysis.
- ARP mechanics and cache investigation.
- Local-versus-remote subnet decisions.
- Switch forwarding, routing tables, gateways, firewall policy, NAT, DNS, transport ports, and detailed headers.
- Interview-level troubleshooting challenges.

Existing advanced components, scenario data, and authored material remain in the repository. They are not deleted and may be reused in later, appropriately scoped modules.

## Relationship to Lesson 1 and Later Lessons

Lesson 1 introduces networks, broad device categories, and common host examples. Lesson 2 must not repeat the complete host gallery or the device-role tour. Instead, it takes the next conceptual step: familiar hosts run applications, and those applications take roles during a conversation.

Later lessons own device-specific and protocol-specific depth:

- Hubs, bridges, switches, and routers receive separate introductory lessons.
- Physical and logical addressing explains MAC and IP addresses.
- OSI and TCP/IP Models introduces layered responsibilities.
- Later modules teach Ethernet forwarding, ARP, routing, DNS, transport, troubleshooting, and packet inspection.

## Lesson Structure

The visible lesson follows this order:

1. **What is a host?**
   - A host sends, receives, or processes network data.
   - Device shape does not determine host status; network participation does.
   - Examples are concise and refer back to Lesson 1 rather than recreating its gallery.

2. **Network interfaces**
   - An interface is a host's connection point to a network.
   - Ethernet and Wi-Fi are introduced as familiar wired and wireless examples.
   - One host may have multiple interfaces.
   - Detailed addressing and link behavior are explicitly deferred.

3. **Clients and servers**
   - A client application requests a service.
   - A server application provides a service and responds.
   - The words describe application roles, not the size, price, or permanent identity of a device.

4. **Interactive host-role player**
   - Three selectable request-and-response conversations.
   - Synchronized topology, role labels, animation, and explanation bubble.

5. **One host, multiple roles**
   - A host can run multiple applications.
   - Roles can change between conversations.
   - The file-sharing example demonstrates role reversal.

6. **Classify host roles**
   - Short examples ask whether an application is acting as a client, server, or both.
   - Immediate explanations clarify the reasoning.

7. **Knowledge check and summary**
   - Questions cover the lesson's introductory concepts only.
   - All required quiz questions must be answered correctly for lesson completion.

## Interactive Host-Role Player

### Scenarios

The player offers exactly three beginner-friendly scenarios:

1. **Open a website**
   - A browser on a laptop requests a page.
   - A web service on a server responds with the page.

2. **Send a print job**
   - A print application on a laptop requests printing.
   - A network printer provides the printing service and returns status.

3. **Share a file**
   - Computer A requests a shared file from Computer B.
   - Computer B serves the file.
   - A second conversation reverses the direction to demonstrate that the same computer can be a client in one conversation and a server in another.

The player describes application roles accurately. It does not imply that an entire computer is permanently a client or permanently a server.

### Visual Language

- Reuse the exact device-symbol implementation already used by Lesson 1.
- Reuse the Lesson 1 laptop, workstation/desktop, printer, server, and packet symbols rather than creating parallel icons.
- The active application role is shown with both a visible role label and an active visual treatment.
- Inactive endpoints are subdued but remain readable.
- A compact explanation bubble appears above the device currently being explained.
- The packet follows the connection line continuously; it does not jump between endpoints.
- Request and response directions are visually and textually distinguishable.
- The player must work in both light and dark themes.

### Initial and Reset State

- The topology and scenario controls are visible before playback.
- No explanation bubble appears before the learner selects **Play**.
- No packet animation starts automatically.
- Switching scenarios resets the newly selected scenario to its untouched state.
- Restart before Play remains paused and does not reveal the bubble.
- Restart after playback returns to the first step without corrupting role state.
- Selecting the already-active scenario is a no-op and does not hide information or restart playback unexpectedly.

### Playback

- Reuse the established Previous, Play/Pause, Next, Restart, and playback-speed controls.
- One normal-speed packet traversal lasts 1.5 seconds.
- The request travels from the requesting application to the service application.
- The response travels back along the same connection.
- The active client glows during the request step while the server is subdued.
- The active server glows during the response step while the client is subdued.
- The explanation bubble follows the active endpoint.
- The file-sharing scenario adds the approved role-reversal sequence while preserving the same control model.
- Reduced-motion users receive the same ordered state changes without required moving animation.

### Scenario State

Changing scenarios must update all dependent information together:

- endpoint names;
- device icons;
- client and server role labels;
- request and response copy;
- animation direction;
- current step;
- active and subdued endpoint states; and
- accessible status text.

No state from the previous scenario may remain visible after a scenario switch.

## Content and Access

- The beginner lesson remains available as free content.
- The public content contains the full introductory teaching path and the player.
- The stable slug and existing course-navigation position remain unchanged.
- Catalog title remains **Hosts, Clients and Servers**.
- The visible section headings and catalog section metadata remain synchronized.
- Advanced account content is disconnected from this lesson without deleting its reusable source code or data.

## Completion Rule

Interactive playback, scenario selection, manual navigation, and role-classification practice do not mark the lesson complete.

The lesson completes only when the learner answers every required knowledge-check question correctly. Incorrect attempts may be recorded according to the existing progress model, but they must not count as completion. No visible Continue, Retry Saving, progress-percentage, or Restart Lesson controls are introduced.

## Architecture

### Content

The public MDX file owns the complete beginner narrative and embeds the focused player and practice. The lesson-content repository stops loading an account-only block for this lesson. The current advanced account MDX is moved to a non-rendered reference location so its authored material remains in source control, while its reusable components and data remain in their existing source folders.

### Interactive Component

Create or adapt a focused lesson-specific wrapper for the three host-role scenarios. Reuse the established packet-flow playback primitives and Lesson 1 device-symbol rendering where they fit cleanly. Do not expand the generic player with host-role-only concepts when a small wrapper or data adapter provides a clearer boundary.

### Scenario Data

Keep scenario definitions outside MDX and validate them before rendering. Each scenario must provide:

- a stable scenario identifier;
- endpoint identifiers and device-symbol types;
- application-role labels;
- ordered request and response steps;
- explanation copy;
- packet direction and duration; and
- role-reversal metadata where applicable.

The component must fall back to clear static teaching content if scenario validation fails. A broken scenario must never display another scenario's labels or steps.

### Preserved Advanced Work

Existing advanced host/device data, topology explorer code, Windows guidance, Wireshark guidance, and troubleshooting material remain available in the repository. Implementation should avoid destructive deletion unless a file is proven unused and its useful content is preserved elsewhere. Keeping code does not mean exposing it in the beginner lesson bundle or interface when it is unnecessary.

## Accessibility and Responsive Behavior

- Scenario choices and playback controls use native keyboard-operable controls.
- Every endpoint and role has an unambiguous accessible name.
- Status announcements describe meaningful step changes without announcing animation frames.
- Active state never relies on colour alone; text labels and visual emphasis are paired.
- Focus indicators remain visible.
- Reduced-motion preference preserves manual navigation and conceptual sequencing.
- The topology, bubble, controls, labels, and summary fit at 320px without horizontal page overflow.
- On narrow screens, controls wrap and the topology reflows without shrinking essential labels below readable size.
- The explanation bubble remains associated spatially with the endpoint it describes and does not cover device labels.

## Testing Strategy

### Content and catalog

- Assert the stable lesson slug, title, objective, publication status, and position after Lesson 1.
- Assert that catalog section metadata matches explicit MDX heading IDs.
- Assert that advanced troubleshooting and capture material is absent from the rendered beginner lesson.
- Assert quiz-only completion boundaries.

### Scenario data

- Validate all three scenarios and their stable endpoint and step identifiers.
- Assert every request has a corresponding response.
- Assert file sharing contains a genuine role reversal.
- Assert icons, labels, packet direction, and active roles agree for every step.

### Component behavior

- Verify the untouched state has no bubble and no autoplay.
- Exercise every scenario and request/response direction.
- Verify continuous 1.5-second normal-speed travel along the connection.
- Verify active glow, inactive subdued state, and bubble placement.
- Verify Previous, Play/Pause, Next, Restart, speed selection, and final-step boundaries.
- Verify scenario switching resets all state and active-scenario reselection is a no-op.
- Verify reduced motion and keyboard navigation.
- Verify player interaction does not complete the lesson.

### Regression and visual checks

- Run Lesson 1 device-role and shared packet-player tests.
- Confirm exact Lesson 1 device symbols are reused.
- Review desktop, light-theme, dark-theme, and mobile previews.
- Verify no relevant console errors or horizontal overflow.
- Run the full unit suite, type checking, linting, and production build.

## Delivery Workflow

1. Work in the isolated `feature/hosts-clients-servers` branch.
2. Add failing tests before changing lesson behavior.
3. Implement content and player in small verified steps.
4. Preserve advanced reusable source while removing it from the visible lesson.
5. Show a working local preview for user approval.
6. Commit and push only after preview approval.
7. Create a separate pull request for this lesson.

## Acceptance Criteria

The lesson is ready when a complete beginner can:

- explain what makes a device a host;
- describe a network interface without requiring addressing knowledge;
- identify client and server as application roles;
- follow request and response directions in all three scenarios;
- explain how one computer can serve and request data in different conversations; and
- complete the lesson only by answering all required quiz questions correctly.

The player must use Lesson 1's real device symbols, start only after Play, move packets continuously in 1.5 seconds at normal speed, remain accessible and responsive, and pass all automated and visual verification without regressing Lesson 1.
