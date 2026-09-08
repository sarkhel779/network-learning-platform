# Hubs, Bridges and Switches Lesson Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the fourth Networking Foundations lesson with an accurate public hub/bridge/switch comparison, a protected six-scenario frame-forwarding lab, evidence-led troubleshooting, and strict anonymous-content boundaries.

**Architecture:** Follow the proven connection-media split: catalog and MDX repositories remain authoritative, public comparison data is safe to ship anonymously, and authored exercises stay behind a `server-only` loader. Zod validates both datasets, a pure evaluator owns every learning/forwarding/filtering/flooding rule, and focused React components render public explanation and authorized practice without duplicating network logic.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9 strict mode, MDX 3, Zod 4, Vitest 3, Testing Library, Playwright 1.55, CSS.

**Spec:** `docs/superpowers/specs/2026-09-08-hubs-bridges-switches-lesson-design.md`

## Global Constraints

- Preserve the approved slug `hubs-bridges-and-switches`, catalog position, title, objective, SEO metadata, and `estimatedMinutes: 20`.
- Previous is `cables-fibre-wireless-and-network-connections`; Next is the planned `routers-default-gateways-and-network-boundaries` entry.
- Teach behavior before terminology and remain vendor-neutral; use **forwarding table** before CAM/MAC-address-table terminology.
- A hub repeats physical signals and has no MAC awareness or forwarding table.
- A bridge or switch learns the source MAC on ingress, then looks up the destination MAC; it never learns a destination from the lookup.
- Known unicast forwards only to the learned destination port; a destination on the ingress port is filtered.
- Unknown unicast and broadcast flood only to eligible ports other than ingress.
- Dynamic aging is implementation-dependent; do not teach a universal timer.
- Each full-duplex switch port normally forms a separate collision domain, but a switch alone does not create separate broadcast domains, route, authorize, or encrypt traffic.
- Do not teach VLANs, trunks, STP, link aggregation, port security, PoE, router behavior, vendor commands, ASIC design, QoS, multicast snooping, or packet-capture uploads.
- Public responses may contain only beginner prose and public comparison data; account scenarios, answers, troubleshooting answers, knowledge-check answers, and Pro detail must not enter anonymous HTML, RSC, metadata, or requested client JavaScript.
- The only upgrade action is exactly **Join the Pro Member Waitlist**, temporarily linking to `/contact`; no checkout or immediate Pro entitlement is implemented.
- **I know this—proceed to advanced** selects `same-segment-filtering`, resets all predictions/results, focuses its scenario radio, and never bypasses access controls.
- Essential public conclusions remain usable without JavaScript and animation.
- Support keyboard input, visible focus, one polite announcement per submission, reduced motion, and 360px layouts without document-level horizontal overflow.
- Wide forwarding tables live in a labelled, focusable local scroll region.
- Invalid authored account data renders explicit static troubleshooting guidance rather than throwing or substituting hidden scenarios.
- Add no runtime dependency, external request, learner-data persistence, authentication implementation, payment integration, or hardware access.
- Follow TDD for every task; run focused tests during implementation and the complete project gate only once at the end.
- Never stage `.pnpm-store/`, `.next/`, `test-results/`, or generated Playwright reports.

## File Structure

- `src/features/switching/switching.schema.ts` owns public comparison and protected scenario schemas plus inferred types.
- `src/features/switching/switching.data.ts` owns only anonymous-safe hub/bridge/switch comparison data.
- `src/features/switching/switching.account.scenarios.ts` is the `server-only` authored source for six protected scenarios and their explanations.
- `src/features/switching/switching.account-loader.ts` combines public topology facts with protected authored data, validates once, and returns explicit scenario props or `undefined`.
- `src/features/switching/evaluate-frame-forwarding.ts` is the pure Ethernet learning/forwarding evaluator.
- `src/features/switching/switching-comparison.tsx` renders the public interactive and no-JavaScript-safe comparison.
- `src/features/switching/frame-forwarding-lab.tsx` renders authorized scenario selection, table evidence, predictions, feedback, focus management, and announcements.
- `src/features/switching/frame-forwarding-experience.tsx` validates authorized props, composes the lab, and owns the static troubleshooting fallback/workflow.
- `src/content/networking-foundations/hubs-bridges-and-switches.public.mdx` contains the six anonymous-safe teaching sections.
- `src/content/networking-foundations/hubs-bridges-and-switches.account.mdx` directly imports the server loader and authorized experience for sections 7–10.
- Existing catalog, lesson repository, MDX registry, route tests, content-contract tests, CSS, sitemap tests, and E2E coverage receive focused integration changes.

