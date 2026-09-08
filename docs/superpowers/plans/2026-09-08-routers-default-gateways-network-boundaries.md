# Routers, Default Gateways and Network Boundaries Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a beginner-safe Routers, Default Gateways and Network Boundaries lesson with a public route-decision player, protected free-account practice, and verified content isolation.

**Architecture:** Add a lesson-specific routing domain under `src/features/route-decision`: Zod validates public and protected teaching scenarios, pure functions choose connected, specific, default, or no-route outcomes, and React components only render those results. Public and account MDX remain separate and are loaded through the existing server authorization boundary; anonymous bundles receive public scenarios only.

**Tech Stack:** Node.js 22+, Next.js 15 App Router, React 19, strict TypeScript, MDX, Zod 4, Vitest, Testing Library, Playwright, ESLint.

**Spec:** `docs/superpowers/specs/2026-09-08-routers-default-gateways-network-boundaries-design.md`

## Global Constraints

- Preserve slug `routers-default-gateways-and-network-boundaries`, its curriculum position, title, objective, and 20-minute estimate.
- Public, account, and Pro content boundaries must be enforced by server-side module selection.
- A router never forwards an ordinary Layer 2 broadcast in these scenarios.
- In no-NAT examples, routed forwarding keeps source/destination IP addresses while replacing link-layer framing and decrementing TTL.
- ARP resolves only a local IPv4 next hop; IPv6 Neighbor Discovery is preview text, not simulated behavior.
- **I know this—proceed to advanced** may move to protected intermediate practice but never bypass authentication or unlock Pro content.
- Pro remains preview-only and uses the exact action **Join the Pro Member Waitlist**.
- All controls remain keyboard usable, at least 44px high, reduced-motion safe, no-JavaScript useful, and free of horizontal overflow at 360px.

---

### Task 1: Publish the catalog shell and enforce content authorization

**Files:**
- Modify: `src/features/catalog/catalog.data.ts`
- Modify: `src/features/catalog/catalog.repository.test.ts`
- Modify: `src/features/catalog/module-list.test.tsx`
- Modify: `src/features/lessons/lesson-content.repository.ts`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`
- Modify: `src/app/sitemap.test.ts`

**Interfaces:**
- Consumes: existing `LessonSummary`, `loadAuthorizedLessonContent(key, access)`, catalog repository, and route rendering.
- Produces: published key `networking-foundations/routers-default-gateways-and-network-boundaries` with eleven catalog sections and public/account lazy imports.

- [ ] **Step 1: Write failing catalog and authorization tests**

Assert the lesson is published immediately after `unicast-broadcast-and-multicast-communication`, remains 20 minutes, and has these sections:

```ts
[
  ["why-network-boundaries-matter", "public"],
  ["what-a-router-does", "public"],
  ["local-or-remote", "public"],
  ["default-gateway", "public"],
  ["direct-and-routed-delivery", "public"],
  ["what-changes-at-each-hop", "public"],
  ["route-decision-player", "public"],
  ["read-a-basic-routing-table", "account"],
  ["diagnose-gateway-boundary-problems", "account"],
  ["knowledge-check-summary", "account"],
  ["pro-deep-dive", "pro"],
]
```

Add repository mocks for the future public/account MDX modules. Assert anonymous access returns only `public`, account access returns both `public` and `account`, and no access level returns a Pro body. Add route and sitemap expectations for the exact slug.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```powershell
pnpm exec vitest run src/features/catalog/catalog.repository.test.ts src/features/catalog/module-list.test.tsx src/features/lessons/lesson-content.repository.test.ts "src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts" src/app/sitemap.test.ts
```

Expected: failures show the lesson is unpublished and the content imports/route are absent.

- [ ] **Step 3: Add the minimum catalog and loader entries**

Replace the lesson's `plannedLesson(...)` entry with a published lesson matching the exact section pairs above. Add:

```ts
"networking-foundations/routers-default-gateways-and-network-boundaries": {
  public: () => import("@/content/networking-foundations/routers-default-gateways-and-network-boundaries.public.mdx"),
  account: () => import("@/content/networking-foundations/routers-default-gateways-and-network-boundaries.account.mdx"),
},
```

Use temporary minimal MDX headings only if compilation requires the modules; Task 4 replaces them with substantive content before the branch can finish.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run the Step 2 command. Expected: all selected tests pass without warnings.

- [ ] **Step 5: Commit**

```powershell
git add src/features/catalog src/features/lessons src/app/sitemap.test.ts "src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts" src/content/networking-foundations/routers-default-gateways-and-network-boundaries.*.mdx
git commit -m "feat: publish routers and gateways lesson shell"
```

### Task 2: Define and validate the route-decision domain

**Files:**
- Create: `src/features/route-decision/route-decision.schema.ts`
- Create: `src/features/route-decision/route-decision.schema.test.ts`

**Interfaces:**
- Produces: `RouteDecisionScenario`, `RouteEntry`, `RouteDecisionOutcome`, `LearnerRoutePrediction`, `parseRouteDecisionCatalog(input)`, and `safeParseRouteDecisionCatalog(input)`.

- [ ] **Step 1: Write failing schema tests**

Define wished-for scenario data around this interface:

```ts
type RouteEntry = {
  id: string;
  destination: string;
  prefixLength: number;
  nextHop?: string;
  interfaceId: string;
  kind: "connected" | "static" | "default";
};

