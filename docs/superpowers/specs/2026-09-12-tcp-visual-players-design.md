# TCP visual players design

## Purpose

Replace the TCP connection player's abstract middle card with an animated client/server sequence diagram, and separate sliding-window learning from loss recovery. Keep Packetsecrets' dark, teal-accented design and current playback controls.

## Connection sequence

The current TCP scenarios remain selectable. Show two endpoint lifelines and one chronological arrow per packet-bearing step; highlight and animate the active arrow. Non-packet terminal steps highlight the endpoint states without displaying “No packet crossing.” The graceful-close scenario must show FIN, ACK, FIN, ACK with sequence/acknowledgement values and state changes. A FIN consumes one sequence number. Respect reduced-motion preference.

## Sliding-window player

The existing `interactive-tcp-window` section becomes normal delivery only. Its diagram shows an ordered byte strip with distinct sent-and-acknowledged, sent-but-unacknowledged, and waiting categories, plus the current send-window band and three pointers: left edge, next byte to send, right edge. Animate segment sends and cumulative ACKs. Do not mix SACK or fast retransmit into this player.

## Fast retransmit and SACK player

Add a new `interactive-fast-retransmit` section with its own progress item. A two-lane time diagram shows a missing segment followed by three later arrivals, three duplicate ACKs, retransmission of the gap, and a cumulative ACK that advances when the gap closes. The packet-flow animation follows the selected step. In the same view, show receiver-held out-of-order bytes and the SACK block left/right edges. Explain that the right edge is exclusive, SACK blocks are optional negotiated reports, and they do not change the cumulative ACK. Keep `cwnd` separate from the sender/receiver sliding-window lesson; no simplified congestion-window growth claim is required.

## Data, accessibility, and progress

Use deterministic authored steps and preserve the existing TCP-window progress item for normal delivery. Add a new fast-retransmit interactive item and a forward-only SQL migration that registers it and recalculates attempt summaries without removing historical events. Update catalogue, MDX, manifests, tests, and styles. Use accessible labels, live step text, keyboard-operable controls, mobile layout, and reduced-motion handling.

## Sources

- [RFC 9293](https://www.rfc-editor.org/rfc/rfc9293.html): TCP sequence numbers, FIN and closing states.
- [RFC 5681](https://www.rfc-editor.org/rfc/rfc5681.html): three duplicate ACKs and fast retransmit.
- [RFC 2018](https://www.rfc-editor.org/rfc/rfc2018.html): SACK-Permitted, SACK blocks, left edge and exclusive right edge.