---

### Task 1: Publish the Catalog Entry and Establish Content Boundaries

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/catalog/module-list.test.tsx`
- Modify: `src/features/catalog/pathway-overview.test.tsx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `src/content/lesson-access.content.test.ts`
- Create: `src/content/networking-foundations/hubs-bridges-and-switches.public.mdx`
- Create: `src/content/networking-foundations/hubs-bridges-and-switches.account.mdx`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
- Modify: `src/app/sitemap.test.ts`

**Interfaces:**
- Consumes: `loadAuthorizedLessonContent(key: LessonContentKey, access: ViewerAccess)` and existing catalog repository APIs.
- Produces: published key `networking-foundations/hubs-bridges-and-switches`, ten exact catalog section IDs, anonymous public module, authorized account module, and updated published/coming-later counts.

- [ ] **Step 1: Write failing catalog, repository, route, sitemap, and access-boundary tests**

Assert the catalog entry is published with its existing metadata and exactly these sections:

```ts
expect(getLesson("networking-foundations", "hubs-bridges-and-switches")).toMatchObject({
  title: "Hubs, Bridges and Switches",
  objective: "Explain why hubs repeat signals while bridges and switches make link-layer forwarding decisions.",
  estimatedMinutes: 20,
  published: true,
  seo: {
    title: "Hubs, Bridges and Switches Explained",
    description: "See how hubs repeat traffic while bridges and switches make selective link-layer forwarding choices on a local network.",
  },
  sections: [
    { id: "one-local-ethernet-conversation", access: "public" },
    { id: "what-a-hub-does", access: "public" },
    { id: "why-bridges-changed-ethernet", access: "public" },
    { id: "how-a-switch-learns", access: "public" },
    { id: "how-a-switch-forwards", access: "public" },
    { id: "compare-hub-bridge-switch", access: "public" },
    { id: "forward-the-frame", access: "account" },
    { id: "diagnose-local-switching-symptoms", access: "account" },
    { id: "knowledge-check-summary", access: "account" },
    { id: "pro-deep-dive", access: "pro" },
  ],
});
```

Also assert:

```ts
expect(getAdjacentLessons("networking-foundations", "hubs-bridges-and-switches")).toMatchObject({
  previous: { slug: "cables-fibre-wireless-and-network-connections" },
  next: { slug: "routers-default-gateways-and-network-boundaries", published: false },
});
expect(await loadAuthorizedLessonContent(
  "networking-foundations/hubs-bridges-and-switches",
  "anonymous",
)).toMatchObject({ public: expect.any(Object), account: undefined });
```

Update UI count expectations from four to five published lessons and from nineteen to eighteen coming-later lessons. Verify sitemap contains `/learn/networking-foundations/hubs-bridges-and-switches` once. Add protected phrases such as `same-segment-filtering`, `Host moved from port 2 to port 4`, and `VLAN-aware forwarding` to the anonymous content exclusion test.

- [ ] **Step 2: Run focused tests and confirm the unpublished/missing-import failures**

Run:

```bash
pnpmc vitest run src/features/catalog/catalog.repository.test.ts src/features/catalog/module-list.test.tsx src/features/catalog/pathway-overview.test.tsx src/features/lessons/lesson-content.repository.test.ts src/content/lesson-access.content.test.ts "src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts" src/app/sitemap.test.ts
```

Expected: FAIL because the lesson is planned, has no sections, and has no content imports.

- [ ] **Step 3: Publish the catalog entry and register separate MDX imports**

Replace `plannedLesson({...})` with the existing lesson object plus `published: true` and the exact section array from Step 1. Add repository imports:

```ts
"networking-foundations/hubs-bridges-and-switches": {
  public: () => import("@/content/networking-foundations/hubs-bridges-and-switches.public.mdx"),
  account: () => import("@/content/networking-foundations/hubs-bridges-and-switches.account.mdx"),
},
```

Create the public MDX with the six exact `h2` IDs and beginner-safe prose covering local frames, hub repetition, bridge segmentation, source learning, destination lookup, and the five switch decisions. Include a static `table` labelled **Hub, bridge and switch at a glance**. Create the account MDX with the four exact account/Pro IDs; initially render static headings and access-safe explanatory copy only, including the exact `/contact` CTA:

```mdx
<PremiumPreview
  title="Pro Deep Dive"
  description="Preview VLAN-aware forwarding, STP reasoning, managed-switch evidence, standards-guided checks, advanced Wireshark analysis, and interview preparation."
  href="/contact"
  cta="Join the Pro Member Waitlist"
/>
```