type RouteDecisionScenario = {
  id: string;
  difficulty: "foundational" | "intermediate";
  title: string;
  sourceIp: string;
  sourcePrefixLength: number;
  destinationIp: string;
  interfaces: Array<{ id: string; label: string; ip: string; prefixLength: number; mac: string }>;
  routes: RouteEntry[];
  destinationMac?: string;
  nextHopMac?: string;
  destinationKind: "unicast" | "local-broadcast";
  expected: {
    scope: "on-link" | "remote-via-gateway" | "no-route" | "local-broadcast";
    routeId?: string;
    interfaceId?: string;
    nextHopIp?: string;
    firstHopRecipient: "destination" | "gateway" | "local-broadcast" | "none";
    boundaryAction: "direct-delivery" | "route-unicast" | "stop-broadcast" | "host-routing-failure" | "router-no-route";
  };
  plainExplanation: string;
  technicalExplanation: string;
  wrongAnswerExplanations: { scope: string; interface: string; nextHop: string; boundary: string };
};
```

Tests must reject invalid IPv4 octets/prefixes, duplicate IDs, routes pointing to unknown interfaces, default routes not using prefix `0`, connected routes with a `nextHop`, expected routes that do not exist, off-link next hops, and ambiguous equally specific routes. Assert local-broadcast cases can only use `stop-broadcast`.

- [ ] **Step 2: Run the schema test and verify RED**

```powershell
pnpm exec vitest run src/features/route-decision/route-decision.schema.test.ts
```

Expected: module-not-found failure for `route-decision.schema`.

- [ ] **Step 3: Implement Zod schemas and refinements**

Use strict IPv4 parsing into four integer octets, prefix `0..32`, unique identifiers, interface/reference validation, and an `isOnLink(ip, networkIp, prefixLength)` helper used only for schema consistency checks. Export inferred types and safe/throwing catalog parsers.

- [ ] **Step 4: Run the schema test and verify GREEN**

Run Step 2. Expected: all validation cases pass.

- [ ] **Step 5: Commit**

```powershell
git add src/features/route-decision/route-decision.schema.ts src/features/route-decision/route-decision.schema.test.ts
git commit -m "feat: define route decision model"
```

### Task 3: Implement pure route selection and prediction feedback

**Files:**
- Create: `src/features/route-decision/evaluate-route-decision.ts`
- Create: `src/features/route-decision/evaluate-route-decision.test.ts`

**Interfaces:**
- Consumes: validated `RouteDecisionScenario` and `LearnerRoutePrediction`.
- Produces: `evaluateRouteDecision(scenario)`, `safeEvaluateRouteDecision(input)`, `evaluateRoutePrediction(scenario, prediction)`, and `safeEvaluateRoutePrediction(scenarioInput, predictionInput)`.

- [ ] **Step 1: Write failing evaluator tests**

Cover these independent results:

```ts
expect(evaluateRouteDecision(local).firstHopRecipient).toBe("destination");
expect(evaluateRouteDecision(remote).firstHopRecipient).toBe("gateway");
expect(evaluateRouteDecision(remote).nextHopIp).toBe("192.0.2.1");
expect(evaluateRouteDecision(specificAndDefault).routeId).toBe("route-office");
expect(evaluateRouteDecision(noRoute).scope).toBe("no-route");
expect(evaluateRouteDecision(broadcast).boundaryAction).toBe("stop-broadcast");
```

Also verify `/24` is not assumed: a `/20` address pair sharing the actual prefix is local even when the third octet differs. Verify prediction feedback returns `scopeCorrect`, `interfaceCorrect`, `nextHopCorrect`, and `boundaryCorrect` separately.

- [ ] **Step 2: Run the evaluator test and verify RED**

```powershell
pnpm exec vitest run src/features/route-decision/evaluate-route-decision.test.ts
```

Expected: module-not-found failure for the evaluator.

- [ ] **Step 3: Implement the minimum evaluator**

Convert IPv4 addresses to unsigned 32-bit integers, compute masks without signed-comparison errors, select the highest prefix length, and handle local broadcast before route selection. Return scenario-authored explanations only after deriving the structural outcome. Validate unknown input in safe wrappers before evaluation.

- [ ] **Step 4: Run schema and evaluator tests and verify GREEN**

```powershell
pnpm exec vitest run src/features/route-decision/route-decision.schema.test.ts src/features/route-decision/evaluate-route-decision.test.ts
```

- [ ] **Step 5: Commit**

```powershell
git add src/features/route-decision/evaluate-route-decision.ts src/features/route-decision/evaluate-route-decision.test.ts
git commit -m "feat: evaluate host route decisions"
```

### Task 4: Add isolated public lesson content and public scenarios

**Files:**
- Create: `src/features/route-decision/route-decision.data.ts`
- Create: `src/features/route-decision/route-decision.data.test.ts`
- Create: `src/content/networking-foundations/routers-default-gateways-and-network-boundaries.public.mdx`
- Modify: `src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts`

**Interfaces:**
- Produces: `publicRouteDecisionScenarios` containing exactly the five public scenarios in the spec; public MDX headings matching catalog metadata.

- [ ] **Step 1: Write failing data and content tests**

Assert five unique public scenarios parse, produce all four foundational outcomes needed by the design, use documentation addresses, and contain no protected IDs. Render the public route and assert the seven public headings, comparison table, local/remote decision sequence, hop-change explanation, broadcast boundary warning, and `<RouteDecisionPlayer />` placeholder.

- [ ] **Step 2: Run focused tests and verify RED**

```powershell
pnpm exec vitest run src/features/route-decision/route-decision.data.test.ts "src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts"
```

- [ ] **Step 3: Add validated public data and substantive MDX**

Use RFC 5737 documentation networks such as `192.0.2.0/24` and `198.51.100.0/24`. The MDX must explicitly state:

```md
The host applies its configured prefix; matching the first three octets is not a general subnet rule.

