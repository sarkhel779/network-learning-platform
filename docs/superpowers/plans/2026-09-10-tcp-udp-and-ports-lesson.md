# TCP, UDP and Ports Lesson Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Publish a beginner, packet-first TCP, UDP and Ports lesson with two synchronized interactive players, account-only practice, terminal-only progress tracking, and complete catalog/navigation integration.

**Architecture:** Add a focused 'src/features/transport' domain with Zod-validated scenario models, pure journey builders, and two client players that reuse existing playback, reduced-motion, and progress primitives. MDX owns lesson prose while catalog, content registry, MDX registration, progress manifests, and an idempotent Supabase migration connect it to the platform.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.9, MDX 3, Zod 4, Vitest, Testing Library, Supabase PostgreSQL.

**Spec:** 'docs/superpowers/specs/2026-09-10-tcp-udp-and-ports-lesson-design.md'

## Global constraints

- Twelve public conceptual sections and two public players at '/learn/networking-foundations/tcp-udp-and-ports'.
- Account-only inspection, diagnosis, troubleshooting, and three knowledge checks.
- Pro-only advanced topics exactly as scoped in the design.
- No authentication changes and no new dependencies.
- Invalid scenarios fail closed with no autoplay, navigation, or completion.
- Interactive progress records only at a visible terminal state.
- Submitted answers record attempts independently from correctness.
- Preserve keyboard operation, 44px targets, non-colour cues, responsive containment, autoplay once, speeds, and reduced motion.

## File map

- 'src/features/transport/transport.schema.ts': validated transport contracts.
- 'src/features/transport/tcp-journeys.ts': six TCP scenarios and pure journey builder.
- 'src/features/transport/port-delivery-journeys.ts': five demultiplexing scenarios and builder.
- 'src/features/transport/transport-player-controls.tsx': shared accessible controls.
- 'src/features/transport/tcp-connection-player.tsx': TCP lifecycle player.
- 'src/features/transport/port-delivery-player.tsx': TCP/UDP port-delivery player.
- 'src/content/networking-foundations/tcp-udp-and-ports.{public,account}.mdx': lesson bodies.
- Catalog, registry, progress, migration, rendering, navigation, sitemap, and style files wire the lesson into the platform.

---

### Task 1: Validated transport scenario contracts

**Files:**
- Create: 'src/features/transport/transport.schema.ts'
- Test: 'src/features/transport/transport.schema.test.ts'

**Interfaces:**
- Produces: 'parseTcpScenario(input: unknown): TcpScenario'
- Produces: 'parsePortDeliveryScenario(input: unknown): PortDeliveryScenario'
- Produces: 'TransportProtocol', 'TcpFlag', 'TcpEndpointState', 'TcpScenario', 'PortDeliveryScenario'.

- [ ] **Step 1: Write failing schema tests**

Test valid minimum inputs plus duplicate IDs, ports outside 0–65535, ACK without acknowledgement number, impossible SYN+FIN, inconsistent payload sequence ranges, delivered outcome without listener, and contradictory no-listener outcomes.

~~~ts
expect(() => parseTcpScenario(validTcpScenario)).not.toThrow();
expect(() => parseTcpScenario({ ...validTcpScenario, steps: [{ ...step, flags: ["SYN", "FIN"] }] })).toThrow();
expect(() => parsePortDeliveryScenario({ ...validDelivery, destinationPort: 70000 })).toThrow();
expect(() => parsePortDeliveryScenario({ ...validDelivery, outcome: "delivered", listener: null })).toThrow();
~~~

- [ ] **Step 2: Verify RED**

Run: '.\node_modules\.bin\vitest.cmd run src/features/transport/transport.schema.test.ts'

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement minimal schemas**

Define:

~~~ts
type TransportProtocol = "TCP" | "UDP";
type TcpFlag = "SYN" | "ACK" | "FIN" | "RST" | "PSH";
type TcpEndpointState = "CLOSED" | "LISTEN" | "SYN-SENT" | "SYN-RECEIVED" | "ESTABLISHED" | "FIN-WAIT" | "CLOSE-WAIT" | "LAST-ACK" | "TIME-WAIT";
~~~

Each TCP step has stable ID/title/explanation, direction, flags, nullable sequence/ack, payload bytes, receive window, client/server state, outcome cue, and terminal boolean. Each delivery scenario has protocol, endpoint IP/ports, compact header fields, nullable listener/application, outcome, and conclusion. Add 'superRefine' rules matching the failing cases.

- [ ] **Step 4: Verify GREEN**

Run the Step 2 command. Expected: PASS.

- [ ] **Step 5: Commit**

~~~powershell
git add src/features/transport/transport.schema.ts src/features/transport/transport.schema.test.ts
git commit -m "feat: validate transport lesson scenarios"
~~~