- [ ] **Step 4: Run the focused tests and confirm they pass**

Run the command from Step 2. Expected: all listed files PASS and anonymous loading excludes account content.

- [ ] **Step 5: Commit the publication boundary**

```bash
git add src/features/catalog src/features/lessons/lesson-content.repository.ts src/features/lessons/lesson-content.repository.test.ts src/content/lesson-access.content.test.ts src/content/networking-foundations src/app/learn src/app/sitemap.test.ts
git commit -m "feat: publish hubs bridges switches lesson shell"
```

---

### Task 2: Define and Validate the Switching Domain Model

**Files:**
- Create: `src/features/switching/switching.schema.ts`
- Create: `src/features/switching/switching.schema.test.ts`

**Interfaces:**
- Consumes: Zod 4.
- Produces: `SwitchingDeviceId`, `ComparisonDimensionId`, `SwitchDecision`, `MacAddress`, `SwitchPort`, `ForwardingEntry`, `SwitchingScenario`, `LearnerPrediction`, `SwitchingCatalog`, `parseSwitchingCatalog(input)`, and `safeParseSwitchingCatalog(input)`.

- [ ] **Step 1: Write failing schema tests for valid data and every cross-reference rule**

Use a minimal three-port fixture and assert acceptance of uppercase colon-delimited MAC addresses. Assert rejection of:

```ts
const invalidCases = [
  ["malformed MAC", { sourceMac: "AA-BB-CC-DD-EE-01" }],
  ["duplicate scenario ID", { duplicateScenario: true }],
  ["duplicate port ID", { duplicatePort: true }],
  ["unknown ingress port", { ingressPortId: "p9" }],
  ["unknown eligible egress", { eligibleEgressPortIds: ["p9"] }],
  ["ingress included as eligible egress", { eligibleEgressPortIds: ["p1", "p2"] }],
  ["unknown table port", { tablePortId: "p9" }],
  ["duplicate forwarding MAC", { duplicateTableMac: true }],
  ["broadcast with unicast destination", { destinationType: "broadcast", destinationMac: "02:00:00:00:00:02" }],
  ["known unicast without destination entry", { expectedDecision: "known-unicast", initialTable: [] }],
  ["filtering with destination on another port", { expectedDecision: "filter", destinationPortId: "p2" }],
  ["flood result missing eligible port", { expectedDecision: "unknown-unicast-flood", expectedEgressPortIds: ["p2"] }],
];
```

The valid scenario shape must include `id`, `difficulty`, `title`, `ports`, `initialTable`, `ingressPortId`, `sourceMac`, `destinationMac`, `destinationType`, `eligibleEgressPortIds`, `expectedDecision`, `expectedEgressPortIds`, `expectedLearnedEntry`, `explanation`, `wrongAnswerExplanations`, and `evidenceNotes`.

- [ ] **Step 2: Run the schema test and verify the missing-module failure**

```bash
pnpmc vitest run src/features/switching/switching.schema.test.ts
```

Expected: FAIL because `switching.schema.ts` does not exist.

- [ ] **Step 3: Implement focused schemas and cross-field validation**

Define exact unions:

```ts
export const switchingDeviceIdSchema = z.enum(["hub", "bridge", "switch"]);
export const comparisonDimensionIdSchema = z.enum([
  "signal-handling", "collision-scope", "bandwidth-sharing", "address-awareness", "delivery-scope",
]);
export const switchDecisionSchema = z.enum([
  "known-unicast", "filter", "unknown-unicast-flood", "broadcast-flood",
]);
export const macAddressSchema = z.string().regex(/^([0-9A-F]{2}:){5}[0-9A-F]{2}$/);
export type LearnerPrediction = Readonly<{
  decision: SwitchDecision;
  egressPortIds: readonly string[];
}>;
```

Use `superRefine` to enforce unique identifiers and references, keep ingress out of eligible egress, require `FF:FF:FF:FF:FF:FF` for broadcast, derive known/filter consistency from the destination entry, and require flood egress to equal the full eligible set. Export schema-inferred readonly types and parse/safe-parse functions.

- [ ] **Step 4: Run schema tests and typecheck the new module**

