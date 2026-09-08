# Unicast, Broadcast and Multicast Communication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a beginner-friendly delivery-scope lesson with a public interactive player and protected prediction lab that accurately distinguishes forwarding, physical receipt, host acceptance, and router-boundary behaviour.

**Architecture:** Follow the proven public/account lesson split. Public MDX and a public-safe demonstration model may ship anonymously; authored prediction scenarios and answers remain in a `server-only` module and reach client components only after account authorization and schema validation. A pure evaluator owns delivery-scope rules so React renders outcomes without duplicating network logic.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9 strict mode, MDX 3, Zod 4, Vitest 3, Testing Library, Playwright 1.55, CSS.

**Spec:** `docs/superpowers/specs/2026-09-08-networking-curriculum-restructure-design.md`

## Global Constraints

- Add the stable slug `unicast-broadcast-and-multicast-communication` between `hubs-bridges-and-switches` and `routers-default-gateways-and-network-boundaries`.
- Do not redesign or rewrite any already published lesson in this work.
- Teach delivery scope before protocol depth; IGMP, MLD, PIM, RPF and multicast routing remain future-pathway material.
- Distinguish **forwarded through a port**, **received by an interface**, and **accepted and processed by a host** in every visual outcome.
- Unknown unicast flooding never changes a unicast destination into a broadcast destination.
- Ordinary Layer 2 broadcasts stop at a router; DHCP relay is explicit forwarding, not ordinary broadcast propagation.
- Multicast efficiency depends on group-aware switching/routing state; do not imply that addressing alone guarantees selective delivery.
- Public assets must contain no account scenario identifiers, predictions, answers, troubleshooting answers, or Pro details.
- Free-account practice covers easy through mid-advanced scenarios and includes **I know this—proceed to advanced**.
- Pro copy uses **Pro Member Waitlist** and **Join the Pro Member Waitlist**; it must not imply immediate paid access.
- Preserve keyboard, 44px touch targets, light/dark themes, reduced motion, 360px layout, local table scrolling, server rendering, and no-JavaScript usefulness.
- Reuse existing lesson shell, registration boundary, curriculum navigation, `KnowledgeCheck`, `PremiumPreview`, theme system, and reduced-motion hook.
- Add no dependencies.

## File Map

### Catalog and content

- Modify `src/features/catalog/catalog.data.ts` — insert and publish the lesson with section access metadata.
- Modify `src/features/catalog/catalog.repository.test.ts` — lock order, counts, metadata and adjacency.
- Modify `src/features/catalog/module-list.test.tsx` — update published/planned rendering counts if asserted.
- Modify `src/features/lessons/lesson-content.repository.ts` — add public/account MDX loaders.
- Modify `src/features/lessons/lesson-content.repository.test.ts` — verify anonymous/account import boundaries.
- Create `src/content/networking-foundations/unicast-broadcast-and-multicast-communication.public.mdx` — complete public reading path.
- Create `src/content/networking-foundations/unicast-broadcast-and-multicast-communication.account.mdx` — protected lab, troubleshooting, checks and Pro preview.
- Modify `src/content/lesson-rendering.test.tsx` — validate compiled semantics.
- Modify `src/content/lesson-access.content.test.ts` — protect authored scenario and answer strings.
- Modify `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts` — route generation and anonymous rendering.
- Modify `src/app/sitemap.test.ts` — published canonical route.

### Delivery-scope feature

