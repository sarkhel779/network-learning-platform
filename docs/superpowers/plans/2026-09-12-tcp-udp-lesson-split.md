# TCP and UDP Lesson Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish separate TCP and UDP lessons with a TCP byte-window/SACK/fast-retransmit player while preserving old TCP progress and the legacy lesson URL.

**Architecture:** Retain the combined lesson's stable ID for the renamed TCP catalogue entry, add a new UDP entry and manifest, and divide its MDX content. Put TCP sequence-window arithmetic in a pure model consumed by an accessible focused player. Redirect the old slug through a legacy route that can map hash anchors in the browser.

**Tech Stack:** Next.js 15, React 19, TypeScript, MDX, Vitest, Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-12-tcp-udp-lesson-split-design.md`

## Global Constraints

- Retain `lesson_tcp_udp_and_ports` and unchanged item IDs for TCP content that remains in TCP; do not transfer historical UDP completions to the new lesson.
- Keep the established public/account/Pro access pattern and both existing transport players where relevant.
- The old `/learn/networking-foundations/tcp-udp-and-ports` URL must remain usable.
- Distinguish sender-window edges from SACK-block edges and receive-window flow control from congestion control.
- Player states require play/pause, step, replay, reduced-motion behavior, keyboard operation, and text explanations.

## File map

- `src/features/catalog/catalog.data.ts`: two ordered catalogue entries and section definitions.
- `src/features/lessons/lesson-content.repository.ts`: new MDX imports.
- `src/content/networking-foundations/{tcp-reliable-transport,udp-datagrams-and-ports}.{public,account}.mdx`: focused learning material.
- `src/features/transport/tcp-window-model.ts` and `.test.ts`: pure byte-range and acknowledgement scenario state.
- `src/features/transport/tcp-window-player.tsx` and `.test.tsx`: animated visual and accessible controls.
- `src/features/transport/port-delivery-journeys.ts`: UDP-only scenario additions/filtering for the UDP lesson.
- `src/features/progress/progress-manifests.ts`: retain TCP prefix/IDs and add UDP definition.
- `supabase/migrations/202609120001_split_tcp_udp_progress.sql`: replace the TCP item definitions while retaining learner events, add UDP items, and recompute existing TCP attempt summaries.
- `src/app/learn/networking-foundations/tcp-udp-and-ports/page.tsx`: old URL/hash handoff.
- Existing catalogue, lesson route, progress, content, and browser tests: enforce the new contracts.

---

### Task 1: Catalogue and progress contract

**Files:** Modify `src/features/catalog/catalog.data.ts`, `src/features/catalog/catalog.repository.test.ts`, `src/features/progress/progress-manifests.ts`, `src/features/progress/progress-manifests.test.ts`, `supabase/migrations/tcp-udp-ports-progress.test.ts`; create `supabase/migrations/202609120001_split_tcp_udp_progress.sql`.

**Interfaces:** Produces canonical slugs `tcp-reliable-transport` and `udp-datagrams-and-ports`; preserves `lesson_tcp_udp_and_ports`; adds `lesson_udp_datagrams_and_ports`.

- [ ] **Step 1: Write failing tests.** Assert two consecutive published lessons, the stable TCP ID, unique section anchors, distinct manifests, unchanged IDs such as `tcp_udp_and_ports_interactive_interactive_tcp_connection`, and a fresh `udp_datagrams_and_ports_*` prefix.

```ts
expect(tcp.id).toBe("lesson_tcp_udp_and_ports");
expect(udp.id).toBe("lesson_udp_datagrams_and_ports");
expect(udp.slug).toBe("udp-datagrams-and-ports");
expect(tcpManifest.items.some((item) => item.itemId === "tcp_udp_and_ports_interactive_interactive_tcp_connection")).toBe(true);
expect(udpManifest.items.every((item) => item.itemId.startsWith("udp_datagrams_and_ports_"))).toBe(true);
```

- [ ] **Step 2: Run red.** `npm test -- src/features/catalog/catalog.repository.test.ts src/features/progress/progress-manifests.test.ts` — expect missing UDP entry/manifest.
- [ ] **Step 3: Implement.** Rename the current entry and redistribute section definitions; retain TCP's existing section IDs/item IDs where their teaching remains, add TCP advanced sections, and create the UDP entry and manifest. Keep Pro sections on both lessons. Add a transactional SQL migration that replaces the old TCP item definitions without deleting learner events, registers UDP, and recomputes saved TCP attempt percentages and next items.

```ts
{ lessonId: "lesson_udp_datagrams_and_ports", interactiveAnchors: ["interactive-udp-port-delivery"], knowledgeCheckCount: 3, knowledgeAnchor: "knowledge-check-summary" }
```

- [ ] **Step 4: Run green.** Run the two targeted tests; update old count/order assertions only when they reflect the intentional split.
- [ ] **Step 5: Commit.** `git add src/features/catalog src/features/progress && git commit -m "Split TCP and UDP catalogue and progress contracts"`.

### Task 2: TCP window model and player

**Files:** Create `src/features/transport/tcp-window-model.ts`, `.test.ts`, `tcp-window-player.tsx`, `.test.tsx`; modify transport CSS in its existing stylesheet (locate with `rg 'transport-topology' src`).

**Interfaces:** Export `buildTcpWindowJourney(scenario: "normal" | "fast-retransmit" | "timeout"): readonly TcpWindowStep[]` and `TcpWindowPlayer({ progressItemId?: string })`. Each step exposes `id`, `title`, `explanation`, `sendLeft`, `nextToSend`, `sendRight`, `cumulativeAck`, `sackBlocks`, `packets`, and `terminal`.

- [ ] **Step 1: Write failing pure-model tests.** Use a fixed 100-byte MSS example and assert: ACK 1101 follows bytes 1001–1100; each block's right edge is exclusive; three duplicate ACKs precede the fast-retransmit step; timeout scenario does not claim three duplicate ACKs. Test `sendLeft <= nextToSend <= sendRight` at each send step.

```ts
const steps = buildTcpWindowJourney("fast-retransmit");
expect(steps.find((s) => s.id === "out-of-order")?.sackBlocks).toEqual([{ left: 1201, right: 1401 }]);
expect(steps.findIndex((s) => s.id === "third-duplicate-ack")).toBeLessThan(steps.findIndex((s) => s.id === "fast-retransmit"));
```

- [ ] **Step 2: Run red.** `npm test -- src/features/transport/tcp-window-model.test.ts` — expect missing export.
- [ ] **Step 3: Implement minimal pure model.** Use explicit authored states validated by the invariants; distinguish the sender's send-window edges and SACK-block edges in field names and explanations. Add normal ACK advancement, loss/fast retransmit, and timeout journeys.

```ts
export type SackBlock = Readonly<{ left: number; right: number }>;
export type TcpWindowScenario = "normal" | "fast-retransmit" | "timeout";
const receivedBlock: SackBlock = { left: 1201, right: 1401 }; // bytes 1201–1400 received
const nextExpectedByte = 1101; // cumulative ACK stays at the missing byte
```

- [ ] **Step 4: Run green.** Targeted model tests pass.
- [ ] **Step 5: Write failing player tests.** Render the component and assert visible sender-window/SACK labels, status narration, play/pause and next/replay actions, reduced-motion initial pause (follow the existing `TcpConnectionPlayer` test setup), and terminal progress marking.

```tsx
render(<TcpWindowPlayer />);
expect(screen.getByText(/Sender window left edge/i)).toBeInTheDocument();
await user.click(screen.getByRole("button", { name: "Next" }));
expect(screen.getByRole("status")).toHaveTextContent(/Step 2/i);
```

- [ ] **Step 6: Run red.** `npm test -- src/features/transport/tcp-window-player.test.tsx` — expect missing component/behavior.
- [ ] **Step 7: Implement player.** Reuse `TransportPlayerControls`, `useReducedMotionState`, and `useProgressCompletionBoundary`; animate a highlighted packet across the topology and a byte-range strip, with an aria-live step sentence and a static fallback. Put controls directly below the topology.

```tsx
<TransportPlayerControls finalIndex={steps.length - 1} playing={playing} stepIndex={index} speed={speed} onNext={next} onPrevious={previous} onRestart={restart} onTogglePlay={toggle} onSpeedChange={setSpeed} />
```

- [ ] **Step 8: Run green and commit.** Targeted model/player tests; `git add src/features/transport src/app/globals.css && git commit -m "Teach TCP sliding windows SACK and fast retransmit"`.

### Task 3: Focused TCP and UDP content

**Files:** Create four MDX files in `src/content/networking-foundations/`; modify `src/features/lessons/lesson-content.repository.ts`, `src/content/networking-foundations/tcp-udp-and-ports.content.test.ts`, relevant lesson-rendering tests, and `src/features/transport/port-delivery-journeys.ts` plus its test.

**Interfaces:** Content loader keys `networking-foundations/tcp-reliable-transport` and `networking-foundations/udp-datagrams-and-ports`; TCP uses `TcpConnectionPlayer` and `TcpWindowPlayer`; UDP uses `UdpPortDeliveryPlayer`, a focused wrapper over `PortDeliveryPlayer` with UDP-only scenarios.

- [ ] **Step 1: Write failing tests.** Assert every catalogue section has a matching MDX `h2` and access split; TCP has MSS, Window Scale, SACK-Permitted/SACK block edges, fast retransmit and timeout explanation; UDP has its header, DNS/DHCP examples and conditional silence. Assert the UDP player receives no TCP-only scenarios.

```ts
expect(tcpPublic).toContain('<TcpWindowPlayer progressItemId="tcp_udp_and_ports_interactive_interactive_tcp_window" />');
expect(udpPublic).toContain('<ProtocolFormatDiagram kind="udp" />');
expect(udpScenarios.every((scenario) => scenario.protocol === "UDP")).toBe(true);
```

- [ ] **Step 2: Run red.** `npm test -- src/content/networking-foundations/tcp-udp-and-ports.content.test.ts src/features/transport/port-delivery-journeys.test.ts` — expect absent split content.
- [ ] **Step 3: Implement content and imports.** Move existing TCP paragraphs and connection player into TCP MDX with old completion IDs; write packet-first advanced sections; move/adapt UDP material into UDP MDX with new completion IDs and three checks; split account practice/Pro previews without copying progress IDs to UDP. Keep text beginner-readable and link protocol claims to RFC sources in lesson copy where useful.

```ts
"networking-foundations/udp-datagrams-and-ports": {
  public: () => import("@/content/networking-foundations/udp-datagrams-and-ports.public.mdx"),
  account: () => import("@/content/networking-foundations/udp-datagrams-and-ports.account.mdx"),
},
```

- [ ] **Step 4: Run green.** Targeted content, loader, and port-delivery tests; then `npm run typecheck` to catch MDX/component linkage.
- [ ] **Step 5: Commit.** `git add src/content/networking-foundations src/features/lessons src/features/transport && git commit -m "Publish focused TCP and UDP lessons"`.

### Task 4: Legacy URL, navigation, and end-to-end verification

**Files:** Create `src/app/learn/networking-foundations/tcp-udp-and-ports/page.tsx` and a tested pure `legacy-transport-link.ts`; modify `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`, sitemap tests, and browser smoke coverage.

**Interfaces:** `resolveLegacyTransportUrl(hash: string, search: string): string` returns a canonical TCP or UDP URL, retaining `audit=1` and mapping known UDP anchors. The static legacy page calls `window.location.replace` after hydration and presents a visible fallback link.

- [ ] **Step 1: Write failing redirect tests.** Assert blank hash goes to TCP, `#interactive-tcp-connection` stays on TCP, `#interactive-tcp-udp-port-delivery` maps to UDP's player anchor, unknown hashes fall back to TCP, and `?audit=1` survives.