```bash
pnpmc vitest run src/features/switching/switching.schema.test.ts
pnpmc typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit the validated model**

```bash
git add src/features/switching/switching.schema.ts src/features/switching/switching.schema.test.ts
git commit -m "feat: define switching lesson model"
```

---

### Task 3: Implement the Pure Learning and Forwarding Evaluator

**Files:**
- Create: `src/features/switching/evaluate-frame-forwarding.ts`
- Create: `src/features/switching/evaluate-frame-forwarding.test.ts`

**Interfaces:**
- Consumes: `SwitchingScenario` and `LearnerPrediction` from Task 2.
- Produces: `evaluateFrameForwarding(scenario, prediction): FrameForwardingResult` and `safeEvaluateFrameForwarding(scenario, prediction): FrameForwardingResult | undefined`.

- [ ] **Step 1: Write failing rule tests using complete scenario fixtures**

Test these exact outcomes:

```ts
expect(result.learnedEntry).toEqual({ mac: "02:00:00:00:00:01", portId: "p1" });
expect(result.nextTable).toContainEqual({ mac: "02:00:00:00:00:01", portId: "p1" });
expect(known.egressPortIds).toEqual(["p2"]);
expect(filtered.egressPortIds).toEqual([]);
expect(unknown.egressPortIds).toEqual(["p2", "p3", "p4"]);
expect(broadcast.egressPortIds).toEqual(["p2", "p3", "p4"]);
expect(moved.nextTable).toContainEqual({ mac: "02:00:00:00:00:01", portId: "p4" });
```

Also prove destination lookup happens after source learning, stale source entries move to ingress, existing source entries refresh without duplication, an aged-out destination behaves as unknown unicast, egress order is deterministic by scenario port order, correct predictions are set-based rather than click-order-based, wrong decision/ports produce `correct: false`, and unknown decision/port identifiers make the safe API return `undefined`.

- [ ] **Step 2: Run the evaluator test and verify the missing-module failure**

```bash
pnpmc vitest run src/features/switching/evaluate-frame-forwarding.test.ts
```

Expected: FAIL because the evaluator does not exist.

- [ ] **Step 3: Implement one source of truth for switching behavior**

Use this result contract:

```ts
export type FrameForwardingResult = Readonly<{
  scenarioId: string;
  decision: SwitchDecision;
  learnedEntry: ForwardingEntry;
  egressPortIds: readonly string[];
  correct: boolean;
  explanation: string;
  wrongAnswerExplanation?: string;
  nextTable: readonly ForwardingEntry[];
}>;
```

Algorithm order must be explicit: validate identifiers; replace/refresh the source entry with ingress; inspect destination type; for unicast, look up destination in the updated table; choose filter when destination port equals ingress, known unicast when different, otherwise flood all eligible ports; compare normalized prediction sets; return frozen copies. Do not read React state, public prose, timers, or DOM data.

- [ ] **Step 4: Run evaluator and schema tests**

```bash
pnpmc vitest run src/features/switching/evaluate-frame-forwarding.test.ts src/features/switching/switching.schema.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the evaluator**

```bash
git add src/features/switching/evaluate-frame-forwarding.ts src/features/switching/evaluate-frame-forwarding.test.ts
git commit -m "feat: evaluate ethernet frame forwarding"
```

---

### Task 4: Add Anonymous-Safe Comparison Data and Public Visualization

**Files:**
- Create: `src/features/switching/switching.data.ts`
- Create: `src/features/switching/switching.data.test.ts`
- Create: `src/features/switching/switching-comparison.tsx`
- Create: `src/features/switching/switching-comparison.test.tsx`
- Modify: `src/features/lessons/mdx-components.tsx`
- Modify: `src/features/lessons/mdx-components.test.tsx`
- Modify: `src/content/networking-foundations/hubs-bridges-and-switches.public.mdx`
- Modify: `src/content/lesson-rendering.test.tsx`

**Interfaces:**
- Consumes: public schemas from Task 2.
- Produces: `publicSwitchingComparison`, globally registered `<SwitchingComparison />`, five selectable dimensions, three device panels, meaningful non-color state cues, static table fallback, and no protected scenario imports.

- [ ] **Step 1: Write failing public-data and component tests**

Assert three devices and all dimensions:

```ts
expect(publicSwitchingComparison.map(({ id }) => id)).toEqual(["hub", "bridge", "switch"]);
expect(screen.getAllByRole("article")).toHaveLength(3);
for (const name of ["Signal handling", "Collision scope", "Bandwidth sharing", "Address awareness", "Delivery scope"]) {
  expect(screen.getByRole("radio", { name })).toBeVisible();
}
```

For every dimension, change the selected radio and assert each device's visible explanation and `data-behavior` change to the authored `repeat`, `segment`, `filter`, `learn`, `forward`, or `flood` cue. Assert the topology has an accessible name, host and port labels are visible, reduced motion renders discrete state text, and the server-rendered output contains the full comparison table. Add an import-boundary test proving neither `switching.data.ts` nor `switching-comparison.tsx` imports `.account`, the evaluator, or the authorized experience.