- Create `src/features/delivery-scope/delivery-scope.schema.ts` — Zod schemas and derived types.
- Create `src/features/delivery-scope/delivery-scope.schema.test.ts` — structural and cross-reference validation.
- Create `src/features/delivery-scope/evaluate-delivery.ts` — pure forwarding/receipt/acceptance evaluator.
- Create `src/features/delivery-scope/evaluate-delivery.test.ts` — rule matrix and invalid-input behaviour.
- Create `src/features/delivery-scope/delivery-scope.data.ts` — public-safe demonstration data only.
- Create `src/features/delivery-scope/delivery-scope.data.test.ts` — public completeness and protected-string exclusion.
- Create `src/features/delivery-scope/delivery-scope-player.tsx` — public comparison/player.
- Create `src/features/delivery-scope/delivery-scope-player.test.tsx` — interaction, semantics and reduced motion.
- Create `src/features/delivery-scope/delivery-scope.account.scenarios.ts` — `server-only` authored practice.
- Create `src/features/delivery-scope/delivery-scope.account.data.test.ts` — seven scenario outcomes.
- Create `src/features/delivery-scope/delivery-scope.account-loader.ts` — validate protected scenarios.
- Create `src/features/delivery-scope/delivery-scope.account-loader.test.ts` — loader contract.
- Create `src/features/delivery-scope/delivery-scope-lab.tsx` — protected prediction interface.
- Create `src/features/delivery-scope/delivery-scope-lab.test.tsx` — submit/reset/focus/feedback/fallback.
- Create `src/features/delivery-scope/delivery-scope-experience.tsx` — validation boundary and static fallback.
- Create `src/features/delivery-scope/delivery-scope-experience.test.tsx` — valid and malformed props.
- Modify `mdx-components.tsx` — register only `DeliveryScopePlayer` globally.
- Modify `src/app/globals.css` — scoped responsive, theme and reduced-motion presentation.
- Modify `src/app/theme-styles.test.ts` — observable style requirements.

### Browser coverage

- Create `tests/e2e/delivery-scope.spec.ts` — public route, keyboard, themes, mobile, reduced motion and no JavaScript.
- Modify `tests/e2e/lesson-access.spec.ts` — HTML/RSC/client-asset privacy audit and table coverage.
- Modify `tests/e2e/lesson.spec.ts` — curriculum counts.
- Modify `tests/e2e/pathway.spec.ts` — pathway counts and new link.
- Modify `tests/e2e/navigation.spec.ts` — previous/next navigation.

---

### Task 1: Publish the Catalog Contract and Content Boundary

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/catalog/module-list.test.tsx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
- Modify: `src/app/sitemap.test.ts`
- Create: `src/content/networking-foundations/unicast-broadcast-and-multicast-communication.public.mdx`
- Create: `src/content/networking-foundations/unicast-broadcast-and-multicast-communication.account.mdx`

**Interfaces:**
- Consumes: existing `LessonSummary`, catalog repository, authorized lesson loader and lesson shell.
- Produces: published catalog entry and import key `networking-foundations/unicast-broadcast-and-multicast-communication`.

- [ ] **Step 1: Write failing catalog, route, sitemap and repository tests**

Assert the lesson is immediately after `hubs-bridges-and-switches`, is published, has a 22-minute estimate, and uses:

```ts
{
  title: "Unicast, Broadcast and Multicast Communication",
  objective: "Identify a transmission's delivery scope and predict which interfaces receive, accept, or forward it.",
  seo: {
    title: "Unicast, Broadcast and Multicast Explained",
    description: "Compare unicast, broadcast, and multicast traffic and predict how switches, hosts, and routers handle each delivery type.",
  },
}
```

Lock these sections exactly:

```ts
[
  { id: "why-delivery-scope-matters", label: "Why delivery scope matters", access: "public" },
  { id: "unicast-one-destination", label: "Unicast: one intended destination", access: "public" },
  { id: "broadcast-local-domain", label: "Broadcast: the local broadcast domain", access: "public" },
  { id: "multicast-receiver-group", label: "Multicast: an interested receiver group", access: "public" },
  { id: "unknown-unicast-is-not-broadcast", label: "Unknown unicast is not broadcast", access: "public" },
  { id: "compare-delivery-types", label: "Compare delivery types", access: "public" },
  { id: "delivery-scope-player", label: "Interactive delivery-scope player", access: "public" },
  { id: "predict-delivery", label: "Predict traffic delivery", access: "account" },
  { id: "diagnose-delivery-scope", label: "Diagnose delivery-scope scenarios", access: "account" },
  { id: "packet-evidence", label: "Packet evidence", access: "account" },
  { id: "knowledge-check-summary", label: "Knowledge check and summary", access: "account" },
  { id: "pro-deep-dive", label: "Pro Deep Dive", access: "pro", preview: "Discover future multicast operations, advanced packet analysis, and production troubleshooting." },
]
```

