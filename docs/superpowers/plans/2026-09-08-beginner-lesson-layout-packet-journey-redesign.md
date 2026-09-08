# Beginner Lesson Layout and Packet Journey Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make lessons readable at all supported widths and teach switching and routing through a reusable, accessible, hop-by-hop packet journey.

**Architecture:** Replace the reserved curriculum column with an overlay drawer, then add a presentation-only `packet-journey` feature whose typed stages are produced by lesson-domain adapters. Reuse the existing playback reducer and reduced-motion hook while keeping routing and switching evaluation inside their current features.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9, CSS, Vitest, Testing Library, Playwright

**Spec:** `docs/superpowers/specs/2026-09-08-beginner-lesson-layout-packet-journey-redesign.md`

## Global Constraints

- The curriculum drawer is collapsed by default and never reserves lesson width.
- Normal words must not split character by character; wide tables scroll inside their own labelled wrapper.
- Selecting a scenario autoplays its journey once, except when reduced motion is preferred.
- Manual Previous or Next navigation pauses playback; completed journeys expose Replay.
- Public pages and client bundles must not import protected account or Pro scenario data.
- The router changes the link-layer frame and decrements TTL, but retains source and destination IP addresses because NAT is not part of this lesson.
- No-JavaScript and hydration-failure paths retain a useful static explanation.
- New behavior is developed test-first and each task ends in a focused commit.

---

## File Structure

### New files

- `src/features/lessons/course-contents-drawer.tsx` — client drawer state, focus, dismissal, and curriculum rendering.
- `src/features/lessons/course-contents-drawer.test.tsx` — drawer interaction and accessibility contract.
- `src/features/packet-journey/packet-journey.types.ts` — immutable public presentation types.
- `src/features/packet-journey/packet-journey.schema.ts` — runtime validation and safe fallback for journey input.
- `src/features/packet-journey/packet-journey.schema.test.ts` — valid and invalid model coverage.
- `src/features/packet-journey/packet-journey-player.tsx` — playback orchestration and accessible stage announcements.
- `src/features/packet-journey/packet-journey-player.test.tsx` — autoplay, controls, reduced motion, and scenario-reset behavior.
- `src/features/packet-journey/packet-journey-stage.tsx` — topology, interface labels, packet position, nested layer view, and changed fields.
- `src/features/packet-journey/packet-journey-stage.test.tsx` — visual-state semantics and fallback coverage.
- `src/features/packet-journey/static-packet-journey.tsx` — server-safe ordered journey explanation.
- `src/features/route-decision/create-route-journey.ts` — adapter from evaluated route outcomes to journey stages.
- `src/features/route-decision/create-route-journey.test.ts` — all five route-outcome journeys and packet invariants.
- `src/features/switching/create-switching-journey.ts` — selected-device switching presentation adapter.
- `src/features/switching/create-switching-journey.test.ts` — hub, bridge, and switch behavior coverage.

### Modified files

- `src/features/lessons/lesson-shell.tsx` and `.test.tsx` — full-width shell, drawer, and server fallback.
- `src/features/lessons/curriculum-navigation.tsx` — optional selection callback for closing the drawer.
- `src/app/globals.css` — responsive layout, drawer, table, packet layers, topology, and switching styles.
- `src/features/packet-flow/playback-controls.tsx` and tests — configurable Replay label while preserving existing users.
- `src/features/route-decision/route-decision-player.tsx` and `.test.tsx` — use evaluated journey and retain decision summary.
- `src/features/route-decision/route-decision-experience.tsx` and tests — server-safe static journey alongside the client enhancement.
- `src/features/switching/switching-comparison.tsx` and `.test.tsx` — one selected intermediary at a time.
- `tests/e2e/lesson.spec.ts`, `tests/e2e/route-decision.spec.ts`, `tests/e2e/hubs-bridges-switches.spec.ts` — responsive, keyboard, animation-stage, and reduced-motion acceptance coverage.

---