- [ ] **Step 2: Run focused tests and verify missing modules/registration**

```bash
pnpmc vitest run src/features/switching/switching.data.test.ts src/features/switching/switching-comparison.test.tsx src/features/lessons/mdx-components.test.tsx src/content/lesson-rendering.test.tsx
```

Expected: FAIL because the comparison is not implemented or registered.

- [ ] **Step 3: Implement public data and the comparison component**

Author only public facts: hub repeats to other ports/shared collision domain/shared bandwidth/no address awareness; bridge learns/filter between segments/fewer collision domains; switch learns and makes per-port decisions/dedicated full-duplex links/separate collision domains while retaining one broadcast domain. Render native radios, three labelled articles, visible port labels, a stable topology, concise consequence text, and `data-behavior` plus text/icons so color is supplementary. Read `prefers-reduced-motion` only to choose between travelling-frame enhancement and discrete ingress/action/egress markers; render the static table regardless of JavaScript.

Register only the public component:

```ts
SwitchingComparison,
```

Embed `<SwitchingComparison />` beneath `h2#compare-hub-bridge-switch`; do not register or import `FrameForwardingExperience` in the shared MDX map.

- [ ] **Step 4: Run focused tests and confirm all public states pass**

Run the command from Step 2. Expected: PASS, including SSR and import-boundary assertions.

- [ ] **Step 5: Commit the public comparison**

```bash
git add src/features/switching src/features/lessons/mdx-components.tsx src/features/lessons/mdx-components.test.tsx src/content/networking-foundations/hubs-bridges-and-switches.public.mdx src/content/lesson-rendering.test.tsx
git commit -m "feat: compare hubs bridges and switches"
```

---

### Task 5: Author and Safely Load Six Protected Scenarios

**Files:**
- Create: `src/features/switching/switching.account.scenarios.ts`
- Create: `src/features/switching/switching.account.data.test.ts`
- Create: `src/features/switching/switching.account-loader.ts`
- Create: `src/features/switching/switching.account-loader.test.ts`

**Interfaces:**
- Consumes: `safeParseSwitchingCatalog`, public topology/port facts, and scenario types from Tasks 2 and 4.
- Produces: `accountSwitchingScenarioInput` behind `server-only` and `loadAccountSwitchingScenarios(): readonly SwitchingScenario[] | undefined`.

- [ ] **Step 1: Write failing authored-data and loader tests**

Assert these exact scenario IDs and expected outcomes:

```ts
expect(scenarios.map(({ id, expectedDecision, expectedEgressPortIds }) => ({
  id, expectedDecision, expectedEgressPortIds,
}))).toEqual([
  { id: "first-frame-unknown-destination", expectedDecision: "unknown-unicast-flood", expectedEgressPortIds: ["p2", "p3", "p4"] },
  { id: "reply-after-learning", expectedDecision: "known-unicast", expectedEgressPortIds: ["p1"] },
  { id: "known-unicast", expectedDecision: "known-unicast", expectedEgressPortIds: ["p3"] },
  { id: "same-segment-filtering", expectedDecision: "filter", expectedEgressPortIds: [] },
  { id: "broadcast-frame", expectedDecision: "broadcast-flood", expectedEgressPortIds: ["p1", "p3", "p4"] },
  { id: "aged-out-destination", expectedDecision: "unknown-unicast-flood", expectedEgressPortIds: ["p1", "p2", "p4"] },
]);
```

Verify every scenario has a source-learning update, explanation, evidence notes, and wrong-answer explanations for all four decision choices. Mock malformed input and assert the loader returns `undefined` without leaking substitute scenarios. Add source checks for top-level `import "server-only"` and absence of imports from public components.

- [ ] **Step 2: Run focused tests and verify missing protected modules**

```bash
pnpmc vitest run src/features/switching/switching.account.data.test.ts src/features/switching/switching.account-loader.test.ts
```

Expected: FAIL because authored data and loader do not exist.

- [ ] **Step 3: Author complete scenarios and validate in the server loader**

Use locally administered teaching MAC addresses `02:00:00:00:00:01` through `02:00:00:00:00:04`, ports `p1` through `p4`, and explicit eligible egress sets. Make scenario 4 the first `intermediate` scenario. Scenario 6 must omit the aged destination entry rather than simulate a universal timer. Implement:

```ts
export function loadAccountSwitchingScenarios() {
  const catalog = safeParseSwitchingCatalog({
    comparison: publicSwitchingComparison,
    scenarios: accountSwitchingScenarioInput,
  });
  return catalog.success ? catalog.data.scenarios : undefined;
}
```

