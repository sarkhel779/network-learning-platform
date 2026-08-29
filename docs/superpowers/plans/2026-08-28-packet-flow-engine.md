# Packet-Flow Animation Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable, accessible packet-flow player to the published “How Networks Communicate” lesson, covering gateway ARP and the complete ICMP request/reply path.

**Architecture:** Validated immutable scenario data feeds a client-side React player. A pure playback reducer controls step, play state, and speed; focused view components render the responsive SVG topology, controls, explanation, and packet inspector. The existing static diagram remains the no-script and invalid-scenario fallback.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9, Zod 4, MDX 3, Vitest 3, Testing Library, Playwright 1.55, SVG, CSS

**Spec:** `docs/superpowers/specs/2026-08-28-packet-flow-engine-design.md`

## Global Constraints

- Do not add a runtime or development dependency.
- Keep scenario content outside MDX and reference topology elements by stable identifiers.
- Preserve the existing static diagram and complete lesson text for no-script and failure fallback.
- Autoplay at 1× unless `prefers-reduced-motion: reduce` is active; reduced-motion mode starts paused.
- Support exactly 0.5×, 1×, 1.5×, and 2× speeds.
- Previous and Next pause playback; the final step pauses and disables Play and Next.
- Use native button, select, and details/summary controls with visible focus behavior.
- Do not imply that switches route packets or that end-to-end IPv4 addresses change at a router.
- Use `node node_modules/vitest/vitest.mjs run --configLoader runner` when the Windows sandbox cannot load the Vitest config normally.

---

## File Structure

- `src/features/packet-flow/packet-flow.schema.ts`: Zod schemas, inferred public types, and validation entry point.
- `src/features/packet-flow/packet-flow.schema.test.ts`: valid and invalid scenario contract tests.
- `src/features/packet-flow/network-communication.scenario.ts`: the approved ARP and ICMP scenario data.
- `src/features/packet-flow/network-communication.scenario.test.ts`: protocol-order and addressing invariants.
- `src/features/packet-flow/playback.ts`: pure playback state, actions, reducer, and interval calculation.
- `src/features/packet-flow/playback.test.ts`: deterministic transition tests.
- `src/features/packet-flow/use-reduced-motion.ts`: browser preference subscription.
- `src/features/packet-flow/network-topology.tsx`: accessible SVG topology and current packet/link state.
- `src/features/packet-flow/packet-inspector.tsx`: simple and expandable packet fields.
- `src/features/packet-flow/playback-controls.tsx`: native playback controls and speed selector.
- `src/features/packet-flow/packet-flow-player.tsx`: timer orchestration and synchronized composition.
- `src/features/packet-flow/packet-flow-player.test.tsx`: user interaction, timers, inspector, and reduced-motion tests.
- `src/features/packet-flow/packet-flow-error-boundary.tsx`: catches unexpected interactive rendering failures without hiding lesson content.
- `src/features/packet-flow/packet-flow-experience.tsx`: validated lesson-facing boundary and static-fallback notice.
- `src/features/packet-flow/packet-flow-experience.test.tsx`: validation/fallback tests.
- `src/content/networking-foundations/how-networks-communicate.mdx`: replace the Plan 2 notice with the player.
- `mdx-components.tsx`: expose the lesson-facing component to MDX.
- `src/app/globals.css`: responsive topology, state, controls, inspector, and reduced-motion styles.
- `tests/e2e/packet-flow.spec.ts`: desktop, mobile, keyboard, speed, sequence, and reduced-motion browser tests.
- `tests/e2e/lesson.spec.ts`: preserve and extend no-script fallback assertions.

---

### Task 1: Define and Validate the Scenario Contract

**Files:**
- Create: `src/features/packet-flow/packet-flow.schema.ts`
- Create: `src/features/packet-flow/packet-flow.schema.test.ts`

**Interfaces:**
- Produces: `PLAYBACK_SPEEDS`, `PacketFlowScenario`, `PacketFlowStep`, `parsePacketFlowScenario(input: unknown): PacketFlowScenario`, and `safeParsePacketFlowScenario(input: unknown)`.
- Consumes: Zod 4 already present in `package.json`.

- [ ] **Step 1: Write the failing schema tests**

Create fixtures with two devices, one link, and one step. Assert that a valid scenario parses, then assert rejection for duplicate device IDs, an unknown active device, an unknown active link, a packet path not matching the active link endpoints, an empty step list, `durationMs: 0`, and `defaultSpeed: 3`.