### Task 1: Fix responsive lesson readability

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/features/lessons/lesson-shell.test.tsx`
- Modify: `tests/e2e/lesson.spec.ts`

**Interfaces:**
- Consumes: existing `.lesson-page`, `.lesson-shell`, `.lesson-table`, and interactive card classes.
- Produces: a single-column lesson layout and `.lesson-table-scroll` overflow contract used by lesson MDX/content renderers.

- [ ] **Step 1: Write failing layout assertions**

Add an E2E case that loads a published lesson at 360px and desktop widths and asserts:

```ts
await expect(page.locator("html")).toHaveJSProperty("scrollWidth", 360);
await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
await expect(page.getByText("Bridge", { exact: true })).toBeVisible();
```

Use `page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)` for the final overflow assertion, and assert the permanent `aside[aria-label='Course contents']` is absent.

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `pnpm exec vitest run src/features/lessons/lesson-shell.test.tsx`

Run: `pnpm exec playwright test tests/e2e/lesson.spec.ts --project=mobile-chromium`

Expected: FAIL because the desktop shell still reserves a sidebar and current wrapping permits crushed content.

- [ ] **Step 3: Implement the minimal CSS layout correction**

Change `.lesson-page` to a centred, single-column container. Replace broad `overflow-wrap: anywhere` on normal labels/cells with:

```css
word-break: normal;
overflow-wrap: break-word;
hyphens: none;
```

Give lesson headings a bounded `clamp()` size. Make table wrappers use `overflow-x: auto`, `max-width: 100%`, and `tabindex="0"` at the rendering boundary; give table columns/minimum table width enough room to retain whole labels. Stack cards at the breakpoint where their content would otherwise split.

- [ ] **Step 4: Re-run focused tests**

Run the two commands from Step 2.

Expected: PASS, with no document-level horizontal overflow.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/features/lessons/lesson-shell.test.tsx tests/e2e/lesson.spec.ts
git commit -m "fix: make lesson content responsive"
```

---

### Task 2: Add the floating course-contents drawer

**Files:**
- Create: `src/features/lessons/course-contents-drawer.tsx`
- Create: `src/features/lessons/course-contents-drawer.test.tsx`
- Modify: `src/features/lessons/curriculum-navigation.tsx`
- Modify: `src/features/lessons/lesson-shell.tsx`
- Modify: `src/features/lessons/lesson-shell.test.tsx`
- Modify: `src/app/globals.css`
- Modify: `tests/e2e/navigation.spec.ts`

**Interfaces:**
- Consumes: `Pathway`, current lesson slug, and `CurriculumNavigation`.
- Produces: `CourseContentsDrawer({ pathway, currentLessonSlug }: CourseContentsDrawerProps)` and `CurriculumNavigation` optional `onLessonSelect?: () => void`.

- [ ] **Step 1: Write failing drawer component tests**

Cover the collapsed initial state, trigger, dialog name, Close button, Escape, backdrop dismissal, lesson selection, focus containment, and focus return:

```tsx
render(<CourseContentsDrawer pathway={pathway} currentLessonSlug="current" />);
const trigger = screen.getByRole("button", { name: "Course contents" });
expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
await user.click(trigger);
expect(screen.getByRole("dialog", { name: "Course contents" })).toBeVisible();
await user.keyboard("{Escape}");
expect(trigger).toHaveFocus();
```

Use a real published lesson link to verify the optional selection callback closes the drawer.

- [ ] **Step 2: Run the tests and confirm failure**

Run: `pnpm exec vitest run src/features/lessons/course-contents-drawer.test.tsx src/features/lessons/lesson-shell.test.tsx`

Expected: FAIL because the drawer does not exist.

- [ ] **Step 3: Implement drawer behavior**