- [ ] **Step 4: Run authored-data, loader, schema, and evaluator tests**

```bash
pnpmc vitest run src/features/switching/switching.account.data.test.ts src/features/switching/switching.account-loader.test.ts src/features/switching/switching.schema.test.ts src/features/switching/evaluate-frame-forwarding.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the protected dataset**

```bash
git add src/features/switching/switching.account.scenarios.ts src/features/switching/switching.account.data.test.ts src/features/switching/switching.account-loader.ts src/features/switching/switching.account-loader.test.ts
git commit -m "feat: add protected switching scenarios"
```

---

### Task 6: Build the Authorized Frame-Forwarding Lab

**Files:**
- Create: `src/features/switching/frame-forwarding-lab.tsx`
- Create: `src/features/switching/frame-forwarding-lab.test.tsx`
- Create: `src/features/switching/frame-forwarding-experience.tsx`
- Create: `src/features/switching/frame-forwarding-experience.test.tsx`
- Modify: `src/content/networking-foundations/hubs-bridges-and-switches.account.mdx`
- Modify: `src/content/lesson-rendering.test.tsx`

**Interfaces:**
- Consumes: validated unknown scenario props from the server loader and `safeEvaluateFrameForwarding` from Task 3.
- Produces: `FrameForwardingLab({ scenarios, showAdvancedShortcut? })` and `FrameForwardingExperience({ scenarios }: { scenarios: unknown })` with complete authorized practice and static fallback.

- [ ] **Step 1: Write failing interaction, accessibility, reset, and fallback tests**

Cover all six scenarios. For the initial scenario, assert current table, ingress, source/destination, eligible ports, decision radios, egress checkboxes, disabled submit until a decision is selected, and result sections labelled **Source learning**, **Destination lookup**, **Forwarding decision**, and **Updated forwarding table**. Submit one correct and one incorrect prediction and assert explanatory feedback.

Assert reset behavior:

```ts
await user.click(screen.getByRole("radio", { name: "Reply frame after learning" }));
expect(screen.queryByRole("region", { name: "Frame forwarding result" })).not.toBeInTheDocument();
expect(screen.getByRole("status")).toHaveTextContent("");
expect(screen.getAllByRole("checkbox", { checked: true })).toHaveLength(0);
```

Submit the same answer twice and assert announcements increment from `Check 1:` to `Check 2:`. Click **I know this—proceed to advanced** and assert `same-segment-filtering` is selected, its radio is focused, state is cleared, and the next Tab focuses the first decision radio. Assert malformed `scenarios` renders **Frame-forwarding lab unavailable** plus the static evidence-first workflow and never throws.

- [ ] **Step 2: Run focused component tests and verify missing modules**

```bash
pnpmc vitest run src/features/switching/frame-forwarding-lab.test.tsx src/features/switching/frame-forwarding-experience.test.tsx src/content/lesson-rendering.test.tsx
```

Expected: FAIL because the authorized components do not exist.

- [ ] **Step 3: Implement lab state without duplicating switching rules**

Use native fieldsets/radios/checkboxes/buttons and this state shape:

```ts
const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "");
const [decision, setDecision] = useState<SwitchDecision>();
const [egressPortIds, setEgressPortIds] = useState<readonly string[]>([]);
const [result, setResult] = useState<FrameForwardingResult>();
const [checkCount, setCheckCount] = useState(0);
const [announcement, setAnnouncement] = useState("");
```

On submit, call only `safeEvaluateFrameForwarding(scenario, { decision, egressPortIds })`. On scenario change or advanced jump, clear decision, ports, result, announcement, and unavailable state. Render the forwarding table inside `tabIndex={0}`, `role="region"`, and `aria-label="Current forwarding table; scroll horizontally if needed"`. Present an empty state as **No learned entries yet**. Use the evaluator's returned next table; do not recompute it in React.

- [ ] **Step 4: Implement authorized composition and direct MDX import**

Validate `unknown` props with `safeParseSwitchingCatalog`. On failure, render static guidance covering link/port state, frame addresses/type, ingress/expected egress, table freshness, observed decision, one-variable retest, and evidence recording. In account MDX, import the loader and component directly:

```mdx
import { loadAccountSwitchingScenarios } from "@/features/switching/switching.account-loader";
import { FrameForwardingExperience } from "@/features/switching/frame-forwarding-experience";