### Task 2: Pure TCP journey model

**Files:**
- Create: 'src/features/transport/tcp-journeys.ts'
- Test: 'src/features/transport/tcp-journeys.test.ts'

**Interfaces:**
- Consumes: 'TcpScenario', 'parseTcpScenario'.
- Produces: 'tcpScenarios: readonly TcpScenario[]'.
- Produces: 'buildTcpJourney(scenario: TcpScenario): readonly TcpJourneyStep[]'.

- [ ] **Step 1: Write failing journey tests**

Assert IDs 'handshake', 'data-transfer', 'lost-segment', 'graceful-close', 'connection-refused', and 'connection-timeout'. Verify handshake state transitions, retransmission reusing the lost sequence range and accepting payload once, FIN/ACK close, RST refusal, timeout silence, and exactly one terminal step per journey.

- [ ] **Step 2: Verify RED**

Run: '.\node_modules\.bin\vitest.cmd run src/features/transport/tcp-journeys.test.ts'

- [ ] **Step 3: Implement scenarios and builder**

Use internally consistent teaching numbers: client ISN 1000, server ISN 5000, first data sequence 1001, and 100 bytes acknowledged by 1101. Derive flags, fields, endpoint states, evidence, and conclusion from parsed data.

- [ ] **Step 4: Verify GREEN**

Run: '.\node_modules\.bin\vitest.cmd run src/features/transport/transport.schema.test.ts src/features/transport/tcp-journeys.test.ts'

- [ ] **Step 5: Commit**

~~~powershell
git add src/features/transport/tcp-journeys.ts src/features/transport/tcp-journeys.test.ts
git commit -m "feat: model TCP connection journeys"
~~~

### Task 3: Pure TCP/UDP port-delivery model

**Files:**
- Create: 'src/features/transport/port-delivery-journeys.ts'
- Test: 'src/features/transport/port-delivery-journeys.test.ts'

**Interfaces:**
- Consumes: 'PortDeliveryScenario', 'parsePortDeliveryScenario'.
- Produces: 'portDeliveryScenarios' and 'buildPortDeliveryJourney(scenario)'.

- [ ] **Step 1: Write failing tests**

Assert IDs 'tcp-listener', 'udp-listener', 'ephemeral-clients', 'tcp-no-listener', and 'udp-no-listener'. Verify tuple stability, two different ephemeral source ports, TCP's representative RST, and UDP wording that ICMP port unreachable may appear or the sender may observe silence.

- [ ] **Step 2: Verify RED**

Run: '.\node_modules\.bin\vitest.cmd run src/features/transport/port-delivery-journeys.test.ts'

- [ ] **Step 3: Implement model**

Build arrival, header inspection, socket lookup, and terminal outcome steps. Derive each tuple as protocol plus source IP:port and destination IP:port. Never promise a response when host/firewall policy can change it.

- [ ] **Step 4: Verify GREEN and commit**

Run the schema and delivery-model tests, then:

~~~powershell
git add src/features/transport/port-delivery-journeys.ts src/features/transport/port-delivery-journeys.test.ts
git commit -m "feat: model transport port delivery"
~~~

### Task 4: Shared controls and TCP Connection Journey player

**Files:**
- Create: 'src/features/transport/transport-player-controls.tsx'
- Create: 'src/features/transport/tcp-connection-player.tsx'
- Test: 'src/features/transport/tcp-connection-player.test.tsx'

**Interfaces:**
- Consumes: TCP builder/data, 'PLAYBACK_SPEEDS', 'useReducedMotionState', 'useProgressCompletionBoundary'.
- Produces: 'TransportPlayerControls(props)' and 'TcpConnectionPlayer({ progressItemId?, scenarios? })'.

- [ ] **Step 1: Write failing player tests**

Cover six selectors, autoplay, Previous/Play/Next/Restart/speeds, scenario reset, synchronized flags/seq/ack/states, retransmission, RST, timeout, reduced-motion pause, terminal-only completion, save retry, and invalid-data fallback with no timer/completion.

- [ ] **Step 2: Verify RED**

Run: '.\node_modules\.bin\vitest.cmd run src/features/transport/tcp-connection-player.test.tsx'

- [ ] **Step 3: Implement shared controls**

Use explicit state and callbacks:

~~~ts
type TransportPlayerControlsProps = {
  stepIndex: number; finalIndex: number; playing: boolean; speed: number;
  onPrevious(): void; onTogglePlay(): void; onNext(): void;
  onRestart(): void; onSpeedChange(speed: number): void;
};
~~~

- [ ] **Step 4: Implement player**

Guard parse/build in 'useMemo', autoplay with cancellable timer, stop at terminal, and complete progress only for the rendered terminal step. Render selector, endpoint topology/states, directional packet, flags, seq/ack/payload/window table, explanation, conclusion, controls, and retry.

