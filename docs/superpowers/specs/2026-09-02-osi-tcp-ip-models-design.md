# OSI and TCP/IP Models Lesson Design

## Goal

Publish a beginner-friendly lesson that relates the OSI and TCP/IP models to a real browser-to-server exchange and teaches encapsulation, decapsulation, device scope, packet inspection, and interview reasoning without duplicating the two existing packet-journey lessons.

## Lesson structure

1. Why layered models exist
2. The seven OSI layers
3. The four-layer TCP/IP model
4. OSI-to-TCP/IP mapping
5. Interactive encapsulation and decapsulation
6. What each network device examines
7. Wireshark layer identification
8. Troubleshooting and interview scenarios
9. Knowledge check and summary

The catalogue objective remains: “Relate common network tasks to the OSI and TCP/IP models.” The lesson is free, approximately 18 minutes, and becomes the third published lesson in Networking Essentials.

## Teaching approach

Teach the two models side by side rather than as separate memorization lists. Anchor every layer to one example: a browser request sent from a host to a server. Explain that the models are reasoning tools and that real implementations do not always align perfectly with one OSI layer.

Use precise protocol examples without teaching future modules prematurely:

- Application: HTTP, DNS, DHCP
- Transport: TCP, UDP, ports
- Internet/network: IPv4 and routing
- Network access/data link: Ethernet, Wi-Fi, MAC addresses, frames
- Physical: signals and bits

## Interactive experience

The main visualization shows two synchronized stacks: seven OSI layers and four TCP/IP layers. A learner can play, pause, restart, move previous/next, and select 0.5×, 1×, 1.5×, or 2× speed.

During encapsulation, application data moves down the sender stack and gains transport, IP, and frame information. The visible protocol data unit changes through Data → Segment → Packet → Frame → Bits. During decapsulation, the order reverses at the receiver. Each step includes a plain-language explanation and expandable technical details.

The experience must:

- start automatically unless reduced motion is requested;
- start paused for reduced motion and use discrete transitions;
- preserve keyboard access and visible focus;
- expose the active layer and current protocol data unit in text, not color alone;
- work in light, dark, and system themes;
- render a useful static explanation without JavaScript.

## Device-layer mapping

A separate compact comparison uses the shared Packetsecrets symbols:

- Host/server: all layers
- Layer 2 switch: primarily Physical and Data Link / Network Access
- Router: Physical, Data Link, and Network / Internet
- Firewall: scope depends on design; introduce packet, transport, and application-aware inspection without teaching policy configuration yet

The wording must say “commonly examines” rather than implying that every device is limited permanently to one layer.

## Practical checks

The Wireshark section teaches learners to connect visible fields to layers using a capture containing Ethernet, IPv4, TCP, and HTTP or TLS. It includes these filters and fields:

- Filters: `eth`, `ip`, `tcp`, `udp`, `dns`, `http`, `tls`
- Fields: `eth.src`, `eth.dst`, `ip.src`, `ip.dst`, `tcp.srcport`, `tcp.dstport`

The troubleshooting section follows a bottom-up check: link, local delivery, IP path, transport reachability, and application behavior. Interview practice requires learners to explain encapsulation and compare the two models without reciting layer names only.

## Boundaries

- Do not deeply teach TCP handshakes, DNS resolution, TLS negotiation, VLANs, routing protocols, NAT, or firewall policy; those remain later lessons.
- Do not claim that switches, routers, or firewalls inspect only one fixed layer.
- Do not add a new animation framework or external dependency.
- Reuse the existing accessibility, playback, theme, lesson navigation, shared device-symbol, knowledge-check, Wireshark, and interview-scenario patterns.

## Validation

- Unit tests cover the layer mapping, encapsulation step sequence, controls, reduced motion, and accessible text.
- Content tests cover the nine approved sections, practical filters, and the absence of invalid nested paragraphs.
- Route and navigation tests confirm the lesson is published and linked.
- End-to-end coverage confirms playback, responsive layout, theme compatibility, no horizontal overflow, and no hydration or console errors.

