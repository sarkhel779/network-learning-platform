# TCP and UDP lesson split

## Goal and scope

Replace the combined “TCP, UDP and Ports” lesson with two consecutive lessons in Networking Foundations. TCP receives the deeper treatment requested by the learner: MSS, window scaling, sliding-window mechanics, SACK-permitted/SACK blocks, and fast retransmit. UDP remains a focused, independently understandable lesson. Preserve existing TCP learning evidence and old bookmarks without claiming that the learner has completed newly added material.

## Catalogue and navigation

Keep the existing `lesson_tcp_udp_and_ports` stable ID for the new TCP lesson, but give it a TCP-specific title and canonical slug. Insert a new UDP lesson immediately afterward with a distinct lesson ID and slug. Both briefly explain ports and socket identity so either lesson makes sense when opened directly. The old `/learn/networking-foundations/tcp-udp-and-ports` URL redirects to TCP. Retained TCP section anchors should continue to work; old UDP-only anchors should resolve to their new UDP counterparts where an explicit mapping exists, with a safe TCP fallback otherwise. Update catalogue metadata, content imports, sitemap/static route expectations, and pathway navigation together.

## TCP learning design

Teach the TCP segment header and the connection lifecycle before advanced mechanisms. Show the SYN/SYN-ACK exchange negotiating MSS, Window Scale, and SACK-Permitted, with a clear distinction between an advertised capability and a later option in use. MSS is the maximum TCP payload per segment, not the path MTU or the whole IP packet. Window Scale expands the interpretation of the advertised receive window and is negotiated on SYNs. Keep receive-window flow control distinct from congestion control.

An interactive packet-and-byte timeline is the main explanation for sliding windows and loss recovery. Label the sender's left edge (oldest unacknowledged byte), next byte to send, and right edge (current send limit). As ACKs arrive, animate the left edge and resulting send opportunity. A loss scenario leaves a gap while later segments arrive: repeated cumulative ACKs expose the gap, three duplicate ACKs trigger a fast retransmission in the teaching scenario, and the repaired gap lets the cumulative ACK advance. A timer-based retransmission remains a separate scenario so learners do not assume fast retransmit always happens.

On that same scenario, show the SACK-Permitted exchange followed by SACK blocks for out-of-order received data. A block's left edge is its first byte and its right edge is the byte *after* its last byte. Label these as SACK block edges, visually distinct from the send-window edges. Show how a SACK report helps the sender avoid retransmitting data already received, while the ordinary cumulative ACK still marks the next missing byte. Include sequence-number arithmetic, FIN/RST behavior, practical packet inspection, and checks that ask learners to identify the gap, the SACK block, and the retransmission trigger. Offer play/pause, step, replay, reduced-motion handling, and a text explanation of every state.

## UDP learning design

Teach the compact UDP header, datagram boundaries, source/destination ports, checksum/length, socket delivery, and the absence of built-in connection setup, ordered delivery, or retransmission. Reuse or adapt the existing port-delivery player for UDP-specific cases: successful listener, two client conversations, closed destination with possible ICMP Port Unreachable, and silence that does not prove a single cause. Ground examples in DNS and DHCP without duplicating their full lessons. Include an inspect/diagnose exercise and knowledge checks. Explain that applications can implement their own recovery or session behavior above UDP; avoid blanket “UDP is faster” claims.

## Access and progress

Retain the site's existing public/account/Pro section pattern. Keep item IDs for TCP material that remains in TCP, including the existing TCP connection player, so historical completions continue to match. New TCP sections and checks receive new IDs. UDP receives a new manifest and its own progress record; do not silently copy completions from the old combined record into it. Existing completed TCP items remain completed, but overall TCP completion may fall below 100% when the new required items are introduced. The UI should reflect that honestly, without resetting the attempt. Any old combined-lesson UDP item IDs can remain stored as historical events but do not count toward the new TCP manifest.

## Implementation boundaries and verification

Follow the current catalogue → MDX content loader → lesson route → progress manifest pattern. Keep lesson-specific interactive state isolated from the shared player framework; prefer a focused TCP byte-window player or extension over changing unrelated protocol players. Update relevant content, catalogue, route, progress, and rendering tests. Verify canonical links and legacy redirect, section/access alignment, preserved TCP item IDs, new UDP manifest, all packet-step arithmetic, keyboard controls, reduced motion, and mobile layout. Run the affected tests, typecheck, and a browser review of both lessons and the old URL.

## Protocol sources

- [RFC 2018](https://www.rfc-editor.org/rfc/rfc2018.html): SACK-Permitted and SACK block edges.
- [RFC 5681](https://www.rfc-editor.org/rfc/rfc5681.html): fast retransmit using three duplicate ACKs in the teaching scenario.
- [RFC 7323](https://www.rfc-editor.org/rfc/rfc7323.html): Window Scale negotiation and receive-window interpretation.