Assert adjacency: previous is hubs/switches; next is planned routers/gateways. Assert anonymous loading returns public only, account loading returns both, and sitemap contains the canonical route once.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
pnpmc vitest run src/features/catalog/catalog.repository.test.ts src/features/catalog/module-list.test.tsx src/features/lessons/lesson-content.repository.test.ts src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts src/app/sitemap.test.ts
```

Expected: failures for the missing lesson/imports and outdated counts.

- [ ] **Step 3: Add the catalog entry, repository loaders and minimal MDX shells**

Insert the lesson without editing existing published lesson bodies. The public shell contains the seven public `h2` IDs and `<DeliveryScopePlayer />`; the account shell contains the five protected `h2` IDs but no authored answers yet.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the Step 2 command. Expected: PASS.

- [ ] **Step 5: Commit the catalog boundary**

```bash
git add src/features/catalog src/features/lessons/lesson-content.repository.ts src/features/lessons/lesson-content.repository.test.ts src/app/learn src/app/sitemap.test.ts src/content/networking-foundations/unicast-broadcast-and-multicast-communication.*.mdx
git commit -m "feat: publish delivery scope lesson shell"
```

---

### Task 2: Define and Validate the Delivery Model

**Files:**
- Create: `src/features/delivery-scope/delivery-scope.schema.ts`
- Create: `src/features/delivery-scope/delivery-scope.schema.test.ts`

**Interfaces:**
- Produces: `DeliveryKind`, `DeliveryNode`, `DeliveryPort`, `DeliveryScenario`, `DeliveryOutcome`, `LearnerDeliveryPrediction`, `parseDeliveryCatalog()` and `safeParseDeliveryCatalog()`.

- [ ] **Step 1: Write failing schema tests**

Use these core shapes:

```ts
type DeliveryKind = "known-unicast" | "unknown-unicast" | "broadcast" | "multicast";
type RouterAction = "not-in-path" | "receive-local-only" | "route-unicast" | "multicast-disabled";

type DeliveryNode = {
  id: string;
  label: string;
  kind: "host" | "router";
  acceptsUnicast: boolean;
  multicastGroups: string[];
};

type DeliveryPort = {
  id: string;
  label: string;
  connectedNodeId: string;
  eligible: boolean;
};

type DeliveryScenario = {
  id: string;
  difficulty: "foundational" | "intermediate";
  title: string;
  deliveryKind: DeliveryKind;
  destinationLabel: string;
  destinationNodeId?: string;
  multicastGroup?: string;
  multicastGroupKnownToSwitch: boolean;
  ingressPortId: string;
  nodes: DeliveryNode[];
  ports: DeliveryPort[];
  learnedDestinationPortId?: string;
  routerAction: RouterAction;
  expectedEgressPortIds: string[];
  expectedReceivingNodeIds: string[];
  expectedAcceptingNodeIds: string[];
  explanation: string;
  evidenceNotes: string[];
  wrongAnswerExplanations: Record<"forwarded" | "received" | "accepted" | "router", string>;
};

type DeliveryOutcome = {
  egressPortIds: string[];
  receivingNodeIds: string[];
  acceptingNodeIds: string[];
  routerAction: RouterAction;
  explanation: string;
};

type LearnerDeliveryPrediction = {
  egressPortIds: string[];
  receivingNodeIds: string[];
  acceptingNodeIds: string[];
  routerAction: RouterAction;
};
```

Assert rejection of duplicate IDs; unknown connected nodes; missing ingress; ineligible expected ports; unicast without a destination; known unicast without a learned destination port; broadcast with a learned unicast port; multicast without a group; expected receivers inconsistent with egress connections; expected accepters that did not receive; and a router outcome inconsistent with the delivery kind.

- [ ] **Step 2: Run schema tests and verify RED**

```bash
pnpmc vitest run src/features/delivery-scope/delivery-scope.schema.test.ts
```

Expected: FAIL because the schema module does not exist.

- [ ] **Step 3: Implement Zod schemas and cross-field validation**

Derive all exported TypeScript types with `z.infer`. Cross-field validation must calculate receiver node IDs from expected egress ports and require exact set equality. Expected accepting nodes must be a subset of expected receivers. For `receive-local-only`, require the router to receive but forbid implying onward forwarding.

- [ ] **Step 4: Run schema tests and typecheck**

```bash
pnpmc vitest run src/features/delivery-scope/delivery-scope.schema.test.ts
pnpmc tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Commit the validated model**