<FrameForwardingExperience scenarios={loadAccountSwitchingScenarios()} />
```

Add six troubleshooting cases: unexpected learned port, missing/aged entry, expected broadcast flooding, same-port filtering, moved host, and physical-link failure. Add application knowledge checks and a compact decision table. Keep answer explanations within the account module/component only.

- [ ] **Step 5: Run component and rendering tests**

Run the command from Step 2. Expected: PASS with correct focus, announcements, fallback, and authorized rendering.

- [ ] **Step 6: Commit the authorized experience**

```bash
git add src/features/switching/frame-forwarding-lab.tsx src/features/switching/frame-forwarding-lab.test.tsx src/features/switching/frame-forwarding-experience.tsx src/features/switching/frame-forwarding-experience.test.tsx src/content/networking-foundations/hubs-bridges-and-switches.account.mdx src/content/lesson-rendering.test.tsx
git commit -m "feat: add frame forwarding practice"
```

---

### Task 7: Add Responsive, Theme-Safe, and Reduced-Motion Styling

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/features/switching/switching-comparison.test.tsx`
- Modify: `src/features/switching/frame-forwarding-lab.test.tsx`

**Interfaces:**
- Consumes: stable semantic class names from Tasks 4 and 6.
- Produces: responsive comparison/lab layouts, visible focus, local table scrolling, non-color state cues, and discrete reduced-motion behavior.

- [ ] **Step 1: Add failing structural assertions for styling hooks**

Assert `.switching-comparison`, `.switching-device-card`, `.switching-topology`, `.frame-forwarding-lab`, `.forwarding-table-scroll`, and `[data-behavior]` hooks exist. Assert the table scroll region is focusable/labelled, each control label meets a 44px minimum-block-size contract, behavior text remains visible, and reduced-motion state exposes `data-motion="reduced"`.

- [ ] **Step 2: Run focused component tests and verify style-contract failures**

```bash
pnpmc vitest run src/features/switching/switching-comparison.test.tsx src/features/switching/frame-forwarding-lab.test.tsx
```

Expected: FAIL on missing hooks or accessibility attributes.

- [ ] **Step 3: Add scoped CSS using existing design tokens**

Use `repeat(3, minmax(0, 1fr))` for desktop comparison cards and collapse to one column under the existing mobile breakpoint. Give topology lines, shapes, labels, and behavior badges light/dark token-based contrast. Use dashed/solid/double line and text/icon differences so repeat/filter/learn/forward/flood never rely on color. Set tables to `min-width` only inside `.forwarding-table-scroll { overflow-x: auto; }`; do not add document-wide overflow hiding. Under `@media (prefers-reduced-motion: reduce)`, remove transitions/keyframes and retain discrete ingress/action/egress emphasis.

- [ ] **Step 4: Run focused component tests and lint the CSS consumers**

```bash
pnpmc vitest run src/features/switching/switching-comparison.test.tsx src/features/switching/frame-forwarding-lab.test.tsx
pnpmc lint
```

Expected: PASS.

- [ ] **Step 5: Commit the presentation layer**

```bash
git add src/app/globals.css src/features/switching/switching-comparison.test.tsx src/features/switching/frame-forwarding-lab.test.tsx
git commit -m "style: refine switching lesson experience"
```

---

### Task 8: Verify Browser Behavior and Production Privacy

**Files:**
- Create: `tests/e2e/hubs-bridges-switches.spec.ts`
- Modify: `tests/e2e/lesson.spec.ts`
- Modify: `tests/e2e/pathway.spec.ts`
- Modify: `tests/e2e/lesson-access.spec.ts`

**Interfaces:**
- Consumes: published route, public comparison, route access boundary, styles, and production output from Tasks 1–7.
- Produces: desktop/mobile/theme/keyboard/reduced-motion/no-JavaScript regression coverage and anonymous artifact proof.

- [ ] **Step 1: Write failing route and responsive browser tests**