```ts
import { describe, expect, it } from "vitest";

import { parsePacketFlowScenario } from "./packet-flow.schema";

const validScenario = {
  id: "test-flow",
  title: "Test flow",
  description: "A small validated flow.",
  defaultSpeed: 1,
  devices: [
    { id: "pc", label: "PC", role: "Source host", x: 80, y: 100 },
    { id: "router", label: "Router", role: "Gateway", x: 260, y: 100 },
  ],
  links: [{ id: "pc-router", from: "pc", to: "router" }],
  steps: [{
    id: "send",
    title: "Send",
    explanation: "The PC sends one frame.",
    durationMs: 2000,
    activeDeviceIds: ["pc"],
    activeLinkIds: ["pc-router"],
    packet: { kind: "frame", label: "ARP", from: "pc", to: "router" },
    summaryFields: [{ label: "Protocol", value: "ARP" }],
    detailFields: [],
  }],
} as const;

describe("parsePacketFlowScenario", () => {
  it("accepts a valid scenario", () => {
    expect(parsePacketFlowScenario(validScenario).id).toBe("test-flow");
  });

  it.each([
    ["duplicate device", { ...validScenario, devices: [validScenario.devices[0], validScenario.devices[0]] }],
    ["unknown device", { ...validScenario, steps: [{ ...validScenario.steps[0], activeDeviceIds: ["missing"] }] }],
    ["empty steps", { ...validScenario, steps: [] }],
    ["invalid duration", { ...validScenario, steps: [{ ...validScenario.steps[0], durationMs: 0 }] }],
    ["unsupported speed", { ...validScenario, defaultSpeed: 3 }],
  ])("rejects %s", (_name, scenario) => {
    expect(() => parsePacketFlowScenario(scenario)).toThrow();
  });
});
```

- [ ] **Step 2: Run the schema test to verify it fails**

Run:

```powershell
node node_modules\vitest\vitest.mjs run src/features/packet-flow/packet-flow.schema.test.ts --configLoader runner
```

Expected: FAIL because `packet-flow.schema.ts` does not exist.

- [ ] **Step 3: Implement the schema and cross-reference validation**

Define these exact public shapes through Zod inference:

```ts
export const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2] as const;

const fieldSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  changed: z.boolean().optional(),
});

const stepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  explanation: z.string().min(1),
  durationMs: z.number().int().positive(),
  activeDeviceIds: z.array(z.string().min(1)),
  activeLinkIds: z.array(z.string().min(1)),
  packet: z.object({
    kind: z.enum(["frame", "packet"]),
    label: z.string().min(1),
    from: z.string().min(1),
    to: z.string().min(1),
    broadcast: z.boolean().optional(),
  }).optional(),
  summaryFields: z.array(fieldSchema),
  detailFields: z.array(fieldSchema),
  stateNote: z.string().min(1).optional(),
});
```

Define devices as `{ id, label, role, x, y }`, links as `{ id, from, to }`, and the scenario as `{ id, title, description, defaultSpeed, devices, links, steps }`. Add one `superRefine` that builds device/link ID sets, rejects duplicates, validates all references, and verifies that `packet.from` and `packet.to` are the endpoints of at least one active link. Export strict `parse` and non-throwing `safeParse` functions.

- [ ] **Step 4: Run the schema tests**

Run the command from Step 2. Expected: all schema tests PASS.

- [ ] **Step 5: Commit the scenario contract**

```bash
git add src/features/packet-flow/packet-flow.schema.ts src/features/packet-flow/packet-flow.schema.test.ts
git commit -m "feat: define packet flow scenario contract"
```

---

### Task 2: Author the ARP and ICMP Scenario

**Files:**
- Create: `src/features/packet-flow/network-communication.scenario.ts`
- Create: `src/features/packet-flow/network-communication.scenario.test.ts`

**Interfaces:**
- Consumes: `parsePacketFlowScenario` and `PacketFlowScenario` from Task 1.
- Produces: `networkCommunicationScenario: PacketFlowScenario`.

- [ ] **Step 1: Write failing content-invariant tests**

Assert the exported scenario has exactly four devices in the order PC, Switch, Router, Server; contains all 11 approved learning stages; begins with remote-destination determination; contains ARP request before ARP reply; contains ICMP echo request before echo reply; ends in a successful ping; and uses these addressing invariants:

```ts
expect(echoRequest.summaryFields).toEqual(expect.arrayContaining([
  { label: "Destination MAC", value: "00:11:22:33:44:01" },
  { label: "Destination IP", value: "198.51.100.20" },
]));

expect(routedRequest.detailFields).toEqual(expect.arrayContaining([
  { label: "TTL", value: "63", changed: true },
]));
```

Use documentation-only addresses:

- PC: `192.0.2.10`, MAC `00:11:22:33:44:10`
- Gateway LAN: `192.0.2.1`, MAC `00:11:22:33:44:01`
- Router server-side MAC: `00:11:22:33:55:01`
- Server: `198.51.100.20`, MAC `00:11:22:33:55:20`

- [ ] **Step 2: Run the scenario test to verify it fails**

```powershell
node node_modules\vitest\vitest.mjs run src/features/packet-flow/network-communication.scenario.test.ts --configLoader runner
```

Expected: FAIL because the scenario module does not exist.

- [ ] **Step 3: Implement the complete 11-stage scenario**

Declare devices at x positions `80`, `280`, `520`, and `720`, with links `pc-switch`, `switch-router`, and `router-server`. Use `durationMs: 2600` for decision/state steps and `durationMs: 1800` for frame-travel steps. Each step must include beginner fields and only relevant detail fields. Model broadcast flooding with both LAN links active but move the ARP marker along one declared segment per step. Describe the reverse ICMP path explicitly rather than compressing it into an unexplained jump.

Export only the parsed immutable result:

```ts
export const networkCommunicationScenario = parsePacketFlowScenario({
  id: "network-communication-arp-icmp",
  title: "ARP and ICMP across two networks",
  description: "Follow a ping from a PC to a remote server and back.",
  defaultSpeed: 1,
  devices,
  links,
  steps,
});
```

- [ ] **Step 4: Run scenario and schema tests**

```powershell
node node_modules\vitest\vitest.mjs run src/features/packet-flow/packet-flow.schema.test.ts src/features/packet-flow/network-communication.scenario.test.ts --configLoader runner
```

Expected: both files PASS.

- [ ] **Step 5: Commit the validated lesson scenario**

```bash
git add src/features/packet-flow/network-communication.scenario.ts src/features/packet-flow/network-communication.scenario.test.ts
git commit -m "feat: author ARP and ICMP packet journey"
```

---

### Task 3: Implement Deterministic Playback State

**Files:**
- Create: `src/features/packet-flow/playback.ts`
- Create: `src/features/packet-flow/playback.test.ts`
- Create: `src/features/packet-flow/use-reduced-motion.ts`

**Interfaces:**
- Consumes: `PLAYBACK_SPEEDS` and its speed type from Task 1.
- Produces: `PlaybackState`, `PlaybackAction`, `createPlaybackState(stepCount, defaultSpeed, reducedMotion)`, `playbackReducer(state, action)`, `getStepDelay(durationMs, speed)`, and `useReducedMotion()`.

- [ ] **Step 1: Write failing pure playback tests**

Test these exact transitions:

```ts
expect(createPlaybackState(11, 1, false)).toEqual({
  stepIndex: 0, stepCount: 11, speed: 1, playing: true,
});
expect(createPlaybackState(11, 1, true).playing).toBe(false);
expect(playbackReducer(playing, { type: "pause" }).playing).toBe(false);
expect(playbackReducer(paused, { type: "play" }).playing).toBe(true);
expect(playbackReducer(playing, { type: "next" })).toMatchObject({ stepIndex: 1, playing: false });
expect(playbackReducer(atEnd, { type: "tick" })).toMatchObject({ stepIndex: 10, playing: false });
expect(playbackReducer(atEnd, { type: "restart", autoplay: true })).toMatchObject({ stepIndex: 0, playing: true });
expect(getStepDelay(1800, 2)).toBe(900);
```

Also test Previous clamps at zero, Next clamps at the final step, unsupported speed actions preserve the prior speed, and zero steps throws during initialization.

- [ ] **Step 2: Run the playback test to verify it fails**

```powershell
node node_modules\vitest\vitest.mjs run src/features/packet-flow/playback.test.ts --configLoader runner
```

Expected: FAIL because `playback.ts` does not exist.

- [ ] **Step 3: Implement the reducer and delay calculation**