```ts
expect(resolveLegacyTransportUrl("#interactive-tcp-udp-port-delivery", "?audit=1"))
  .toBe("/learn/networking-foundations/udp-datagrams-and-ports?audit=1#interactive-udp-port-delivery");
```

- [ ] **Step 2: Run red.** `npm test -- src/app/learn/networking-foundations/tcp-udp-and-ports/legacy-transport-link.test.ts` — expect missing resolver.
- [ ] **Step 3: Implement resolver and legacy page.** Use a static route alongside the dynamic published lesson route; no obsolete lesson appears in catalogue/static params/sitemap. Handle malformed/unknown fragments with the safe TCP fallback.

```tsx
useEffect(() => { window.location.replace(resolveLegacyTransportUrl(window.location.hash, window.location.search)); }, []);
```

- [ ] **Step 4: Run green and integration checks.** Run redirect, route, sitemap, catalogue, progress, transport, and content tests; `npm run typecheck`, `npm run lint`, `npm run build`. Review TCP, UDP, old URL, keyboard controls and responsive topology in browser, including `prefers-reduced-motion`.
- [ ] **Step 5: Commit.** `git add src/app && git commit -m "Preserve legacy transport lesson links"` (include any other changed paths explicitly).

## Plan self-review

- Catalogue, content imports, access, progress preservation, interactions, old links, tests, and browser QA each have a task.
- The only historical progress kept is valid TCP evidence; UDP starts new, and new TCP requirements may lower prior completion percentage.
- All identifiers in later tasks match the Task 1 slug/ID contract and Task 2 player export.