```bash
git add src/features/delivery-scope/delivery-scope.schema.*
git commit -m "feat: define delivery scope model"
```

---

### Task 3: Implement the Pure Delivery Evaluator

**Files:**
- Create: `src/features/delivery-scope/evaluate-delivery.ts`
- Create: `src/features/delivery-scope/evaluate-delivery.test.ts`

**Interfaces:**
- Consumes: validated `DeliveryScenario` and `LearnerDeliveryPrediction`.
- Produces: `evaluateDelivery(scenario): DeliveryOutcome`, `evaluateDeliveryPrediction(scenario, prediction)` and safe variants returning `undefined` for invalid data.

- [ ] **Step 1: Write the failing rule matrix**

Cover:

```text
known unicast       -> learned destination port only
unknown unicast     -> every eligible non-ingress port; only destination host accepts
broadcast           -> every eligible non-ingress port; ordinary router does not forward onward
known multicast     -> subscribed eligible receiver ports
unknown multicast   -> every eligible non-ingress port; only subscribers accept
```

Assert deterministic port/node ordering, exact forwarded/received/accepted sets, and explicit router action. Prediction correctness requires exact set equality and router choice; extra selections are incorrect.

- [ ] **Step 2: Run evaluator tests and verify RED**

```bash
pnpmc vitest run src/features/delivery-scope/evaluate-delivery.test.ts
```

Expected: FAIL because evaluator exports do not exist.

- [ ] **Step 3: Implement the evaluator without React dependencies**

Compute forwarding first, receipt from connected egress nodes second, acceptance third, and router action last. Return four separately labelled result groups; never collapse receipt and acceptance into one boolean.

- [ ] **Step 4: Run evaluator tests and typecheck**