Create a client component with `open` state, trigger/dialog refs, an Escape listener active only while open, focusable-element discovery, Tab/Shift+Tab containment, and focus restoration. Render a backdrop button with an accessible dismissal label, and set the drawer to `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.

Update `CurriculumNavigation` so published links call `onLessonSelect` without changing server-only callers. Replace the desktop aside and mobile details in `LessonShell` with the drawer plus an in-flow `<noscript>` curriculum fallback.

- [ ] **Step 4: Style and verify the drawer**

Add fixed trigger, backdrop, slide-in panel, scroll containment, visible focus, and reduced-motion styles. Ensure the trigger remains reachable without covering primary lesson controls.

Run: `pnpm exec vitest run src/features/lessons/course-contents-drawer.test.tsx src/features/lessons/lesson-shell.test.tsx src/features/lessons/curriculum-navigation.test.tsx`

Run: `pnpm exec playwright test tests/e2e/navigation.spec.ts`

Expected: PASS for desktop, mobile, keyboard, and dismissal behavior.

- [ ] **Step 5: Commit**

```bash
git add src/features/lessons/course-contents-drawer.tsx src/features/lessons/course-contents-drawer.test.tsx src/features/lessons/curriculum-navigation.tsx src/features/lessons/lesson-shell.tsx src/features/lessons/lesson-shell.test.tsx src/app/globals.css tests/e2e/navigation.spec.ts
git commit -m "feat: add floating course contents drawer"
```

---

### Task 3: Define packet-journey types and route adapter

**Files:**
- Create: `src/features/packet-journey/packet-journey.types.ts`
- Create: `src/features/packet-journey/packet-journey.schema.ts`
- Create: `src/features/packet-journey/packet-journey.schema.test.ts`
- Create: `src/features/route-decision/create-route-journey.ts`
- Create: `src/features/route-decision/create-route-journey.test.ts`

**Interfaces:**
- Consumes: `RouteDecisionScenario`, `RouteDecisionOutcome`.
- Produces:

```ts
type PacketLayer = Readonly<{
  kind: "application" | "ip" | "ethernet";
  label: string;
  fields: readonly Readonly<{ label: string; value: string; changed?: boolean }>[];
}>;

type PacketJourneyStage = Readonly<{
  id: string;
  title: string;
  explanation: string;
  technicalDetail?: string;
  activeDeviceId: "source" | "router" | "destination";
  activeInterfaceId?: string;
  activeLinkId?: "source-router" | "router-destination" | "source-destination";
  position: "at-device" | "on-link" | "at-boundary";
  layers: readonly PacketLayer[];
}>;

type PacketJourney = Readonly<{
  id: string;
  accessibleName: string;
  devices: readonly Readonly<{ id: string; label: string; kind: "host" | "router" | "server"; interfaces: readonly string[] }>[];
  stages: readonly PacketJourneyStage[];
}>;

function createRouteJourney(
  scenario: RouteDecisionScenario,
  outcome: RouteDecisionOutcome,
): PacketJourney;
```

- [ ] **Step 1: Write schema and adapter tests first**

Test unique stage identifiers, at least one stage, valid active device/link references, and non-empty layer fields. For the remote scenario assert this exact semantic sequence:

```ts
expect(journey.stages.map(({ id }) => id)).toEqual([
  "build-at-source",
  "leave-source-eth0",
  "open-at-router-lan",
  "choose-router-wan",
  "reframe-for-next-link",
  "deliver-to-destination",
]);
```

Assert IP source/destination remain equal before and after the router, TTL changes from `64` to `63`, and Ethernet MAC values change. Add exact outcome assertions for on-link direct delivery, gateway-self termination, no-route source failure, and local-broadcast boundary stop.

- [ ] **Step 2: Run tests and confirm failure**

Run: `pnpm exec vitest run src/features/packet-journey/packet-journey.schema.test.ts src/features/route-decision/create-route-journey.test.ts`

Expected: FAIL because the types, schema, and adapter do not exist.

- [ ] **Step 3: Implement model validation**

Define readonly TypeScript types and Zod schemas. Export `parsePacketJourney(input: unknown): PacketJourney` and `safeParsePacketJourney(input: unknown)`. Validate references with `superRefine`; do not import any lesson-domain module into `packet-journey`.

- [ ] **Step 4: Implement the route adapter**

Build small private helpers for application, IP, and Ethernet layers. Use stable interface labels (`Host eth0`, `Router LAN`, `Router WAN`, `Destination eth0`). Select the stage sequence from `outcome.scope` and `outcome.boundaryAction`; do not recompute route selection in the adapter.

- [ ] **Step 5: Run tests and commit**

Run the command from Step 2.

Expected: PASS for validation and all five journeys.

```bash
git add src/features/packet-journey src/features/route-decision/create-route-journey.ts src/features/route-decision/create-route-journey.test.ts
git commit -m "feat: model beginner packet journeys"
```

---

### Task 4: Build the accessible packet-journey player

**Files:**
- Create: `src/features/packet-journey/packet-journey-stage.tsx`
- Create: `src/features/packet-journey/packet-journey-stage.test.tsx`
- Create: `src/features/packet-journey/packet-journey-player.tsx`
- Create: `src/features/packet-journey/packet-journey-player.test.tsx`
- Create: `src/features/packet-journey/static-packet-journey.tsx`
- Modify: `src/features/packet-flow/playback-controls.tsx`
- Modify: `src/features/packet-flow/packet-flow-player.test.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `PacketJourney`, existing `createPlaybackState`, `playbackReducer`, `getStepDelay`, `PlaybackControls`, and `useReducedMotionState`.
- Produces:

```ts
function PacketJourneyPlayer({ journey }: { journey: PacketJourney }): React.JSX.Element;
function PacketJourneyStageView({ journey, stage }: { journey: PacketJourney; stage: PacketJourneyStage }): React.JSX.Element;
function StaticPacketJourney({ journey }: { journey: PacketJourney }): React.JSX.Element;
```

- [ ] **Step 1: Write failing stage-rendering tests**

Assert labelled devices and interfaces, active device/link data attributes, nested layers in application → IP → Ethernet order, and `changed` field output that contains text as well as color. Pass invalid parsed data to the boundary/fallback path and expect “Packet journey unavailable”.

- [ ] **Step 2: Write failing playback tests**

Use fake timers to assert initial autoplay, stage advancement, stop at final stage, Replay, speed changes, and timer cleanup. Assert Previous/Next pauses playback. Mock reduced motion and assert stage zero remains static until Next is activated.

- [ ] **Step 3: Run tests and confirm failure**

Run: `pnpm exec vitest run src/features/packet-journey src/features/packet-flow/packet-flow-player.test.tsx`

Expected: FAIL because the player files do not exist.

- [ ] **Step 4: Implement stage and static renderers**

Render a semantic text summary and an SVG topology with explicit interface labels. Render the packet as nested `<section>` elements with headings for Ethernet frame, IP packet, and Application data. Pause the travelling marker at device stages and use `data-position`, `data-active-device`, and `data-active-link` for deterministic tests and CSS.

- [ ] **Step 5: Implement playback orchestration**

Initialize the existing reducer with `journey.stages.length`. Dispatch timed `tick` actions only while hydrated, playing, and not reduced-motion. Reset with `{ type: "restart", autoplay: !reducedMotion }` when `journey.id` changes. Configure `PlaybackControls` to display `Replay` at completion without changing the current PacketFlowPlayer behavior.

- [ ] **Step 6: Style packet movement and unfolding**

Add topology grid/SVG positioning, nested packet layers, changed-field badges, link marker transitions, and device-stage unfold transitions. Under `prefers-reduced-motion`, remove transforms/transitions and hide continuous travel while retaining the selected static stage.

- [ ] **Step 7: Run tests and commit**

Run the command from Step 3.

Expected: PASS for normal playback, reduced motion, controls, and static output.

```bash
git add src/features/packet-journey src/features/packet-flow/playback-controls.tsx src/features/packet-flow/packet-flow-player.test.tsx src/app/globals.css
git commit -m "feat: add accessible packet journey player"
```

---

### Task 5: Integrate the journey into the route lesson