- [ ] **Step 5: Verify GREEN and commit**

Run all TCP schema/model/player tests, then:

~~~powershell
git add src/features/transport/transport-player-controls.tsx src/features/transport/tcp-connection-player.tsx src/features/transport/tcp-connection-player.test.tsx
git commit -m "feat: add TCP connection journey player"
~~~

### Task 5: TCP vs UDP and Port Delivery player

**Files:**
- Create: 'src/features/transport/port-delivery-player.tsx'
- Test: 'src/features/transport/port-delivery-player.test.tsx'

**Interfaces:**
- Consumes: shared controls, delivery builder/data, playback/reduced-motion/progress primitives.
- Produces: 'PortDeliveryPlayer({ progressItemId?, scenarios? })'.

- [ ] **Step 1: Write failing tests**

Cover five selectors, full tuple, protocol header, socket/application selection, ephemeral clients, TCP RST, conditional UDP no-listener copy, controls, speeds, reduced motion, reset, terminal completion, retry, scroll-region semantics, and invalid fallback.

- [ ] **Step 2: Verify RED**

Run: '.\node_modules\.bin\vitest.cmd run src/features/transport/port-delivery-player.test.tsx'

- [ ] **Step 3: Implement player**

Render explanation, host/application diagram, tuple, header table, listener/application outcome, conclusion, and shared controls. Use the same guarded autoplay/reduced-motion/progress behavior as the TCP player and include text cues in addition to colour.

- [ ] **Step 4: Verify GREEN and commit**

Run: '.\node_modules\.bin\vitest.cmd run src/features/transport'

Then commit the player and test as 'feat: add TCP UDP port delivery player'.

### Task 6: Author and register lesson content

**Files:**
- Create: 'src/content/networking-foundations/tcp-udp-and-ports.public.mdx'
- Create: 'src/content/networking-foundations/tcp-udp-and-ports.account.mdx'
- Create: 'src/content/networking-foundations/tcp-udp-and-ports.content.test.ts'
- Modify: 'mdx-components.tsx'
- Modify: 'src/features/lessons/lesson-content.repository.ts'
- Modify: 'src/features/lessons/lesson-content.repository.test.ts'
- Test: 'src/content/lesson-rendering.test.tsx'
- Test: 'src/content/lesson-access.content.test.ts'

**Interfaces:**
- Produces authorized content key 'networking-foundations/tcp-udp-and-ports'.

- [ ] **Step 1: Write failing content/registry tests**

Assert all twelve public anchors in order, both players once, the seven approved service families, ephemeral-port and conditional no-listener wording, account sentinel, inspection/diagnosis/troubleshooting, three checks, and Pro preview. Assert anonymous loading excludes account MDX.

- [ ] **Step 2: Verify RED**

Run the new content test and 'lesson-content.repository.test.ts'.

- [ ] **Step 3: Author public MDX**

Use exact design headings. Insert:

~~~mdx
<TcpConnectionPlayer progressItemId="tcp_udp_and_ports_interactive_interactive_tcp_connection" />
<PortDeliveryPlayer progressItemId="tcp_udp_and_ports_interactive_interactive_tcp_udp_port_delivery" />
~~~

Add matching 'SectionContinue' to each non-interactive public section. Include the compact HTTP/HTTPS, DNS, DHCP, SSH, SMTP, and NTP table and avoid absolute speed/reliability claims.

- [ ] **Step 4: Author account MDX**

Include Wireshark filters 'tcp', 'udp', 'tcp.flags.syn == 1', and 'tcp.analysis.retransmission'; suitable 'ss', 'netstat', or PowerShell evidence; guided diagnosis; seven-step troubleshooting; three stable 'KnowledgeCheck' IDs; and only the approved Pro topics.

- [ ] **Step 5: Register components/imports**

Expose both players from 'mdx-components.tsx'. Add public/account dynamic imports and test mocks under the exact registry key.

- [ ] **Step 6: Verify GREEN**

Run the content, registry, rendering, and access tests.

- [ ] **Step 7: Commit**

Stage only the files above and commit as 'feat: author TCP UDP and ports lesson'.

### Task 7: Publish catalog, navigation, route, and sitemap

**Files:**
- Modify: 'src/features/catalog/catalog.data.ts'
- Modify: 'src/features/catalog/catalog.repository.test.ts'
- Modify: 'src/features/catalog/module-list.test.tsx'
- Modify: 'src/features/catalog/pathway-overview.test.tsx'
- Modify: 'src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts'
- Modify: 'src/app/sitemap.test.ts'

- [ ] **Step 1: Write failing publication tests**

Assert published state, canonical link, previous ICMP lesson, unpublished next DHCP lesson, public anonymous rendering, locked account/Pro descriptors, sitemap inclusion, and unpublished count changing from six to five.