```bash
pnpmc vitest run src/features/delivery-scope/evaluate-delivery.test.ts
pnpmc tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Commit the evaluator**

```bash
git add src/features/delivery-scope/evaluate-delivery.*
git commit -m "feat: evaluate network delivery scope"
```

---

### Task 4: Build the Public Player and Complete Public Lesson

**Files:**
- Create: `src/features/delivery-scope/delivery-scope.data.ts`
- Create: `src/features/delivery-scope/delivery-scope.data.test.ts`
- Create: `src/features/delivery-scope/delivery-scope-player.tsx`
- Create: `src/features/delivery-scope/delivery-scope-player.test.tsx`
- Modify: `src/content/networking-foundations/unicast-broadcast-and-multicast-communication.public.mdx`
- Modify: `src/content/lesson-rendering.test.tsx`
- Modify: `mdx-components.tsx`

**Interfaces:**
- Produces: `publicDeliveryDemonstrations` and `<DeliveryScopePlayer />` registered for public MDX.

- [ ] **Step 1: Write failing public-data and player tests**

Require public demonstrations for known unicast, unknown unicast, ARP broadcast, multicast with known subscribers, and multicast without group-aware switching. Serialize the public module and assert it excludes protected IDs such as `dhcp-relay-boundary`, `wrong-default-gateway`, account answer text, IGMP/PIM details and Pro diagnostic phrases.

Render the player and assert:

- one stable sender/switch/three-host/router/remote-host topology;
- native scenario tabs or radios with meaningful accessible names;
- separate **Forwarded**, **Received**, **Accepted**, and **Router boundary** result regions;
- every selection changes meaningful text and non-colour cues;
- unknown unicast remains labelled **Unicast destination** while flooded;
- each multicast scenario identifies subscriber and non-subscriber outcomes;
- reduced motion renders discrete states with `data-motion="reduced"`;
- the server-rendered first scenario is complete and useful.

- [ ] **Step 2: Run player tests and verify RED**

```bash
pnpmc vitest run src/features/delivery-scope/delivery-scope.data.test.ts src/features/delivery-scope/delivery-scope-player.test.tsx src/content/lesson-rendering.test.tsx
```

Expected: FAIL for missing modules/component.

- [ ] **Step 3: Implement public data, player and public prose**

The public MDX must explain all seven public sections, include HTTPS unicast, ARP broadcast, DHCP-relay boundary, multicast video-group examples, misconceptions, a comparison table, and `<DeliveryScopePlayer />`. It must state that flooding describes a switch action while unicast/broadcast/multicast describe destination scope.

- [ ] **Step 4: Run tests and typecheck**

Run Step 2 plus `pnpmc tsc --noEmit`. Expected: PASS.

- [ ] **Step 5: Commit public teaching**

```bash
git add src/features/delivery-scope/delivery-scope.data.* src/features/delivery-scope/delivery-scope-player.* src/content/networking-foundations/unicast-broadcast-and-multicast-communication.public.mdx src/content/lesson-rendering.test.tsx mdx-components.tsx
git commit -m "feat: add interactive delivery scope lesson"
```

---

### Task 5: Add Protected Practice Data and Loader

**Files:**
- Create: `src/features/delivery-scope/delivery-scope.account.scenarios.ts`
- Create: `src/features/delivery-scope/delivery-scope.account.data.test.ts`
- Create: `src/features/delivery-scope/delivery-scope.account-loader.ts`
- Create: `src/features/delivery-scope/delivery-scope.account-loader.test.ts`

**Interfaces:**
- Produces: `loadAccountDeliveryScenarios(): unknown` from a module beginning with `import "server-only";`.

- [ ] **Step 1: Write failing authored-data and loader tests**

Require seven valid scenarios:

```text
known-unicast-to-local-server
unknown-unicast-temporary-flood
arp-request-local-broadcast
dhcp-relay-boundary
multicast-known-subscribers
multicast-without-group-state
remote-unicast-through-router
```

Assert exact expected forwarding, receiving, accepting and router outcomes. At least the first four are foundational; `multicast-without-group-state` is the first intermediate scenario used by the advanced shortcut. Require evidence notes and four wrong-answer explanations per scenario.

- [ ] **Step 2: Run protected-data tests and verify RED**

```bash
pnpmc vitest run src/features/delivery-scope/delivery-scope.account.data.test.ts src/features/delivery-scope/delivery-scope.account-loader.test.ts
```

Expected: FAIL for missing modules.

- [ ] **Step 3: Author server-only scenarios and validating loader**

Do not import this module from `mdx-components.tsx`, public MDX, public data or the public player. The loader validates the complete catalog before returning scenario props and throws a descriptive authoring error for invalid fixtures.

- [ ] **Step 4: Run protected-data, schema and evaluator tests**

```bash
pnpmc vitest run src/features/delivery-scope
pnpmc tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Commit protected scenario data**

```bash
git add src/features/delivery-scope/delivery-scope.account.*
git commit -m "feat: add protected delivery scenarios"
```

---

### Task 6: Build the Account Lab and Finish Protected Content

**Files:**
- Create: `src/features/delivery-scope/delivery-scope-lab.tsx`
- Create: `src/features/delivery-scope/delivery-scope-lab.test.tsx`
- Create: `src/features/delivery-scope/delivery-scope-experience.tsx`
- Create: `src/features/delivery-scope/delivery-scope-experience.test.tsx`
- Modify: `src/content/networking-foundations/unicast-broadcast-and-multicast-communication.account.mdx`
- Modify: `src/content/lesson-rendering.test.tsx`
- Modify: `src/content/lesson-access.content.test.ts`

**Interfaces:**
- Produces: `<DeliveryScopeExperience scenarios={unknown} />` and `<DeliveryScopeLab scenarios={DeliveryScenario[]} showAdvancedShortcut />`.

- [ ] **Step 1: Write failing interaction and fallback tests**

