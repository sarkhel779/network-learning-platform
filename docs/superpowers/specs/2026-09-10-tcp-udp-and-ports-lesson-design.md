# TCP, UDP and Ports Lesson Design

## Purpose

Add the next Networking Foundations lesson, **TCP, UDP and Ports**, as a packet-first beginner lesson that explains how transport protocols identify applications, establish and manage delivery, and react to common outcomes. The lesson should prepare learners for later routing and application-service material without turning into a full transport-protocol engineering course.

## Approved product decisions

- Publish one lesson at `/learn/networking-foundations/tcp-udp-and-ports`.
- Use two focused interactive players instead of one large simulation.
- Keep all twelve conceptual sections and both players public.
- Gate the guided inspection, diagnosis, troubleshooting, and knowledge checks behind the existing account boundary.
- Keep advanced transport mechanics in the existing Pro-preview pattern.
- Reuse the established autoplay, manual playback, speed, reduced-motion, inspector, responsive-layout, and progress conventions.
- Do not alter authentication or the broader Supabase integration in this feature.

## Learning outcomes

By the end of the public lesson, a learner should be able to:

1. Explain why IP addressing alone cannot select the correct application on a host.
2. Distinguish a TCP segment from a UDP datagram at a useful beginner level.
3. Read source and destination ports as part of a transport conversation.
4. Explain sockets and multiplexing without treating a port as a physical connector.
5. Follow a TCP connection from handshake through data transfer and closure or failure.
6. Describe sequencing, acknowledgements, retransmission, duplicate handling, and receive-window flow control.
7. Compare TCP and UDP using application requirements rather than slogans such as “TCP is slow” or “UDP is unreliable.”
8. Recognize a compact set of common service ports and distinguish them from ephemeral client ports.

## Lesson architecture

The public lesson contains these ordered sections:

1. Why transport protocols exist
2. Segments, datagrams, ports, and sockets
3. Source and destination ports, multiplexing, and demultiplexing
4. TCP and UDP header essentials
5. Interactive Player 1: TCP Connection Journey
6. Sequence numbers, acknowledgements, and ordered delivery
7. Loss, retransmission, and duplicate handling
8. Flow control and the receive window
9. Graceful closure and reset behavior
10. Interactive Player 2: TCP vs UDP and Port Delivery
11. Common service ports and ephemeral ports
12. Choosing TCP or UDP carefully

The account continuation contains:

- guided packet and command inspection;
- a guided diagnosis exercise;
- a methodical transport-troubleshooting section; and
- three knowledge checks.

The Pro preview names, but does not teach in the public lesson:

- congestion control;
- window scaling;
- selective acknowledgements;
- QUIC;
- NAT and socket edge cases; and
- deeper packet and performance analysis.

## Public content principles

The prose begins with one packet journey and introduces vocabulary only when the learner needs it. Every technical term receives a plain-language explanation before compact technical detail.

TCP coverage includes sequence and acknowledgement numbers, the relevant flags, ordered delivery, retransmission, receive-window flow control, graceful closure, and reset behavior. It does not imply that acknowledgement of data is the same as application-level success.

UDP coverage emphasizes its connectionless message delivery and smaller transport contract. The lesson must not promise that UDP is always faster, that TCP is always slow, or that UDP applications cannot implement reliability themselves.

The public common-port set is intentionally compact:

| Service | Port information to introduce |
| --- | --- |
| HTTP | TCP 80 |
| HTTPS | TCP 443, while noting modern HTTP can also use QUIC over UDP |
| DNS | UDP or TCP 53 depending on the exchange |
| DHCP | UDP 67 and 68 |
| SSH | TCP 22 |
| SMTP | TCP 25 as the foundational server-to-server port |
| NTP | UDP 123 |

The lesson treats these as recognizable defaults, not immutable rules. Deeper port memorization belongs in gated or later material.

## Interactive Player 1: TCP Connection Journey

### Goal

Show how both endpoints' state and transport fields change together over the lifetime of a TCP connection.

### Scenarios

The selector offers:

1. successful three-way handshake;
2. application data transfer;
3. lost segment followed by retransmission;
4. graceful connection close;
5. connection refused with a reset; and
6. connection attempt timeout.

### Synchronized evidence

Every visible step updates the same evidence model:

- sender and receiver direction;
- SYN, ACK, FIN, or RST flags where applicable;
- simplified sequence and acknowledgement numbers;
- endpoint connection state;
- active topology link and packet marker;
- plain-language conclusion; and
- expandable technical inspection.

Sequence values may be simplified for teaching, but their arithmetic must remain internally consistent. Retransmission reuses the lost data's sequence range. A duplicate must not appear as newly accepted application data.

### Playback