- [ ] **Step 2: Verify RED**

Run all six listed test files.

- [ ] **Step 3: Publish catalog entry**

Preserve objective, SEO, and 25-minute estimate. Define twelve public descriptors; account descriptors 'inspect-transport-evidence', 'guided-transport-diagnosis', 'troubleshoot-transport', 'knowledge-check-summary'; and 'pro-deep-dive'.

- [ ] **Step 4: Update navigation/sitemap expectations**

Insert the canonical URL immediately after ICMP. Do not publish DHCP.

- [ ] **Step 5: Verify GREEN and commit**

Run the Step 2 tests and commit as 'feat: publish TCP UDP and ports lesson'.

### Task 8: Progress manifest and idempotent migration

**Files:**
- Modify: 'src/features/progress/progress-manifests.ts'
- Modify: 'src/features/progress/progress-manifests.test.ts'
- Create: 'supabase/migrations/202609100004_add_tcp_udp_ports_progress.sql'
- Create: 'supabase/migrations/tcp-udp-ports-progress.test.ts'

**Interfaces:**
- Produces manifest for 'lesson_tcp_udp_and_ports' with two interactive anchors, three checks, and 18 required items: twelve public entries, three account sections, and three checks.

- [ ] **Step 1: Write failing tests**

Assert manifest identity/order, interactive and check IDs, required count 18, SQL transaction, manifest/item upserts, stable anchors, and conflict updates. Cross-check generated items against SQL rows.

- [ ] **Step 2: Verify RED**

Run both progress test files.

- [ ] **Step 3: Add runtime definition**

~~~ts
{ lessonId: "lesson_tcp_udp_and_ports", interactiveAnchors: ["interactive-tcp-connection", "interactive-tcp-udp-port-delivery"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" }
~~~

- [ ] **Step 4: Add migration**

Use 'begin'/'commit', the established conflict targets, and 18 ordered required rows matching catalog/MDX IDs. Make reruns update ordinal, kind, label, anchor, and required fields.

- [ ] **Step 5: Verify GREEN and commit**

Run manifest/migration tests and commit as 'feat: track TCP UDP lesson progress'.

### Task 9: Responsive and accessibility refinement

**Files:**
- Modify: 'src/app/globals.css'
- Modify: 'src/app/theme-styles.test.ts'
- Modify: 'src/features/transport/tcp-connection-player.test.tsx'
- Modify: 'src/features/transport/port-delivery-player.test.tsx'

- [ ] **Step 1: Add failing assertions**

Assert scoped selectors, 44px controls, locally scrollable evidence, mobile grid collapse, focus visibility, non-colour labels, fieldset/status/table semantics, and deterministic reduced motion.

- [ ] **Step 2: Verify RED**

Run theme and both player tests.

- [ ] **Step 3: Add scoped styles/semantic fixes**

Keep all regions inside the lesson column; collapse to explanation → visualization → controls → evidence → conclusion on narrow screens; allow only evidence tables to scroll; preserve legibility in light/dark themes.

- [ ] **Step 4: Verify GREEN and commit**

Run the Step 2 tests and commit as 'style: refine transport lesson interactives'.

### Task 10: Full verification and preview checkpoint

**Files:**
- Modify only files implicated by an observed failure.

- [ ] **Step 1: Run focused tests**

~~~powershell
.\node_modules\.bin\vitest.cmd run src/features/transport src/content/networking-foundations/tcp-udp-and-ports.content.test.ts src/features/lessons/lesson-content.repository.test.ts src/features/catalog src/features/progress supabase/migrations/tcp-udp-ports-progress.test.ts src/app/sitemap.test.ts
~~~

Expected: PASS.

- [ ] **Step 2: Validate types and lint**

Run 'pnpm typecheck' and 'pnpm lint'. Expected: exit 0 with no new warnings.

- [ ] **Step 3: Run complete suite and build**

Run 'pnpm test' then 'pnpm build'. Expected: all tests pass and build exits 0 with the lesson route generated.

- [ ] **Step 4: Inspect repository**

Run 'git diff --check main...HEAD', 'git status --short --branch', and 'git log --oneline main..HEAD'. Expect no whitespace errors or uncommitted implementation files.

- [ ] **Step 5: Launch preview**

Run 'pnpm dev -- --port 3021' and open 'http://127.0.0.1:3021/learn/networking-foundations/tcp-udp-and-ports'. Verify desktop/narrow layouts, themes, both players, autoplay/reduced motion, account locks, and no page overflow.

- [ ] **Step 6: Commit demonstrated fixes only**

If a verification step required a code change, reproduce its failure, make the minimum fix, rerun the failing and full checks, and commit as 'fix: complete TCP UDP lesson verification'.