Assert the learner selects a scenario, predicts egress ports, receiving nodes, accepting nodes and router action, then submits explicitly. Result headings are exactly **Forwarding decision**, **Interfaces that receive**, **Hosts that accept**, and **Router boundary**. Correct and incorrect submissions explain every distinction.

Changing scenario resets all selections, result and live announcement. Repeated submission increments one polite message (`Check 1`, `Check 2`). The advanced shortcut chooses the first intermediate scenario, clears state, focuses its radio, and preserves logical next-Tab order. Malformed props render **Delivery-scope lab unavailable** followed by a static evidence checklist.

- [ ] **Step 2: Run lab tests and verify RED**

```bash
pnpmc vitest run src/features/delivery-scope/delivery-scope-lab.test.tsx src/features/delivery-scope/delivery-scope-experience.test.tsx src/content/lesson-rendering.test.tsx src/content/lesson-access.content.test.ts
```

Expected: FAIL for missing components and incomplete account MDX.

- [ ] **Step 3: Implement the account experience and MDX**

Account MDX imports the loader and experience directly:

```mdx
import { loadAccountDeliveryScenarios } from "@/features/delivery-scope/delivery-scope.account-loader";
import { DeliveryScopeExperience } from "@/features/delivery-scope/delivery-scope-experience";

<DeliveryScopeExperience scenarios={loadAccountDeliveryScenarios()} />
```

Add evidence-led troubleshooting for unexpected flooding, missing MAC state, broadcast crossing assumptions, unsubscribed multicast receipt, disabled multicast routing, and DHCP relay boundaries. Add three application `KnowledgeCheck` components, a compact summary table, interview scenarios, and `PremiumPreview` with the exact CTA **Join the Pro Member Waitlist** linking to `/contact`.

- [ ] **Step 4: Run focused tests and typecheck**

Run Step 2 plus `pnpmc tsc --noEmit`. Expected: PASS.

- [ ] **Step 5: Commit protected practice**

```bash
git add src/features/delivery-scope/delivery-scope-lab.* src/features/delivery-scope/delivery-scope-experience.* src/content/networking-foundations/unicast-broadcast-and-multicast-communication.account.mdx src/content/lesson-rendering.test.tsx src/content/lesson-access.content.test.ts
git commit -m "feat: add delivery scope practice lab"
```

---