For a remote destination, the packet keeps the remote destination IP address while the first Ethernet frame targets the gateway's MAC address. This example does not use NAT.
```

Include a server-rendered comparison table with columns `Question`, `Direct delivery`, `Routed delivery`, and `No route`.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run Step 2. Expected: all selected tests pass.

- [ ] **Step 5: Commit**

```powershell
git add src/features/route-decision/route-decision.data.* src/content/networking-foundations/routers-default-gateways-and-network-boundaries.public.mdx "src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts"
git commit -m "feat: add public routers and gateways lesson"
```

### Task 5: Build the accessible public route-decision player

**Files:**
- Create: `src/features/route-decision/route-decision-player.tsx`
- Create: `src/features/route-decision/route-decision-player.test.tsx`
- Modify: `mdx-components.tsx`
- Modify: `src/content/networking-foundations/routers-default-gateways-and-network-boundaries.public.mdx`

**Interfaces:**
- Consumes: `publicRouteDecisionScenarios`, `evaluateRouteDecision`, `useReducedMotionState`, and existing `NetworkDeviceSymbol` where appropriate.
- Produces: MDX component `RouteDecisionPlayer` with scenario choices, topology, decision cards, and plain/technical explanation modes.

- [ ] **Step 1: Write failing component tests**

Render the wished-for component and assert:

```tsx
expect(screen.getByRole("group", { name: "Choose a route decision scenario" })).toBeVisible();
expect(screen.getByRole("region", { name: "Decision" })).toHaveTextContent("On-link");
expect(screen.getByRole("region", { name: "First frame" })).toHaveTextContent("Destination host");
expect(screen.getByRole("img", { name: /source host.*router.*destination/i })).toBeVisible();
```

Select the remote, no-route, gateway-self, and broadcast choices and assert every result changes together. Verify keyboard radio behavior, reduced-motion `data-motion="reduced"`, no stale labels, and no account identifiers in rendered markup.

- [ ] **Step 2: Run the component test and verify RED**

```powershell
pnpm exec vitest run src/features/route-decision/route-decision-player.test.tsx
```

- [ ] **Step 3: Implement the minimum player**

Keep selection state in the client component but derive all decisions through `evaluateRouteDecision`. Render labelled regions for Decision, Outgoing interface, Next hop, First frame, Boundary action, and Why. Plain language appears first; technical reasoning is available through an accessible disclosure. Do not copy evaluator rules into JSX.

- [ ] **Step 4: Register in MDX and verify GREEN**

Export `RouteDecisionPlayer` through `mdx-components.tsx`, place it under the exact public heading, and run Step 2 plus the route test from Task 4.

- [ ] **Step 5: Commit**

```powershell
git add mdx-components.tsx src/features/route-decision/route-decision-player* src/content/networking-foundations/routers-default-gateways-and-network-boundaries.public.mdx
git commit -m "feat: add interactive route decision player"
```

### Task 6: Add protected practice data, evaluator, and lab

**Files:**
- Create: `src/features/route-decision/route-decision.account.scenarios.ts`
- Create: `src/features/route-decision/route-decision.account.data.test.ts`
- Create: `src/features/route-decision/route-decision.account-loader.ts`
- Create: `src/features/route-decision/route-decision.account-loader.test.ts`
- Create: `src/features/route-decision/route-decision-lab.tsx`
- Create: `src/features/route-decision/route-decision-lab.test.tsx`
- Create: `src/features/route-decision/route-decision-experience.tsx`
- Create: `src/features/route-decision/route-decision-experience.test.tsx`

**Interfaces:**
- Produces: server-only `loadAccountRouteDecisionScenarios()`, validated seven-scenario catalog, `RouteDecisionExperience({ scenarios })`, and `RouteDecisionLab`.

- [ ] **Step 1: Write failing protected-data tests**

Assert the seven exact scenario categories from the spec exist, at least two are `intermediate`, every result is derived consistently, and authoring errors throw `ROUTE_DECISION_AUTHORING_ERROR`. Import the loader from a simulated client module and verify the `server-only` guard rejects it.

- [ ] **Step 2: Run data/loader tests and verify RED**

```powershell
pnpm exec vitest run src/features/route-decision/route-decision.account.data.test.ts src/features/route-decision/route-decision.account-loader.test.ts
```

- [ ] **Step 3: Implement protected data and loader**

Begin the loader with `import "server-only"`; parse the protected catalog inside a `try/catch` and wrap invalid authored data with `ROUTE_DECISION_AUTHORING_ERROR` and the original cause.

- [ ] **Step 4: Write failing lab and fallback tests**

Require predictions for scope, interface, next hop, and boundary action; submit once; verify independent feedback; change scenario and confirm state resets. Verify **I know this—proceed to advanced** selects/focuses the first intermediate scenario. Pass malformed data to `RouteDecisionExperience` and assert a static routing-evidence checklist instead of a guessed scenario.

- [ ] **Step 5: Run lab tests and verify RED**

```powershell
pnpm exec vitest run src/features/route-decision/route-decision-lab.test.tsx src/features/route-decision/route-decision-experience.test.tsx
```

- [ ] **Step 6: Implement the minimum protected experience and verify GREEN**

Use radio/select controls with explicit labels and a single polite result announcement. Render field-specific correction text from the scenario only when that prediction field is wrong. Run all four tests from Steps 2 and 5.

- [ ] **Step 7: Commit**

```powershell
git add src/features/route-decision/route-decision.account* src/features/route-decision/route-decision-lab* src/features/route-decision/route-decision-experience*
git commit -m "feat: add protected route decision practice"
```

### Task 7: Complete account MDX, routing evidence, and privacy contracts

**Files:**
- Create: `src/content/networking-foundations/routers-default-gateways-and-network-boundaries.account.mdx`
- Modify: `mdx-components.tsx`
- Modify: `src/features/lessons/lesson-content.repository.test.ts`
- Modify: `tests/e2e/lesson-access.spec.ts`

**Interfaces:**
- Consumes: `loadAccountRouteDecisionScenarios`, `RouteDecisionExperience`, existing `KnowledgeCheck`, `InterviewScenario`, and `PremiumPreview`.
- Produces: complete account lesson with normalized routing-table evidence, troubleshooting, assessment, and Pro preview.

- [ ] **Step 1: Write failing content and privacy tests**

Assert the account MDX renders the four account/pro headings, Windows `route print` and Linux `ip route` examples, seven-step troubleshooting sequence, knowledge checks, one interview scenario, exact waitlist terminology, and the advanced shortcut. Add protected sentinels such as `gateway-not-on-link`, `router-onward-no-route`, and `ROUTE_DECISION_ACCOUNT_SENTINEL`; assert none occur in anonymous HTML or RSC payload text.

- [ ] **Step 2: Run focused tests and verify RED**

```powershell
pnpm exec vitest run src/features/lessons/lesson-content.repository.test.ts
pnpm exec playwright test tests/e2e/lesson-access.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 3: Write substantive account MDX and register the experience**