**Files:**
- Modify: `src/features/route-decision/route-decision-player.tsx`
- Modify: `src/features/route-decision/route-decision-player.test.tsx`
- Modify: `src/features/route-decision/route-decision-experience.tsx`
- Modify: `src/features/route-decision/route-decision-experience.test.tsx`
- Modify: `tests/e2e/route-decision.spec.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `evaluateRouteDecision(scenario)`, `createRouteJourney(scenario, outcome)`, `PacketJourneyPlayer`, and `StaticPacketJourney`.
- Produces: scenario-driven packet journeys while retaining the existing Decision, Outgoing interface, Next hop, First frame, and Boundary action summary.

- [ ] **Step 1: Replace static-diagram expectations with failing journey expectations**

Assert scenario selection renders the first stage and autoplays. For the remote scenario assert the visible order includes `Host eth0`, `Router LAN`, `Router WAN`, TTL `64`, then TTL `63`, and the new Ethernet MAC fields. For no-route and broadcast assert their terminal explanations and positions. Retain tests for plain/technical explanation selection and public-data boundaries.

- [ ] **Step 2: Add failing E2E journey tests**

Drive the scenario using accessible radio names, pause playback, and use Next to verify layer/state changes at each hop. Add a reduced-motion context and assert no automatic stage advancement. Verify the server/no-JavaScript project contains the ordered static explanation.

- [ ] **Step 3: Run focused tests and confirm failure**

Run: `pnpm exec vitest run src/features/route-decision/route-decision-player.test.tsx src/features/route-decision/route-decision-experience.test.tsx`

Run: `pnpm exec playwright test tests/e2e/route-decision.spec.ts`

Expected: FAIL while the static topology remains.

- [ ] **Step 4: Integrate client and static journeys**

Compute `outcome` once, pass it to `createRouteJourney`, and render `PacketJourneyPlayer`. Keep the compact decision result cards beneath the journey. In the server experience, render `StaticPacketJourney` from public scenario data as the useful fallback; do not serialize or import account scenario modules.

- [ ] **Step 5: Run focused verification and commit**

Run both commands from Step 3.

Expected: PASS across desktop, mobile, no-JavaScript, and reduced-motion variants.

```bash
git add src/features/route-decision tests/e2e/route-decision.spec.ts src/app/globals.css
git commit -m "feat: animate route decisions hop by hop"
```

---

### Task 6: Simplify switching comparison and run full regression

**Files:**
- Create: `src/features/switching/create-switching-journey.ts`
- Create: `src/features/switching/create-switching-journey.test.ts`
- Modify: `src/features/switching/switching-comparison.tsx`
- Modify: `src/features/switching/switching-comparison.test.tsx`
- Modify: `tests/e2e/hubs-bridges-switches.spec.ts`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `publicSwitchingComparison`, `ComparisonDimensionId`, and packet-journey presentation primitives.
- Produces: `createSwitchingJourney(deviceId, dimensionId): PacketJourney` and a single selected Hub/Bridge/Switch panel.

- [ ] **Step 1: Write failing switching-adapter tests**

Assert the hub repeats toward both eligible egress ports, while bridge and switch stages use the selected dimension's `filter`, `forward`, `flood`, or `learn` behavior. Assert no stage uses routing, gateway, security-boundary, or IP-forwarding language.

- [ ] **Step 2: Write failing component and E2E tests**

Assert three selector tabs/buttons exist but only one device heading and journey are presented at a time. Select each device and dimension and verify the three beginner questions are answered: what entered, where it left, and what was inspected or learned. At 360px assert no page overflow and that the at-a-glance table scrolls rather than splitting device names.

- [ ] **Step 3: Run focused tests and confirm failure**

Run: `pnpm exec vitest run src/features/switching/create-switching-journey.test.ts src/features/switching/switching-comparison.test.tsx`

Run: `pnpm exec playwright test tests/e2e/hubs-bridges-switches.spec.ts`

Expected: FAIL because all three dense cards are still rendered simultaneously.

- [ ] **Step 4: Implement selected-device comparison**

Add `deviceId` state defaulting to `hub`. Render an accessible selector, one `PacketJourneyPlayer`, a concise “What changed?” summary, and an optional technical-detail disclosure. Keep the existing dimension selector and at-a-glance table. Do not include protected switching scenarios.

- [ ] **Step 5: Run focused tests**

Run both commands from Step 3.

Expected: PASS for semantic correctness and responsive presentation.

- [ ] **Step 6: Run the full quality gate**

Run:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Expected: every command exits 0. Record the exact Vitest and Playwright pass counts in the handoff. If a command fails, diagnose the root cause and rerun the smallest affected test before repeating this gate.

- [ ] **Step 7: Commit**

```bash
git add src/features/switching tests/e2e/hubs-bridges-switches.spec.ts src/app/globals.css
git commit -m "feat: simplify switching packet comparison"
```

- [ ] **Step 8: Inspect final branch state**

Run: `git status --short`

Expected: no output. Then use `superpowers:requesting-code-review` before presenting merge or push options.
