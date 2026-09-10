# HTTP, HTTPS and Essential Network Services Lesson Design

**Date:** 2026-09-11  
**Status:** Approved in conversation; awaiting written-spec review  
**Pathway:** Networking Foundations  
**Lesson slug:** `http-https-tls-and-essential-network-services`

## Purpose

Publish one substantial lesson that teaches the essential application services a network practitioner encounters. HTTP/HTTPS, remote access, email, file transfer, time synchronization, and network management receive comparable instructional depth. SSL/TLS is introduced only far enough to explain HTTPS and secure service variants because a later dedicated module will cover TLS handshakes and cryptography deeply.

The lesson must remain approachable despite its breadth. Learners can enter any service chapter from a networking-themed map rather than reading one long forced sequence.

## Scope

The six service families are:

1. HTTP and HTTPS
2. SSH and Telnet
3. SMTP, IMAP, and POP3
4. FTP, FTPS, and SFTP
5. NTP
6. SNMP

DNS and DHCP may appear as dependencies in packet journeys but are not retaught. LDAP, SMB, and deep SSL/TLS analysis are outside this lesson.

## Learning outcomes

After completing the lesson, learners can:

- associate every covered protocol with its common ports and transport;
- describe the end-to-end request, response, session, or polling flow;
- interpret the important fields in representative protocol messages;
- distinguish insecure, encrypted, and differently designed secure alternatives;
- infer likely causes from observable symptoms and packet evidence;
- use Wireshark-style conversations and RFC constraints in advanced analysis;
- explain why SSL is obsolete and where TLS fits without treating this lesson as the dedicated TLS module.

## Information architecture

### Open service chapters

All six chapters are directly accessible and do not unlock sequentially. Each chapter has a stable anchor so learners can link to it, resume it, or return to it after signing in.

The shared chapter rhythm is:

1. purpose and real-world use;
2. ports and transport;
3. message or header anatomy;
4. animated packet traversal;
5. security and protocol alternatives;
6. failure symptoms and troubleshooting;
7. an immediate knowledge check.

### Service-station map

The lesson uses the approved DNS `Page contents` interaction as its starting pattern, adapted into a service-station map with Web, Remote Access, Email, File Transfer, Time, and Monitoring nodes.

- The compact rectangular `Page contents` control expands and collapses the map.
- Opening it remounts the route animation so the packet travels every time.
- Each node links to its stable chapter anchor.
- Account and Pro destinations remain clickable when locked and redirect to sign-in while preserving the exact lesson anchor.
- Pro destinations retain an explicit `Pro` label.
- Reduced-motion users see immediate route-state changes without travel animation.
- The layout must wrap cleanly on narrow screens without horizontal page overflow.

## Tier design

### Public tier

Every service family includes meaningful instruction rather than a teaser.

#### HTTP and HTTPS

- URL components and the relationship between DNS, TCP, HTTP, and the application;
- methods, request targets, headers, bodies, responses, and common status-code classes;
- persistent connections, redirects, and basic caching behavior;
- ports 80, 443, and common alternate development port 8080;
- HTTPS as HTTP protected by TLS;
- a brief certificate-trust and encryption explanation;
- SSL identified as obsolete and unsuitable as the modern generic name for TLS.

#### SSH and Telnet

- interactive remote access and command execution;
- TCP ports 22 and 23;
- session establishment and client/server message flow;
- SSH encryption, authentication, and host identity at an introductory level;
- why Telnet exposes content and credentials and where its behavior may still appear in labs or legacy devices.

#### Email services

- SMTP submission, server relay, and delivery separated from mailbox retrieval;
- IMAP synchronization versus POP3 download behavior;
- TCP ports 25, 465, 587, 143, 993, 110, and 995 with accurate roles;
- envelope information distinguished from visible message headers;
- commands, replies, state changes, and common authentication/security expectations.

#### File transfer

- FTP control and data channels;
- TCP port 21, active-mode port 20 behavior, and passive-mode negotiated data ports;
- active/passive traversal and the effect of firewalls and NAT;
- FTPS distinguished from SFTP;
- SFTP described as an SSH subsystem commonly using TCP 22, not as secure FTP.

#### NTP

- UDP port 123 and client/server exchange;
- the four timestamps used to reason about delay and offset;
- strata, reference clocks, drift, and synchronization quality at foundation depth;
- why incorrect time affects authentication, logging, certificates, and incident analysis.

#### SNMP

- manager, agent, managed object, MIB, and OID;
- polling on UDP 161 and notifications on UDP 162;
- Get, GetNext/GetBulk, Set, Response, Trap, and Inform roles;
- security limitations of community strings and the reason to prefer SNMPv3.

Every knowledge check gives an explanation immediately after submission. An attempt counts as completed even if the selected answer is wrong; correctness and confidence remain separate signals.

### Free-account tier

Each service family receives:

- a controllable packet-journey player using the site's consistent Previous, Play/Pause, Next, Restart, and playback-speed controls;
- a field-by-field protocol message inspector;
- port and transport identification practice;
- a symptom-to-diagnosis troubleshooting exercise;
- retry and simplified-explanation states;
- learner progress, resume, next-incomplete, and restart support.

Where the educational-team chat entry point is available in the product, the chapter exposes it after an explanation so an underconfident learner can request help without losing context.

### Pro tier

Each service family receives both of the following, with service-specific evidence rather than generic placeholders:

- a Wireshark-style capture/conversation analysis;
- an RFC-level behavior or malformed-message validation exercise.