The first scenario autoplays once. Scenario changes restart the selected journey. Previous, Play/Pause, Next, Restart/Replay, and speed controls follow the existing player conventions. Reduced-motion mode shows discrete state changes without depending on animated movement.

## Interactive Player 2: TCP vs UDP and Port Delivery

### Goal

Combine protocol comparison with the host's port/socket/application selection so learners can see why delivery to an IP address is not the end of the decision.

### Journeys

The player includes representative journeys for:

- a TCP application with a listening socket;
- a UDP application with a receiving socket;
- two client conversations using different ephemeral source ports;
- a TCP destination port with no listener; and
- a UDP destination port with no listener.

The no-listener journeys must distinguish common outcomes without promising that a response always appears: TCP commonly returns RST when the host is reachable and the port is closed; UDP may produce an ICMP port-unreachable response or may remain silent because of host, firewall, or network policy.

### Synchronized evidence

Each step shows:

- protocol;
- source IP and port;
- destination IP and port;
- the complete protocol/IP/port tuple appropriate to the example;
- compact TCP or UDP header fields;
- matching socket or absence of a listener;
- selected application, if any; and
- an outcome explanation.

The comparison should communicate trade-offs in delivery contract, ordering, recovery, overhead, application responsibility, and latency sensitivity. It should not reduce protocol choice to a single speed or reliability label.

## Component and data boundaries

Create a dedicated transport feature area rather than embedding scenario logic in MDX. Expected boundaries are:

- validated TCP journey data and a journey builder;
- validated port-delivery comparison data;
- focused presentational components for topology, transport header, socket selection, endpoint state, and conclusion;
- two client player shells that share the established playback primitives; and
- thin lesson experience components imported by the public MDX.

Scenario data is the source of truth. Visual labels, inspector output, and learner conclusions must derive from that data so they cannot silently disagree.

Validation must fail closed. Invalid scenario data must render a safe explanatory fallback and must not autoplay, advance, or record completion.

## Access and progress behavior

- Anonymous learners can read all twelve public sections and complete both public players.
- Account-only content uses the existing registration boundary and must not be server-rendered into anonymous HTML.
- Each player records progress only after the learner reaches a visible terminal state.
- Changing scenarios, viewing an intermediate frame, or merely mounting a player does not count as completion.
- Any submitted knowledge-check answer counts as an attempt, including an incorrect answer; correctness remains a separate result.
- Progress manifest and migration entries must be stable and idempotent.
- Existing learner controls, pending-save reliability, resume behavior, and next-incomplete navigation remain intact.

## Accessibility and responsive behavior

- All scenario and playback controls are keyboard operable and meet the established minimum touch-target size.
- State is conveyed with text and structure, never colour alone.
- Live announcements describe intentional scenario changes and completed steps without narrating every animation frame.
- Diagrams expose meaningful text alternatives and labelled interfaces.
- Inspector tables and transport tuples remain inside their containers on narrow screens.
- Mobile layouts preserve the reading order: explanation, visualization, controls, evidence, conclusion.
- Reduced-motion behavior is deterministic and retains every instructional state.

## Error and edge-case behavior

- Unsupported or malformed scenario identifiers select no journey and show a safe fallback.
- Missing steps, inconsistent sequence arithmetic, impossible state transitions, duplicate IDs, and invalid ports are rejected by schema or model tests.
- Playback never advances beyond the last step and Replay returns to the first step.
- Switching scenarios clears stale state, announcements, inspection detail, and terminal completion state.
- A no-listener outcome must be described as an observed or representative result, not an unconditional protocol guarantee.

## Verification strategy

Implementation is complete only after verifying:

1. journey schemas and builders reject invalid TCP state, flag, sequence, acknowledgement, and port combinations;
2. every approved scenario reaches the intended terminal outcome;
3. topology, headers, socket selection, endpoint states, inspector, and conclusion stay synchronized at every step;
4. autoplay, manual navigation, replay, speeds, and reduced motion work for both players;
5. keyboard operation, labels, announcements, non-colour cues, focus behavior, and mobile containment;
6. terminal-only progress recording and idempotent migration behavior;
7. public/account/Pro access boundaries and anonymous server-rendering behavior;
8. catalog publication, curriculum navigation, sitemap, and lesson metadata;
9. content accuracy tests for the public and account MDX;
10. focused tests, TypeScript validation, linting, the complete test suite, and a production build.

## Deferred scope

This lesson does not implement or deeply teach congestion-control algorithms, congestion windows, slow start, fast recovery, window scaling, SACK negotiation, QUIC internals, NAT traversal, socket programming APIs, TLS internals, or exhaustive service-port memorization. Authentication fixes and new learner-workspace tools also remain separate work.