At `/learn/networking-foundations/hubs-bridges-and-switches`, assert the title, objective, six public `h2` headings, three comparison cards, five dimensions, static table, Previous link to connection media, and absence of account-only lab controls. At 360px, assert comparison cards stack, radio labels are at least 44px high, keyboard arrow navigation changes dimensions with visible focus, the table scrolls locally, and `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.

Run light and dark schemes and assert the same topology labels remain visible. Under reduced motion, assert every traffic path has `data-motion="reduced"`, no travelling animation, and visible ingress/action/egress labels.

- [ ] **Step 2: Add no-JavaScript and anonymous network-payload tests**

With JavaScript disabled at 360px, assert all six public headings, the static comparison table, and **Continue this lesson for free** remain usable. Assert account headings, `same-segment-filtering`, authored MAC scenario phrases, troubleshooting answers, knowledge answers, and Pro details are absent.

Follow the existing `lesson-access.spec.ts` response audit pattern: capture the document, RSC requests, metadata, and every requested same-origin JavaScript asset; read each body before any later navigation; assert none contains:

```ts
const protectedSentinels = [
  "same-segment-filtering",
  "Host moved from port 2 to port 4",
  "VLAN-aware forwarding",
  "advanced Wireshark analysis",
  "first-frame-unknown-destination",
];
```

Use `page.unrouteAll({ behavior: "ignoreErrors" })` before test completion so in-flight Next.js requests do not create false failures.

- [ ] **Step 3: Run the dedicated E2E file against one managed development server**

```bash
pnpmc exec playwright test tests/e2e/hubs-bridges-switches.spec.ts
```

Expected: FAIL until selectors/content/style integration is complete; then make only implementation-consistent corrections and rerun until PASS.

- [ ] **Step 4: Update shared curriculum expectations and run the focused browser set**

Change shared published-link counts from four to five and coming-later counts from nineteen to eighteen. Run:

```bash
pnpmc exec playwright test tests/e2e/hubs-bridges-switches.spec.ts tests/e2e/lesson.spec.ts tests/e2e/pathway.spec.ts tests/e2e/lesson-access.spec.ts
```

Expected: PASS on Chromium and mobile Chromium with no page, console, hydration, focus, overflow, or privacy failures.

- [ ] **Step 5: Commit browser coverage**

```bash
git add tests/e2e/hubs-bridges-switches.spec.ts tests/e2e/lesson.spec.ts tests/e2e/pathway.spec.ts tests/e2e/lesson-access.spec.ts
git commit -m "test: cover switching lesson journeys"
```

---

### Task 9: Run the Single Final Verification Gate

**Files:**
- Modify only if a command exposes a concrete defect in files already owned by Tasks 1–8.

**Interfaces:**
- Consumes: the complete lesson implementation.
- Produces: evidence that source, types, lint, unit/component tests, production output, anonymous artifacts, and browser behavior are release-ready.

- [ ] **Step 1: Run source hygiene and focused privacy checks**

```bash
git diff --check
pnpmc vitest run src/content/lesson-access.content.test.ts src/features/lessons/lesson-content.repository.test.ts src/features/switching
```

Expected: no whitespace errors; all focused tests PASS.

- [ ] **Step 2: Run the full unit/component suite once**

```bash
pnpmc test
```

Expected: all test files and tests PASS.

- [ ] **Step 3: Run static quality gates once**

```bash
pnpmc typecheck
pnpmc lint
```

Expected: both exit 0 with no errors.

- [ ] **Step 4: Build production output and audit protected sentinels**

```bash
pnpmc build
rg -n "same-segment-filtering|Host moved from port 2 to port 4|VLAN-aware forwarding|advanced Wireshark analysis|first-frame-unknown-destination" .next/server/app/learn/networking-foundations/hubs-bridges-and-switches .next/static
```

Expected: build exits 0. Any matches must be limited to authorized server modules that cannot enter anonymous HTML/RSC/client assets; there must be no match in anonymous route HTML, RSC payloads, metadata, or `.next/static` JavaScript. If output layout differs, locate the route with `rg --files .next/server/app | rg "hubs-bridges-and-switches"` and audit those exact artifacts.

- [ ] **Step 5: Run all Playwright projects once**

```bash
pnpmc test:e2e
```

Expected: all desktop and mobile browser tests PASS with no console, hydration, accessibility-flow, overflow, no-JavaScript, or response-body privacy failures.

- [ ] **Step 6: Inspect scope and commit only verified fixes**

```bash
git status --short
git diff --stat
git log --oneline --decorate -8
```

Expected: only the lesson/spec/plan implementation is present; `.pnpm-store/`, `.next/`, `test-results/`, and Playwright reports are untracked or ignored and unstaged. If final-gate fixes were required:

```bash
git add src/features/catalog src/features/lessons src/features/switching src/content/networking-foundations/hubs-bridges-and-switches.public.mdx src/content/networking-foundations/hubs-bridges-and-switches.account.mdx src/content/lesson-access.content.test.ts src/content/lesson-rendering.test.tsx src/app/globals.css src/app/learn src/app/sitemap.test.ts tests/e2e/hubs-bridges-switches.spec.ts tests/e2e/lesson.spec.ts tests/e2e/pathway.spec.ts tests/e2e/lesson-access.spec.ts
git commit -m "fix: complete switching lesson verification"
```

Do not create an empty final commit when no fixes were needed.