Advanced scenarios include:

- HTTP caching, redirects, proxies, connection reuse, and invalid framing or header behavior;
- SSH algorithm negotiation, host-key reasoning, and authentication failures;
- SMTP relay, delivery, reply-code, and authentication failures plus IMAP/POP3 state errors;
- FTP active/passive firewall and NAT failures and secure-variant confusion;
- NTP strata, clock selection, offset/delay calculation, drift, and invalid timestamp reasoning;
- SNMPv3 security, OID/table traversal, request identifiers, error status, and trap/inform diagnosis.

TLS capture content remains introductory: learners may recognize that TLS protects a service and locate the transition from transport establishment to encrypted application data, but detailed handshake messages, cipher negotiation, key derivation, and cryptography stay reserved for the separate SSL/TLS module.

## Component architecture

The lesson should prefer typed data and shared components over six bespoke players:

- `ServiceStationMap` renders open chapter navigation and tier-aware destinations.
- `ServiceJourneyPlayer` renders ordered endpoints, links, packets, captions, and playback state.
- `ProtocolMessageInspector` renders message groups and field explanations.
- `PortTransportPanel` renders port, transport, direction, security, and role facts.
- `ServiceTroubleshootingLab` renders evidence, answer choices, immediate feedback, confidence, retry, and completion.
- `CaptureAnalysisLab` renders Pro capture rows, filters, conversation context, and evidence questions.
- `RfcValidationLab` renders Pro claims or messages and explains the relevant protocol constraint.

Protocol-specific scenario data lives under a focused essential-services feature directory and is validated at module load or test time. MDX files compose the chapters and tier boundaries but do not duplicate player logic.

## Data model

Each service family has a stable identifier, label, anchor, endpoints, port facts, message fields, journey steps, checks, and troubleshooting cases. Interactive items have stable progress IDs that do not depend on display text.

The progress manifest adds all account-tier activities. Pro-only activities are registered only where the existing progress model supports them; otherwise they render without falsely affecting public completion. A Supabase migration adds the new stable item IDs idempotently and preserves existing learner records.

## State and data flow

1. The catalog resolves the lesson and the content repository selects public, account, and Pro MDX based on access.
2. MDX passes validated scenario objects to shared client components.
3. Players keep transient playback and selection state locally.
4. Submitting a check immediately reveals the explanation and records the attempt as completed.
5. The progress provider applies optimistic state, queues an idempotent update, and later reconciles with the server-confirmed state.
6. Locked links construct a safe sign-in `returnTo` containing the lesson path and selected anchor.

## Error handling

- Invalid authored scenario data fails schema tests before publication.
- Unknown ports, empty steps, duplicate IDs, invalid anchors, and missing explanations are rejected.
- A malformed interactive scenario is contained within its activity and shows a retry/fallback message rather than crashing the whole lesson.
- Player controls remain safe at the first and last steps.
- Progress failures use the existing optimistic retry behavior and never discard the learner's local attempt silently.
- Return paths are restricted to safe internal lesson routes.

## Accessibility and responsive behavior

- All controls are native buttons or links with visible focus states and descriptive accessible names.
- Players are usable by keyboard and expose the current step as text, not color alone.
- Animations honor `prefers-reduced-motion`.
- Message inspectors use semantic headings, lists, and tables with mobile alternatives where necessary.
- Network diagrams scale or reflow without overlapping labels, controls, or adjacent panels.
- At narrow widths, control groups wrap consistently and do not reproduce the spacing differences found in older players.

## Testing strategy

### Unit and schema tests

- validate every service, journey, port fact, message field, troubleshooting case, capture, and RFC check;
- assert canonical ports and transports;
- reject duplicate progress IDs and invalid tier references;
- verify immediate explanations for correct and incorrect answers.

### Component tests

- exercise all player controls and boundary states;
- verify the map replays on every open;
- verify chapter-anchor navigation;
- verify locked Account and Pro links preserve anchors;
- verify reduced-motion behavior;
- verify contained error and retry states.

### Integration tests

- render public, account, and Pro variants without leaking gated content;
- verify catalog publication, metadata, sitemap behavior, progress manifests, and migration coverage;
- verify an incorrect attempt still marks the activity complete;
- verify consistent controls and spacing across all six players.

### Browser checks

- inspect representative desktop, tablet, and mobile widths;
- check map wrapping, diagrams, inspectors, control rows, and locked redirects;
- confirm there is no horizontal page overflow;
- confirm each service anchor and return path works.

Before merge, run focused tests, type checking, linting, and the full test suite.

## Publication and acceptance criteria

The lesson is ready to publish when:

- all six service families have comparable public, account, and Pro depth;
- SSL/TLS remains explicitly introductory and points toward the future dedicated module;
- every service includes accurate ports, packet flow, message anatomy, security context, troubleshooting, Wireshark analysis, and an RFC-level Pro exercise;
- the service-station map matches the approved interaction and is responsive;
- locked items are clickable and preserve their anchors through sign-in;
- immediate explanations and completion semantics work for right and wrong answers;
- progress IDs and the Supabase migration are stable and idempotent;
- focused and full verification pass.

## Explicit non-goals

- deep TLS handshake, PKI, cipher-suite, or cryptographic instruction;
- full LDAP or SMB coverage;
- repeating the dedicated DNS and DHCP curricula;
- redesigning Page contents on older lessons during this change;
- implementing unrelated authentication, payments, chat, or dashboard expansion.