Use this action union:

```ts
export type PlaybackAction =
  | { type: "play" }
  | { type: "pause" }
  | { type: "tick" }
  | { type: "next" }
  | { type: "previous" }
  | { type: "restart"; autoplay: boolean }
  | { type: "set-speed"; speed: PlaybackSpeed };
```

Keep the reducer pure. A `tick` advances only while playing; arriving at the last step sets `playing: false`. Manual Previous/Next always return `playing: false`. `getStepDelay` returns `durationMs / speed` and rejects non-positive duration.

- [ ] **Step 4: Implement `useReducedMotion`**

Use `window.matchMedia("(prefers-reduced-motion: reduce)")`, initialize safely during server rendering, subscribe with `addEventListener("change", listener)`, and remove the same listener on cleanup. The hook returns a boolean and contains no player state.

- [ ] **Step 5: Run playback tests**

Run the command from Step 2. Expected: all playback tests PASS.

- [ ] **Step 6: Commit playback state**

```bash
git add src/features/packet-flow/playback.ts src/features/packet-flow/playback.test.ts src/features/packet-flow/use-reduced-motion.ts
git commit -m "feat: add packet flow playback state"
```

---

### Task 4: Build the Accessible Packet-Flow Player

**Files:**
- Create: `src/features/packet-flow/network-topology.tsx`
- Create: `src/features/packet-flow/packet-inspector.tsx`
- Create: `src/features/packet-flow/playback-controls.tsx`
- Create: `src/features/packet-flow/packet-flow-player.tsx`
- Create: `src/features/packet-flow/packet-flow-player.test.tsx`

**Interfaces:**
- Consumes: `PacketFlowScenario`, `PacketFlowStep`, `PLAYBACK_SPEEDS`, playback reducer APIs, and `useReducedMotion()`.
- Produces: `PacketFlowPlayer({ scenario }: { scenario: PacketFlowScenario })`.

- [ ] **Step 1: Write failing player interaction tests with fake timers**

Render a two-step parsed fixture. Use `vi.useFakeTimers()` for autoplay and `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` for controls. Assert:

- Initial text is `Step 1 of 2` and Play is represented as a pressed Pause control.
- Advancing the first step duration moves to Step 2 and pauses.
- Pause prevents timer advancement; Play resumes it.
- Next and Previous update the explanation and pause.
- Restart returns to Step 1 and autoplays when reduced motion is false.
- Selecting `2×` changes the delay and the accessible selected value.
- Next and Play are disabled on the final step; Previous is disabled on the first.
- Opening `Technical packet details` reveals EtherType and TTL values.
- MAC and IP labels update synchronously with the selected step.
- Mocked reduced motion starts paused and Restart remains paused.

- [ ] **Step 2: Run the player test to verify it fails**

```powershell
node node_modules\vitest\vitest.mjs run src/features/packet-flow/packet-flow-player.test.tsx --configLoader runner
```

Expected: FAIL because player modules do not exist.

- [ ] **Step 3: Implement `NetworkTopology`**

Render an SVG with `viewBox="0 0 800 240"`, a `<title>` using the scenario title, and a `<desc>` summarizing device order and current step. Resolve link endpoints from device coordinates. Apply `data-active="true"` and class names to active devices/links. Render packet markers only when `step.packet` exists, add a visible label such as ARP or ICMP, set `aria-hidden="true"` on the moving marker, and render an adjacent visible text label `Active: <device/link description>`.

- [ ] **Step 4: Implement inspector and controls**

`PacketInspector` renders summary fields as a `<dl>` and technical fields inside:

```tsx
<details>
  <summary>Technical packet details</summary>
  <dl>
    {step.detailFields.map((field) => (
      <div data-changed={field.changed || undefined} key={field.label}>
        <dt>{field.label}</dt>
        <dd>{field.value}</dd>
        {field.changed ? <span>Changed at this hop</span> : null}
      </div>
    ))}
  </dl>
</details>
```

Add `data-changed="true"` to changed fields and visible text `Changed at this hop`. `PlaybackControls` uses native buttons and a labeled select. The Play/Pause button text follows state, and all disabled states derive from `stepIndex` and `stepCount`.

- [ ] **Step 5: Compose `PacketFlowPlayer` with timer cleanup**