Include a normalized table whose columns are `Destination/prefix`, `Next hop`, `Interface`, and `Purpose`. Mount protected data only from the server-rendered account MDX:

```mdx
<RouteDecisionExperience scenarios={loadAccountRouteDecisionScenarios()} />
```

Register `RouteDecisionExperience` in `mdx-components.tsx`. End with `<PremiumPreview />` using catalog preview metadata and the existing **Join the Pro Member Waitlist** action.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run Step 2. Expected: account content renders only for authorized test access and protected strings remain absent anonymously.

- [ ] **Step 5: Commit**

```powershell
git add mdx-components.tsx src/content/networking-foundations/routers-default-gateways-and-network-boundaries.account.mdx src/features/lessons/lesson-content.repository.test.ts tests/e2e/lesson-access.spec.ts
git commit -m "feat: complete routers and gateways practice"
```

### Task 8: Add responsive styling and end-to-end lesson coverage

**Files:**
- Modify: `src/app/globals.css`
- Create: `tests/e2e/route-decision.spec.ts`
- Modify: `tests/e2e/lesson.spec.ts`
- Modify: `tests/e2e/pathway.spec.ts`

**Interfaces:**
- Verifies the complete public route and its cross-cutting usability contracts.

- [ ] **Step 1: Write failing browser tests**

