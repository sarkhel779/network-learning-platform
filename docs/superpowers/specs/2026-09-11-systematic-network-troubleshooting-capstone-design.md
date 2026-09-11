# Systematic Network Troubleshooting Capstone Design

## Purpose

The final Networking Foundations lesson must prove that a learner can combine the pathway's concepts into a disciplined troubleshooting workflow. The lesson is not a command-memory exam. It evaluates whether the learner can define scope, form a falsifiable hypothesis, choose a low-risk test, interpret evidence, correct the fault, and verify service restoration end to end.

The canonical incident is: **Branch users cannot reach the company portal.** One stable enterprise topology is reused across account and Pro experiences so added difficulty comes from analysis rather than relearning the diagram.

## Access tiers

### Public

Anonymous learners receive the complete troubleshooting method:

- distinguish symptoms from causes;
- establish affected users, locations, protocols, and time window;
- work from physical/interface state through VLAN, addressing, ARP, routing, DNS, transport/TLS, and HTTP evidence;
- write a hypothesis and predicted result before testing;
- prefer reversible, least-destructive tests;
- validate the complete service rather than stopping after the first successful ping;
- document evidence, result, next action, and escalation context.

Public content contains explanations and reflection prompts but no answer-bearing assessment components.

### Free account

Authenticated learners receive a guided evidence-board simulation with three sequential faults:

1. The branch workstation's switch access port is assigned to the wrong VLAN.
2. After the VLAN is corrected, a more-specific route sends portal traffic to the wrong next hop.
3. After routing is corrected, a stale DNS answer still points clients at an obsolete portal address.

Correcting one fault reveals the next. Every submitted attempt counts as completion even when incorrect. Feedback is immediate and explains what the selected evidence proves or fails to prove. Confidence is recorded separately from correctness.

### Pro

The Pro incident reuses the topology after a new outage and removes most guidance. It includes:

- intermittent duplex/error evidence as a plausible distractor;
- asymmetric routing that breaks stateful firewall/NAT return traffic;
- DNS cache behavior that initially resembles an application outage;
- correlated CLI output, device logs, event timing, and Wireshark-style packet evidence;
- RFC and vendor-behavior validation used as operational references rather than trivia;
- a required incident report covering impact, evidence, root causes, correction, validation, and prevention.

Pro content remains authored and locked until the platform's entitlement/payment layer can deliver it.

## Interaction model

The recommended design is an evidence-board simulation with selected CLI commands embedded as test actions. A free-form terminal parser is explicitly out of scope because it would reward syntax recall and create avoidable parsing complexity.

The learner repeats this loop:

1. Review the current symptom and known scope.
2. Select a hypothesis.
3. State the expected observation if that hypothesis is true.
4. Choose an evidence-gathering action.
5. Inspect the result and record the conclusion.
6. Apply a remediation only when evidence supports it.
7. Verify all affected layers before closing the incident.

Tests consume simulated time. Poor choices reduce efficiency scoring but never lock the learner out or erase progress.

## Domain model

`TroubleshootingScenario` is validated data rather than UI-specific conditionals. It defines:

- topology nodes, interfaces, links, addresses, VLANs, routes, and services;
- initial symptoms and scope facts;
- an ordered set of faults and the conditions that expose each fault;
- hypotheses and predicted observations;
- tests with risk, time cost, command label, evidence, and interpretation;
- remediations and their prerequisites;
- restoration checks;
- scoring rules and explanatory feedback.

State transitions are deterministic. The current scenario state is derived from completed tests, accepted conclusions, applied remediations, and verification results. Answers are not embedded in presentational components.

## Components

- `TroubleshootingWorkspace` coordinates scenario state, progress boundaries, reset, and resume.
- `TroubleshootingTopology` renders the shared network and highlights affected interfaces and packet paths.
- `EvidenceBoard` lists available low-risk tests and displays CLI, table, log, and capture results.
- `HypothesisJournal` requires a hypothesis and expected result before a test can run.
- `IncidentTimeline` records tests, evidence, conclusions, fixes, confidence, and simulated elapsed time.
- `RemediationPanel` exposes only contextually valid changes and explains unsafe or premature actions.
- `RestorationChecklist` verifies addressing, local delivery, VLAN forwarding, routing, DNS, TCP/TLS, and HTTP.
- `IncidentReportBuilder` provides the Pro structured report and completeness validation.

The existing Page contents network-map pattern is reused. Account anchors unlock for authenticated learners; Pro anchors remain clickable sign-in/upgrade routes according to the current access model.

## Feedback and scoring

Immediate feedback identifies the difference between observation and inference. A wrong hypothesis or test attempt is still recorded as completed learning activity. Learners can retry without losing the server-confirmed completion event.

Scoring has independent dimensions:

- scope accuracy;
- hypothesis quality;
- predicted-result quality;
- test safety and ordering;
- evidence interpretation;
- root-cause identification;
- complete restoration validation;
- incident-report completeness for Pro.

The UI must explain each score in plain language. No single numeric score blocks lesson completion.

## Progress and persistence

The lesson registers stable progress item IDs for public sections, guided workspace milestones, knowledge checks, restoration verification, Pro evidence tasks, and the report. Existing learner-specific queued persistence, idempotency keys, sequential replay, optimistic state, confirmed state, retry, resume, next-incomplete, and restart behavior are reused.

Restart creates a new attempt. Reload or reconnect resumes the existing attempt. Duplicate terminal events are safe. A new idempotent Supabase migration publishes the lesson and its ordered progress items transactionally.

## Accessibility and responsive behavior

- All evidence actions, hypotheses, remediations, and tabs are keyboard reachable.
- Status updates use restrained live regions and never rely on color alone.
- Topology and evidence tables provide text equivalents and labelled relationships.
- Wide technical output scrolls inside its own container without expanding the page.
- At 360px, panels stack in task order and controls retain at least 44px targets.
- Packet and evidence-reveal animations are subtle and replay only for meaningful state changes.
- Reduced-motion preference removes movement while preserving final state and sequence meaning.

## Error handling

Invalid scenario data fails validation before rendering. Missing evidence produces an explicit unavailable state rather than fabricated output. Progress-save errors keep learner work visible and expose retry. Protected content is never loaded or serialized for unauthorized viewers. Restoration cannot be declared until every required check has an explicit result.

## Testing contract

Implementation follows test-driven development and must cover:

- scenario schema validation and rejection of invalid transitions;
- deterministic sequential-fault state changes;
- hypothesis, predicted-result, evidence, remediation, and scoring behavior;
- immediate feedback and any-attempt completion;
- resume, retry, next-incomplete, and restart semantics;
- public/account/Pro source boundaries;
- locked and unlocked Page contents anchors;
- unique accessible names and instance-safe IDs;
- mobile containment, keyboard operation, and reduced motion;
- catalog, metadata, sitemap, MDX loader, progress manifest, and migration integration;
- end-to-end anonymous and authenticated browser flows.

Before integration, focused tests, the full Vitest suite, TypeScript validation, lint, and desktop/mobile Playwright checks must pass.

## Out of scope

- A free-form command parser or emulated network operating system.
- Real device access or arbitrary packet capture uploads.
- Building Pro billing or entitlement delivery.
- Automatic AI grading of unrestricted incident prose.
- Troubleshooting topics that require a separate advanced routing, wireless, or security course.