Add `"use client"`. Initialize the reducer from scenario defaults and reduced-motion state. Schedule one `window.setTimeout` only when playing, clear it on every effect cleanup, and dispatch `tick` after `getStepDelay(currentStep.durationMs, speed)`. Render:

```tsx
<section className="packet-flow" aria-labelledby={`${scenario.id}-title`}>
  <h2 id={`${scenario.id}-title`}>Interactive packet journey</h2>
  <p>{scenario.description}</p>
  <NetworkTopology scenario={scenario} step={currentStep} reducedMotion={reducedMotion} />
  <PlaybackControls state={state} dispatch={dispatch} />
  <div className="packet-flow-details">
    <section aria-live="polite" aria-atomic="true">
      <p>Step {state.stepIndex + 1} of {state.stepCount}</p>
      <h3>{currentStep.title}</h3>
      <p>{currentStep.explanation}</p>
      {currentStep.stateNote ? <p>{currentStep.stateNote}</p> : null}
    </section>
    <PacketInspector step={currentStep} />
  </div>
</section>
```

- [ ] **Step 6: Run player and playback tests**

```powershell
node node_modules\vitest\vitest.mjs run src/features/packet-flow/playback.test.ts src/features/packet-flow/packet-flow-player.test.tsx --configLoader runner
```

Expected: both files PASS with no leaked fake timers.

- [ ] **Step 7: Commit the interactive player**

```bash
git add src/features/packet-flow/network-topology.tsx src/features/packet-flow/packet-inspector.tsx src/features/packet-flow/playback-controls.tsx src/features/packet-flow/packet-flow-player.tsx src/features/packet-flow/packet-flow-player.test.tsx
git commit -m "feat: add accessible packet flow player"
```

---

### Task 5: Integrate the Player with the Published Lesson

**Files:**
- Create: `src/features/packet-flow/packet-flow-error-boundary.tsx`
- Create: `src/features/packet-flow/packet-flow-experience.tsx`
- Create: `src/features/packet-flow/packet-flow-experience.test.tsx`
- Modify: `src/content/networking-foundations/how-networks-communicate.mdx`
- Modify: `mdx-components.tsx`
- Modify: `src/app/globals.css`
- Modify: `tests/e2e/lesson.spec.ts`

**Interfaces:**
- Consumes: `safeParsePacketFlowScenario`, `PacketFlowPlayer`, and `networkCommunicationScenario`.
- Produces: `PacketFlowExperience({ scenario })` and `NetworkCommunicationPacketFlow()` for MDX.

- [ ] **Step 1: Write failing experience tests**

Assert that `NetworkCommunicationPacketFlow` renders the `Interactive packet journey` heading and Step 1 content. Pass invalid data to `PacketFlowExperience` and assert it renders:

```text
The interactive packet journey is unavailable. Use the static diagram and explanation above.
```

Also assert the invalid path does not render playback controls. Render a test child that throws inside `PacketFlowErrorBoundary`, suppress the expected `console.error`, and assert the same fallback notice is displayed while sibling lesson text remains mounted.

- [ ] **Step 2: Run the experience test to verify it fails**

```powershell
node node_modules\vitest\vitest.mjs run src/features/packet-flow/packet-flow-experience.test.tsx --configLoader runner
```

Expected: FAIL because the experience module does not exist.

- [ ] **Step 3: Implement the rendering error boundary**

Create a focused client component extending `Component<Props, State>`. `getDerivedStateFromError()` sets `failed: true`; `componentDidCatch()` reports through `console.error("Packet-flow player failed", error)` without including scenario or learner data. When failed, render the same static-fallback notice used for validation errors. Otherwise render `children`.

- [ ] **Step 4: Implement the validated experience boundary**

Use `safeParsePacketFlowScenario` before rendering. Export:

```tsx
export function PacketFlowExperience({ scenario }: { scenario: unknown }) {
  const parsed = safeParsePacketFlowScenario(scenario);
  if (!parsed.success) {
    return <aside className="lesson-notice" role="note">The interactive packet journey is unavailable. Use the static diagram and explanation above.</aside>;
  }
  return (
    <PacketFlowErrorBoundary>
      <PacketFlowPlayer scenario={parsed.data} />
    </PacketFlowErrorBoundary>
  );
}

export function NetworkCommunicationPacketFlow() {
  return <PacketFlowExperience scenario={networkCommunicationScenario} />;
}
```

- [ ] **Step 5: Replace the placeholder notice and register the MDX component**