### Task 7: Add Responsive, Theme and Motion Presentation

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/theme-styles.test.ts`
- Modify: `src/features/delivery-scope/delivery-scope-player.test.tsx`
- Modify: `src/features/delivery-scope/delivery-scope-lab.test.tsx`

**Interfaces:**
- Consumes: `.delivery-scope-*` class names and `data-motion`/`data-state` attributes.
- Produces: observable responsive and accessible presentation.

- [ ] **Step 1: Add failing computed-style tests**

Require 44px minimum interactive labels/buttons, visible focus, non-colour state labels, local horizontal scrolling for wide tables, stacked 360px layout, dark/light custom-property use, and disabled travel animations under `prefers-reduced-motion`.

- [ ] **Step 2: Run style/component tests and verify RED**

```bash
pnpmc vitest run src/app/theme-styles.test.ts src/features/delivery-scope/delivery-scope-player.test.tsx src/features/delivery-scope/delivery-scope-lab.test.tsx
```

Expected: FAIL for missing style behaviour.

- [ ] **Step 3: Implement only scoped delivery-scope styles**

Use existing design tokens. Do not change established lesson/site layout selectors except where a test demonstrates a shared regression.

- [ ] **Step 4: Run focused tests, lint and typecheck**

```bash
pnpmc vitest run src/app/theme-styles.test.ts src/features/delivery-scope
pnpmc lint
pnpmc tsc --noEmit
```

Expected: PASS.

- [ ] **Step 5: Commit presentation**

```bash
git add src/app/globals.css src/app/theme-styles.test.ts src/features/delivery-scope
git commit -m "feat: style delivery scope experiences"
```

---

### Task 8: Add Browser Journeys and Anonymous Privacy Proof

**Files:**
- Create: `tests/e2e/delivery-scope.spec.ts`
- Modify: `tests/e2e/lesson-access.spec.ts`
- Modify: `tests/e2e/lesson.spec.ts`
- Modify: `tests/e2e/pathway.spec.ts`
- Modify: `tests/e2e/navigation.spec.ts`

**Interfaces:**
- Produces: end-to-end evidence across Chromium and mobile Chromium.

- [ ] **Step 1: Write public route and responsive tests**

At the lesson route, assert title, objective, seven public headings, comparison table, stable topology, five public demonstrations, Previous link to hubs/switches, Next planned routers label, and absence of account controls. At 360px assert no document overflow, local table scroll, 44px controls, keyboard arrow navigation, visible focus and stacked outcome regions.

- [ ] **Step 2: Add theme, reduced-motion, hydration and no-JavaScript tests**

In both themes, assert topology labels and four outcome distinctions remain visible. Under reduced motion, require every path to use discrete state. With JavaScript disabled, require all seven public headings, comparison table, examples and registration boundary.

- [ ] **Step 3: Extend the anonymous response audit**

Capture document HTML, navigation/prefetch RSC, metadata and every requested same-origin JavaScript asset before navigating away. Assert none contains:

```ts
[
  "dhcp-relay-boundary",
  "multicast-without-group-state",
  "wrong-default-gateway",
  "IGMP querier election",
  "PIM rendezvous point",
  "DELIVERY_SCOPE_ACCOUNT_SENTINEL",
]
```

Assert public HTML still contains the public comparison and never imports the account experience.

- [ ] **Step 4: Run the focused browser suite**

```bash
pnpmc exec playwright test tests/e2e/delivery-scope.spec.ts tests/e2e/lesson-access.spec.ts tests/e2e/lesson.spec.ts tests/e2e/pathway.spec.ts tests/e2e/navigation.spec.ts
```

Expected: PASS in Chromium and mobile Chromium with no page, console, focus, overflow, hydration or privacy failure.

- [ ] **Step 5: Commit browser coverage**

```bash
git add tests/e2e
git commit -m "test: cover delivery scope lesson journeys"
```

---

### Task 9: Run the Final Release Gate

**Files:**
- Modify only if verification exposes an in-scope defect.

**Interfaces:**
- Consumes: complete feature branch.
- Produces: release evidence and a clean reviewed branch.

- [ ] **Step 1: Run source hygiene and focused privacy tests**

```bash
git diff --check
pnpmc vitest run src/content/lesson-access.content.test.ts src/features/lessons/lesson-content.repository.test.ts src/features/delivery-scope
```

Expected: PASS.

- [ ] **Step 2: Run full unit/component suite once**

```bash
pnpmc vitest run
```

Expected: all test files and tests pass with zero failures.

- [ ] **Step 3: Run static gates**

```bash
pnpmc tsc --noEmit
pnpmc lint
```

Expected: both exit 0.

- [ ] **Step 4: Build and audit production artifacts**

```bash
pnpmc build
rg -n "dhcp-relay-boundary|multicast-without-group-state|wrong-default-gateway|IGMP querier election|PIM rendezvous point|DELIVERY_SCOPE_ACCOUNT_SENTINEL" .next/server/app/learn/networking-foundations/unicast-broadcast-and-multicast-communication.html .next/server/app/learn/networking-foundations/unicast-broadcast-and-multicast-communication.rsc .next/static
```

Expected: build exits 0 and `rg` finds no protected sentinel in anonymous HTML, RSC or client assets. Matches are permitted only inside authorized server modules that are not requested anonymously.

- [ ] **Step 5: Run all Playwright projects once**

```bash
pnpmc test:e2e
```

Expected: every desktop/mobile test passes.

- [ ] **Step 6: Inspect scope and request code review**

```bash
git status --short
git diff --stat origin/main...HEAD
git log --oneline origin/main..HEAD
```

Leave unrelated `.pnpm-store/` content untouched. Dispatch an independent review against this plan and the approved curriculum spec; resolve every Critical or Important finding with a regression test.

- [ ] **Step 7: Finish the branch**

Use `superpowers:verification-before-completion` and `superpowers:finishing-a-development-branch`. Present the standard merge/push/keep choices only after fresh verification proves the final tree.