Cover public heading order, five player choices, every result region, keyboard selection, plain/technical modes, reduced motion, direct navigation, curriculum counts, and sitemap presence. At 360×800 assert controls are at least 44px and:

```ts
await expect.poll(() => page.evaluate(
  () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
)).toBe(true);
```

Create a JavaScript-disabled context and assert the seven public headings, direct/routed/no-route comparison, boundary warning, and account CTA remain visible. Capture `pageerror` and console errors in both themes and require an empty error list.

- [ ] **Step 2: Run the new browser test and verify RED**

```powershell
pnpm exec playwright test tests/e2e/route-decision.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 3: Add focused styles**

Add `.route-decision-player` and `.route-decision-lab` rules following existing delivery-scope conventions: wrapping scenario controls, responsive topology, one-column mobile result cards, keyboard-scrollable evidence tables, visible focus, 44px controls, and `prefers-reduced-motion: reduce`. Scope every selector to the feature classes.

- [ ] **Step 4: Run focused browser and regression tests and verify GREEN**

```powershell
pnpm exec playwright test tests/e2e/route-decision.spec.ts tests/e2e/lesson.spec.ts tests/e2e/pathway.spec.ts tests/e2e/lesson-access.spec.ts --project=chromium --project=mobile-chromium
```

- [ ] **Step 5: Commit**

```powershell
git add src/app/globals.css tests/e2e/route-decision.spec.ts tests/e2e/lesson.spec.ts tests/e2e/pathway.spec.ts
git commit -m "test: cover routers and gateways lesson journeys"
```

### Task 9: Complete full verification and review

**Files:**
- Modify only files required by evidence-backed findings.

**Interfaces:**
- Produces: a clean, review-ready branch with fresh verification evidence.

- [ ] **Step 1: Run static and unit verification**

```powershell
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