In `mdx-components.tsx`, import and expose `NetworkCommunicationPacketFlow`. In the lesson MDX, replace only the Plan 2 placeholder `<aside>` with:

```mdx
<NetworkCommunicationPacketFlow />
```

Keep the existing static `<figure>`, text alternative, Wireshark check, quiz, and interview scenario unchanged.

- [ ] **Step 6: Add focused responsive and state styles**

Extend `globals.css` with `.packet-flow`, `.packet-flow-topology`, `.packet-flow-controls`, `.packet-flow-progress`, `.packet-flow-details`, `.packet-flow-inspector`, active device/link selectors, broadcast styling, changed-field styling, and disabled-control styling. At `min-width: 56rem`, make `.packet-flow-details` a two-column grid. Ensure SVG remains `width: 100%; height: auto`, controls wrap, labels remain visible, and no fixed width can create horizontal page overflow.

Inside the existing reduced-motion media query, disable packet transition/animation and set the packet marker directly at the destination coordinates.

- [ ] **Step 7: Extend the no-script lesson test**

Keep the current static diagram assertions. Add an assertion that the main instructional explanation and `arp or icmp` filter remain visible with JavaScript disabled. Do not require the client-only playback controls in that test.

- [ ] **Step 8: Run focused and full unit verification**

```powershell
node node_modules\vitest\vitest.mjs run src/features/packet-flow --configLoader runner
node node_modules\vitest\vitest.mjs run --configLoader runner
pnpm typecheck
pnpm lint
```

Expected: all tests, type-check, and lint PASS.

- [ ] **Step 9: Commit lesson integration**

```bash
git add src/features/packet-flow/packet-flow-error-boundary.tsx src/features/packet-flow/packet-flow-experience.tsx src/features/packet-flow/packet-flow-experience.test.tsx src/content/networking-foundations/how-networks-communicate.mdx mdx-components.tsx src/app/globals.css tests/e2e/lesson.spec.ts
git commit -m "feat: embed packet journey in first lesson"
```

---

### Task 6: Add Production Browser Coverage

**Files:**
- Create: `tests/e2e/packet-flow.spec.ts`

**Interfaces:**
- Consumes: visible player roles, labels, step text, and `data-active` state from Tasks 4–5.
- Produces: desktop/mobile behavior evidence for the complete interactive scenario.

- [ ] **Step 1: Write the end-to-end behavior tests**

Use the published lesson URL. Add tests that:

1. Confirm Step 1 appears and autoplay reaches Step 2.
2. Pause, wait longer than the current duration, and confirm the step does not change.
3. Use Next, Previous, and Restart and confirm their exact step results.
4. Select `2×`, resume, and confirm the next step arrives within the shortened interval.
5. Repeatedly click Next until the final successful-ping step, then assert Play and Next are disabled.
6. Expand `Technical packet details` and confirm EtherType, ARP opcode, TTL, and ICMP type appear on relevant steps.
7. Use keyboard Tab/Enter/Space to operate the primary controls.
8. Emulate reduced motion before navigation and confirm Step 1 remains paused beyond its duration.
9. In the mobile project, assert the player and inspector fit within the viewport:

```ts
const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
expect(overflow).toBe(false);
```

- [ ] **Step 2: Run the focused browser test**

```powershell
pnpm exec playwright test tests/e2e/packet-flow.spec.ts
```

Expected: all packet-flow tests PASS in `chromium` and `mobile-chromium`.

- [ ] **Step 3: Run complete production verification**

```powershell
node node_modules\vitest\vitest.mjs run --configLoader runner
pnpm typecheck
pnpm lint
pnpm build
pnpm exec playwright test
```

Expected: 0 unit failures, type-check PASS, lint PASS, production build PASS with the lesson route generated as SSG, and all desktop/mobile Playwright tests PASS.

- [ ] **Step 4: Inspect the final diff and commit browser coverage**

```bash
git diff --check main...HEAD
git status --short
git add tests/e2e/packet-flow.spec.ts
git commit -m "test: cover packet flow learning journey"
```

- [ ] **Step 5: Record the implementation checkpoint**

Capture the final branch name, commit hash, verification counts, non-blocking environment warnings, and any deliberately deferred follow-ups. Keep the worktree at `C:/Users/Pranita Pati/Documents/Codex/2026-08-27/s/work/packet-flow-engine` for review and pull-request feedback.