Expected: zero TypeScript errors, zero ESLint errors, all unit/component tests pass, and production build succeeds.

- [ ] **Step 2: Run the full browser suite**

```powershell
pnpm run test:e2e
```

Expected: all Chromium and mobile Chromium projects pass.

- [ ] **Step 3: Inspect anonymous production artifacts**

Search `.next/server`, `.next/static`, and captured anonymous response payloads for:

```text
gateway-not-on-link
router-onward-no-route
ROUTE_DECISION_ACCOUNT_SENTINEL
```

Expected: no matches. A match blocks completion and requires repairing the import/content boundary before rerunning the build and search.

- [ ] **Step 4: Perform visual and accessibility review**

Review desktop, 360px mobile, light, dark, reduced-motion, keyboard-only, and JavaScript-disabled states. Confirm the player never implies that the gateway is the remote IP destination or that an ordinary Layer 2 broadcast crosses the router.

- [ ] **Step 5: Commit evidence-backed corrections**

For each finding, first add or tighten a failing regression test, verify RED, implement the smallest correction, and verify GREEN. Commit only after the complete verification commands pass:

```powershell
git add src/features/route-decision src/content/networking-foundations/routers-default-gateways-and-network-boundaries.*.mdx mdx-components.tsx src/app/globals.css src/features/catalog src/features/lessons src/app/sitemap.test.ts "src/app/learn/[pathwaySlug]/[lessonSlug]/page.test.ts" tests/e2e
git commit -m "fix: strengthen routers and gateways lesson"
```

- [ ] **Step 6: Confirm branch state**

```powershell
git status --short --branch
git log --oneline --decorate -12
```

Expected: the feature branch is clean, ahead of `main`, and contains only the approved lesson design, plan, implementation, and evidence-backed fixes.
